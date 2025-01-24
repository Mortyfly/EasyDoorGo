import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusSettings } from './StatusSettings';
import { CitySettings } from './CitySettings';
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';
import { Address } from '@/lib/types/address';
import { City } from '@/lib/types/city';
import { useAuthContext } from '@/providers/AuthProvider';
import { statusService } from '@/lib/firebase/services/statusService';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SettingsSectionProps {
  addresses: Address[];
  cities: City[];
  onCityDelete: (city: City) => void;
}

export function SettingsSection({ addresses, cities, onCityDelete }: SettingsSectionProps) {
  const { user } = useAuthContext();
  const { statuses, updateStatuses } = useStatusSettings();
  const [usedStatuses, setUsedStatuses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isCitiesOpen, setIsCitiesOpen] = useState(true);
  const [isStatusesOpen, setIsStatusesOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const used = new Set(addresses.map(addr => addr.status));
    setUsedStatuses(used);
  }, [addresses]);

  const handleStatusesChange = async (newStatuses: typeof statuses) => {
    if (!user) return;

    try {
      setLoading(true);

      // Mettre à jour les statuts dans Firestore
      await Promise.all(newStatuses.map(async (status) => {
        await statusService.updateStatus(user.uid, status.id, status);
      }));

      // Mettre à jour le state local
      updateStatuses(newStatuses);

      toast({
        title: "Succès",
        description: "Les statuts ont été mis à jour avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des statuts",
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
    <div className="space-y-6">
      <Collapsible open={isCitiesOpen} onOpenChange={setIsCitiesOpen}>
        <Card>
          <CardHeader className="p-0">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center p-6"
              >
                <CardTitle>Gestion des villes</CardTitle>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isCitiesOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <CitySettings
                cities={cities}
                addresses={addresses}
                onCityDelete={onCityDelete}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      <Collapsible open={isStatusesOpen} onOpenChange={setIsStatusesOpen}>
        <Card>
          <CardHeader className="p-0">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center p-6"
              >
                <CardTitle>Gestion des statuts</CardTitle>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isStatusesOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <StatusSettings
                statuses={statuses}
                onStatusesChange={handleStatusesChange}
                usedStatuses={usedStatuses}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}