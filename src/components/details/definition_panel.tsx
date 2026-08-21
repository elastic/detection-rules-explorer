import { FunctionComponent } from 'react';
import {
  EuiBadge,
  EuiCodeBlock,
  EuiDescriptionList,
  EuiFlexItem,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';

import { Rule } from '../../types';
import {
  integrationDocsUrl,
  integrationPack,
  relatedIntegrations,
} from '../../lib/rule_display';
import { ruleTypeLabel } from '../../lib/rule_types';
import { ruleDetailsStyles } from './rule_details.styles';
import { CandidateItem, withContent } from './description_items';

interface DefinitionPanelProps {
  rule: Rule;
}

/**
 * How the rule works: its type, package, indices, integrations and query.
 *
 * Two defects were fixed here (see CLEANUP_PLAN.md PR 5):
 *
 * - D1: the rule-type label came from a `switch` that fell through from
 *   `case 'query'` into `case 'eql'`, so a non-kuery query rule was labelled
 *   "Event Correlation Rule" and `esql` rules returned `undefined`, silently
 *   dropping the row. Now delegated to `ruleTypeLabel`.
 * - D2: "Related Integrations" spread `[metadata.integration]` unconditionally,
 *   rendering a link labelled "undefined" when the field was absent. Now
 *   delegated to `relatedIntegrations`, which returns `[]`.
 */
const DefinitionPanel: FunctionComponent<DefinitionPanelProps> = ({ rule }) => {
  const { euiTheme } = useEuiTheme();
  const styles = ruleDetailsStyles(euiTheme);

  const integrations = relatedIntegrations(rule.metadata);

  const candidates: CandidateItem[] = [
    {
      title: 'Rule Type',
      description: ruleTypeLabel(rule.rule.type, rule.rule.language),
    },
    {
      title: 'Integration Pack',
      description: integrationPack(rule).name,
    },
    {
      title: 'Index Patterns',
      description:
        rule.rule.index &&
        rule.rule.index.map((index, i) => (
          <EuiBadge key={i} color="hollow">
            {index}
          </EuiBadge>
        )),
    },
    {
      title: 'Related Integrations',
      description:
        integrations.length > 0 &&
        integrations.map((integration, i) => (
          <p key={i}>
            <EuiLink target="_blank" href={integrationDocsUrl(integration)}>
              {integration}
            </EuiLink>
          </p>
        )),
    },
    {
      // Rendered as the code block below, so the row is a label only.
      title: 'Query',
      description: '',
    },
  ];
  // The Query row is a label only; its content is the code block below.
  const items = withContent(candidates, ['Query']);

  return (
    <EuiFlexItem>
      <EuiPanel>
        <EuiTitle size="m">
          <h1>Definition</h1>
        </EuiTitle>
        <EuiSpacer size="l" />
        <EuiDescriptionList type="column" listItems={items} css={styles.list} />
        <EuiSpacer size="m" />
        <EuiCodeBlock>{rule.rule.query}</EuiCodeBlock>
      </EuiPanel>
    </EuiFlexItem>
  );
};

export default DefinitionPanel;
