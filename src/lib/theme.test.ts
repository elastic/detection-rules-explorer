import { beforeEach, describe, expect, it } from 'vitest';

import { defaultTheme, enableTheme, getTheme } from './theme';

const themeLinks = () =>
  Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[data-name="eui-theme"]')
  );

const linkFor = (theme: string) =>
  themeLinks().find(link => link.dataset.theme === theme)!;

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
  document.body.className = '';
  // Mirrors what _document.tsx renders: one link per theme, non-default ones
  // starting out disabled.
  for (const theme of ['light', 'dark']) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.name = 'eui-theme';
    link.dataset.theme = theme;
    if (theme !== defaultTheme) {
      link.disabled = true;
      link.setAttribute('aria-disabled', 'true');
    }
    document.head.appendChild(link);
  }
});

describe('getTheme', () => {
  it('falls back to the default when nothing is stored', () => {
    expect(getTheme()).toBe(defaultTheme);
  });

  it('returns the stored theme', () => {
    localStorage.setItem('theme', 'dark');
    expect(getTheme()).toBe('dark');
  });
});

describe('enableTheme', () => {
  it('persists the choice so it survives a reload', () => {
    enableTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('enables only the chosen stylesheet', () => {
    enableTheme('dark');
    expect(linkFor('dark').disabled).toBe(false);
    expect(linkFor('light').disabled).toBe(true);
  });

  // Before PR 7 this assigned a stray `link['aria-disabled']` JS property,
  // which never touched the DOM -- so the attribute rendered by _document.tsx
  // went stale the moment the theme was switched.
  it('keeps aria-disabled in step with disabled', () => {
    enableTheme('dark');
    expect(linkFor('dark').hasAttribute('aria-disabled')).toBe(false);
    expect(linkFor('light').getAttribute('aria-disabled')).toBe('true');

    enableTheme('light');
    expect(linkFor('light').hasAttribute('aria-disabled')).toBe(false);
    expect(linkFor('dark').getAttribute('aria-disabled')).toBe('true');
  });

  it('marks the body so custom styles can adapt', () => {
    enableTheme('dark');
    expect(document.body.classList.contains('appTheme-dark')).toBe(true);
  });

  it('replaces the previous theme class rather than accumulating classes', () => {
    enableTheme('dark');
    enableTheme('light');
    expect(document.body.classList.contains('appTheme-light')).toBe(true);
    expect(document.body.classList.contains('appTheme-dark')).toBe(false);
  });
});
