import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search } from "lucide-react";
import { AddressStatus } from '@/lib/types/address';
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';

interface AddressFiltersProps {
  streets: string[];
  onFilterChange: (filters: {
    street: string;
    status: AddressStatus | '';
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => void;
}

type SortOption = {
  value: string;
  label: string;
};

const sortOptions: SortOption[] = [
  { value: 'number', label: 'Numéro' },
  { value: 'street', label: 'Rue' },
  { value: 'status', label: 'Statut' },
  { value: 'date', label: 'Date d\'ajout' }
];

export function AddressFilters({ streets, onFilterChange }: AddressFiltersProps) {
  const { statuses } = useStatusSettings();
  const [selectedStreet, setSelectedStreet] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<AddressStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleFilterChange = () => {
    onFilterChange({
      street: selectedStreet === 'all' ? '' : selectedStreet,
      status: selectedStatus === 'all' ? '' : selectedStatus as AddressStatus,
      search: searchTerm,
      sortBy,
      sortOrder
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une adresse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rue</label>
          <Select value={selectedStreet} onValueChange={setSelectedStreet}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Toutes les rues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="filter-street-all" value="all">Toutes les rues</SelectItem>
              {streets.map((street) => (
                <SelectItem key={`filter-street-${street}`} value={street}>{street}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Statut</label>
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AddressStatus | 'all')}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="filter-status-all" value="all">Tous les statuts</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={`filter-status-${status.id}`} value={status.name}>{status.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Trier par</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Choisir un tri" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={`filter-sort-${option.value}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ordre</label>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
            <ArrowUpDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <Button onClick={handleFilterChange} className="w-full sm:w-auto">
        Appliquer les filtres
      </Button>
    </div>
  );
}