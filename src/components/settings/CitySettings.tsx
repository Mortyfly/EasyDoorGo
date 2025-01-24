import { City } from "@/lib/types/city";
import { Address } from "@/lib/types/address";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CitySettingsProps {
  cities: City[];
  addresses: Address[];
  onCityDelete: (city: City) => void;
}

export function CitySettings({ cities, addresses, onCityDelete }: CitySettingsProps) {
  const getCityStats = (cityId: string) => {
    const cityAddresses = addresses.filter(addr => addr.cityId === cityId);
    const streets = new Set(cityAddresses.map(addr => addr.streetName));
    return {
      addresses: cityAddresses.length,
      streets: streets.size
    };
  };

  return (
    <div className="space-y-4">
      {cities.map(city => {
        const stats = getCityStats(city.id);
        return (
          <div
            key={city.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <div className="space-y-1">
              <h3 className="font-medium">{city.name}</h3>
              <p className="text-sm text-muted-foreground">
                {city.postalCode} • {stats.addresses} adresses • {stats.streets} rues
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCityDelete(city)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      {cities.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          Aucune ville n'a été ajoutée
        </p>
      )}
    </div>
  );
}