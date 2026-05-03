import { useCallback, useEffect, useRef, useState } from "react";

import { mapPostsToFlights } from "../mappers/flightMapper";
import { fetchPosts } from "../services/api";
import type { DataState, Flight, RawPost } from "../types/flight";

const DEFAULT_REFRESH_INTERVAL_MS = 30_000;

export interface UseFlightDataOptions {
  refreshIntervalMs?: number;
  fetcher?: (signal?: AbortSignal) => Promise<RawPost[]>;
}

export interface UseFlightDataResult {
  flights: Flight[];
  dataState: DataState;
  refresh: () => void;
}

const errorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
};

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === "AbortError";

export const useFlightData = (
  options: UseFlightDataOptions = {},
): UseFlightDataResult => {
  const {
    refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
    fetcher = fetchPosts,
  } = options;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [dataState, setDataState] = useState<DataState>({
    phase: "initialLoading",
  });

  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const flightsRef = useRef<Flight[]>([]);
  const dataStateRef = useRef<DataState>(dataState);
  const fetcherRef = useRef(fetcher);
  const isMountedRef = useRef<boolean>(true);

  flightsRef.current = flights;
  dataStateRef.current = dataState;
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (): Promise<void> => {
    if (inFlightRef.current) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;

    const hadDataBefore = flightsRef.current.length > 0;
    if (hadDataBefore) {
      const prev = dataStateRef.current;
      const lastUpdated =
        prev.phase === "loaded" ||
        prev.phase === "backgroundRefreshing" ||
        prev.phase === "staleError"
          ? prev.lastUpdated
          : new Date();
      setDataState({ phase: "backgroundRefreshing", lastUpdated });
    } else {
      setDataState({ phase: "initialLoading" });
    }

    try {
      const posts = await fetcherRef.current(controller.signal);
      if (controller.signal.aborted || !isMountedRef.current) return;

      const mapped = mapPostsToFlights(posts);
      setFlights(mapped);
      setDataState({ phase: "loaded", lastUpdated: new Date() });
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) return;
      if (!isMountedRef.current) return;

      const message = errorMessage(err);
      if (flightsRef.current.length > 0) {
        const prev = dataStateRef.current;
        const lastUpdated =
          prev.phase === "loaded" ||
          prev.phase === "backgroundRefreshing" ||
          prev.phase === "staleError"
            ? prev.lastUpdated
            : new Date();
        setDataState({ phase: "staleError", error: message, lastUpdated });
      } else {
        setDataState({ phase: "initialError", error: message });
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const refresh = useCallback((): void => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    void fetchData();

    const intervalId = window.setInterval(() => {
      void fetchData();
    }, refreshIntervalMs);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(intervalId);
      abortRef.current?.abort();
      inFlightRef.current = false;
    };
  }, [fetchData, refreshIntervalMs]);

  return { flights, dataState, refresh };
};
