import { describe, expect, it } from 'vitest';

import {
  DEFAULT_TAG_THEME,
  TAG_TYPES,
  isHiddenTag,
  tagTheme,
  tagTypeTheme,
  tagsForType,
} from './tags';
import { TagSummary } from '../types';

const summary = (tag_full: string, count = 1): TagSummary => {
  const [tag_type, tag_name] = tag_full.split(': ');
  return { tag_type, tag_name, tag_full, count };
};

describe('TAG_TYPES', () => {
  it('preserves the on-screen order of the filter controls', () => {
    // This order is load-bearing: it is what the home page renders.
    expect(TAG_TYPES.map(t => t.type)).toEqual([
      'Domain',
      'Rule Type',
      'OS',
      'Use Case',
      'Tactic',
      'Data Source',
      'Hunt Type',
      'Language',
    ]);
  });

  it('keeps the colour and icon of every type it replaced', () => {
    // Transcribed from the deleted `ruleFilterTypeMap` in lib/ruledata.ts.
    const expected = {
      Domain: { color: 'accent', icon: 'globe' },
      'Use Case': { color: 'primary', icon: 'launch' },
      'Data Source': { color: 'default', icon: 'database' },
      'Hunt Type': { color: 'default', icon: 'eye' },
      OS: { color: 'success', icon: 'compute' },
      Tactic: { color: 'warning', icon: 'bug' },
      'Rule Type': { color: 'hollow', icon: 'layers' },
      Language: { color: 'default', icon: 'menu' },
    };
    for (const [type, theme] of Object.entries(expected)) {
      expect(tagTypeTheme(type)).toEqual(theme);
    }
  });

  it('excludes the ML rule type from its filter, as before', () => {
    const ruleType = TAG_TYPES.find(t => t.type === 'Rule Type')!;
    expect(ruleType?.excludeTagNames).toEqual(['ML']);
  });
});

describe('tagTheme', () => {
  it('themes a full tag by its type prefix', () => {
    expect(tagTheme('Domain: Endpoint')).toEqual({
      color: 'accent',
      icon: 'globe',
    });
  });

  it('falls back for tag types the taxonomy does not know', () => {
    // The data also carries Mitre Atlas, Threat, Promotion and Platform tags.
    expect(tagTheme('Mitre Atlas: T0819')).toEqual(DEFAULT_TAG_THEME);
    expect(tagTheme('Promotion: External Alerts')).toEqual(DEFAULT_TAG_THEME);
  });

  it('does not throw on a tag with no type separator', () => {
    expect(tagTheme('Elastic')).toEqual(DEFAULT_TAG_THEME);
  });
});

describe('isHiddenTag', () => {
  it('hides Resources tags', () => {
    expect(isHiddenTag('Resources: Investigation Guide')).toBe(true);
  });

  it('keeps everything else', () => {
    expect(isHiddenTag('Domain: Endpoint')).toBe(false);
    expect(isHiddenTag('Use Case: Threat Detection')).toBe(false);
  });
});

describe('tagsForType', () => {
  const all = [
    summary('Domain: Endpoint'),
    summary('Rule Type: BBR'),
    summary('Rule Type: ML'),
    summary('OS: Linux'),
  ];

  it('selects only the matching type', () => {
    const domain = TAG_TYPES.find(t => t.type === 'Domain')!;
    expect(tagsForType(all, domain).map(t => t.tag_full)).toEqual([
      'Domain: Endpoint',
    ]);
  });

  it('applies excludeTagNames', () => {
    const ruleType = TAG_TYPES.find(t => t.type === 'Rule Type')!;
    expect(tagsForType(all, ruleType).map(t => t.tag_name)).toEqual(['BBR']);
  });

  it('returns an empty list when nothing matches', () => {
    const language = TAG_TYPES.find(t => t.type === 'Language')!;
    expect(tagsForType(all, language)).toEqual([]);
  });
});
