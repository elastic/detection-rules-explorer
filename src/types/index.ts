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

export interface RuleTechnique {
  id: string;
  name: string;
  reference: string;
  subtechnique?: { id: string; reference: string }[];
}

export interface RuleThreat {
  framework: string;
  tactic?: { id: string; name: string; reference: string };
  technique?: RuleTechnique[];
}

/**
 * A rule document as written to `src/data/rules/<id>.json`.
 *
 * Deliberately permissive: upstream owns this shape, and detection rules,
 * building-block rules and hunts each populate a different subset. Every field
 * the UI reads is optional because for some rule kind it genuinely is.
 */
export interface RuleDefinition {
  name?: string;
  description?: string;
  tags?: string[];
  severity?: string;
  risk_score?: number;
  reference?: string[];
  threat?: RuleThreat[];
  false_positives?: string[];
  type?: string;
  language?: string;
  index?: string[];
  /** A string for detection rules; hunts store an array of statements. */
  query?: string | string[];
  license?: string;
}

export interface RuleMetadata {
  creation_date?: string;
  updated_date?: string;
  /** A single integration name or a list of them; absent for 56 rules. */
  integration?: string | string[];
  source_integration?: string;
  source_integration_name?: string;
}

export interface Rule {
  metadata: RuleMetadata;
  rule: RuleDefinition;
  /** Present only for threat hunts, which have no [metadata] section. */
  hunt?: Record<string, unknown>;
}
