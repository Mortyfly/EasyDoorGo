export interface Address {
  streetName: string;
  number: string;
  status: 'Accepté' | 'Absent' | 'PI' | 'Fermé' | 'À Vendre' | 'Référent';
  additionalInfo?: string;
}

export interface Street {
  streetName: string;
  addresses: Address[];
}