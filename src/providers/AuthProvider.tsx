import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { toast } = useToast();
  const lastUserRef = useRef<User | null>(null);

  const handleLogout = async (userId: string) => {
    try {
      // Récupérer toutes les sessions actives ou en pause
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const activeSessionQuery = query(
        sessionsRef,
        where('status', 'in', ['active', 'paused'])
      );

      const snapshot = await getDocs(activeSessionQuery);

      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            status: 'completed',
            endedAt: new Date()
          });
        });

        // Exécuter le batch
        await batch.commit();
        console.log('Sessions terminées avec succès');
      }
    } catch (error) {
      // Ignorer les erreurs de permission qui sont normales à la déconnexion
      if (error?.code !== 'permission-denied') {
        console.error('Erreur lors de la fermeture des sessions:', error);
      }
    }
  };

  // Gérer la déconnexion de l'utilisateur
  useEffect(() => {
    // Si l'utilisateur était connecté et ne l'est plus
    if (lastUserRef.current && !auth.user) {
      handleLogout(lastUserRef.current.uid).catch(error => {
        console.error('Erreur lors de la déconnexion:', error);
      });
    }

    // Mettre à jour la référence de l'utilisateur
    lastUserRef.current = auth.user;
  }, [auth.user]);

  // Gérer la fermeture complète de l'application
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (auth.user) {
        event.preventDefault();
        event.returnValue = '';
        await handleLogout(auth.user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [auth.user]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}