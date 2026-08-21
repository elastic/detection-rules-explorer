import { describe, expect, it } from 'vitest';

import { addTagSummary, sortByNewest, sortByPopularity } from './summarize';
import { RuleSummaryInput, TagSummary } from './types';

const rule = (name: string, updated: string): RuleSummaryInput => ({
  id: name,
  name,
  tags: [],
  updated_date: new Date(updated),
});

describe('addTagSummary', () => {
  it('splits a tag into its type and name', () => {
    const summaries = new Map<string, TagSummary>();
    addTagSummary('Domain: Endpoint', summaries);

    expect(summaries.get('Domain: Endpoint')).toEqual({
      tag_type: 'Domain',
      tag_name: 'Endpoint',
      tag_full: 'Domain: Endpoint',
      count: 1,
    });
  });

  it('accumulates repeated tags', () => {
    const summaries = new Map<string, TagSummary>();
    addTagSummary('OS: Linux', summaries);
    addTagSummary('OS: Linux', summaries);
    addTagSummary('OS: Windows', summaries);

    expect(summaries.get('OS: Linux')?.count).toBe(2);
    expect(summaries.get('OS: Windows')?.count).toBe(1);
    expect(summaries.size).toBe(2);
  });

  it('tolerates a tag with no type separator', () => {
    const summaries = new Map<string, TagSummary>();
    addTagSummary('Elastic', summaries);

    expect(summaries.get('Elastic')?.tag_type).toBe('Elastic');
    expect(summaries.get('Elastic')?.tag_name).toBeUndefined();
  });
});

describe('sortByNewest', () => {
  it('puts the most recently updated rule first', () => {
    const sorted = sortByNewest([
      rule('older', '2024-01-01'),
      rule('newest', '2026-06-01'),
      rule('middle', '2025-03-01'),
    ]);

    expect(sorted.map(r => r.name)).toEqual(['newest', 'middle', 'older']);
  });

  it('does not mutate its input', () => {
    const input = [rule('a', '2024-01-01'), rule('b', '2026-01-01')];
    sortByNewest(input);
    expect(input.map(r => r.name)).toEqual(['a', 'b']);
  });
});

describe('sortByPopularity', () => {
  it('puts the most-used tag first', () => {
    const summaries = new Map<string, TagSummary>();
    addTagSummary('Rare: Tag', summaries);
    for (let i = 0; i < 5; i++) {
      addTagSummary('Common: Tag', summaries);
    }
    for (let i = 0; i < 3; i++) {
      addTagSummary('Middling: Tag', summaries);
    }

    expect(sortByPopularity(summaries).map(t => t.tag_full)).toEqual([
      'Common: Tag',
      'Middling: Tag',
      'Rare: Tag',
    ]);
  });
});
