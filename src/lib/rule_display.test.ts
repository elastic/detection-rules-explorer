import { describe, expect, it } from 'vitest';

import {
  integrationDocsUrl,
  integrationPack,
  relatedIntegrations,
  severityColor,
} from './rule_display';
import { Rule } from '../types';

const ruleWith = (metadata: Rule['metadata']): Rule => ({
  metadata,
  rule: { name: 'Test' },
});

describe('severityColor', () => {
  it('maps medium and high to warning and danger', () => {
    expect(severityColor('medium')).toBe('warning');
    expect(severityColor('high')).toBe('danger');
  });

  it('preserves the existing low/critical behaviour', () => {
    // Both fall through to subdued today. Documented in Appendix B as a
    // product decision, not a bug to fix during a refactor.
    expect(severityColor('low')).toBe('subdued');
    expect(severityColor('critical')).toBe('subdued');
  });

  it('does not throw on a missing severity', () => {
    expect(severityColor(undefined)).toBe('subdued');
  });
});

describe('relatedIntegrations', () => {
  it('passes a list through unchanged', () => {
    expect(relatedIntegrations({ integration: ['aws', 'okta'] })).toEqual([
      'aws',
      'okta',
    ]);
  });

  it('wraps a single integration in a list', () => {
    expect(relatedIntegrations({ integration: 'endpoint' })).toEqual([
      'endpoint',
    ]);
  });

  // Regression test for defect D2: the old inline expression produced
  // [undefined] here, which rendered a link labelled "undefined".
  it('returns an empty list when there is no integration', () => {
    expect(relatedIntegrations({})).toEqual([]);
    expect(relatedIntegrations({ integration: undefined })).toEqual([]);
  });
});

describe('integrationPack', () => {
  it('defaults to the prebuilt rules package', () => {
    const pack = integrationPack(ruleWith({}));
    expect(pack.name).toBe('Prebuilt Security Detection Rules');
    expect(pack.link).toContain('prebuilt-rules-management');
  });

  it('uses the source integration when the rule came from a package', () => {
    const pack = integrationPack(
      ruleWith({ source_integration: 'dga', source_integration_name: 'DGA' })
    );
    expect(pack.name).toBe('DGA');
    expect(pack.link).toBe(integrationDocsUrl('dga'));
  });
});
