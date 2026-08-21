import { FunctionComponent } from 'react';
import { EuiCallOut, EuiLink, EuiSpacer, useEuiTheme } from '@elastic/eui';

import { Rule } from '../../types';
import { integrationPack } from '../../lib/rule_display';
import { ruleDetailsStyles } from './rule_details.styles';

interface InstallCalloutProps {
  rule: Rule;
}

/** Points at the install guide for whichever package ships this rule. */
const InstallCallout: FunctionComponent<InstallCalloutProps> = ({ rule }) => {
  const { euiTheme } = useEuiTheme();
  const styles = ruleDetailsStyles(euiTheme);
  const pack = integrationPack(rule);

  return (
    <EuiCallOut
      size="m"
      title={'Install detection rules in Elastic Security'}
      iconType="logoElastic"
      css={styles.callout}>
      <EuiSpacer size="s" />
      <p>
        Detect {rule.rule.name} in the Elastic Security detection engine by
        installing this rule into your Elastic Stack.
      </p>
      <p>
        To setup this rule, check out the installation guide for{' '}
        <EuiLink target="_blank" href={pack.link}>
          {pack.name}
        </EuiLink>
        .
      </p>
    </EuiCallOut>
  );
};

export default InstallCallout;
