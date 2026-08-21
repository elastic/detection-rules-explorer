import { FunctionComponent } from 'react';
import {
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
import RuleTagBadges from '../rule_tag_badges';

interface RulePanelProps {
  rule: RuleSummary;
}

const RulePanel: FunctionComponent<RulePanelProps> = ({ rule }) => {
  const styles = rulePanelStyles();

  return (
    <EuiFlexItem css={styles.item}>
      <EuiPanel>
        <EuiText>
          {/*
            `legacyBehavior` keeps Link cloning its child and passing href down.
            Without it, EuiLink gets no href and renders a <button>, giving
            invalid <a><button> markup. Next 16 removes this prop, at which
            point EuiLink needs the href directly plus manual basePath handling.
          */}
          <Link href={`/rules/${rule.id}`} passHref legacyBehavior>
            <EuiLink color="text" css={styles.link}>
              {rule.name}
            </EuiLink>
          </Link>
        </EuiText>
        <LazyLoad>
          <>
            <EuiSpacer size="xs" />
            <RuleTagBadges tags={rule.tags} badgeCss={styles.badge} />
            <EuiSpacer size="xs" />
            {!rule.tags.some(t => t === 'Hunt Type: Hunt') && (
              <EuiText size="xs">
                <p>
                  <em>Updated {moment(rule.updated_date).fromNow()}</em>
                </p>
              </EuiText>
            )}
          </>
        </LazyLoad>
      </EuiPanel>
    </EuiFlexItem>
  );
};

export default RulePanel;
