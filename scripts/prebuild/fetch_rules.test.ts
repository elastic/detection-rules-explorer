import { describe, expect, it } from 'vitest';

import { isRulePath } from './fetch_rules';

const root = 'elastic-detection-rules-a1b2c3d';

describe('isRulePath', () => {
  it('accepts detection rules, hunts and building-block rules', () => {
    expect(isRulePath(`${root}/rules/linux/execution_foo.toml`)).toBe(true);
    expect(isRulePath(`${root}/hunting/linux/queries/low_volume.toml`)).toBe(
      true
    );
    expect(isRulePath(`${root}/rules_building_block/windows/bar.toml`)).toBe(
      true
    );
  });

  it('rejects deprecated rules wherever they appear', () => {
    expect(isRulePath(`${root}/rules/_deprecated/old_rule.toml`)).toBe(false);
    expect(isRulePath(`${root}/hunting/linux/_deprecated/old_hunt.toml`)).toBe(
      false
    );
  });

  it('rejects non-TOML files inside the rule directories', () => {
    expect(isRulePath(`${root}/rules/README.md`)).toBe(false);
    expect(isRulePath(`${root}/hunting/index.md`)).toBe(false);
  });

  it('rejects TOML outside the ingested directories', () => {
    // Otherwise pyproject.toml and friends would be parsed as rules.
    expect(isRulePath(`${root}/pyproject.toml`)).toBe(false);
    expect(isRulePath(`${root}/detection_rules/etc/config.toml`)).toBe(false);
    expect(isRulePath(`${root}/tests/data/fixture.toml`)).toBe(false);
  });

  it('requires the tarball prefix, so paths cannot be spoofed', () => {
    expect(isRulePath('rules/linux/execution_foo.toml')).toBe(false);
    expect(isRulePath('some-other-repo/rules/linux/foo.toml')).toBe(false);
  });
});
