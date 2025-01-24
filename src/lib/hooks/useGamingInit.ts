import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { gamingService } from '@/lib/firebase/services/gamingService';
import { achievementService } from '@/lib/firebase/services/achievementService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function useGamingInit() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGaming = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Vérifier si le profil existe
        const profileRef = doc(db, 'users', user.uid, 'profile', 'current');
        const profileSnap = await getDoc(profileRef);

        // Initialiser le profil si nécessaire
        if (!profileSnap.exists()) {
          await gamingService.createUserProfile(user.uid, user.email?.split('@')[0] || 'Joueur');
          
          toast({
            title: "Profil de jeu créé",
            description: "Votre profil de jeu a été initialisé avec succès"
          });
        }

        // Initialiser les succès globaux s'ils n'existent pas
        await achievementService.initializeAchievements();

      } catch (error) {
        console.error('Erreur lors de l\'initialisation du gaming:', error);
        if (error?.code !== 'permission-denied') {
          toast({
            title: "Erreur d'initialisation",
            description: "Une erreur est survenue lors de l'initialisation du profil de jeu",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeGaming();
  }, [user, toast]);

  return { loading };
}