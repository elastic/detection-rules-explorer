const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { IgnorePlugin } = require('webpack');

/**
 * When deploying under a subdirectory (GitHub Pages serves this repo at
 * /detection-rules-explorer) Next has to be told, or every asset URL is wrong.
 * Local development serves from `/`, so the default is empty.
 *
 * Set PATH_PREFIX to the prefix itself, e.g. `/detection-rules-explorer`. For
 * compatibility with the previous flag, `PATH_PREFIX=true` still resolves to
 * the default prefix below.
 *
 * This used to be derived by parsing `.git/config` with `iniparser` to read the
 * origin URL. That silently produced a different prefix depending on how the
 * repository had been cloned -- the classic "works locally, breaks in CI" trap.
 */
const DEFAULT_PATH_PREFIX = '/detection-rules-explorer';

const pathPrefix = resolvePathPrefix(process.env.PATH_PREFIX);

const themeConfig = buildThemeConfig();

const nextConfig = {
  /**
   * Static HTML export. Next 13 removed the separate `next export` command in
   * favour of this, so `npm run build` now produces `out/` on its own.
   */
  output: 'export',

  compiler: {
    emotion: true,
  },
  /** Disable the `X-Powered-By: Next.js` response header. */
  poweredByHeader: false,

  /**
   * When set to something other than '', this field instructs Next to
   * expect all paths to have a specific directory prefix. This fact is
   * transparent to (almost all of) the rest of the application.
   */
  basePath: pathPrefix,

  /**
   * Set custom `process.env.SOMETHING` values to use in the application.
   * You can do this with Webpack's `DefinePlugin`, but this is more concise.
   * It's also possible to provide values via `publicRuntimeConfig`, but
   * this method is preferred as it can be done statically at build time.
   *
   * @see https://nextjs.org/docs/api-reference/next.config.js/environment-variables
   */
  env: {
    PATH_PREFIX: pathPrefix,
    THEME_CONFIG: JSON.stringify(themeConfig),
  },

  /**
   * Next.js reports TypeScript errors by default. If you don't want to
   * leverage this behavior and prefer something else instead, like your
   * editor's integration, you may want to disable it.
   */
  // typescript: {
  //   ignoreDevErrors: true,
  // },

  /** Customises the build */
  webpack(config, { isServer }) {
    // EUI uses some libraries and features that don't work outside of a
    // browser by default. We need to configure the build so that these
    // features are either ignored or replaced with stub implementations.
    if (isServer) {
      config.externals = config.externals.map(eachExternal => {
        if (typeof eachExternal !== 'function') {
          return eachExternal;
        }

        return (context, callback) => {
          if (context.request.indexOf('@elastic/eui') > -1) {
            return callback();
          }

          return eachExternal(context, callback);
        };
      });

      // Mock HTMLElement on the server-side
      const definePluginId = config.plugins.findIndex(
        p => p.constructor.name === 'DefinePlugin'
      );

      config.plugins[definePluginId].definitions = {
        ...config.plugins[definePluginId].definitions,
        HTMLElement: function () {},
      };
    }

    // Copy theme CSS files into `public` only if they exist
    if (
      Array.isArray(themeConfig.copyConfig) &&
      themeConfig.copyConfig.length > 0
    ) {
      config.plugins.push(
        new CopyWebpackPlugin({ patterns: themeConfig.copyConfig })
      );
    }

    config.plugins.push(
      // Moment ships with a large number of locales. Exclude them, leaving
      // just the default English locale. If you need other locales, see:
      // https://create-react-app.dev/docs/troubleshooting/#momentjs-locales-are-missing
      new IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    config.resolve.mainFields = ['module', 'main'];

    return config;
  },
};

/**
 * Enhances the Next config with the ability to:
 * - Analyze the webpack bundle
 * - Load images from JavaScript.
 * - Load SCSS files from JavaScript.
 */
module.exports = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

/**
 * Find all EUI themes and construct a theme configuration object.
 *
 * The `copyConfig` key is used to configure CopyWebpackPlugin, which
 * copies the default EUI themes into the `public` directory, injecting a
 * hash into the filename so that when EUI is updated, new copies of the
 * themes will be fetched.
 *
 * The `availableThemes` key is used in the app to includes the themes in
 * the app's `<head>` element, and for theme switching.
 *
 * @return {ThemeConfig}
 */
function buildThemeConfig() {
  const themeDir = path.join(
    __dirname,
    'node_modules',
    '@elastic',
    'eui',
    'dist'
  );

  // Was `glob.sync('eui_theme_*.min.css')`. glob v9 removed the sync export and
  // this is the only call site, so the dependency is not worth carrying.
  //
  // NOTE: as of @elastic/eui 111 this directory does not exist -- EUI no longer
  // ships prebuilt theme stylesheets, it is CSS-in-JS throughout. glob.sync
  // silently returned [] for a missing directory, so match that rather than
  // throwing. See defect D17 in CLEANUP_PLAN.md: the entire theme-<link>
  // mechanism is dead code today.
  const themeFiles = (fs.existsSync(themeDir) ? fs.readdirSync(themeDir) : [])
    .filter(name => /^eui_theme_.*\.min\.css$/.test(name))
    .sort()
    .map(name => path.join(themeDir, name));

  const themeConfig = {
    availableThemes: [],
    copyConfig: [],
  };

  for (const each of themeFiles) {
    const basename = path.basename(each, '.min.css');

    const themeId = basename.replace(/^eui_theme_/, '');

    const themeName =
      themeId[0].toUpperCase() + themeId.slice(1).replace(/_/g, ' ');

    const publicPath = `themes/${basename}.${hashFile(each)}.min.css`;
    const toPath = path.join(
      __dirname,
      `public`,
      `themes`,
      `${basename}.${hashFile(each)}.min.css`
    );

    themeConfig.availableThemes.push({
      id: themeId,
      name: themeName,
      publicPath,
    });

    themeConfig.copyConfig.push({
      from: each,
      to: toPath,
    });
  }

  return themeConfig;
}

/**
 * Given a file, calculate a hash and return the first portion. The number
 * of characters is truncated to match how Webpack generates hashes.
 *
 * @param {string} filePath the absolute path to the file to hash.
 * @return string
 */
function hashFile(filePath) {
  const hash = crypto.createHash(`sha256`);
  const fileData = fs.readFileSync(filePath);
  hash.update(fileData);
  const fullHash = hash.digest(`hex`);

  // Use a hash length that matches what Webpack does
  return fullHash.substr(0, 20);
}

/**
 * Resolve the configured base path.
 *
 * - unset or empty -> '' (local development, served from /)
 * - 'true'         -> the default prefix (what the old flag meant)
 * - anything else  -> used verbatim, so forks can override it
 *
 * @param {string | undefined} value
 * @return {string}
 */
function resolvePathPrefix(value) {
  if (!value) {
    return '';
  }
  if (value === 'true') {
    return DEFAULT_PATH_PREFIX;
  }
  return value.startsWith('/') ? value : `/${value}`;
}
