import { ReactNode } from 'react';

/** A row as `EuiDescriptionList` requires it: both halves definitely present. */
export interface DescriptionItem {
  title: string;
  description: NonNullable<ReactNode>;
}

/** A row before filtering, where the description may be missing. */
export interface CandidateItem {
  title: string;
  description?: ReactNode;
}

/**
 * Drop rows with nothing to show.
 *
 * A plain `.filter(item => item.description)` does the same at runtime but does
 * not narrow the type, so `EuiDescriptionList` rejects the result under
 * `strictNullChecks`. Hence the explicit predicate.
 *
 * `alwaysKeep` preserves rows that are label-only -- the Definition panel's
 * "Query" row is rendered as a code block beneath the list, so its description
 * is deliberately an empty string.
 */
export function withContent(
  items: CandidateItem[],
  alwaysKeep: string[] = []
): DescriptionItem[] {
  return items.filter(
    (item): item is DescriptionItem =>
      alwaysKeep.includes(item.title) || Boolean(item.description)
  );
}
