import { useState, useEffect, useCallback } from 'react';
import { Status } from '@/lib/types/status';
import { useAuthContext } from '@/providers/AuthProvider';
import { statusService } from '@/lib/firebase/services/statusService';

const DEFAULT_STATUSES: Omit<Status, 'id' | 'updatedAt'>[] = [
  {
    name: 'Accepté',
    color: '#22c55e',
    description: 'Le propriétaire a accepté de recevoir des informations',
    order: 0
  },
  {
    name: 'Absent',
    color: '#eab308',
    description: 'Personne n\'était présent lors de la visite',
    order: 1
  },
  {
    name: 'PI',
    color: '#ef4444',
    description: 'Pas intéressé',
    order: 2
  },
  {
    name: 'Fermé',
    color: '#3b82f6',
    description: 'Accès impossible ou refusé',
    order: 3
  },
  {
    name: 'À Vendre',
    color: '#a855f7',
    description: 'Bien en vente',
    order: 4
  },
  {
    name: 'Référent',
    color: '#14b8a6',
    description: 'Contact privilégié dans le secteur',
    order: 5
  }
];

export function useStatusSettings() {
  const { user } = useAuthContext();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initializeDefaultStatuses = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Initialisation des statuts par défaut...');
      const createdStatuses = [];
      
      // Créer les statuts par défaut
      for (const status of DEFAULT_STATUSES) {
        const createdStatus = await statusService.addStatus(user.uid, status);
        createdStatuses.push(createdStatus);
      }
      
      setStatuses(createdStatuses);
      console.log('Statuts par défaut créés:', createdStatuses.length);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des statuts par défaut:', error);
      setError(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }, [user]);

  const loadStatuses = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les statuts existants
      const existingStatuses = await statusService.getStatuses(user.uid);
      console.log('Statuts existants chargés:', existingStatuses.length);

      // Si aucun statut n'existe, initialiser les statuts par défaut
      if (existingStatuses.length === 0) {
        await initializeDefaultStatuses();
      } else {
        setStatuses(existingStatuses);
      }
    } catch (error) {
      // Ignorer les erreurs de permission qui sont normales avant l'authentification
      if (error?.code !== 'permission-denied') {
        console.error('Erreur lors du chargement des statuts:', error);
        setError(error instanceof Error ? error : new Error('Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  }, [user, initializeDefaultStatuses]);

  useEffect(() => {
    if (user) {
      loadStatuses();
    }
  }, [user, loadStatuses]);

  const updateStatuses = async (newStatuses: Status[]) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Mettre à jour tous les statuts dans Firestore
      await Promise.all(newStatuses.map(status =>
        statusService.updateStatus(user.uid, status.id, status)
      ));
      
      setStatuses(newStatuses);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
      setError(error instanceof Error ? error : new Error('Erreur inconnue'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addStatus = async (newStatus: Omit<Status, 'id' | 'updatedAt'>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const createdStatus = await statusService.addStatus(user.uid, newStatus);
      setStatuses(prev => [...prev, createdStatus]);
      
      return createdStatus;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du statut:', error);
      setError(error instanceof Error ? error : new Error('Erreur inconnue'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    statuses,
    loading,
    error,
    updateStatuses,
    addStatus,
    reloadStatuses: loadStatuses
  };
}