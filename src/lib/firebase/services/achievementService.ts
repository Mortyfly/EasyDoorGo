import { collection, doc, setDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import { Achievement } from '@/lib/types/gaming';

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
  {
    name: 'Première poignée',
    description: 'Visiter 10 portes',
    category: 'progression',
    xpReward: 50,
    badge: '🚪',
    conditions: { doorsVisited: 10 }
  },
  {
    name: 'Marcheur de rue',
    description: 'Visiter 100 portes',
    category: 'progression',
    xpReward: 250,
    badge: '🏃',
    conditions: { doorsVisited: 100 }
  },
  {
    name: 'Maître des clés',
    description: 'Visiter 500 portes',
    category: 'progression',
    xpReward: 500,
    badge: '🔑',
    conditions: { doorsVisited: 500 }
  },
  {
    name: 'Conquérant de la ville',
    description: 'Atteindre 1000 portes',
    category: 'progression',
    xpReward: 1000,
    badge: '👑',
    conditions: { doorsVisited: 1000 }
  },
  {
    name: 'Échauffement',
    description: 'Terminer une série de 10 portes',
    category: 'series',
    xpReward: 100,
    badge: '🎯',
    conditions: { seriesCompleted: 1 }
  },
  {
    name: 'Endurant',
    description: 'Terminer 5 séries consécutives',
    category: 'series',
    xpReward: 300,
    badge: '💪',
    conditions: { consecutiveSeries: 5 }
  },
  {
    name: 'Marathonien',
    description: 'Réaliser 10 séries sans pause',
    category: 'series',
    xpReward: 500,
    badge: '🏃‍♂️',
    conditions: { seriesWithoutPause: 10 }
  },
  {
    name: 'Visite rapide',
    description: 'Compléter 10 portes en moins de 15 minutes',
    category: 'bonus',
    xpReward: 200,
    badge: '⚡',
    conditions: { doorsInTimeframe: { doors: 10, timeframe: 900 } }
  },
  {
    name: 'Persévérant',
    description: 'Compléter 100 portes dans une journée',
    category: 'bonus',
    xpReward: 400,
    badge: '🌟',
    conditions: { doorsInDay: 100 }
  },
  {
    name: 'Explorateur',
    description: 'Valider 5 rues différentes dans une session',
    category: 'bonus',
    xpReward: 300,
    badge: '🗺️',
    conditions: { uniqueStreets: 5 }
  }
];

export const achievementService = {
  async initializeAchievements(): Promise<void> {
    try {
      const achievementsRef = collection(db, 'achievements');
      const snapshot = await getDocs(achievementsRef);

      // Si des succès existent déjà, ne pas les réinitialiser
      if (!snapshot.empty) return;

      // Créer tous les succès par défaut
      const batch = db.batch();
      DEFAULT_ACHIEVEMENTS.forEach((achievement, index) => {
        const docRef = doc(achievementsRef, `achievement_${index + 1}`);
        batch.set(docRef, {
          ...achievement,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des succès:', error);
      throw error;
    }
  },

  async getAchievements(): Promise<Achievement[]> {
    try {
      const achievementsRef = collection(db, 'achievements');
      const snapshot = await getDocs(achievementsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Achievement));
    } catch (error) {
      console.error('Erreur lors de la récupération des succès:', error);
      throw error;
    }
  }
};