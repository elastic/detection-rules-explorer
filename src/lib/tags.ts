import { TagSummary } from '../types';

/**
 * The tag taxonomy. Rule tags are `"<type>: <name>"` strings (e.g.
 * `"Domain: Endpoint"`), and this is the single place that decides how each
 * type is labelled, coloured, and ordered.
 *
 * Before this existed the same information was spread across `lib/ruledata.ts`
 * (colours + icons), eight hand-written `<RuleFilter>` blocks in
 * `home/home_hero.tsx` (display names, icons, order, the one-off ML exclusion),
 * and two copy-pasted badge blocks. Keeping those in sync was manual.
 */
export interface TagTypeConfig {
  /** Tag prefix as it appears in the data, before the `": "`. */
  type: string;
  /** Plural label for the filter control. */
  displayName: string;
  /** EUI icon type. */
  icon: string;
  /** EUI colour, used for both filter health dots and badges. */
  color: string;
  /** Tag names to hide from the filter (not from badges). */
  excludeTagNames?: string[];
}

/**
 * Order is significant: this is the on-screen order of the filter controls.
 */
export const TAG_TYPES: TagTypeConfig[] = [
  { type: 'Domain', displayName: 'Domains', icon: 'globe', color: 'accent' },
  {
    type: 'Rule Type',
    displayName: 'Rule Types',
    icon: 'layers',
    color: 'hollow',
    // 'ML' duplicates the machine-learning signal already carried by other
    // tags, and has always been hidden from this filter.
    excludeTagNames: ['ML'],
  },
  {
    type: 'OS',
    displayName: 'Operating Systems',
    icon: 'compute',
    color: 'success',
  },
  {
    type: 'Use Case',
    displayName: 'Use Cases',
    icon: 'launch',
    color: 'primary',
  },
  { type: 'Tactic', displayName: 'Tactics', icon: 'bug', color: 'warning' },
  {
    type: 'Data Source',
    displayName: 'Data Sources',
    icon: 'database',
    color: 'default',
  },
  {
    type: 'Hunt Type',
    displayName: 'Threat Hunt Queries',
    icon: 'eye',
    color: 'default',
  },
  {
    type: 'Language',
    displayName: 'Rule Languages',
    icon: 'menu',
    color: 'default',
  },
];

export interface TagTheme {
  color: string;
  icon: string;
}

/**
 * Used for tag types with no entry in `TAG_TYPES`. The data currently also
 * carries `Mitre Atlas`, `Threat`, `Promotion` and `Platform` tags, which are
 * rendered as plain badges.
 */
export const DEFAULT_TAG_THEME: TagTheme = { color: 'hollow', icon: '' };

/** Tags with these prefixes are never rendered as badges. */
export const HIDDEN_TAG_PREFIXES = ['Resources'];

const THEMES_BY_TYPE: Record<string, TagTheme> = TAG_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.type]: { color: t.color, icon: t.icon } }),
  {}
);

/** Theme for a bare tag type, e.g. `'Domain'`. */
export function tagTypeTheme(tagType: string): TagTheme {
  return THEMES_BY_TYPE[tagType] || DEFAULT_TAG_THEME;
}

/** Theme for a full tag, e.g. `'Domain: Endpoint'`. */
export function tagTheme(tagFull: string): TagTheme {
  return tagTypeTheme(tagFull.split(': ')[0]);
}

/** True if the tag should be hidden from badge lists. */
export function isHiddenTag(tagFull: string): boolean {
  return HIDDEN_TAG_PREFIXES.some(prefix => tagFull.startsWith(prefix));
}

/** The tag summaries a given filter control should offer. */
export function tagsForType(
  tagSummaries: TagSummary[],
  config: TagTypeConfig
): TagSummary[] {
  return tagSummaries.filter(
    t =>
      t.tag_type === config.type &&
      !(config.excludeTagNames || []).includes(t.tag_name)
  );
}
