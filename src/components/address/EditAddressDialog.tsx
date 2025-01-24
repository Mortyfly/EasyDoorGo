import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Address, AddressStatus } from '@/lib/types/address';
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface EditAddressDialogProps {
  address: Address | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAddress: Address) => void;
}

export function EditAddressDialog({ address, isOpen, onClose, onSave }: EditAddressDialogProps) {
  const { statuses, loading } = useStatusSettings();
  const [number, setNumber] = useState(address?.number ?? '');
  const [status, setStatus] = useState<AddressStatus>(address?.status ?? 'Accepté');
  const [additionalInfo, setAdditionalInfo] = useState(address?.additionalInfo ?? '');

  useEffect(() => {
    if (address) {
      setNumber(address.number);
      setStatus(address.status);
      setAdditionalInfo(address.additionalInfo ?? '');
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    onSave({
      ...address,
      number,
      status,
      additionalInfo
    });
    onClose();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'adresse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-number">Numéro</Label>
            <Input
              id="edit-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-status">Statut</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as AddressStatus)}
            >
              <SelectTrigger id="edit-status">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={`edit-dialog-status-${s.id}`} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-info">Informations additionnelles</Label>
            <Input
              id="edit-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}