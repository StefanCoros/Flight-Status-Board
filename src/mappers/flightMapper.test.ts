import { describe, expect, it } from 'vitest';

import { mapPostToFlight, mapPostsToFlights } from './flightMapper';
import { FlightStatus, type RawPost } from '../types/flight';

const fixedDate = new Date('2026-04-30T00:00:00.000Z');

const post = (overrides: Partial<RawPost> = {}): RawPost => ({
  id: 42,
  userId: 3,
  title: 'Some City',
  body: '',
  ...overrides,
});

describe('mapPostToFlight', () => {
  it('produces stable, deterministic output for the same post', () => {
    const a = mapPostToFlight(post(), fixedDate);
    const b = mapPostToFlight(post(), fixedDate);
    expect(a).toEqual(b);
  });

  it('formats flight number from the post id', () => {
    const flight = mapPostToFlight(post({ id: 7 }), fixedDate);
    expect(flight.flightNumber).toBe('FL-7');
  });

  it('uses userId as the terminal', () => {
    const flight = mapPostToFlight(post({ userId: 5 }), fixedDate);
    expect(flight.terminal).toBe(5);
  });

  it('derives status using the documented 70/20/10 split', () => {
    expect(mapPostToFlight(post({ id: 0 }), fixedDate).status).toBe(FlightStatus.OnTime);
    expect(mapPostToFlight(post({ id: 6 }), fixedDate).status).toBe(FlightStatus.OnTime);
    expect(mapPostToFlight(post({ id: 7 }), fixedDate).status).toBe(FlightStatus.Delayed);
    expect(mapPostToFlight(post({ id: 8 }), fixedDate).status).toBe(FlightStatus.Delayed);
    expect(mapPostToFlight(post({ id: 9 }), fixedDate).status).toBe(FlightStatus.Cancelled);
  });

  it('produces a gate of the form letter+number', () => {
    const flight = mapPostToFlight(post({ id: 12 }), fixedDate);
    expect(flight.gate).toMatch(/^[A-F]\d+$/);
  });

  it('clamps terminal to 1..10', () => {
    expect(mapPostToFlight(post({ userId: 0 }), fixedDate).terminal).toBe(1);
    expect(mapPostToFlight(post({ userId: 99 }), fixedDate).terminal).toBe(10);
  });

  it('places departure time within 06:00..21:59 of the base day', () => {
    const flight = mapPostToFlight(post({ id: 15 }), fixedDate);
    const hour = flight.departureTime.getHours();
    expect(hour).toBeGreaterThanOrEqual(6);
    expect(hour).toBeLessThanOrEqual(21);
  });
});

describe('mapPostsToFlights', () => {
  it('maps an array of posts to flights', () => {
    const posts: RawPost[] = [post({ id: 1 }), post({ id: 2 })];
    const flights = mapPostsToFlights(posts, fixedDate);
    expect(flights).toHaveLength(2);
    expect(flights[0]?.flightNumber).toBe('FL-1');
    expect(flights[1]?.flightNumber).toBe('FL-2');
  });
});
