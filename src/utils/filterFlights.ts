import type { Flight, StatusFilter } from '../types/flight';

export const filterFlights = (
  flights: Flight[],
  statusFilter: StatusFilter,
  search: string = '',
): Flight[] => {
  const trimmed = search.trim().toLowerCase();
  return flights.filter((flight) => {
    const statusMatches = statusFilter === 'all' || flight.status === statusFilter;
    if (!statusMatches) return false;

    if (!trimmed) return true;
    return (
      flight.flightNumber.toLowerCase().includes(trimmed) ||
      flight.destination.toLowerCase().includes(trimmed)
    );
  });
};
