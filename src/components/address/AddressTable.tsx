import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Info } from "lucide-react";
import { Address } from "@/lib/types/address";
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';
import { generateAddressKey } from "@/lib/utils/addressUtils";
import { InfoDialog } from "./InfoDialog";
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AddressTableProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
}

export function AddressTable({ addresses, onEdit, onDelete }: AddressTableProps) {
  const { statuses, loading } = useStatusSettings();
  const [selectedInfo, setSelectedInfo] = useState<{ title: string; content: string } | null>(null);

  const handleInfoClick = (address: Address) => {
    if (address.additionalInfo) {
      setSelectedInfo({
        title: `${address.number} ${address.streetName}`,
        content: address.additionalInfo
      });
    }
  };

  const getStatusStyle = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    if (!status) return {};
    
    return {
      backgroundColor: `${status.color}20`,
      color: status.color,
      borderColor: `${status.color}40`
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[120px]">N°</TableHead>
              <TableHead>Rue</TableHead>
              <TableHead className="w-[100px]">Statut</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.map((address) => (
              <TableRow key={generateAddressKey(address)}>
                <TableCell className="font-medium">{address.number}</TableCell>
                <TableCell className="max-w-[150px] truncate">{address.streetName}</TableCell>
                <TableCell>
                  {address.status && (
                    <span 
                      className="inline-block px-2 py-1 text-xs rounded-full border"
                      style={getStatusStyle(address.status)}
                    >
                      {address.status}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {address.additionalInfo && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleInfoClick(address)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(address)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InfoDialog
        isOpen={!!selectedInfo}
        onClose={() => setSelectedInfo(null)}
        title={selectedInfo?.title ?? ''}
        content={selectedInfo?.content ?? ''}
      />
    </>
  );
}