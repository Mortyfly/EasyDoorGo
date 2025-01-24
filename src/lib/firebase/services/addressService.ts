import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import { Address } from '@/lib/types/address';

const COLLECTION = 'addresses';

export const addressService = {
  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const addressesRef = collection(db, 'users', userId, COLLECTION);
      const q = query(addressesRef);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Address));
    } catch (error) {
      console.error('Erreur lors de la récupération des adresses:', error);
      throw error;
    }
  },

  async addAddress(userId: string, address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> {
    try {
      const addressesRef = collection(db, 'users', userId, COLLECTION);
      const addressData = {
        ...address,
        createdAt: serverTimestamp(),
      };

      // Vérifier que toutes les propriétés requises sont présentes
      if (!addressData.cityId || !addressData.streetName || !addressData.number || !addressData.status) {
        throw new Error('Données d\'adresse invalides');
      }

      const docRef = await addDoc(addressesRef, addressData);

      return {
        id: docRef.id,
        ...address,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'adresse:', error);
      throw error;
    }
  },

  async updateAddress(userId: string, addressId: string, data: Partial<Address>): Promise<void> {
    try {
      const addressRef = doc(db, 'users', userId, COLLECTION, addressId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      await updateDoc(addressRef, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'adresse:', error);
      throw error;
    }
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const addressRef = doc(db, 'users', userId, COLLECTION, addressId);
      await deleteDoc(addressRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'adresse:', error);
      throw error;
    }
  }
};