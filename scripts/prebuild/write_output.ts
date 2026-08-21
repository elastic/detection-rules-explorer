import * as fs from 'fs';
import * as path from 'path';

import { RuleDocument, RuleSummaryInput, TagSummary } from './types';

/** Everything written here is generated and gitignored (`src/data/**`). */
export const DATA_DIR = path.join('src', 'data');

export interface DataWriter {
  /**
   * Recreate the rules directory from scratch.
   *
   * The original script only did `mkdir -p`, so a rule deleted or renamed
   * upstream lingered in a local `src/data/rules` forever and kept being
   * exported as a page. CI never noticed because it always starts clean.
   */
  resetRulesDir(): void;
  writeRule(id: string, document: RuleDocument): void;
  writeSummaries(
    newestRules: RuleSummaryInput[],
    popularTags: TagSummary[]
  ): void;
}

/**
 * File writers rooted at `dataDir`. Parameterised so tests can write to a
 * temporary directory instead of the real `src/data`.
 */
export function createWriter(dataDir: string = DATA_DIR): DataWriter {
  const rulesDir = path.join(dataDir, 'rules');

  return {
    resetRulesDir() {
      fs.rmSync(rulesDir, { recursive: true, force: true });
      fs.mkdirSync(rulesDir, { recursive: true });
    },

    writeRule(id, document) {
      fs.writeFileSync(
        path.join(rulesDir, `${id}.json`),
        JSON.stringify(document)
      );
    },

    writeSummaries(newestRules, popularTags) {
      fs.writeFileSync(
        path.join(dataDir, 'newestRules.json'),
        JSON.stringify(newestRules)
      );
      fs.writeFileSync(
        path.join(dataDir, 'tagSummaries.json'),
        JSON.stringify(popularTags)
      );
    },
  };
}
