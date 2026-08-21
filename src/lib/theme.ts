/**
 * The functions here are for tracking and setting the current theme.
 * localStorage is used to store the currently preferred them, though
 * that doesn't work on the server, where we just use a default.
 */

const selector = 'link[data-name="eui-theme"]';
export const defaultTheme = 'light';

function getAllThemes(): HTMLLinkElement[] {
  // @ts-ignore
  return [...document.querySelectorAll(selector)];
}

export function enableTheme(newThemeName: string): void {
  const oldThemeName = getTheme();
  localStorage.setItem('theme', newThemeName);

  for (const themeLink of getAllThemes()) {
    // Disable all theme links, except for the desired theme, which we enable
    const isDisabled = themeLink.dataset.theme !== newThemeName;
    themeLink.disabled = isDisabled;
    // `themeLink['aria-disabled'] = ...` used to be assigned here, which set a
    // stray JS property and never touched the DOM -- so the attribute rendered
    // by _document.tsx went stale as soon as the theme was switched. Mirror
    // `disabled` properly instead.
    if (isDisabled) {
      themeLink.setAttribute('aria-disabled', 'true');
    } else {
      themeLink.removeAttribute('aria-disabled');
    }
  }

  // Add a class to the `body` element that indicates which theme we're using.
  // This allows any custom styling to adapt to the current theme.
  if (document.body.classList.contains(`appTheme-${oldThemeName}`)) {
    document.body.classList.replace(
      `appTheme-${oldThemeName}`,
      `appTheme-${newThemeName}`
    );
  } else {
    document.body.classList.add(`appTheme-${newThemeName}`);
  }
}

export function getTheme(): string {
  const storedTheme = localStorage.getItem('theme');

  return storedTheme || defaultTheme;
}

export interface Theme {
  id: string;
  name: string;
  publicPath: string;
}

// This is supplied to the app as JSON by Webpack - see next.config.js
export interface ThemeConfig {
  availableThemes: Array<Theme>;
  copyConfig: Array<{
    from: string;
    to: string;
  }>;
}

// The config is generated during the build and made available in a JSON string.
export const themeConfig: ThemeConfig = JSON.parse(process.env.THEME_CONFIG!);
