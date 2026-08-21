import * as toml from 'toml';

import { NormalizedRule, RuleDocument, Technique, Threat } from './types';

/** Applied to hunts, which carry no `[rule] tags`. */
export const DEFAULT_HUNT_TAGS = ['Hunt Type: Hunt'];

/**
 * Hunts express MITRE coverage as a flat list of ids (`["TA0011", "T1071",
 * "T1071.001"]`). Detection rules use a structured `rule.threat`, so convert
 * so the detail page can render both the same way.
 *
 * Techniques attach to the most recently seen tactic; a technique appearing
 * before any tactic gets a placeholder tactic, which is what the UI expects.
 */
export function convertHuntMitre(mitreData: string[]): Threat[] {
  const threat: Threat[] = [];

  mitreData.forEach(item => {
    if (item.startsWith('TA')) {
      threat.push({
        framework: 'MITRE ATT&CK',
        tactic: {
          id: item,
          name: '',
          reference: `https://attack.mitre.org/tactics/${item}/`,
        },
        technique: [], // Ensure technique is an empty array if not present
      });
    } else if (item.startsWith('T')) {
      const parts = item.split('.');
      const techniqueId = parts[0];
      const subtechniqueId = parts[1];

      const technique: Technique = {
        id: techniqueId,
        name: '',
        reference: `https://attack.mitre.org/techniques/${techniqueId}/`,
      };

      if (subtechniqueId) {
        technique.subtechnique = [
          {
            id: `${techniqueId}.${subtechniqueId}`,
            reference: `https://attack.mitre.org/techniques/${techniqueId}/${subtechniqueId}/`,
          },
        ];
      }

      // Find the last added threat with a tactic to add the technique to it
      const lastThreat = threat[threat.length - 1];
      if (lastThreat && lastThreat.tactic && lastThreat.technique) {
        lastThreat.technique.push(technique);
      } else {
        threat.push({
          framework: 'MITRE ATT&CK',
          tactic: {
            id: '',
            name: '',
            reference: '',
          },
          technique: [technique],
        });
      }
    }
  });

  return threat;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function setDefault(obj: Record<string, any>, key: string, value: any): void {
  if (!obj[key]) {
    obj[key] = value;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Parse one rule or hunt TOML and fill in the defaults the UI relies on.
 *
 * Pure: no filesystem, no network, no shared state. That is what makes it the
 * one part of the prebuild worth unit-testing.
 *
 * NOTE ON KEY ORDER: the generated JSON is written with `JSON.stringify`, so
 * the order in which properties are assigned below is the order they appear in
 * `src/data/rules/*.json`. Hunts come out as `{hunt, rule, metadata}` purely
 * because `rule` is assigned before `metadata`. Do not reorder these
 * statements without re-running the parity diff in CLEANUP_PLAN.md PR 4.
 */
export function normalizeRule(tomlText: string): NormalizedRule {
  const document: RuleDocument = toml.parse(tomlText);

  const id = document.rule?.rule_id || document.hunt?.uuid;
  if (!id) {
    throw new Error('Neither rule.rule_id nor hunt.uuid is available');
  }

  document.rule = document.rule || {};
  document.metadata = document.metadata || {};

  const tags: string[] = document.rule.tags || [...DEFAULT_HUNT_TAGS];
  setDefault(document.rule, 'tags', tags);

  // Language is not a tag upstream, but it is a useful filter.
  const language = document.rule.language;
  if (language) {
    tags.push(`Language: ${language}`);
  }

  // Hunting TOMLs have no [metadata] section at all. The epoch fallback is why
  // the UI must suppress "Updated" for hunts -- see defect note in PR 5.
  const defaultDate = new Date(0).toISOString();
  setDefault(document.metadata, 'creation_date', defaultDate);
  setDefault(document.metadata, 'updated_date', defaultDate);

  const updatedDate = new Date(
    document.metadata.updated_date.replace(/\//g, '-')
  );

  const name = document.rule.name || document.hunt?.name || 'Unknown Rule';

  setDefault(document.metadata, 'integration', document.hunt?.integration);
  setDefault(document.rule, 'query', document.hunt?.query);
  setDefault(document.rule, 'license', 'Elastic License v2');
  setDefault(document.rule, 'description', document.hunt?.description);

  if (document.hunt?.mitre) {
    document.rule.threat = convertHuntMitre(document.hunt.mitre);
  }

  return { id, name, tags, updatedDate, document };
}
