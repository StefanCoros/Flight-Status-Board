import { FlightStatus } from '../types/flight';

export interface StatusMeta {
  label: string;
  color: 'success' | 'warning' | 'error';
  tone: 'on-time' | 'delayed' | 'cancelled';
}

export const statusMeta: Record<FlightStatus, StatusMeta> = {
  [FlightStatus.OnTime]: { label: 'On Time', color: 'success', tone: 'on-time' },
  [FlightStatus.Delayed]: { label: 'Delayed', color: 'warning', tone: 'delayed' },
  [FlightStatus.Cancelled]: { label: 'Cancelled', color: 'error', tone: 'cancelled' },
};
