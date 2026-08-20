import { describe, expect, it } from 'vitest';

import { RULE_TYPE_LABELS, ruleTypeLabel } from './rule_types';

describe('ruleTypeLabel', () => {
  it('labels every rule type present in the data', () => {
    // Census 2026-08-20: eql 1029, query 456, new_terms 242, esql 211,
    // machine_learning 106, threshold 30, threat_match 6.
    expect(ruleTypeLabel('eql', 'eql')).toBe('Event Correlation Rule');
    expect(ruleTypeLabel('new_terms', 'kuery')).toBe('New Terms Rule');
    expect(ruleTypeLabel('machine_learning')).toBe('Machine Learning');
    expect(ruleTypeLabel('threshold', 'kuery')).toBe('Threshold Rule');
    expect(ruleTypeLabel('threat_match', 'kuery')).toBe('Threat Match Rule');
  });

  it('keeps the existing wording for kuery query rules', () => {
    expect(ruleTypeLabel('query', 'kuery')).toBe(
      'Query (Kibana Query Language)'
    );
  });

  // Regression tests for defect D1: the switch in rules/[id].tsx falls through
  // from `case 'query'` into `case 'eql'`.
  it('does not mislabel a lucene query rule as an event correlation rule', () => {
    // No lucene rule exists upstream today, which is exactly why this is a
    // test rather than something the out/ diff would have caught.
    expect(ruleTypeLabel('query', 'lucene')).toBe('Query (Lucene)');
    expect(ruleTypeLabel('query', 'lucene')).not.toBe('Event Correlation Rule');
  });

  it('gives esql rules a label instead of dropping the row', () => {
    expect(ruleTypeLabel('esql', 'esql')).toBe('ES|QL Rule');
    expect(ruleTypeLabel('esql', 'esql')).toBeDefined();
  });

  it('falls back to a plain Query label for an unknown query language', () => {
    expect(ruleTypeLabel('query', 'sql')).toBe(RULE_TYPE_LABELS.query);
    expect(ruleTypeLabel('query')).toBe(RULE_TYPE_LABELS.query);
  });

  it('returns undefined for threat hunts, which have no rule type', () => {
    // 137 hunts in the corpus have no `rule.type` at all.
    expect(ruleTypeLabel(undefined)).toBeUndefined();
    expect(ruleTypeLabel('')).toBeUndefined();
  });

  it('returns undefined for a genuinely unknown type', () => {
    expect(ruleTypeLabel('sequence')).toBeUndefined();
  });
});
