import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRuleFilters } from './use_rule_filters';
import { RuleSummary, TagSummary } from '../types';

const rule = (
  id: string,
  name: string,
  tags: string[],
  updated = '2026-01-01T00:00:00.000Z'
): RuleSummary => ({ id, name, tags, updated_date: updated });

const summary = (tag_full: string): TagSummary => {
  const [tag_type, tag_name] = tag_full.split(': ');
  return { tag_type, tag_name, tag_full, count: 0 };
};

const RULES: RuleSummary[] = [
  rule('1', 'AWS STS Role Chaining', ['Domain: Cloud', 'OS: Linux']),
  rule('2', 'Suspicious PowerShell', ['Domain: Endpoint', 'OS: Windows']),
  rule('3', 'Linux Reverse Shell', ['Domain: Endpoint', 'OS: Linux']),
];

const TAGS: TagSummary[] = [
  summary('Domain: Cloud'),
  summary('Domain: Endpoint'),
  summary('OS: Linux'),
  summary('OS: Windows'),
];

const setup = (rules = RULES, tags = TAGS) =>
  renderHook(() => useRuleFilters(rules, tags));

describe('useRuleFilters: search', () => {
  it('returns everything by default', () => {
    expect(setup().result.current.rules).toHaveLength(3);
  });

  it('matches names case-insensitively on a substring', () => {
    const { result } = setup();
    act(() => result.current.setSearchFilter('powershell'));
    expect(result.current.rules.map(r => r.id)).toEqual(['2']);

    act(() => result.current.setSearchFilter('LINUX'));
    expect(result.current.rules.map(r => r.id)).toEqual(['3']);
  });

  it('returns nothing when the search matches nothing', () => {
    const { result } = setup();
    act(() => result.current.setSearchFilter('no such rule'));
    expect(result.current.rules).toEqual([]);
  });
});

describe('useRuleFilters: tag filtering', () => {
  it('filters to rules carrying the selected tag', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('OS', ['OS: Linux']));
    expect(result.current.rules.map(r => r.id)).toEqual(['1', '3']);
  });

  it('ANDs tags across types', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('OS', ['OS: Linux']));
    act(() => result.current.toggleTagType('Domain', ['Domain: Endpoint']));
    expect(result.current.rules.map(r => r.id)).toEqual(['3']);
  });

  it('ANDs multiple tags of the same type, which can match nothing', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('OS', ['OS: Linux', 'OS: Windows']));
    expect(result.current.rules).toEqual([]);
  });

  it('replaces only the same type, leaving other types selected', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('Domain', ['Domain: Endpoint']));
    act(() => result.current.toggleTagType('OS', ['OS: Linux']));
    act(() => result.current.toggleTagType('OS', ['OS: Windows']));

    expect(result.current.tagFilter).toEqual([
      'Domain: Endpoint',
      'OS: Windows',
    ]);
  });

  it('clears a type when passed an empty selection', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('OS', ['OS: Linux']));
    act(() => result.current.toggleTagType('OS', []));
    expect(result.current.tagFilter).toEqual([]);
    expect(result.current.rules).toHaveLength(3);
  });

  it('combines search and tags', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('OS', ['OS: Linux']));
    act(() => result.current.setSearchFilter('aws'));
    expect(result.current.rules.map(r => r.id)).toEqual(['1']);
  });
});

describe('useRuleFilters: tag counts', () => {
  it('counts against the full set when nothing is filtered', () => {
    const counts = setup().result.current.tagSummaries;
    expect(counts.find(t => t.tag_full === 'OS: Linux')?.count).toBe(2);
    expect(counts.find(t => t.tag_full === 'Domain: Endpoint')?.count).toBe(2);
  });

  it('recounts against the filtered set', () => {
    const { result } = setup();
    act(() => result.current.toggleTagType('OS', ['OS: Windows']));

    const counts = result.current.tagSummaries;
    expect(counts.find(t => t.tag_full === 'OS: Windows')?.count).toBe(1);
    // Only the Windows rule survives, so Linux drops to zero...
    expect(counts.find(t => t.tag_full === 'OS: Linux')?.count).toBe(0);
    // ...but the option is still offered, so the controls do not jump around.
    expect(counts.map(t => t.tag_full)).toContain('OS: Linux');
  });

  it('keeps every known tag even when nothing matches', () => {
    const { result } = setup();
    act(() => result.current.setSearchFilter('no such rule'));
    expect(result.current.tagSummaries).toHaveLength(TAGS.length);
    expect(result.current.tagSummaries.every(t => t.count === 0)).toBe(true);
  });

  it('ignores tags that are not of the form "Type: Name"', () => {
    const { result } = setup(
      [rule('1', 'Odd', ['Elastic', 'Domain: Cloud'])],
      TAGS
    );
    expect(
      result.current.tagSummaries.find(t => t.tag_full === 'Domain: Cloud')
        ?.count
    ).toBe(1);
    expect(
      result.current.tagSummaries.find(t => t.tag_full === 'Elastic')
    ).toBeUndefined();
  });

  it('does not mutate the tag summaries it was given', () => {
    const tags = [summary('OS: Linux')];
    setup(RULES, tags);
    expect(tags[0].count).toBe(0);
  });
});
