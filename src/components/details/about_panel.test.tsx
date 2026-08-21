import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AboutPanel from './about_panel';
import { Rule } from '../../types';

const rule = (overrides: Partial<Rule['rule']> = {}): Rule => ({
  metadata: {},
  rule: {
    name: 'Test Rule',
    description: 'Detects something suspicious.',
    tags: ['Domain: Endpoint'],
    severity: 'high',
    risk_score: 73,
    ...overrides,
  },
});

describe('AboutPanel', () => {
  it('renders the description and core metadata', () => {
    const { container } = render(<AboutPanel rule={rule()} />);
    expect(container.textContent).toContain('Detects something suspicious.');
    expect(container.textContent).toContain('Domain: Endpoint');
    expect(container.textContent).toContain('high');
    expect(container.textContent).toContain('73');
    expect(container.textContent).toContain('Elastic License v2');
  });

  it('omits rows the rule has nothing for', () => {
    const { container } = render(<AboutPanel rule={rule()} />);
    expect(container.textContent).not.toContain('References');
    expect(container.textContent).not.toContain('False Positive Examples');
  });

  it('links each reference', () => {
    const { container } = render(
      <AboutPanel
        rule={rule({ reference: ['https://example.com/advisory'] })}
      />
    );
    const link = Array.from(container.querySelectorAll('a')).find(a =>
      a.textContent?.includes('example.com')
    );
    expect(link?.getAttribute('href')).toBe('https://example.com/advisory');
  });

  it('renders tactics with their techniques nested beneath', () => {
    const { container } = render(
      <AboutPanel
        rule={rule({
          threat: [
            {
              framework: 'MITRE ATT&CK',
              tactic: {
                id: 'TA0011',
                name: 'Command and Control',
                reference: 'https://attack.mitre.org/tactics/TA0011/',
              },
              technique: [
                {
                  id: 'T1071',
                  name: 'Application Layer Protocol',
                  reference: 'https://attack.mitre.org/techniques/T1071/',
                },
              ],
            },
          ],
        })}
      />
    );
    expect(container.textContent).toContain('Command and Control (TA0011)');
    expect(container.textContent).toContain('Application Layer Protocol');
    expect(container.textContent).toContain('T1071');
  });
});
