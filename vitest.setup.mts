/**
 * Shared jsdom setup for component tests.
 */

/**
 * jsdom does not implement IntersectionObserver, which `react-lazy-load` uses
 * in `componentDidMount` (see components/home/rule_panel.tsx). Report an
 * immediate intersection so lazy content renders, matching what a user sees
 * once the card scrolls into view.
 */
class ImmediateIntersectionObserver {
  private callback: IntersectionObserverCallback;

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.callback(
      [
        { isIntersecting: true, intersectionRatio: 1, target },
      ] as unknown as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver =
  ImmediateIntersectionObserver as unknown as typeof IntersectionObserver;

/**
 * jsdom's `getContext('2d')` returns null, but EUI's `CanvasTextUtils` (used by
 * EuiComboBox to size its input) assigns to `ctx.font` and calls
 * `measureText`. Provide the small slice of the 2D context it needs; widths are
 * approximated since jsdom does no layout anyway.
 */
const APPROX_CHAR_WIDTH = 6;

HTMLCanvasElement.prototype.getContext = function getContext() {
  return {
    font: '',
    measureText: (text: string) => ({ width: text.length * APPROX_CHAR_WIDTH }),
  } as unknown as CanvasRenderingContext2D;
} as typeof HTMLCanvasElement.prototype.getContext;

/**
 * `next.config.js` injects THEME_CONFIG at build time via its `env` option, and
 * `src/lib/theme.ts` JSON.parses it at module scope -- so simply importing that
 * module outside a Next build throws. Provide an empty but valid config.
 */
process.env.THEME_CONFIG ??= JSON.stringify({
  availableThemes: [],
  copyConfig: [],
});
