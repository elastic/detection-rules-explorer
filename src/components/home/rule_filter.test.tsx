import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RuleFilter from './rule_filter';
import { TAG_TYPES } from '../../lib/tags';
import { TagSummary } from '../../types';

const osType = TAG_TYPES.find(t => t.type === 'OS')!;

const tag = (tag_full: string, count: number): TagSummary => {
  const [tag_type, tag_name] = tag_full.split(': ');
  return { tag_type, tag_name, tag_full, count };
};

const OS_TAGS = [tag('OS: Linux', 12), tag('OS: Windows', 0)];

describe('RuleFilter', () => {
  it('labels itself from the tag type config', () => {
    const { container } = render(
      <RuleFilter
        tagType={osType}
        tagList={OS_TAGS}
        tagFilter={[]}
        onTagChange={vi.fn()}
      />
    );
    expect(container.textContent).toContain('Operating Systems');
  });

  it('counts only options that match something in the placeholder', () => {
    const { container } = render(
      <RuleFilter
        tagType={osType}
        tagList={OS_TAGS}
        tagFilter={[]}
        onTagChange={vi.fn()}
      />
    );
    // One of the two OS tags has count 0, so the prompt says 1, not 2.
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe(
      'Filter by 1 Operating Systems'
    );
  });

  it('reports its own tag type when a selection is made', async () => {
    // Guards the PR 6 rewiring: the type now comes from the config rather than
    // tagList[0].tag_type. For a non-empty list both give 'OS', so this test
    // catches a mis-wired field, not the empty-list hazard -- that path is
    // unreachable through the UI (you cannot select from an empty list, and all
    // eight tag types always exist in the data), which is precisely why the old
    // code's '' fallback survived unnoticed.
    const onTagChange = vi.fn();
    const { container } = render(
      <RuleFilter
        tagType={osType}
        tagList={OS_TAGS}
        tagFilter={[]}
        onTagChange={onTagChange}
      />
    );

    // `getByRole('combobox')` is ambiguous here: EuiComboBox puts the role on
    // both a wrapper and the input.
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'Linux' } });
    const option = await screen.findByRole('option', { name: /Linux/ });
    fireEvent.click(option);

    expect(onTagChange).toHaveBeenCalledWith('OS', ['OS: Linux']);
  });

  it('marks already-selected tags as selected', () => {
    const { container } = render(
      <RuleFilter
        tagType={osType}
        tagList={OS_TAGS}
        tagFilter={['OS: Linux']}
        onTagChange={vi.fn()}
      />
    );
    expect(container.textContent).toContain('Linux (12)');
  });
});
