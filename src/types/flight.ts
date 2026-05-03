export enum FlightStatus {
  OnTime = 'On Time',
  Delayed = 'Delayed',
  Cancelled = 'Cancelled',
}

export interface Flight {
  flightNumber: string;
  destination: string;
  status: FlightStatus;
  gate: string;
  terminal: number;
  departureTime: Date;
}

export interface RawPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type DataState =
  | { phase: 'idle' }
  | { phase: 'initialLoading' }
  | { phase: 'loaded'; lastUpdated: Date }
  | { phase: 'backgroundRefreshing'; lastUpdated: Date }
  | { phase: 'initialError'; error: string }
  | { phase: 'staleError'; error: string; lastUpdated: Date };

export type StatusFilter = FlightStatus | 'all';

export type GroupKey = 'terminal' | 'gate';
