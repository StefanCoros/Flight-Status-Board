/**
 * Computes the next set of collapsed group keys after toggling the expansion
 * state of a target subset of keys (typically the search-filtered "visible"
 * options of the expand multiselect).
 *
 * Behaviour:
 * - If every target key is currently expanded (i.e. none of them are in the
 *   collapsed set), all targets are collapsed (added to the collapsed set).
 * - Otherwise (at least one target is collapsed), all targets are expanded
 *   (removed from the collapsed set).
 * - Keys outside the target set are left untouched.
 * - Always returns a new Set; the input is never mutated.
 *
 * This is the pure logic behind the "Select all" / "Unselect all" action in
 * the expand-groups multiselect, applied to only the currently visible
 * (search-matched) options.
 */
export const toggleCollapsedForKeys = (
  collapsedKeys: ReadonlySet<string>,
  targetKeys: readonly string[],
): Set<string> => {
  const next = new Set(collapsedKeys);
  if (targetKeys.length === 0) return next;

  const allTargetsExpanded = targetKeys.every((k) => !next.has(k));
  if (allTargetsExpanded) {
    targetKeys.forEach((k) => next.add(k));
  } else {
    targetKeys.forEach((k) => next.delete(k));
  }
  return next;
};
