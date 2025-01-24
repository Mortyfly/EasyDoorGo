import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, GripVertical, AlertCircle, Save } from "lucide-react";
import { Status } from '@/lib/types/status';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';
import { useFirestore } from '@/lib/hooks/useFirestore';

interface StatusSettingsProps {
  statuses: Status[];
  onStatusesChange: (newStatuses: Status[]) => void;
  usedStatuses: Set<string>;
}

export function StatusSettings({ statuses, onStatusesChange, usedStatuses }: StatusSettingsProps) {
  const { addStatus } = useStatusSettings();
  const { addresses, updateAddressStatus, updateAddressesStatus } = useFirestore();
  const [localStatuses, setLocalStatuses] = useState<Status[]>([]);
  const [newStatus, setNewStatus] = useState<Partial<Status>>({
    name: '',
    color: '#000000',
    description: ''
  });
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  const handleAddStatus = async () => {
    if (!newStatus.name || !newStatus.color) {
      toast({
        title: "Erreur",
        description: "Le nom et la couleur sont requis",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const statusToAdd = {
        name: newStatus.name,
        color: newStatus.color,
        description: newStatus.description || '',
        order: localStatuses.length
      };

      const createdStatus = await addStatus(statusToAdd);
      
      if (createdStatus) {
        setLocalStatuses(prev => [...prev, createdStatus]);
        setNewStatus({ name: '', color: '#000000', description: '' });
        toast({
          title: "Succès",
          description: "Le statut a été ajouté avec succès"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du statut:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du statut",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (id: string, field: keyof Status, value: string) => {
    const newStatuses = localStatuses.map(status =>
      status.id === id ? { ...status, [field]: value } : status
    );
    setLocalStatuses(newStatuses);
    setHasUnsavedChanges(true);
  };

  const handleDeleteStatus = (status: Status) => {
    if (usedStatuses.has(status.name)) {
      setStatusToDelete(status);
      return;
    }

    const newStatuses = localStatuses.filter(s => s.id !== status.id);
    setLocalStatuses(newStatuses);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      // Créer un map des anciens noms vers les nouveaux noms de statuts
      const statusNameChanges = new Map<string, Status>();
      statuses.forEach(oldStatus => {
        const newStatus = localStatuses.find(s => s.id === oldStatus.id);
        if (newStatus && oldStatus.name !== newStatus.name) {
          statusNameChanges.set(oldStatus.name, newStatus);
        }
      });

      // Mettre à jour les statuts
      await onStatusesChange(localStatuses);

      // Mettre à jour les adresses qui utilisent les statuts modifiés
      if (statusNameChanges.size > 0) {
        const updates = Array.from(statusNameChanges.entries()).map(
          ([oldName, newStatus]) => updateAddressesStatus(oldName, newStatus)
        );
        await Promise.all(updates);
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Modifications enregistrées",
        description: "Les statuts et les adresses ont été mis à jour avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des statuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Liste des statuts existants */}
        <div className="space-y-4">
          {localStatuses.map((status) => (
            <div
              key={`status-item-${status.id}`}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              
              <div className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={status.name}
                    onChange={(e) => handleUpdateStatus(status.id, 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={status.color}
                      onChange={(e) => handleUpdateStatus(status.id, 'color', e.target.value)}
                      className="w-12 p-1 h-9"
                    />
                    <Input
                      type="text"
                      value={status.color}
                      onChange={(e) => handleUpdateStatus(status.id, 'color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={status.description}
                    onChange={(e) => handleUpdateStatus(status.id, 'description', e.target.value)}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteStatus(status)}
                className={cn(
                  "text-muted-foreground hover:text-destructive",
                  usedStatuses.has(status.name) && "text-destructive"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Formulaire d'ajout */}
        <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold">Ajouter un nouveau statut</h3>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={newStatus.name}
                onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                placeholder="Ex: En attente"
              />
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                  className="w-12 p-1 h-9"
                />
                <Input
                  type="text"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newStatus.description}
                onChange={(e) => setNewStatus({ ...newStatus, description: e.target.value })}
                placeholder="Description du statut"
              />
            </div>
          </div>

          <Button onClick={handleAddStatus} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges || loading}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </CardFooter>

      {/* Dialog de confirmation pour la suppression */}
      <AlertDialog open={!!statusToDelete} onOpenChange={() => setStatusToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Attention
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le statut "{statusToDelete?.name}" est actuellement utilisé par des adresses.
              Si vous le supprimez, ces adresses perdront leur statut actuel.
              Êtes-vous sûr de vouloir continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusToDelete) {
                  const newStatuses = localStatuses.filter(s => s.id !== statusToDelete.id);
                  setLocalStatuses(newStatuses);
                  setStatusToDelete(null);
                  setHasUnsavedChanges(true);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}