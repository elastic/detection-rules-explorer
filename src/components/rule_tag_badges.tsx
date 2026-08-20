import { FunctionComponent } from 'react';
import { SerializedStyles } from '@emotion/react';
import { EuiBadge } from '@elastic/eui';

import { isHiddenTag, tagTheme } from '../lib/tags';

interface RuleTagBadgesProps {
  tags: string[];
  /**
   * Per-badge styles. Deliberately NOT named `css`: the Emotion JSX transform
   * intercepts a `css` prop on any element, so it would be converted to a
   * `className` on this component and silently dropped.
   */
  badgeCss?: SerializedStyles;
}

/**
 * Renders a rule's tags as badges, themed by tag type and with hidden types
 * (`Resources: …`) filtered out. Shared by the rule cards on the home page and
 * the rule detail page, which previously carried copy-pasted versions.
 */
const RuleTagBadges: FunctionComponent<RuleTagBadgesProps> = ({
  tags,
  badgeCss,
}) => (
  <>
    {tags
      .filter(tag => !isHiddenTag(tag))
      .map((tag, i) => {
        const theme = tagTheme(tag);
        return (
          <EuiBadge
            iconType={theme.icon}
            color={theme.color}
            css={badgeCss}
            key={`${tag}-${i}`}>
            {tag}
          </EuiBadge>
        );
      })}
  </>
);

export default RuleTagBadges;
