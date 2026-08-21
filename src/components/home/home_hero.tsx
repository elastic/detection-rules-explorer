import {
  ChangeEvent,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiSpacer,
  EuiLink,
  EuiPanel,
  EuiFlexGrid,
  EuiFieldSearch,
  EuiFormRow,
} from '@elastic/eui';
import { homeHeroStyles } from './home_hero.styles';
import { useEuiTheme } from '@elastic/eui';

import RuleFilter from './rule_filter';

import { RuleSummary, TagSummary } from '../../types';
import { TAG_TYPES, tagsForType } from '../../lib/tags';

/** How long to wait after typing stops before filtering the rule list. */
const SEARCH_DEBOUNCE_MS = 100;

interface HomeHeroProps {
  rules: RuleSummary[];
  tagSummaries: TagSummary[];
  searchFilter: string;
  tagFilter: string[];
  onSearchChange: (value: string) => void;
  onTagChange: (type: string, selected: string[]) => void;
}

const HomeHero: FunctionComponent<HomeHeroProps> = ({
  rules,
  tagSummaries,
  tagFilter,
  onSearchChange,
  onTagChange,
}) => {
  const { euiTheme } = useEuiTheme();
  const styles = homeHeroStyles(euiTheme);

  // The input is uncontrolled by the filter state so typing stays responsive;
  // the expensive filter runs once typing pauses.
  const [displaySearchTerm, setDisplaySearchTerm] = useState('');
  const searchUpdateTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Without this, unmounting mid-debounce leaves a timer that fires into an
  // unmounted component.
  useEffect(
    () => () => {
      if (searchUpdateTimeout.current) {
        clearTimeout(searchUpdateTimeout.current);
      }
    },
    []
  );

  const onSearchBoxChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Read the value out before the timeout: React pools nothing these days,
    // but closing over the event is still needlessly fragile.
    const value = event.target.value;
    setDisplaySearchTerm(value);
    if (searchUpdateTimeout.current) {
      clearTimeout(searchUpdateTimeout.current);
    }
    searchUpdateTimeout.current = setTimeout(
      () => onSearchChange(value),
      SEARCH_DEBOUNCE_MS
    );
  };

  return (
    <EuiFlexGroup alignItems="center" css={styles.container}>
      <EuiFlexItem>
        <EuiTitle size="l" css={styles.title}>
          <h1>Elastic Security Detection Rules</h1>
        </EuiTitle>

        <EuiSpacer size="l" />

        <EuiText css={styles.description}>
          <p>
            Elastic Security detection rules help users to set up and get their
            detections and security monitoring going as soon as possible.
            Elastic is committed to{' '}
            <EuiLink
              href="https://www.elastic.co/blog/continued-leadership-in-open-and-transparent-security"
              target="_blank">
              transparency and openness
            </EuiLink>{' '}
            with the security community, which is why we build and maintain our
            detection logic publicly.
          </p>
          <p>
            See our{' '}
            <EuiLink
              href="https://www.elastic.co/guide/en/security/current/prebuilt-rules-management.html"
              target="_blank">
              docs
            </EuiLink>{' '}
            for more information on how to enable these detection rules in
            Elastic Security.
          </p>
        </EuiText>
        <EuiSpacer size="l" />

        <EuiFormRow fullWidth css={styles.search}>
          <EuiPanel>
            <EuiFieldSearch
              placeholder={`Search ${rules.length} rules by name`}
              value={displaySearchTerm}
              onChange={onSearchBoxChange}
              fullWidth
            />
          </EuiPanel>
        </EuiFormRow>
        <EuiSpacer size="m" />

        <EuiFlexGrid columns={3} css={styles.grid}>
          {TAG_TYPES.map(tagType => (
            <RuleFilter
              key={tagType.type}
              tagType={tagType}
              tagList={tagsForType(tagSummaries, tagType)}
              tagFilter={tagFilter}
              onTagChange={onTagChange}
            />
          ))}
        </EuiFlexGrid>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default HomeHero;
