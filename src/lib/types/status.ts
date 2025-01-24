export interface Status {
  id: string;
  name: string;
  color: string;
  description: string;
  order: number;
}

export interface StatusSettings {
  statuses: Status[];
  lastUpdated: string;
}