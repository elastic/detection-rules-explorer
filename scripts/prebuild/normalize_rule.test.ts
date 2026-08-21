import * as fs from 'fs';
import * as path from 'path';

import { describe, expect, it } from 'vitest';

import { convertHuntMitre, normalizeRule } from './normalize_rule';

const fixture = (name: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

describe('normalizeRule: detection rules', () => {
  const rule = normalizeRule(fixture('detection_rule.toml'));

  it('takes its id from rule.rule_id', () => {
    expect(rule.id).toBe('11111111-2222-3333-4444-555555555555');
  });

  it('takes its name from rule.name', () => {
    expect(rule.name).toBe('Suspicious Network Connection');
  });

  it('synthesises a Language tag from rule.language', () => {
    expect(rule.tags).toContain('Language: eql');
  });

  it('keeps the upstream tags, including hidden ones', () => {
    // Filtering `Resources:` is the UI's job, not the parser's.
    expect(rule.tags).toContain('Domain: Endpoint');
    expect(rule.tags).toContain('Resources: Investigation Guide');
  });

  it('parses updated_date from the YYYY/MM/DD upstream format', () => {
    expect(rule.updatedDate.toISOString().slice(0, 10)).toBe('2025-09-16');
  });

  it('preserves top-level key order, which JSON.stringify depends on', () => {
    expect(Object.keys(rule.document)).toEqual(['metadata', 'rule']);
  });

  it('does not overwrite an existing license', () => {
    expect(rule.document.rule?.license).toBe('Elastic License v2');
  });
});

describe('normalizeRule: hunts', () => {
  const hunt = normalizeRule(fixture('hunt.toml'));

  it('falls back to hunt.uuid for the id', () => {
    expect(hunt.id).toBe('99999999-8888-7777-6666-555555555555');
  });

  it('falls back to hunt.name for the name', () => {
    expect(hunt.name).toBe('Low Volume External Network Connections');
  });

  it('applies the default Hunt Type tag', () => {
    expect(hunt.tags).toEqual(['Hunt Type: Hunt']);
  });

  it('falls back to the epoch when there is no [metadata] section', () => {
    // This is why the UI must hide "Updated" for hunts -- otherwise they read
    // as "Updated 56 years ago".
    expect(hunt.updatedDate.getTime()).toBe(0);
    expect(hunt.document.metadata?.creation_date).toBe(
      new Date(0).toISOString()
    );
  });

  it('promotes hunt fields onto rule so one UI can render both', () => {
    expect(hunt.document.rule?.query).toEqual([
      'from logs-endpoint.events.network-* | limit 10',
    ]);
    expect(hunt.document.rule?.description).toContain('low volume');
    expect(hunt.document.rule?.license).toBe('Elastic License v2');
    expect(hunt.document.metadata?.integration).toEqual(['endpoint']);
  });

  it('emits hunt/rule/metadata in that key order', () => {
    // Order is an artefact of assignment order in normalizeRule; the generated
    // JSON is compared byte-for-byte against the previous script.
    expect(Object.keys(hunt.document)).toEqual(['hunt', 'rule', 'metadata']);
  });

  it('converts hunt.mitre into a structured rule.threat', () => {
    expect(hunt.document.rule?.threat).toHaveLength(1);
  });
});

describe('normalizeRule: failure modes', () => {
  it('throws when neither rule_id nor hunt.uuid is present', () => {
    expect(() => normalizeRule('[rule]\nname = "No id"\n')).toThrow(
      /Neither rule.rule_id nor hunt.uuid/
    );
  });

  it('throws on malformed TOML rather than returning junk', () => {
    // The caller counts these; previously it became an unhandled rejection.
    expect(() => normalizeRule('[rule\nbroken')).toThrow();
  });
});

describe('convertHuntMitre', () => {
  it('attaches techniques and subtechniques to the preceding tactic', () => {
    const threat = convertHuntMitre(['TA0011', 'T1071', 'T1071.001']);

    expect(threat).toHaveLength(1);
    expect(threat[0].framework).toBe('MITRE ATT&CK');
    expect(threat[0].tactic?.id).toBe('TA0011');
    expect(threat[0].tactic?.reference).toBe(
      'https://attack.mitre.org/tactics/TA0011/'
    );
    expect(threat[0].technique).toHaveLength(2);
    expect(threat[0].technique?.[0].id).toBe('T1071');
    expect(threat[0].technique?.[1].subtechnique?.[0].id).toBe('T1071.001');
    expect(threat[0].technique?.[1].subtechnique?.[0].reference).toBe(
      'https://attack.mitre.org/techniques/T1071/001/'
    );
  });

  it('gives a placeholder tactic to a technique with no preceding tactic', () => {
    const threat = convertHuntMitre(['T1059']);

    expect(threat).toHaveLength(1);
    expect(threat[0].tactic?.id).toBe('');
    expect(threat[0].technique?.[0].id).toBe('T1059');
  });

  it('returns nothing for an empty list', () => {
    expect(convertHuntMitre([])).toEqual([]);
  });
});
