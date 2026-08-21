import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createWriter } from './write_output';

let dataDir: string;

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prebuild-test-'));
});

afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('createWriter', () => {
  it('creates the rules directory when it does not exist', () => {
    createWriter(dataDir).resetRulesDir();
    expect(fs.existsSync(path.join(dataDir, 'rules'))).toBe(true);
  });

  // This is PR 4's fix (5). Without it a rule deleted upstream stayed in a
  // local src/data forever and kept being exported as a page.
  it('removes rules left over from a previous run', () => {
    const writer = createWriter(dataDir);
    writer.resetRulesDir();
    writer.writeRule('stale-rule', { rule: { name: 'Gone upstream' } });
    expect(fs.existsSync(path.join(dataDir, 'rules', 'stale-rule.json'))).toBe(
      true
    );

    writer.resetRulesDir();
    expect(fs.readdirSync(path.join(dataDir, 'rules'))).toEqual([]);
  });

  it('writes each rule as compact JSON named by its id', () => {
    const writer = createWriter(dataDir);
    writer.resetRulesDir();
    writer.writeRule('abc-123', { metadata: { a: 1 }, rule: { b: 2 } });

    const written = fs.readFileSync(
      path.join(dataDir, 'rules', 'abc-123.json'),
      'utf8'
    );
    // Compact, and key order preserved -- both are relied on by the parity diff.
    expect(written).toBe('{"metadata":{"a":1},"rule":{"b":2}}');
  });

  it('writes both aggregate files', () => {
    const writer = createWriter(dataDir);
    writer.resetRulesDir();
    writer.writeSummaries(
      [
        {
          id: 'a',
          name: 'A',
          tags: ['Domain: Endpoint'],
          updated_date: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      [
        {
          tag_type: 'Domain',
          tag_name: 'Endpoint',
          tag_full: 'Domain: Endpoint',
          count: 1,
        },
      ]
    );

    const newest = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'newestRules.json'), 'utf8')
    );
    // Dates serialise to the ISO strings the app reads back as strings.
    expect(newest[0].updated_date).toBe('2026-01-01T00:00:00.000Z');
    expect(
      JSON.parse(
        fs.readFileSync(path.join(dataDir, 'tagSummaries.json'), 'utf8')
      )
    ).toHaveLength(1);
  });
});
