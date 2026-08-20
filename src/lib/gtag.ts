declare const window: Window & { gtag?: (...args: unknown[]) => void };
export const GA_TRACKING_ID = 'G-7P2FQG4KX0';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = url => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
