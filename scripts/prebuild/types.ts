/**
 * Shapes used across the prebuild script.
 *
 * `RuleSummaryInput` and `TagSummary` come from the app so the two cannot
 * drift -- see CLEANUP_PLAN.md section 4.1 for why that forces `rootDir: "."`
 * in tsconfig.scripts.json.
 */
export type { RuleSummaryInput, TagSummary } from '../../src/types';

export interface Technique {
  id: string;
  name: string;
  reference: string;
  subtechnique?: { id: string; reference: string }[];
}

export interface Tactic {
  id: string;
  name: string;
  reference: string;
}

export interface Threat {
  framework: string;
  technique?: Technique[];
  tactic?: Tactic;
}

/**
 * A parsed rule TOML. Deliberately loose: upstream owns this shape, the fields
 * vary between detection rules and hunts, and the script's job is to pass it
 * through with defaults filled in rather than to validate it.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RuleDocument {
  metadata?: Record<string, any>;
  rule?: Record<string, any>;
  hunt?: Record<string, any>;
  [key: string]: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** What `normalizeRule` produces: the document to write plus its summary. */
export interface NormalizedRule {
  id: string;
  name: string;
  tags: string[];
  updatedDate: Date;
  document: RuleDocument;
}
