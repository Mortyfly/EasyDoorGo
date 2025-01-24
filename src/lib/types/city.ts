export interface City {
  name: string;
  postalCode: string;
  id: string;
  createdAt: Date;
  userId: string;
  targetDoors?: number;
}

export interface CityWithStreets extends City {
  streets: string[];
}