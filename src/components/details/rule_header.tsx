import { FunctionComponent } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import moment from 'moment';

import { Rule } from '../../types';
import { ruleDetailsStyles } from './rule_details.styles';

interface RuleHeaderProps {
  rule: Rule;
}

/**
 * Rule name plus when it was created and last updated.
 *
 * Dates are suppressed for threat hunts. Hunting TOMLs have a `[hunt]` section
 * and no `[metadata]` at all, so they carry no `updated_date`; the prebuild
 * script falls back to the Unix epoch and the UI would otherwise report
 * "Updated 56 years ago". Detection rules keep both dates.
 */
const RuleHeader: FunctionComponent<RuleHeaderProps> = ({ rule }) => {
  const { euiTheme } = useEuiTheme();
  const styles = ruleDetailsStyles(euiTheme);

  const isThreatHunt = !!rule.hunt;
  const ruleCreated =
    !isThreatHunt &&
    rule.metadata.creation_date &&
    moment(rule.metadata.creation_date.replace(/\//g, '-'));
  const ruleUpdated =
    !isThreatHunt &&
    rule.metadata.updated_date &&
    moment(rule.metadata.updated_date.replace(/\//g, '-'));

  return (
    <EuiFlexGroup gutterSize="l" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel grow={true}>
          <EuiTitle size="m">
            <h1>{rule.rule.name}</h1>
          </EuiTitle>
          <EuiSpacer size="s" />
          {ruleUpdated && (
            <EuiText color="subdued" size="s">
              Last updated {ruleUpdated.fromNow()} on{' '}
              {ruleUpdated.format('YYYY-MM-DD')}
            </EuiText>
          )}
          {ruleCreated && (
            <EuiText color="subdued" size="s">
              Created {ruleCreated.fromNow()} on{' '}
              {ruleCreated.format('YYYY-MM-DD')}
            </EuiText>
          )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default RuleHeader;
