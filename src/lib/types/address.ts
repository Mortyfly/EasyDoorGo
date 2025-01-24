export type AddressStatus = 'Accepté' | 'Absent' | 'PI' | 'Fermé' | 'À Vendre' | 'Référent';

export interface Address {
  id: string;
  cityId: string;
  streetName: string;
  number: string;
  status: AddressStatus;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt?: Date;
}