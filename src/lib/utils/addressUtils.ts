import { Address, AddressStatus } from '@/lib/types/address';

export const filterAddresses = (
  addresses: Address[],
  cityId?: string,
  street?: string,
  status?: AddressStatus
): Address[] => {
  return addresses.filter(address => 
    (!cityId || address.cityId === cityId) &&
    (!street || address.streetName === street) &&
    (!status || address.status === status)
  );
};

export const generateAddressKey = (address: Address): string => {
  return `${address.cityId}-${address.streetName}-${address.number}`;
};

export const groupAddressesByStreet = (addresses: Address[]): Record<string, Address[]> => {
  return addresses.reduce((acc, address) => {
    if (!acc[address.streetName]) {
      acc[address.streetName] = [];
    }
    acc[address.streetName].push(address);
    return acc;
  }, {} as Record<string, Address[]>);
};