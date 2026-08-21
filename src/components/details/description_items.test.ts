import { describe, expect, it } from 'vitest';

import { withContent } from './description_items';

describe('withContent', () => {
  it('keeps rows that have a description', () => {
    expect(
      withContent([
        { title: 'Severity', description: 'high' },
        { title: 'Risk Score', description: 47 },
      ]).map(item => item.title)
    ).toEqual(['Severity', 'Risk Score']);
  });

  it('drops rows with no description', () => {
    expect(
      withContent([
        { title: 'References', description: undefined },
        { title: 'Severity', description: 'high' },
      ]).map(item => item.title)
    ).toEqual(['Severity']);
  });

  it('drops empty arrays, empty strings and false', () => {
    // `false` is what `list.length > 0 && list.map(...)` yields when empty.
    expect(
      withContent([
        { title: 'Empty string', description: '' },
        { title: 'False', description: false },
      ])
    ).toEqual([]);
  });

  it('preserves the pre-existing quirk that a zero risk score is dropped', () => {
    // 0 is falsy. This matches the original `.filter(x => x.description)`, so
    // it is behaviour-preserving rather than a bug introduced by the refactor.
    expect(withContent([{ title: 'Risk Score', description: 0 }])).toEqual([]);
  });

  it('keeps label-only rows named in alwaysKeep', () => {
    expect(
      withContent([{ title: 'Query', description: '' }], ['Query']).map(
        item => item.title
      )
    ).toEqual(['Query']);
  });

  it('does not keep an alwaysKeep row that is absent from the input', () => {
    expect(withContent([], ['Query'])).toEqual([]);
  });
});
