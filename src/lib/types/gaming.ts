export interface UserProgress {
  id: string;
  userId: string;
  level: number;
  totalXp: number;
  totalDoors: number;
  rank: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GamingSession {
  id: string;
  userId: string;
  cityId: string;
  startedAt: Date;
  endedAt?: Date;
  seriesCompleted: number;
  doorsVisited: number;
  currentSeriesDoors: number;
  lastDoorTime?: Date;
  status: 'active' | 'paused' | 'completed';
  pauseStartedAt?: Date;
  totalPauseDuration: number;
  dailyDoors: number;
  dailyDate: string;
}