import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import DefinitionPanel from './definition_panel';
import { Rule } from '../../types';

const rule = (overrides: Partial<Rule> = {}): Rule => ({
  metadata: { integration: ['endpoint'] },
  rule: {
    name: 'Test Rule',
    type: 'eql',
    language: 'eql',
    query: 'process where true',
    index: ['logs-endpoint.events.process-*'],
  },
  ...overrides,
});

describe('DefinitionPanel: rule type (defect D1)', () => {
  it('labels eql rules as event correlation rules, as before', () => {
    const { container } = render(<DefinitionPanel rule={rule()} />);
    expect(container.textContent).toContain('Event Correlation Rule');
  });

  it('labels kuery query rules as before', () => {
    const { container } = render(
      <DefinitionPanel
        rule={rule({ rule: { type: 'query', language: 'kuery' } })}
      />
    );
    expect(container.textContent).toContain('Query (Kibana Query Language)');
  });

  // 211 rules were affected: the old switch returned undefined for esql, and
  // the trailing .filter() then dropped the whole Rule Type row.
  it('shows a rule type for esql rules instead of dropping the row', () => {
    const { container } = render(
      <DefinitionPanel
        rule={rule({ rule: { type: 'esql', language: 'esql' } })}
      />
    );
    expect(container.textContent).toContain('Rule Type');
    expect(container.textContent).toContain('ES|QL Rule');
  });

  // No lucene rule exists upstream today, so only a test can catch this.
  it('does not mislabel a lucene query rule as event correlation', () => {
    const { container } = render(
      <DefinitionPanel
        rule={rule({ rule: { type: 'query', language: 'lucene' } })}
      />
    );
    expect(container.textContent).toContain('Query (Lucene)');
    expect(container.textContent).not.toContain('Event Correlation Rule');
  });

  it('omits the rule type row for hunts, which have no type', () => {
    const { container } = render(
      <DefinitionPanel
        rule={rule({ rule: { query: 'from logs-* | limit 10' } })}
      />
    );
    expect(container.textContent).not.toContain('Rule Type');
  });
});

describe('DefinitionPanel: related integrations (defect D2)', () => {
  it('links each integration', () => {
    const { container } = render(
      <DefinitionPanel rule={rule({ metadata: { integration: ['aws'] } })} />
    );
    expect(container.textContent).toContain('Related Integrations');
    const link = Array.from(container.querySelectorAll('a')).find(a =>
      a.textContent?.includes('aws')
    );
    expect(link?.getAttribute('href')).toBe(
      'https://docs.elastic.co/en/integrations/aws'
    );
  });

  it('accepts a single integration string', () => {
    const { container } = render(
      <DefinitionPanel rule={rule({ metadata: { integration: 'endpoint' } })} />
    );
    expect(container.textContent).toContain('endpoint');
  });

  // 56 of 2217 rules have no integration. They used to render a link labelled
  // "undefined" pointing at .../integrations/undefined.
  it('omits the row entirely when the rule has no integration', () => {
    const { container } = render(
      <DefinitionPanel rule={rule({ metadata: {} })} />
    );
    expect(container.textContent).not.toContain('Related Integrations');
    expect(container.textContent).not.toContain('undefined');
    expect(container.innerHTML).not.toContain('integrations/undefined');
  });
});
