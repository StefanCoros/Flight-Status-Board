import { describe, expect, it } from 'vitest';

import { filterFlights } from './filterFlights';
import { type Flight, FlightStatus } from '../types/flight';

const flight = (overrides: Partial<Flight> = {}): Flight => ({
  flightNumber: 'FL-1',
  destination: 'Berlin',
  status: FlightStatus.OnTime,
  gate: 'A1',
  terminal: 1,
  departureTime: new Date('2026-04-30T08:00:00Z'),
  ...overrides,
});

describe('filterFlights', () => {
  const flights: Flight[] = [
    flight({ flightNumber: 'FL-1', status: FlightStatus.OnTime, destination: 'Berlin' }),
    flight({ flightNumber: 'FL-2', status: FlightStatus.Delayed, destination: 'Paris' }),
    flight({ flightNumber: 'FL-3', status: FlightStatus.Cancelled, destination: 'Rome' }),
  ];

  it('returns all flights when filter is "all" and no search', () => {
    expect(filterFlights(flights, 'all')).toHaveLength(3);
  });

  it('filters by status', () => {
    const onTime = filterFlights(flights, FlightStatus.OnTime);
    expect(onTime).toHaveLength(1);
    expect(onTime[0]?.flightNumber).toBe('FL-1');
  });

  it('filters by case-insensitive search on flight number', () => {
    expect(filterFlights(flights, 'all', 'fl-2')).toHaveLength(1);
  });

  it('filters by case-insensitive search on destination', () => {
    const result = filterFlights(flights, 'all', 'rom');
    expect(result).toHaveLength(1);
    expect(result[0]?.destination).toBe('Rome');
  });

  it('combines status and search filters', () => {
    const result = filterFlights(flights, FlightStatus.Delayed, 'paris');
    expect(result).toHaveLength(1);
    expect(result[0]?.flightNumber).toBe('FL-2');
  });
});
