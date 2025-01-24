import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressStatus } from '@/lib/types/address';
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';
import { useGaming } from '@/lib/hooks/useGaming';
import { LocationButton } from '@/components/common/LocationButton';
import { reverseGeocode } from '@/lib/utils/geocoding';
import { SeriesCompletionPopup } from '@/components/gaming/SeriesCompletionPopup';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause } from 'lucide-react';
import { useTutorial } from '@/components/tutorial/TutorialProvider';

interface AddressFormProps {
  onSubmit: (address: { number: string; status: AddressStatus; additionalInfo: string }) => Promise<boolean>;
  streetName: string;
}

export function AddressForm({ onSubmit, streetName }: AddressFormProps) {
  const { statuses } = useStatusSettings();
  const { activeSession, updateSession } = useGaming();
  const { toast } = useToast();
  const { nextStep } = useTutorial();
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<AddressStatus>(statuses[0]?.name as AddressStatus);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showSeriesPopup, setShowSeriesPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSession) {
      toast({
        title: "Session requise",
        description: "Vous devez démarrer une session avant d'ajouter des adresses",
        variant: "destructive"
      });
      return;
    }

    if (activeSession.status === 'paused') {
      toast({
        title: "Session en pause",
        description: "Vous devez reprendre la session avant d'ajouter des adresses",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await onSubmit({ number, status, additionalInfo });
      
      if (success && activeSession && activeSession.status === 'active') {
        const newDoorsVisited = activeSession.doorsVisited + 1;
        const newCurrentSeriesDoors = activeSession.currentSeriesDoors + 1;
        let newSeriesCompleted = activeSession.seriesCompleted;
        
        if (newCurrentSeriesDoors >= 10) {
          newSeriesCompleted += 1;
          await updateSession(activeSession.id, {
            doorsVisited: newDoorsVisited,
            currentSeriesDoors: 0,
            seriesCompleted: newSeriesCompleted,
            lastDoorTime: new Date()
          });
          
          setShowSeriesPopup(true);
        } else {
          await updateSession(activeSession.id, {
            doorsVisited: newDoorsVisited,
            currentSeriesDoors: newCurrentSeriesDoors,
            lastDoorTime: new Date()
          });
        }

        setNumber('');
        setAdditionalInfo('');
        nextStep();
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleContinue = () => {
    setShowSeriesPopup(false);
  };

  const handlePause = async () => {
    if (activeSession) {
      await updateSession(activeSession.id, { status: 'paused' });
    }
    setShowSeriesPopup(false);
  };

  const handleResume = async () => {
    if (activeSession) {
      await updateSession(activeSession.id, { status: 'active' });
    }
  };

  const handleLocation = async (location: { lat: number; lng: number }) => {
    try {
      const result = await reverseGeocode(location.lat, location.lng);
      
      if (result.error || !result.address?.number) {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de déterminer le numéro",
          variant: "destructive"
        });
        return;
      }

      setNumber(result.address.number);
      
      toast({
        title: "Numéro trouvé",
        description: `Numéro ${result.address.number}`
      });
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déterminer le numéro",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="bg-card address-form">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ajouter une adresse - {streetName}</CardTitle>
            {activeSession?.status === 'paused' && (
              <Button
                variant="outline"
                onClick={handleResume}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Reprendre la session
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Numéro</Label>
              <div className="flex gap-2">
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-background"
                  required
                  disabled={!activeSession || activeSession.status === 'paused'}
                />
                <LocationButton 
                  onLocation={handleLocation}
                  className="shrink-0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as AddressStatus)}
                disabled={!activeSession || activeSession.status === 'paused'}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Informations additionnelles</Label>
              <Input
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="bg-background"
                disabled={!activeSession || activeSession.status === 'paused'}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!activeSession || activeSession.status === 'paused'}
            >
              {!activeSession ? (
                "Démarrez une session pour ajouter des adresses"
              ) : activeSession.status === 'paused' ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Session en pause
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SeriesCompletionPopup
        isOpen={showSeriesPopup}
        onContinue={handleContinue}
        onPause={handlePause}
      />
    </>
  );
}