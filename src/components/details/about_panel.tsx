import { FunctionComponent } from 'react';
import {
  EuiDescriptionList,
  EuiFlexItem,
  EuiHealth,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';

import { Rule } from '../../types';
import { severityColor } from '../../lib/rule_display';
import RuleTagBadges from '../rule_tag_badges';
import { ruleDetailsStyles } from './rule_details.styles';

const ELASTIC_LICENSE_URL = 'https://www.elastic.co/licensing/elastic-license';

interface AboutPanelProps {
  rule: Rule;
}

/**
 * Descriptive metadata: tags, severity, risk, references, ATT&CK mapping,
 * false positives, licence. Rows with no content are dropped.
 */
const AboutPanel: FunctionComponent<AboutPanelProps> = ({ rule }) => {
  const { euiTheme } = useEuiTheme();
  const styles = ruleDetailsStyles(euiTheme);

  const items = [
    {
      title: 'Tags',
      description: (
        <RuleTagBadges tags={rule.rule.tags || []} badgeCss={styles.badge} />
      ),
    },
    {
      title: 'Severity',
      description: (
        <EuiHealth color={severityColor(rule.rule.severity)}>
          {rule.rule.severity}
        </EuiHealth>
      ),
    },
    {
      title: 'Risk Score',
      description: rule.rule.risk_score,
    },
    {
      title: 'References',
      description:
        rule.rule.reference &&
        rule.rule.reference.map((reference, i) => (
          <EuiLink key={i} target="_blank" href={reference}>
            {reference}
          </EuiLink>
        )),
    },
    {
      title: 'MITRE ATT&CK™',
      description:
        rule.rule.threat &&
        rule.rule.threat.map((threat, i) => (
          <p key={i}>
            <EuiLink target="_blank" href={threat.tactic?.reference}>
              {threat.tactic?.name} ({threat.tactic?.id})
            </EuiLink>
            {threat.technique &&
              threat.technique.map((technique, j) => (
                <EuiText key={j} size="xs">
                  <p>
                    <EuiLink target="_blank" href={technique.reference}>
                      ↳ {technique.name} ({technique.id})
                    </EuiLink>
                  </p>
                </EuiText>
              ))}
            <EuiSpacer size="xs" />
          </p>
        )),
    },
    {
      title: 'False Positive Examples',
      description: rule.rule.false_positives,
    },
    {
      title: 'License',
      description: (
        <EuiLink href={ELASTIC_LICENSE_URL} target="_blank">
          Elastic License v2
        </EuiLink>
      ),
    },
  ].filter(item => item.description);

  return (
    <EuiFlexItem>
      <EuiPanel>
        <EuiTitle size="m">
          <h1>About</h1>
        </EuiTitle>
        <EuiSpacer size="l" />
        <EuiText>{rule.rule.description}</EuiText>
        <EuiSpacer size="l" />
        <EuiDescriptionList type="column" listItems={items} css={styles.list} />
      </EuiPanel>
    </EuiFlexItem>
  );
};

export default AboutPanel;
