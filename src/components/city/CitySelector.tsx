import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationButton } from '@/components/common/LocationButton';
import { reverseGeocode } from '@/lib/utils/geocoding';
import { useToast } from '@/hooks/use-toast';
import { City } from '@/lib/types/city';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { HelpCircle } from 'lucide-react';

interface CitySelectorProps {
  cities: City[];
  onCitySelect: (city: City) => void;
  onCityAdd: (cityData: Omit<City, 'id' | 'createdAt' | 'userId'>) => Promise<City>;
}

export function CitySelector({ cities, onCitySelect, onCityAdd }: CitySelectorProps) {
  const [newCityName, setNewCityName] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const { toast } = useToast();
  const { nextStep, restartTutorial } = useTutorial();

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCityName && newPostalCode) {
      try {
        const newCity = await onCityAdd({
          name: newCityName,
          postalCode: newPostalCode,
        });
        setNewCityName('');
        setNewPostalCode('');
        
        // Sélectionner automatiquement la nouvelle ville
        onCitySelect(newCity);
        nextStep(); // Passer à l'étape suivante après l'ajout
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la ville:', error);
      }
    }
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    const selectedCity = cities.find(city => city.id === cityId);
    if (selectedCity) {
      onCitySelect(selectedCity);
      nextStep(); // Passer à l'étape suivante après la sélection
    }
  };

  const handleLocation = async (location: { lat: number; lng: number }) => {
    try {
      const result = await reverseGeocode(location.lat, location.lng);
      
      if (result.error || !result.address?.city || !result.address?.postalCode) {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de déterminer votre ville",
          variant: "destructive"
        });
        return;
      }

      setNewCityName(result.address.city);
      setNewPostalCode(result.address.postalCode);
      
      toast({
        title: "Ville trouvée",
        description: `${result.address.city} (${result.address.postalCode})`
      });
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déterminer votre ville",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={restartTutorial}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Tutoriel
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="city-selector">
          <CardHeader>
            <CardTitle>Sélectionner une commune</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCityId} onValueChange={handleCitySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une commune" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} ({city.postalCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="city-add">
          <CardHeader>
            <CardTitle>Ajouter une nouvelle commune</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCity} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cityName">Nom de la commune</Label>
                <div className="flex gap-2">
                  <Input
                    id="cityName"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    required
                  />
                  <LocationButton 
                    onLocation={handleLocation}
                    className="shrink-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={newPostalCode}
                  onChange={(e) => setNewPostalCode(e.target.value)}
                  pattern="[0-9]{5}"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Ajouter</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}