import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import RulePanel from './rule_panel';
import { RuleSummary } from '../../types';

const rule = (overrides: Partial<RuleSummary> = {}): RuleSummary => ({
  id: '000047bb-b27a-47ec-8b62-ef1a5d2c9e19',
  name: 'Test Detection Rule',
  tags: ['Domain: Endpoint', 'OS: Linux'],
  updated_date: '2026-01-15T00:00:00.000Z',
  ...overrides,
});

describe('RulePanel', () => {
  it('renders the rule name and links to its detail page', () => {
    const { container } = render(<RulePanel rule={rule()} />);
    expect(container.textContent).toContain('Test Detection Rule');
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      '/rules/000047bb-b27a-47ec-8b62-ef1a5d2c9e19'
    );
  });

  it('shows when a detection rule was last updated', () => {
    const { container } = render(<RulePanel rule={rule()} />);
    expect(container.textContent).toContain('Updated');
  });

  // Hunting TOML files have no [metadata] section, so the parser falls back to
  // the Unix epoch and the UI would otherwise claim "Updated 56 years ago".
  it('hides the updated date for threat hunts', () => {
    const hunt = rule({
      tags: ['Hunt Type: Hunt', 'Language: esql'],
      updated_date: new Date(0).toISOString(),
    });
    const { container } = render(<RulePanel rule={hunt} />);
    expect(container.textContent).not.toContain('Updated');
  });

  it('hides Resources tags on the card', () => {
    const { container } = render(
      <RulePanel
        rule={rule({
          tags: ['Resources: Investigation Guide', 'Domain: Endpoint'],
        })}
      />
    );
    expect(container.textContent).not.toContain('Investigation Guide');
    expect(container.textContent).toContain('Domain: Endpoint');
  });
});
