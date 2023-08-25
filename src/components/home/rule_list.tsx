import { FunctionComponent, useMemo } from 'react';
import { EuiFlexGrid, EuiCallOut } from '@elastic/eui';
import { ruleListStyles } from './rule_list.styles';
import { useEuiTheme } from '@elastic/eui';

import RulePanel from './rule_panel';

import { RuleSummary } from '../../types';

interface RuleListProps {
  rules: RuleSummary[];
}

const MAX_RULES = 100;

const RuleList: FunctionComponent<RuleListProps> = ({ children, rules }) => {
  const { euiTheme } = useEuiTheme();
  const styles = ruleListStyles(euiTheme);

  const ruleSlice = useMemo(() => {
    return rules.slice(0, MAX_RULES);
  }, [rules]);

  return (
    <>
      <EuiFlexGrid columns={4} css={styles.grid}>
        {ruleSlice.map((r, i) => {
          return <RulePanel key={i} rule={r} />;
        })}
      </EuiFlexGrid>
      <EuiCallOut
        size="s"
        title={`Showing up to ${MAX_RULES} rules. Use the options at the top of the page to further fine the ${rules.length} rules matching your current search settings.`}
        iconType="lensApp"
        css={styles.callout}
      />
    </>
  );
};

export default RuleList;
