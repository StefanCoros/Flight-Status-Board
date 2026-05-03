import { type Flight, FlightStatus, type RawPost } from "../types/flight";

const TERMINAL_MIN = 1;
const TERMINAL_MAX = 10;

const deriveStatus = (id: number): FlightStatus => {
  const bucket = id % 10;
  if (bucket < 7) return FlightStatus.OnTime;
  if (bucket < 9) return FlightStatus.Delayed;
  return FlightStatus.Cancelled;
};

const deriveGate = (id: number): string => {
  const letter = String.fromCharCode(65 + (id % 6));
  const number = (id % 30) + 1;
  return `${letter}${number}`;
};

const deriveDepartureTime = (id: number, base: Date): Date => {
  const result = new Date(base);
  result.setHours(6 + (id % 16), (id * 7) % 60, 0, 0);
  return result;
};

const clampTerminal = (userId: number): number => {
  if (userId < TERMINAL_MIN) return TERMINAL_MIN;
  if (userId > TERMINAL_MAX) return TERMINAL_MAX;
  return userId;
};

const titleCase = (input: string): string =>
  input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const mapPostToFlight = (
  post: RawPost,
  today: Date = new Date(),
): Flight => ({
  flightNumber: `FL-${post.id}`,
  destination: titleCase(post.title),
  status: deriveStatus(post.id),
  gate: deriveGate(post.id),
  terminal: clampTerminal(post.userId),
  departureTime: deriveDepartureTime(post.id, today),
});

export const mapPostsToFlights = (
  posts: RawPost[],
  today: Date = new Date(),
): Flight[] => posts.map((p) => mapPostToFlight(p, today));
