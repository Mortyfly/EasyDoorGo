import { collection, query, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import { City } from '@/lib/types/city';

export const cityService = {
  async getCities(userId: string): Promise<City[]> {
    try {
      const citiesRef = collection(db, 'users', userId, 'cities');
      const q = query(citiesRef);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as City));
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
      throw error;
    }
  },

  async addCity(userId: string, city: Omit<City, 'id' | 'createdAt' | 'userId'>): Promise<City> {
    try {
      const citiesRef = collection(db, 'users', userId, 'cities');
      const docRef = await addDoc(citiesRef, {
        ...city,
        userId,
        targetDoors: 1000, // Objectif par défaut
        createdAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...city,
        userId,
        targetDoors: 1000,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la ville:', error);
      throw error;
    }
  },

  async updateCity(userId: string, cityId: string, data: Partial<City>): Promise<void> {
    try {
      const cityRef = doc(db, 'users', userId, 'cities', cityId);
      await updateDoc(cityRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ville:', error);
      throw error;
    }
  },

  async deleteCity(userId: string, cityId: string): Promise<void> {
    try {
      const cityRef = doc(db, 'users', userId, 'cities', cityId);
      await deleteDoc(cityRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de la ville:', error);
      throw error;
    }
  }
};