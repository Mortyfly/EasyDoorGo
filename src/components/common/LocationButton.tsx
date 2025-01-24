import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationButtonProps {
  onLocation: (location: { lat: number; lng: number }) => void;
  className?: string;
}

export function LocationButton({ onLocation, className }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetLocation = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      toast({
        title: "Erreur",
        description: "La géolocalisation n'est pas supportée par votre navigateur",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        let message = "Impossible d'obtenir votre position";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Vous devez autoriser la géolocalisation";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position indisponible";
            break;
          case error.TIMEOUT:
            message = "La demande de géolocalisation a expiré";
            break;
        }

        toast({
          title: "Erreur de géolocalisation",
          description: message,
          variant: "destructive"
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // Désactiver la haute précision pour une réponse plus rapide
        timeout: 10000, // Augmenter le timeout à 10 secondes
        maximumAge: 30000 // Permettre l'utilisation d'une position mise en cache jusqu'à 30 secondes
      }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleGetLocation}
      disabled={loading}
      className={className}
    >
      <MapPin className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
    </Button>
  );
}