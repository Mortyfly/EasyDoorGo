import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProgress, GamingSession } from '@/lib/types/gaming';
import { toast } from '@/hooks/use-toast';
import { calculateSessionXp } from '@/lib/utils/gamingUtils';

export const gamingService = {
  async createUserProfile(userId: string, nickname: string): Promise<void> {
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'current');
      await setDoc(profileRef, {
        nickname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  },

  async updateNickname(userId: string, nickname: string): Promise<void> {
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'current');
      await updateDoc(profileRef, {
        nickname,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Pseudo mis à jour",
        description: "Votre pseudo a été modifié avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pseudo:', error);
      throw error;
    }
  },

  async startSession(userId: string, cityId: string): Promise<void> {
    try {
      // Vérifier s'il y a déjà une session active
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const activeSessionQuery = query(
        sessionsRef, 
        where('status', 'in', ['active', 'paused'])
      );
      const activeSessionSnap = await getDocs(activeSessionQuery);

      if (!activeSessionSnap.empty) {
        toast({
          title: "Session déjà active",
          description: "Une session est déjà en cours",
          variant: "destructive"
        });
        return;
      }

      // Créer une nouvelle session
      const newSession = {
        cityId,
        startedAt: serverTimestamp(),
        seriesCompleted: 0,
        doorsVisited: 0,
        currentSeriesDoors: 0,
        status: 'active',
        lastDoorTime: null,
        pauseStartedAt: null,
        totalPauseDuration: 0,
        dailyDoors: 0,
        dailyDate: new Date().toISOString().split('T')[0],
        updatedAt: serverTimestamp()
      };

      await addDoc(sessionsRef, newSession);

      toast({
        title: "Session démarrée",
        description: "Votre session de jeu a commencé"
      });
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session",
        variant: "destructive"
      });
      throw error;
    }
  },

  async updateSession(userId: string, sessionId: string, data: Partial<GamingSession>): Promise<void> {
    try {
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error('Session introuvable');
      }

      const currentSession = {
        ...sessionSnap.data(),
        startedAt: sessionSnap.data().startedAt?.toDate(),
        pauseStartedAt: sessionSnap.data().pauseStartedAt?.toDate(),
      } as GamingSession;

      const updates: any = { 
        ...data,
        updatedAt: serverTimestamp()
      };

      // Gestion de la pause
      if (data.status === 'paused' && currentSession.status === 'active') {
        updates.pauseStartedAt = serverTimestamp();
        toast({
          title: "Session en pause",
          description: "Votre session a été mise en pause"
        });
      }
      // Gestion de la reprise
      else if (data.status === 'active' && currentSession.status === 'paused') {
        const pauseDuration = currentSession.pauseStartedAt ? 
          (Date.now() - currentSession.pauseStartedAt.getTime()) : 0;
        
        updates.totalPauseDuration = (currentSession.totalPauseDuration || 0) + Math.floor(pauseDuration / 1000);
        updates.pauseStartedAt = null;
        
        toast({
          title: "Session reprise",
          description: "Votre session a repris"
        });
      }
      // Gestion de la fin de session
      else if (data.status === 'completed') {
        updates.endedAt = serverTimestamp();
        if (currentSession.pauseStartedAt) {
          const finalPauseDuration = Date.now() - currentSession.pauseStartedAt.getTime();
          updates.totalPauseDuration = (currentSession.totalPauseDuration || 0) + Math.floor(finalPauseDuration / 1000);
        }
        
        toast({
          title: "Session terminée",
          description: `Session terminée avec ${currentSession.doorsVisited} portes visitées !`
        });
      }

      await updateDoc(sessionRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      throw error;
    }
  },

  async checkAchievements(userId: string, session: GamingSession): Promise<void> {
    // Cette fonction sera implémentée plus tard pour gérer les succès
  }
};