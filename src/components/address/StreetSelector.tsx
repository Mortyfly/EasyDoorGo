import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationButton } from '@/components/common/LocationButton';
import { reverseGeocode } from '@/lib/utils/geocoding';
import { useToast } from '@/hooks/use-toast';
import { useTutorial } from '@/components/tutorial/TutorialProvider';

interface StreetSelectorProps {
  existingStreets: string[];
  onStreetSelect: (street: string) => void;
  onStreetAdd: (street: string) => void;
}

export function StreetSelector({ existingStreets, onStreetSelect, onStreetAdd }: StreetSelectorProps) {
  const [newStreet, setNewStreet] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const { toast } = useToast();
  const { nextStep } = useTutorial();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStreet.trim()) {
      onStreetAdd(newStreet.trim());
      setNewStreet('');
      // Passer à l'étape suivante du tutoriel
      nextStep();
    }
  };

  const handleStreetSelect = (street: string) => {
    setSelectedStreet(street);
    onStreetSelect(street);
    // Passer à l'étape suivante du tutoriel
    nextStep();
  };

  const handleLocation = async (location: { lat: number; lng: number }) => {
    try {
      const result = await reverseGeocode(location.lat, location.lng);
      
      if (result.error || !result.address?.street) {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de déterminer votre rue",
          variant: "destructive"
        });
        return;
      }

      setNewStreet(result.address.street);
      
      toast({
        title: "Rue trouvée",
        description: result.address.street
      });
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déterminer votre rue",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 street-selector">
      {existingStreets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner une rue existante</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedStreet} onValueChange={handleStreetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une rue" />
              </SelectTrigger>
              <SelectContent>
                {existingStreets.map((street) => (
                  <SelectItem key={street} value={street}>
                    {street}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une nouvelle rue</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Nom de la rue</Label>
              <div className="flex gap-2">
                <Input
                  id="street"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="Ex: Rue de la Paix"
                  required
                />
                <LocationButton 
                  onLocation={handleLocation}
                  className="shrink-0"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Ajouter la rue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}