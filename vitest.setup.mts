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
      [{ isIntersecting: true, intersectionRatio: 1, target }] as unknown as
        IntersectionObserverEntry[],
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
