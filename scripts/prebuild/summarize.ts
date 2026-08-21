import { RuleSummaryInput, TagSummary } from './types';

/** Count one occurrence of a full tag (`"Domain: Endpoint"`). */
export function addTagSummary(
  tag: string,
  tagSummaries: Map<string, TagSummary>
): void {
  const parts = tag.split(': ');
  let summary = tagSummaries.get(tag);
  if (summary === undefined) {
    summary = {
      tag_type: parts[0],
      tag_name: parts[1],
      tag_full: tag,
      count: 0,
    };
  }
  summary.count++;
  tagSummaries.set(tag, summary);
}

/** Most recently updated first -- the order the home page renders. */
export function sortByNewest(rules: RuleSummaryInput[]): RuleSummaryInput[] {
  return [...rules].sort(
    (a, b) => b.updated_date.getTime() - a.updated_date.getTime()
  );
}

/** Most-used tag first -- drives the filter option ordering. */
export function sortByPopularity(
  tagSummaries: Map<string, TagSummary>
): TagSummary[] {
  return Array.from(tagSummaries.values()).sort((a, b) => b.count - a.count);
}
