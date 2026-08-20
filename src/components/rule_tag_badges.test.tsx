import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { css } from '@emotion/react';

import RuleTagBadges from './rule_tag_badges';

describe('RuleTagBadges', () => {
  it('renders one badge per tag', () => {
    const { container } = render(
      <RuleTagBadges tags={['Domain: Endpoint', 'OS: Linux']} />
    );
    expect(container.textContent).toContain('Domain: Endpoint');
    expect(container.textContent).toContain('OS: Linux');
  });

  it('hides Resources tags', () => {
    // 1974 tags in the corpus carry this prefix, so this path matters.
    const { container } = render(
      <RuleTagBadges
        tags={['Resources: Investigation Guide', 'Domain: Endpoint']}
      />
    );
    expect(container.textContent).not.toContain('Investigation Guide');
    expect(container.textContent).toContain('Domain: Endpoint');
  });

  it('renders nothing when every tag is hidden', () => {
    const { container } = render(
      <RuleTagBadges tags={['Resources: Investigation Guide']} />
    );
    expect(container.textContent).toBe('');
  });

  it('renders nothing for an empty tag list', () => {
    const { container } = render(<RuleTagBadges tags={[]} />);
    expect(container.textContent).toBe('');
  });

  it('does not throw on a tag with an unknown type', () => {
    const { container } = render(
      <RuleTagBadges tags={['Mitre Atlas: T0819', 'Elastic']} />
    );
    expect(container.textContent).toContain('Mitre Atlas: T0819');
    expect(container.textContent).toContain('Elastic');
  });

  // Guards the decision to name the prop `badgeCss` rather than `css`: the
  // Emotion JSX transform intercepts a `css` prop on any element, so naming it
  // `css` would have turned it into a className on this component and silently
  // dropped the style.
  it('applies badgeCss to the badges', () => {
    render(
      <RuleTagBadges
        tags={['Domain: Endpoint']}
        badgeCss={css`
          margin-top: 4px;
        `}
      />
    );
    const injected = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent)
      .join('');
    expect(injected).toContain('margin-top:4px');
  });
});
