/**
 * Shared by the Next app and the prebuild script (`parseRuleData.ts`), which
 * used to declare its own near-identical copies of these.
 */

export interface TagSummary {
  tag_type: string;
  tag_name: string;
  tag_full: string;
  count: number;
}

/**
 * A rule summary as the app reads it back out of `src/data/newestRules.json`.
 */
export interface RuleSummary {
  id: string;
  name: string;
  tags: string[];
  updated_date: string;
}

/**
 * The same record as the prebuild script holds it in memory, before writing.
 * `JSON.stringify` serialises the `Date` to the ISO string the app then sees,
 * which is the only reason the two shapes differ.
 */
export type RuleSummaryInput = Omit<RuleSummary, 'updated_date'> & {
  updated_date: Date;
};
