/**
 * Regenerates `src/data/` from the elastic/detection-rules repository.
 *
 * Runs automatically before `next build` via npm's `prebuild` lifecycle hook,
 * which is why neither workflow invokes it explicitly. If this produces no data
 * the site builds empty, so it fails loudly rather than exiting 0 with a
 * partial tree.
 */
import { fetchRuleFiles } from './fetch_rules';
import { normalizeRule } from './normalize_rule';
import { addTagSummary, sortByNewest, sortByPopularity } from './summarize';
import { RuleSummaryInput, TagSummary } from './types';
import { createWriter } from './write_output';

/**
 * Guard rails. The count on 2026-08-20 was 2217 rules; anything under
 * MIN_RULES means the fetch or the filter broke rather than that upstream
 * shrank. A handful of parse failures is tolerable (one bad upstream commit
 * should not take the site down) but a systemic break is not.
 */
const MIN_RULES = 1500;
const MAX_PARSE_FAILURES = 10;
/** Cap on how many individual failures we print before summarising. */
const MAX_LOGGED_FAILURES = 10;

async function prebuild(): Promise<void> {
  const ruleSummaries: RuleSummaryInput[] = [];
  const tagSummaries = new Map<string, TagSummary>();
  const failures: { path: string; message: string }[] = [];
  const writer = createWriter();

  writer.resetRulesDir();

  await fetchRuleFiles(file => {
    try {
      const rule = normalizeRule(file.contents);

      writer.writeRule(rule.id, rule.document);
      ruleSummaries.push({
        id: rule.id,
        name: rule.name,
        tags: rule.tags,
        updated_date: rule.updatedDate,
      });
      for (const tag of rule.tags) {
        addTagSummary(tag, tagSummaries);
      }
    } catch (error) {
      // Previously this threw inside a stream handler and surfaced as an
      // unhandled rejection, after which the script could still exit 0.
      failures.push({
        path: file.path,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  const newestRules = sortByNewest(ruleSummaries);
  const popularTags = sortByPopularity(tagSummaries);

  for (const failure of failures.slice(0, MAX_LOGGED_FAILURES)) {
    console.error(
      `prebuild: failed to parse ${failure.path}: ${failure.message}`
    );
  }
  if (failures.length > MAX_LOGGED_FAILURES) {
    console.error(
      `prebuild: ...and ${failures.length - MAX_LOGGED_FAILURES} more failures`
    );
  }

  const newest = newestRules[0];
  const mostPopular = popularTags[0];
  console.log(
    [
      `prebuild: ${ruleSummaries.length} rules`,
      `${popularTags.length} tags`,
      `${failures.length} failures`,
      newest
        ? `newest '${newest.name}' (${newest.updated_date
            .toISOString()
            .slice(0, 10)})`
        : 'newest n/a',
      mostPopular
        ? `top tag '${mostPopular.tag_full}' x${mostPopular.count}`
        : 'top tag n/a',
    ].join(' | ')
  );

  if (ruleSummaries.length < MIN_RULES) {
    throw new Error(
      `only ${ruleSummaries.length} rules parsed, expected at least ${MIN_RULES} -- ` +
        `refusing to write a truncated data set`
    );
  }
  if (failures.length > MAX_PARSE_FAILURES) {
    throw new Error(
      `${failures.length} rules failed to parse, more than the ${MAX_PARSE_FAILURES} tolerated`
    );
  }

  writer.writeSummaries(newestRules, popularTags);
}

prebuild().catch(error => {
  console.error(
    'prebuild failed:',
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
