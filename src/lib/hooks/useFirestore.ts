import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { cityService } from '@/lib/firebase/services/cityService';
import { addressService } from '@/lib/firebase/services/addressService';
import { statusService } from '@/lib/firebase/services/statusService';
import { City } from '@/lib/types/city';
import { Address } from '@/lib/types/address';
import { Status } from '@/lib/types/status';
import { collection, onSnapshot, query, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestore() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    const loadData = async () => {
      try {
        setLoading(true);

        // Écouter les changements des villes en temps réel
        const citiesRef = collection(db, 'users', user.uid, 'cities');
        const citiesQuery = query(citiesRef);
        const unsubCities = onSnapshot(citiesQuery, (snapshot) => {
          const citiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as City));
          setCities(citiesData);
        }, (error) => {
          // Ignorer les erreurs de permission qui sont normales avant l'authentification
          if (error?.code !== 'permission-denied') {
            console.error('Erreur lors de l\'écoute des villes:', error);
            setError(error instanceof Error ? error : new Error('Failed to load cities'));
          }
        });
        unsubscribers.push(unsubCities);

        // Écouter les changements des adresses en temps réel
        const addressesRef = collection(db, 'users', user.uid, 'addresses');
        const addressesQuery = query(addressesRef);
        const unsubAddresses = onSnapshot(addressesQuery, (snapshot) => {
          const addressesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Address));
          setAddresses(addressesData);
        }, (error) => {
          // Ignorer les erreurs de permission qui sont normales avant l'authentification
          if (error?.code !== 'permission-denied') {
            console.error('Erreur lors de l\'écoute des adresses:', error);
            setError(error instanceof Error ? error : new Error('Failed to load addresses'));
          }
        });
        unsubscribers.push(unsubAddresses);

        try {
          // Charger les statuts
          const statusesData = await statusService.getStatuses(user.uid);
          setStatuses(statusesData);
        } catch (error) {
          // Ignorer les erreurs de permission qui sont normales avant l'authentification
          if (error?.code !== 'permission-denied') {
            console.error('Erreur lors du chargement des statuts:', error);
          }
        }

      } catch (err) {
        // Ignorer les erreurs de permission qui sont normales avant l'authentification
        if (err?.code !== 'permission-denied') {
          console.error('Erreur lors du chargement des données:', err);
          setError(err instanceof Error ? err : new Error('Failed to load data'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  const addCity = async (cityData: Omit<City, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const newCity = await cityService.addCity(user.uid, cityData);
      return newCity;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la ville:', error);
      throw error;
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const newAddress = await addressService.addAddress(user.uid, addressData);
      return newAddress;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'adresse:', error);
      throw error;
    }
  };

  const updateAddress = async (address: Address) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addressService.updateAddress(user.uid, address.id, address);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'adresse:', error);
      throw error;
    }
  };

  const deleteAddress = async (address: Address) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addressService.deleteAddress(user.uid, address.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'adresse:', error);
      throw error;
    }
  };

  const updateAddressStatus = async (addressId: string, status: Status) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addressService.updateAddress(user.uid, addressId, { status: status.name });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  };

  const updateAddressesStatus = async (oldStatusName: string, newStatus: Status) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const batch = writeBatch(db);
      const addressesToUpdate = addresses.filter(addr => addr.status === oldStatusName);

      addressesToUpdate.forEach(address => {
        const addressRef = doc(db, 'users', user.uid, 'addresses', address.id);
        batch.update(addressRef, { 
          status: newStatus.name,
          updatedAt: new Date()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
      throw error;
    }
  };

  const deleteCity = async (cityId: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      // Supprimer toutes les adresses de la ville
      const cityAddresses = addresses.filter(addr => addr.cityId === cityId);
      const batch = writeBatch(db);

      // Supprimer les adresses
      cityAddresses.forEach(address => {
        const addressRef = doc(db, 'users', user.uid, 'addresses', address.id);
        batch.delete(addressRef);
      });

      // Supprimer la ville
      const cityRef = doc(db, 'users', user.uid, 'cities', cityId);
      batch.delete(cityRef);

      await batch.commit();
    } catch (error) {
      console.error('Erreur lors de la suppression de la ville:', error);
      throw error;
    }
  };

  return {
    loading,
    error,
    cities,
    addresses,
    statuses,
    addCity,
    addAddress,
    updateAddress,
    deleteAddress,
    updateAddressStatus,
    updateAddressesStatus,
    deleteCity
  };
}