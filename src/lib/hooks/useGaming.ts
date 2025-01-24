import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { doc, collection, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { gamingService } from '@/lib/firebase/services/gamingService';
import { GamingSession } from '@/lib/types/gaming';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes en millisecondes

export function useGaming() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<GamingSession | null>(null);
  const { toast } = useToast();

  // Écouter les changements de session
  useEffect(() => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    try {
      // Écouter la session active ou en pause
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      const activeSessionQuery = query(
        sessionsRef,
        where('status', 'in', ['active', 'paused'])
      );
      const unsubSession = onSnapshot(activeSessionQuery, (snapshot) => {
        if (!snapshot.empty) {
          const sessionData = snapshot.docs[0].data();
          setActiveSession({
            id: snapshot.docs[0].id,
            ...sessionData,
            startedAt: sessionData.startedAt?.toDate() || new Date(),
            lastDoorTime: sessionData.lastDoorTime?.toDate(),
            pauseStartedAt: sessionData.pauseStartedAt?.toDate(),
            uniqueStreets: new Set(sessionData.uniqueStreets || [])
          } as GamingSession);
        } else {
          setActiveSession(null);
        }
      });
      unsubscribers.push(unsubSession);

    } catch (error) {
      console.error('Erreur lors du chargement des données de jeu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de jeu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, toast]);

  // Vérifier l'inactivité de la session
  useEffect(() => {
    if (!activeSession || !user) return;

    const checkInactivity = async () => {
      const now = Date.now();
      const lastActivity = activeSession.lastDoorTime?.getTime() || activeSession.startedAt.getTime();
      
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        const sessionRef = doc(db, 'users', user.uid, 'sessions', activeSession.id);
        await updateDoc(sessionRef, {
          status: 'completed',
          endedAt: new Date()
        });
        toast({
          title: "Session terminée",
          description: "La session a été automatiquement terminée après 15 minutes d'inactivité"
        });
      }
    };

    const inactivityTimer = setInterval(checkInactivity, 60000); // Vérifier chaque minute

    return () => clearInterval(inactivityTimer);
  }, [activeSession, user, toast]);

  const startSession = async (cityId: string) => {
    if (!user) return;
    try {
      await gamingService.startSession(user.uid, cityId);
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session",
        variant: "destructive"
      });
    }
  };

  const updateSession = async (sessionId: string, data: Partial<GamingSession>) => {
    if (!user) return;
    try {
      await gamingService.updateSession(user.uid, sessionId, data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la session",
        variant: "destructive"
      });
    }
  };

  const checkAchievements = async () => {
    if (!user || !activeSession) return;
    try {
      await gamingService.checkAchievements(user.uid, activeSession);
    } catch (error) {
      console.error('Erreur lors de la vérification des succès:', error);
    }
  };

  return {
    loading,
    activeSession,
    startSession,
    updateSession,
    checkAchievements
  };
}