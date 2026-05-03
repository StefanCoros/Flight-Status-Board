import type { Flight, GroupKey } from '../types/flight';

export const groupingStrategies: Record<GroupKey, (flight: Flight) => string> = {
  terminal: (flight) => `Terminal ${flight.terminal}`,
  gate: (flight) => `Gate ${flight.gate}`,
};

export const groupKeyLabels: Record<GroupKey, string> = {
  terminal: 'Terminal',
  gate: 'Gate',
};

const NUMBERS_RE = /(\d+)/;

export const compareGroupNames = (a: string, b: string): number => {
  const matchA = a.match(NUMBERS_RE);
  const matchB = b.match(NUMBERS_RE);
  if (matchA && matchB && matchA[0] && matchB[0]) {
    const numA = Number.parseInt(matchA[0], 10);
    const numB = Number.parseInt(matchB[0], 10);
    if (numA !== numB) return numA - numB;
  }
  return a.localeCompare(b);
};
