import { useCallback, useMemo, useState } from 'react';

import { RuleSummary, TagSummary } from '../types';

export interface RuleFilters {
  /** Rules matching the current search text and tag selection. */
  rules: RuleSummary[];
  /**
   * Every known tag, with counts recomputed against `rules`. Tags that match
   * nothing are kept with `count: 0` so the filter controls stay stable rather
   * than options appearing and disappearing as you type.
   */
  tagSummaries: TagSummary[];
  searchFilter: string;
  tagFilter: string[];
  setSearchFilter: (value: string) => void;
  /**
   * Replace the selection for one tag type, leaving other types alone. Called
   * with the type (`'Domain'`) and the full tags now selected within it.
   */
  toggleTagType: (type: string, selected: string[]) => void;
}

/**
 * Search and tag-filter state for the home page.
 *
 * Extracted from `pages/index.tsx`, which previously mixed this with page
 * composition. Keeping it here makes the filtering behaviour testable without
 * rendering EUI.
 */
export function useRuleFilters(
  allRules: RuleSummary[],
  allTagSummaries: TagSummary[]
): RuleFilters {
  const [searchFilter, setSearchFilter] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const rules = useMemo(
    () =>
      allRules.filter(rule => {
        if (
          searchFilter &&
          !rule.name.toLowerCase().includes(searchFilter.toLowerCase())
        ) {
          return false;
        }
        // Tags are ANDed: a rule must carry every selected tag.
        if (
          tagFilter.length > 0 &&
          !tagFilter.every(tag => rule.tags.includes(tag))
        ) {
          return false;
        }
        return true;
      }),
    [allRules, searchFilter, tagFilter]
  );

  const tagSummaries = useMemo(() => {
    const counts = new Map<string, TagSummary>();
    for (const summary of allTagSummaries) {
      counts.set(summary.tag_full, {
        tag_full: summary.tag_full,
        tag_name: summary.tag_name,
        tag_type: summary.tag_type,
        count: 0,
      });
    }
    for (const rule of rules) {
      for (const tag of rule.tags) {
        const summary = counts.get(tag);
        // Tags without a single `": "` separator are not filterable.
        if (tag.split(': ').length !== 2 || summary === undefined) {
          continue;
        }
        summary.count++;
      }
    }
    return Array.from(counts.values());
  }, [allTagSummaries, rules]);

  const toggleTagType = useCallback((type: string, selected: string[]) => {
    setTagFilter(current =>
      current.filter(tag => !tag.startsWith(type)).concat(selected)
    );
  }, []);

  return {
    rules,
    tagSummaries,
    searchFilter,
    tagFilter,
    setSearchFilter,
    toggleTagType,
  };
}
