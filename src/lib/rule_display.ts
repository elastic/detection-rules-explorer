import { Rule, RuleMetadata } from '../types';

const PREBUILT_PACK_NAME = 'Prebuilt Security Detection Rules';
const PREBUILT_PACK_LINK =
  'https://www.elastic.co/guide/en/security/current/prebuilt-rules-management.html';
const INTEGRATION_DOCS = 'https://docs.elastic.co/en/integrations';

/**
 * EUI health colour for a rule's severity.
 *
 * NOTE: `low` and `critical` both fall through to `subdued`, so a critical rule
 * currently looks the same as an informational one. That is the pre-existing
 * behaviour and is preserved here deliberately -- changing it is a product
 * decision, not a refactor (see CLEANUP_PLAN.md Appendix B).
 */
export function severityColor(severity?: string): string {
  if (severity === 'medium') {
    return 'warning';
  }
  if (severity === 'high') {
    return 'danger';
  }
  return 'subdued';
}

/**
 * The integrations a rule depends on, as a list.
 *
 * Fixes defect D2: the previous inline expression spread
 * `[rule.metadata.integration]` unconditionally, so a rule with no
 * `integration` produced `[undefined]` -- a truthy array that survived the
 * `.filter(x => x.description)` and rendered a link labelled "undefined"
 * pointing at `.../integrations/undefined`. 56 of 2217 rules were affected.
 */
export function relatedIntegrations(metadata: RuleMetadata): string[] {
  const integration = metadata.integration;
  if (!integration) {
    return [];
  }
  return Array.isArray(integration) ? integration : [integration];
}

export function integrationDocsUrl(integration: string): string {
  return `${INTEGRATION_DOCS}/${integration}`;
}

/** Which package a rule ships in, and where its install guide lives. */
export function integrationPack(rule: Rule): { name: string; link: string } {
  return {
    name: rule.metadata.source_integration_name || PREBUILT_PACK_NAME,
    link: rule.metadata.source_integration
      ? integrationDocsUrl(rule.metadata.source_integration)
      : PREBUILT_PACK_LINK,
  };
}
