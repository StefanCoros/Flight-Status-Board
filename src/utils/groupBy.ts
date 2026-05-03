export const groupBy = <T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> => {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    const bucket = result[key];
    if (bucket) {
      bucket.push(item);
    } else {
      result[key] = [item];
    }
  }
  return result;
};
