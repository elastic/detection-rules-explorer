import { FunctionComponent, useState, useRef } from 'react';
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
  EuiAccordion,
  EuiFormRow,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { homeHeroStyles } from './home_hero.styles';
import { useEuiTheme } from '@elastic/eui';

import RuleFilter from './rule_filter';

import { RuleSummary, TagSummary } from '../../types';

interface RuleFilterProps {
  rules: RuleSummary[];
  tagSummaries: TagSummary[];
  searchFilter: string;
  tagFilter: string[];
  onSearchChange: (e: string) => void;
  onTagChange: (type: string, selected: string[]) => void;
}

const HomeHero: FunctionComponent<RuleFilterProps> = ({
  children,
  rules,
  tagSummaries,
  searchFilter,
  tagFilter,
  onSearchChange,
  onTagChange,
}) => {
  const { euiTheme } = useEuiTheme();
  const styles = homeHeroStyles(euiTheme);

  const [displaySearchTerm, setDisplaySearchTerm] = useState('');
  const searchUpdateTimeout = useRef(null);

  const onSearchBoxChange = function (e) {
    setDisplaySearchTerm(e.target.value);
    if (searchUpdateTimeout.current) {
      clearTimeout(searchUpdateTimeout.current);
    }
    searchUpdateTimeout.current = setTimeout(() => {
      onSearchChange(e.target.value);
    }, 100);
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
              onChange={e => onSearchBoxChange(e)}
              fullWidth
            />
          </EuiPanel>
        </EuiFormRow>
        <EuiSpacer size="m" />

        <EuiFlexGrid css={styles.grid}>
          <RuleFilter
            displayName="Domains"
            icon="globe"
            tagList={tagSummaries.filter(x => x.tag_type == 'Domain')}
            tagFilter={tagFilter}
            onTagChange={onTagChange}
          />

          <RuleFilter
            displayName="Rule Types"
            icon="layers"
            tagList={tagSummaries.filter(
              x => x.tag_type == 'Rule Type' && x.tag_name != 'ML'
            )}
            tagFilter={tagFilter}
            onTagChange={onTagChange}
          />

          <RuleFilter
            displayName="Operating Systems"
            icon="compute"
            tagList={tagSummaries.filter(x => x.tag_type == 'OS')}
            tagFilter={tagFilter}
            onTagChange={onTagChange}
          />

          <RuleFilter
            displayName="Use Cases"
            icon="launch"
            tagList={tagSummaries.filter(x => x.tag_type == 'Use Case')}
            tagFilter={tagFilter}
            onTagChange={onTagChange}
          />

          <RuleFilter
            displayName="Tactics"
            icon="bug"
            tagList={tagSummaries.filter(x => x.tag_type == 'Tactic')}
            tagFilter={tagFilter}
            onTagChange={onTagChange}
          />

          <RuleFilter
            displayName="Data Sources"
            icon="database"
            tagList={tagSummaries.filter(x => x.tag_type == 'Data Source')}
            tagFilter={tagFilter}
            onTagChange={onTagChange}
          />
        </EuiFlexGrid>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default HomeHero;
