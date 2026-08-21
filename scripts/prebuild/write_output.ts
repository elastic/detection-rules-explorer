import * as fs from 'fs';
import * as path from 'path';

import { RuleDocument, RuleSummaryInput, TagSummary } from './types';

/** Everything here is generated and gitignored (`src/data/**`). */
export const DATA_DIR = path.join('src', 'data');
export const RULES_DIR = path.join(DATA_DIR, 'rules');
export const NEWEST_RULES_FILE = path.join(DATA_DIR, 'newestRules.json');
export const TAG_SUMMARIES_FILE = path.join(DATA_DIR, 'tagSummaries.json');

/**
 * Recreate the rules directory from scratch.
 *
 * The previous script only did `mkdir -p`, so a rule deleted or renamed
 * upstream lingered in a local `src/data/rules` forever and kept being
 * exported as a page. CI never noticed because it always starts clean.
 */
export function resetRulesDir(): void {
  fs.rmSync(RULES_DIR, { recursive: true, force: true });
  fs.mkdirSync(RULES_DIR, { recursive: true });
}

export function writeRule(id: string, document: RuleDocument): void {
  fs.writeFileSync(
    path.join(RULES_DIR, `${id}.json`),
    JSON.stringify(document)
  );
}

export function writeSummaries(
  newestRules: RuleSummaryInput[],
  popularTags: TagSummary[]
): void {
  fs.writeFileSync(NEWEST_RULES_FILE, JSON.stringify(newestRules));
  fs.writeFileSync(TAG_SUMMARIES_FILE, JSON.stringify(popularTags));
}
