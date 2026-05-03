import { useCallback, useEffect, useRef, useState } from "react";

export const useDebounce = <T>(
  value: T,
  delayMs: number,
): readonly [T, () => void] => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const timeoutRef = useRef<number | null>(null);
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  const clearPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setDebouncedValue(value);
      timeoutRef.current = null;
    }, delayMs);

    return clearPending;
  }, [value, delayMs, clearPending]);

  const flush = useCallback(() => {
    clearPending();
    setDebouncedValue(valueRef.current);
  }, [clearPending]);

  return [debouncedValue, flush];
};
