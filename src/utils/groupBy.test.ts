import { describe, expect, it } from 'vitest';

import { groupBy } from './groupBy';

describe('groupBy', () => {
  it('groups items by the provided key', () => {
    const items = [
      { id: 1, type: 'a' },
      { id: 2, type: 'b' },
      { id: 3, type: 'a' },
    ];
    const grouped = groupBy(items, (item) => item.type);
    expect(Object.keys(grouped).sort()).toEqual(['a', 'b']);
    expect(grouped.a).toHaveLength(2);
    expect(grouped.b).toHaveLength(1);
  });

  it('returns an empty record for empty input', () => {
    expect(groupBy<number>([], (n) => String(n))).toEqual({});
  });
});
