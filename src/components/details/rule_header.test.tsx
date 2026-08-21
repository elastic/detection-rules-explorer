import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import RuleHeader from './rule_header';
import { Rule } from '../../types';

describe('RuleHeader', () => {
  it('shows created and updated dates for a detection rule', () => {
    const { container } = render(
      <RuleHeader
        rule={{
          metadata: {
            creation_date: '2023/09/04',
            updated_date: '2025/09/16',
          },
          rule: { name: 'Suspicious Network Connection' },
        }}
      />
    );
    expect(container.textContent).toContain('Suspicious Network Connection');
    expect(container.textContent).toContain('Last updated');
    expect(container.textContent).toContain('2025-09-16');
    expect(container.textContent).toContain('Created');
  });

  // Hunts have no [metadata] section upstream, so the prebuild script falls
  // back to the epoch. Showing it would read as "Updated 56 years ago".
  it('hides both dates for a threat hunt', () => {
    const hunt: Rule = {
      hunt: { uuid: 'abc' },
      metadata: {
        creation_date: new Date(0).toISOString(),
        updated_date: new Date(0).toISOString(),
      },
      rule: { name: 'Low Volume External Connections' },
    };
    const { container } = render(<RuleHeader rule={hunt} />);

    expect(container.textContent).toContain('Low Volume External Connections');
    expect(container.textContent).not.toContain('Last updated');
    expect(container.textContent).not.toContain('Created');
  });
});
