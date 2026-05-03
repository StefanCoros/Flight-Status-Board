import { describe, expect, it } from 'vitest';

import { toggleCollapsedForKeys } from './toggleGroupExpansion';

describe('toggleCollapsedForKeys', () => {
  it('expands only the searched key when starting from "all collapsed" (the user scenario)', () => {
    // Step 1 of the scenario: every group is collapsed (multiselect is empty).
    const collapsed = new Set([
      'Terminal 1',
      'Terminal 2',
      'Terminal 3',
      'Terminal 4',
    ]);

    // Step 2 + 3: the user types in the multiselect's search and "Terminal 1"
    // is the only visible option. Clicking "Select all" should only toggle
    // that visible key.
    const visibleKeys = ['Terminal 1'];

    const result = toggleCollapsedForKeys(collapsed, visibleKeys);

    expect(result.has('Terminal 1')).toBe(false); // expanded
    expect(result.has('Terminal 2')).toBe(true); // untouched (still collapsed)
    expect(result.has('Terminal 3')).toBe(true);
    expect(result.has('Terminal 4')).toBe(true);
  });

  it('expands every visible key when none of them are currently expanded', () => {
    const collapsed = new Set([
      'Terminal 1',
      'Terminal 2',
      'Terminal 3',
      'Terminal 4',
    ]);
    const visibleKeys = ['Terminal 1', 'Terminal 2'];

    const result = toggleCollapsedForKeys(collapsed, visibleKeys);

    expect(result.has('Terminal 1')).toBe(false);
    expect(result.has('Terminal 2')).toBe(false);
    expect(result.has('Terminal 3')).toBe(true);
    expect(result.has('Terminal 4')).toBe(true);
  });

  it('collapses every visible key when all of them are currently expanded', () => {
    // Only Terminal 4 is collapsed; the visible Terminal 1 + 2 are both
    // currently expanded, so the toggle should flip them to collapsed.
    const collapsed = new Set(['Terminal 4']);
    const visibleKeys = ['Terminal 1', 'Terminal 2'];

    const result = toggleCollapsedForKeys(collapsed, visibleKeys);

    expect(result.has('Terminal 1')).toBe(true);
    expect(result.has('Terminal 2')).toBe(true);
    expect(result.has('Terminal 4')).toBe(true); // untouched
    expect(result.size).toBe(3);
  });

  it('expands all visible keys when the visible set is mixed (at least one collapsed)', () => {
    // "At least one visible key is collapsed" means clicking the action
    // expands the whole visible set, matching the "Select all" label that the
    // header shows in this state.
    const collapsed = new Set(['Terminal 1', 'Terminal 5']);
    const visibleKeys = ['Terminal 1', 'Terminal 2'];

    const result = toggleCollapsedForKeys(collapsed, visibleKeys);

    expect(result.has('Terminal 1')).toBe(false);
    expect(result.has('Terminal 2')).toBe(false);
    expect(result.has('Terminal 5')).toBe(true); // untouched (not in visible set)
  });

  it('returns an unchanged copy when there are no visible keys', () => {
    const collapsed = new Set(['Terminal 1', 'Terminal 2']);

    const result = toggleCollapsedForKeys(collapsed, []);

    expect(result).toEqual(collapsed);
    expect(result).not.toBe(collapsed); // still a fresh Set instance
  });

  it('does not mutate the input set', () => {
    const collapsed = new Set(['Terminal 1', 'Terminal 2']);
    const snapshot = new Set(collapsed);

    toggleCollapsedForKeys(collapsed, ['Terminal 1']);

    expect(collapsed).toEqual(snapshot);
  });

  it('leaves keys outside the visible set untouched', () => {
    // Setting up a scenario with many groups, only two visible. The action
    // must never modify keys that the user has not searched for.
    const collapsed = new Set(['Gate A1', 'Gate A2', 'Gate B1', 'Gate B2']);
    const visibleKeys = ['Gate A1', 'Gate A2'];

    const result = toggleCollapsedForKeys(collapsed, visibleKeys);

    expect(result.has('Gate B1')).toBe(true);
    expect(result.has('Gate B2')).toBe(true);
  });
});
