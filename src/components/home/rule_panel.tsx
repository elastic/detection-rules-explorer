import { FunctionComponent } from 'react';
import {
  EuiBadge,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiSpacer,
  EuiLink,
} from '@elastic/eui';
import Link from 'next/link';

import LazyLoad from 'react-lazy-load';
import { rulePanelStyles } from './rule_panel.styles';
import moment from 'moment';

import { RuleSummary } from '../../types';
import { ruleFilterTypeMap } from '../../lib/ruledata';

interface RulePanelProps {
  rule: RuleSummary;
}

const RulePanel: FunctionComponent<RulePanelProps> = ({ children, rule }) => {
  const styles = rulePanelStyles();

  return (
    <EuiFlexItem css={styles.item}>
      <EuiPanel>
        <EuiText>
          <Link href={`/rules/${rule.id}`} passHref>
            <EuiLink color="text" onClick={null} css={styles.link}>
              {rule.name}
            </EuiLink>
          </Link>
        </EuiText>
        <LazyLoad>
          <>
            <EuiSpacer size="xs" />
            {rule.tags
              .filter(t => !t.startsWith('Resources'))
              .map((t, i) => {
                const badgeTheme = ruleFilterTypeMap[t.split(': ')[0]] || {
                  color: 'hollow',
                  icon: '',
                };
                return (
                  <EuiBadge
                    iconType={badgeTheme.icon}
                    color={badgeTheme.color}
                    css={styles.badge}
                    key={i}>
                    {t}
                  </EuiBadge>
                );
              })}
            <EuiSpacer size="xs" />
            <EuiText size="xs">
              <p>
                <em>Updated {moment(rule.updated_date).fromNow()}</em>
              </p>
            </EuiText>
          </>
        </LazyLoad>
      </EuiPanel>
    </EuiFlexItem>
  );
};

export default RulePanel;
