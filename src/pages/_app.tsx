import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { EuiErrorBoundary } from '@elastic/eui';
import { Global } from '@emotion/react';
import Chrome from '../components/chrome';
import { Theme } from '../components/theme';
import { globalStyes } from '../styles/global.styles';
import Script from 'next/script';
import * as gtag from '../lib/gtag';

/**
 * Next.js uses the App component to initialize pages. You can override it
 * and control the page initialization. Here use use it to render the
 * `Chrome` component on each page, and apply an error boundary.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-app
 */
const EuiApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = url => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="initGA4"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gtag.GA_TRACKING_ID}', {
      page_path: window.location.pathname,
    });
  `,
        }}
      />
      <Head>
        {/* You can override this in other pages - see index.tsx for an example */}
        <title>Elastic Detection Rules Explorer</title>
      </Head>
      <Global styles={globalStyes} />
      <Theme>
        <Chrome>
          <EuiErrorBoundary>
            <Component {...pageProps} />
          </EuiErrorBoundary>
        </Chrome>
      </Theme>
    </>
  );
};

export default EuiApp;
