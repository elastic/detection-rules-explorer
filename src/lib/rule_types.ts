/**
 * Human-readable labels for `rule.type` (and, for `query` rules, `rule.language`).
 *
 * NOT YET WIRED IN. `src/pages/rules/[id].tsx` still uses its own `switch`,
 * which has a fall-through bug (defect D1 in CLEANUP_PLAN.md): a `query` rule
 * whose language is not `kuery` falls through to the `eql` case and is
 * mislabelled "Event Correlation Rule", and `esql` rules return `undefined` so
 * the whole "Rule Type" row disappears. PR 5 replaces that switch with
 * `ruleTypeLabel()` below, which is a deliberate output change.
 */

/** Labels keyed on `rule.type`. */
export const RULE_TYPE_LABELS: Record<string, string> = {
  eql: 'Event Correlation Rule',
  esql: 'ES|QL Rule',
  machine_learning: 'Machine Learning',
  new_terms: 'New Terms Rule',
  query: 'Query',
  threat_match: 'Threat Match Rule',
  threshold: 'Threshold Rule',
};

/**
 * `query` rules are labelled by their language. Only `kuery` occurs in the data
 * today, but the others are cheap to support and the absence of `lucene` is why
 * D1 went unnoticed.
 */
export const QUERY_LANGUAGE_LABELS: Record<string, string> = {
  kuery: 'Query (Kibana Query Language)',
  lucene: 'Query (Lucene)',
  esql: 'Query (ES|QL)',
};

/**
 * Returns `undefined` for an unknown or absent type, which is correct for
 * threat hunts — they have no `rule.type` at all, and no Rule Type row should
 * be rendered for them. Callers decide how to present that.
 */
export function ruleTypeLabel(
  type?: string,
  language?: string
): string | undefined {
  if (!type) {
    return undefined;
  }
  if (type === 'query' && language) {
    return QUERY_LANGUAGE_LABELS[language] || RULE_TYPE_LABELS.query;
  }
  return RULE_TYPE_LABELS[type];
}
