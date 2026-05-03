import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFlightData } from './useFlightData';
import type { RawPost } from '../types/flight';

const samplePosts: RawPost[] = [
  { id: 1, userId: 1, title: 'Berlin', body: '' },
  { id: 2, userId: 2, title: 'Paris', body: '' },
];

describe('useFlightData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in initialLoading and transitions to loaded on success', async () => {
    const fetcher = vi.fn().mockResolvedValue(samplePosts);

    const { result } = renderHook(() => useFlightData({ fetcher, refreshIntervalMs: 60_000 }));

    expect(result.current.dataState.phase).toBe('initialLoading');

    await waitFor(() => {
      expect(result.current.dataState.phase).toBe('loaded');
    });

    expect(result.current.flights).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('keeps existing flights and transitions to staleError on a failed refetch', async () => {
    const fetcher = vi
      .fn<(signal?: AbortSignal) => Promise<RawPost[]>>()
      .mockResolvedValueOnce(samplePosts)
      .mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useFlightData({ fetcher, refreshIntervalMs: 60_000 }));

    await waitFor(() => {
      expect(result.current.dataState.phase).toBe('loaded');
    });

    await act(async () => {
      result.current.refresh();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.dataState.phase).toBe('staleError');
    });

    expect(result.current.flights).toHaveLength(2);
    if (result.current.dataState.phase === 'staleError') {
      expect(result.current.dataState.error).toBe('boom');
    }
  });

  it('transitions to initialError when the very first fetch fails', async () => {
    const fetcher = vi
      .fn<(signal?: AbortSignal) => Promise<RawPost[]>>()
      .mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useFlightData({ fetcher, refreshIntervalMs: 60_000 }));

    await waitFor(() => {
      expect(result.current.dataState.phase).toBe('initialError');
    });

    expect(result.current.flights).toHaveLength(0);
  });
});
