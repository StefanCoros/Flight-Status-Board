import type { RawPost } from '../types/flight';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

let simulateError = false;

export const toggleErrorSimulation = (): boolean => {
  simulateError = !simulateError;
  return simulateError;
};

export const isErrorSimulationOn = (): boolean => simulateError;

export const fetchPosts = async (signal?: AbortSignal): Promise<RawPost[]> => {
  if (simulateError) {
    throw new Error('Simulated network failure');
  }

  const res = await fetch(POSTS_URL, signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected API response: not an array');
  }
  return data as RawPost[];
};
