import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately on first render", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current[0]).toBe("hello");
  });

  it("does not update the debounced value before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    rerender({ value: "abc" });

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current[0]).toBe("a");
  });

  it("updates to the latest value once the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    rerender({ value: "abc" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current[0]).toBe("abc");
  });

  it("resets the timer when the value changes again before the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "abc" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe("abc");
  });

  it("updates synchronously when delay is 0", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 0),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    expect(result.current[0]).toBe("b");
  });

  it("flush() commits the latest value immediately and cancels the pending timer", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "abc" });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe("a");

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe("abc");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe("abc");
  });
});
