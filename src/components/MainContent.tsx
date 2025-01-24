import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { DesktopNavigation } from './navigation/DesktopNavigation';
import { MobileNavigation } from './navigation/MobileNavigation';
import { AddressForm } from './address/AddressForm';
import { AddressTable } from './address/AddressTable';
import { AddressFilters } from './address/AddressFilters';
import { StreetSelector } from './address/StreetSelector';
import { StatusChart } from './stats/StatusChart';
import { MapView } from './map/MapView';
import { CitySelector } from './city/CitySelector';
import { SettingsSection } from './settings/SettingsSection';
import { GamingOverview } from './gaming/GamingOverview';
import { GamingSession } from './gaming/GamingSession';
import { EditAddressDialog } from './address/EditAddressDialog';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Address, AddressStatus } from '@/lib/types/address';
import { City } from '@/lib/types/city';
import { filterAddresses } from '@/lib/utils/addressUtils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/lib/hooks/useFirestore';
import { LoadingSpinner } from './LoadingSpinner';
import { MapHelp } from './help/MapHelp';
import { StatsHelp } from './help/StatsHelp';
import { ListHelp } from './help/ListHelp';
import { ArrowLeft } from 'lucide-react';
import { useGaming } from '@/lib/hooks/useGaming';

interface MainContentProps {
  user: User;
}

export function MainContent({ user }: MainContentProps) {
  const [activeSection, setActiveSection] = useState('home');
  const { loading, cities, addresses, addCity, addAddress, updateAddress, deleteAddress, deleteCity } = useFirestore();
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [currentStreet, setCurrentStreet] = useState<string>('');
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>(addresses);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const { toast } = useToast();
  const { activeSession, updateSession } = useGaming();

  useEffect(() => {
    setFilteredAddresses(currentCity ? filterAddresses(addresses, currentCity.id) : []);
  }, [addresses, currentCity]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active' && activeSection !== 'home') {
      updateSession(activeSession.id, {
        status: 'paused',
        pauseStartedAt: new Date()
      });
      toast({
        title: "Session en pause",
        description: "La session a été mise en pause car vous avez quitté la page d'accueil"
      });
    }
  }, [activeSection, activeSession, updateSession, toast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getCurrentCityStreets = () => {
    if (!currentCity) return [];
    return [...new Set(addresses
      .filter(a => a.cityId === currentCity.id)
      .map(a => a.streetName))];
  };

  const getTotalDoorsForCity = (cityId: string) => {
    return addresses.filter(addr => addr.cityId === cityId).length;
  };

  const handleCitySelect = async (city: City) => {
    // Si une session est active, on la termine avant de changer de ville
    if (activeSession) {
      try {
        await updateSession(activeSession.id, {
          status: 'completed',
          endedAt: new Date()
        });
        toast({
          title: "Session terminée",
          description: "La session a été terminée car vous avez changé de ville"
        });
      } catch (error) {
        console.error('Erreur lors de la terminaison de la session:', error);
        toast({
          title: "Erreur",
          description: "Impossible de terminer la session en cours",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentCity(city);
    setCurrentStreet('');
    const cityAddresses = filterAddresses(addresses, city.id);
    setFilteredAddresses(cityAddresses);
  };

  const handleAddCity = async (cityData: Omit<City, 'id' | 'createdAt' | 'userId'>) => {
    try {
      const newCity = await addCity(cityData);
      setCurrentCity(newCity);
      toast({
        title: "Ville ajoutée",
        description: `${cityData.name} a été ajoutée avec succès.`
      });
      return newCity; // Retourner la nouvelle ville
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la ville",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteCity = async () => {
    if (!cityToDelete) return;

    try {
      await deleteCity(cityToDelete.id);
      setCurrentCity(null);
      setCityToDelete(null);
      toast({
        title: "Ville supprimée",
        description: `${cityToDelete.name} et toutes ses données ont été supprimées.`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la ville",
        variant: "destructive"
      });
    }
  };

  const handleBackToSelector = () => {
    setCurrentCity(null);
    setCurrentStreet('');
  };

  const handleAddAddress = async (address: { number: string; status: AddressStatus; additionalInfo: string }): Promise<boolean> => {
    if (!currentCity || !currentStreet) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sélectionner une ville et une rue",
        variant: "destructive"
      });
      return false;
    }

    const isDuplicate = addresses.some(a => 
      a.cityId === currentCity.id && 
      a.streetName === currentStreet && 
      a.number === address.number
    );

    if (isDuplicate) {
      toast({
        title: "Erreur",
        description: "Cette adresse existe déjà",
        variant: "destructive"
      });
      return false;
    }

    try {
      await addAddress({
        cityId: currentCity.id,
        streetName: currentStreet,
        ...address
      });

      toast({
        title: "Adresse ajoutée",
        description: `${address.number} ${currentStreet} a été ajouté avec succès.`
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'adresse",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleEditAddress = async (updatedAddress: Address) => {
    try {
      await updateAddress(updatedAddress);
      setAddressToEdit(null);
      toast({
        title: "Adresse modifiée",
        description: `${updatedAddress.number} ${updatedAddress.streetName} a été modifié avec succès.`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'adresse",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddress(addressToDelete);
      setAddressToDelete(null);
      toast({
        title: "Adresse supprimée",
        description: `${addressToDelete.number} ${addressToDelete.streetName} a été supprimé.`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'adresse",
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (filters: {
    street: string;
    status: AddressStatus | '';
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => {
    if (!currentCity) return;

    let filtered = filterAddresses(
      addresses,
      currentCity.id,
      filters.street || undefined,
      filters.status || undefined
    );

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(addr =>
        addr.number.toLowerCase().includes(searchLower) ||
        addr.streetName.toLowerCase().includes(searchLower) ||
        addr.status.toLowerCase().includes(searchLower) ||
        addr.additionalInfo?.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'number':
          comparison = a.number.localeCompare(b.number, undefined, { numeric: true });
          break;
        case 'street':
          comparison = a.streetName.localeCompare(b.streetName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAddresses(filtered);
  };

  const renderContent = () => {
    if (!currentCity && activeSection !== 'settings') {
      return (
        <section className="bg-card rounded-lg p-3 sm:p-6 shadow-sm">
          <CitySelector 
            cities={cities}
            onCitySelect={handleCitySelect}
            onCityAdd={handleAddCity}
          />
        </section>
      );
    }

    switch (activeSection) {
      case 'home':
        return (
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBackToSelector}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Changer de ville
              </Button>
            </div>

            <GamingOverview 
              currentCity={currentCity}
              totalDoorsVisited={currentCity ? getTotalDoorsForCity(currentCity.id) : 0}
            />
            {currentCity && <GamingSession city={currentCity} />}

            <div className="grid gap-6 lg:grid-cols-2">
              <StreetSelector
                existingStreets={getCurrentCityStreets()}
                onStreetSelect={setCurrentStreet}
                onStreetAdd={(street) => setCurrentStreet(street)}
              />
              {currentStreet && (
                <AddressForm 
                  onSubmit={handleAddAddress} 
                  streetName={currentStreet} 
                />
              )}
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Carte</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Comment ça marche ?</span>
                <MapHelp />
              </div>
            </div>
            <MapView addresses={filteredAddresses} city={currentCity!} />
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Statistiques</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Comment ça marche ?</span>
                <StatsHelp />
              </div>
            </div>
            <StatusChart addresses={filteredAddresses} />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Liste des adresses</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Comment ça marche ?</span>
                <ListHelp />
              </div>
            </div>
            <AddressFilters 
              streets={getCurrentCityStreets()}
              onFilterChange={handleFilterChange}
            />
            <AddressTable 
              addresses={filteredAddresses}
              onEdit={setAddressToEdit}
              onDelete={setAddressToDelete}
            />
            <EditAddressDialog
              address={addressToEdit}
              isOpen={!!addressToEdit}
              onClose={() => setAddressToEdit(null)}
              onSave={handleEditAddress}
            />
            <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer l'adresse {addressToDelete?.number} {addressToDelete?.streetName} ?
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAddress}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );

      case 'settings':
        return (
          <SettingsSection 
            addresses={addresses}
            cities={cities}
            onCityDelete={setCityToDelete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <DesktopNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {renderContent()}

      <MobileNavigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <AlertDialog open={!!cityToDelete} onOpenChange={() => setCityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la ville {cityToDelete?.name} ?
              Cette action supprimera également toutes les adresses et données associées.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCity}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}