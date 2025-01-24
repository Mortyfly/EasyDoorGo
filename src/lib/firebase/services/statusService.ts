import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../config';
import { Status } from '@/lib/types/status';

// ID fixe pour le document settings
const SETTINGS_ID = 'default';

export const statusService = {
  async initializeSettings(userId: string): Promise<void> {
    const settingsRef = doc(db, 'users', userId, 'settings', SETTINGS_ID);
    await setDoc(settingsRef, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  async cleanupDuplicateStatuses(userId: string): Promise<void> {
    try {
      const statusesRef = collection(
        db,
        'users',
        userId,
        'settings',
        SETTINGS_ID,
        'statuses'
      );
      
      const snapshot = await getDocs(statusesRef);
      const statuses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Status));

      // Créer un Map pour regrouper les statuts par leur "signature" unique
      const statusMap = new Map<string, Status[]>();
      
      statuses.forEach(status => {
        const key = `${status.name}-${status.color}-${status.description}`;
        if (!statusMap.has(key)) {
          statusMap.set(key, []);
        }
        statusMap.get(key)!.push(status);
      });

      // Pour chaque groupe de statuts identiques, garder le plus ancien et supprimer les autres
      for (const duplicates of statusMap.values()) {
        if (duplicates.length > 1) {
          // Trier par date de mise à jour pour garder le plus ancien
          duplicates.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
          
          // Supprimer tous les doublons sauf le premier
          for (let i = 1; i < duplicates.length; i++) {
            await this.deleteStatus(userId, duplicates[i].id);
          }
        }
      }
    } catch (error) {
      // Ignorer les erreurs de permission qui sont normales avant l'authentification
      if (error?.code !== 'permission-denied') {
        console.error('Erreur lors du nettoyage des doublons:', error);
        throw error;
      }
    }
  },

  async getStatuses(userId: string): Promise<Status[]> {
    try {
      // S'assurer que le document settings existe
      await this.initializeSettings(userId);
      
      // Nettoyer les doublons avant de retourner les statuts
      await this.cleanupDuplicateStatuses(userId);
      
      const statusesRef = collection(
        db,
        'users',
        userId,
        'settings',
        SETTINGS_ID,
        'statuses'
      );
      
      const q = query(statusesRef, orderBy('order'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Status));
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts:', error);
      throw error;
    }
  },

  async addStatus(userId: string, status: Omit<Status, 'id' | 'updatedAt'>): Promise<Status> {
    try {
      // S'assurer que le document settings existe
      await this.initializeSettings(userId);
      
      // Vérifier si un statut identique existe déjà
      const statusesRef = collection(
        db,
        'users',
        userId,
        'settings',
        SETTINGS_ID,
        'statuses'
      );
      
      const q = query(
        statusesRef,
        where('name', '==', status.name),
        where('color', '==', status.color),
        where('description', '==', status.description)
      );
      
      const snapshot = await getDocs(q);
      
      // Si un statut identique existe, le retourner
      if (!snapshot.empty) {
        const existingStatus = snapshot.docs[0];
        return {
          id: existingStatus.id,
          ...existingStatus.data(),
          updatedAt: existingStatus.data().updatedAt?.toDate() || new Date(),
        } as Status;
      }

      // Sinon, créer un nouveau statut
      const docRef = await addDoc(statusesRef, {
        ...status,
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...status,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du statut:', error);
      throw error;
    }
  },

  async updateStatus(userId: string, statusId: string, data: Partial<Status>): Promise<void> {
    try {
      const statusRef = doc(
        db,
        'users',
        userId,
        'settings',
        SETTINGS_ID,
        'statuses',
        statusId
      );
      
      await updateDoc(statusRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  async deleteStatus(userId: string, statusId: string): Promise<void> {
    try {
      const statusRef = doc(
        db,
        'users',
        userId,
        'settings',
        SETTINGS_ID,
        'statuses',
        statusId
      );
      
      await deleteDoc(statusRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du statut:', error);
      throw error;
    }
  }
};