export interface Station {
  id: string;
  name: string;
  duration: number; // minutes
}

export interface Program {
  id: string;
  name: string;
  stations: Station[];
  startTime: string; // HH:mm:ss
}

export interface Timer {
  id: string;
  name: string;
  programs: Program[];
}

export interface SprinklerSettings {
  timers: Timer[];
  sprinklerOnThreshold: number;
  gpu: number; // Gallons per unit
  gpuCost: number;
}

export interface FlumeDataPoint {
  datetime: Date;
  gallons: number;
  sprinkler?: string;
  isSprinklerDay?: boolean;
}

export interface DailySummary {
  date: string;
  totalGallons: number;
  sprinklerGallons: number;
  isSprinklerDay: boolean;
  bySprinkler: Record<string, number>;
}
