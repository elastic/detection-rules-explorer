# Detection Rules Explorer

A UI for exploring and learning about Elastic Security Detection Rules.

## How do I get to the site?

The explorer is publically available at https://elastic.github.io/detection-rules-explorer. It is updated daily with the latest published rules.

## What rules are included?

All rules come from a single source: the [elastic/detection-rules](https://github.com/elastic/detection-rules/tree/main) repository. The prebuild script downloads that repository's tarball and ingests every TOML file under:

 - `rules/` — prebuilt security detection rules
 - `hunting/` — threat hunting queries
 - `rules_building_block/` — building block rules

Anything under a `_deprecated/` directory is skipped.

Rules from the machine learning integration packages (`dga`, `problemchild`, `lmd`, `ded`) are **not** included. `parseRuleData.ts` contains an unused `getPackageRules()` helper for fetching them, but it has never been wired into the prebuild run, so those rules have never appeared on the site.

## How do I get started with development?

The site is built with GitHub Pages, Next.js and Elastic EUI, based on the [Elastic's Next.js EUI Starter](https://github.com/elastic/next-eui-starter).

To run the local development environment:

1. Get going with node:

```bash
nvm use
```

2. Get the latest rules:

```bash
npm run prebuild
```

3. Start the development server:

```bash
npm run dev
```

From there, open [http://localhost:3000](http://localhost:3000) with your browser to see the result. It will hot reload as you make changes to the site code.

## How does this get deployed to Github pages?

There are two branches in this repository:

 - `main` - stores the source code for the site
 - `gh-pages` - stores the compiled site source for publishing

On merge to `main`, a Github action (at `.github/workflows/gh-pages.yml`) will build the site and push it to the `gh-pages` branch. From there, another Github action (auto-configured by Github) will publish the updates to the internet at https://elastic.github.io/detection-rules-explorer.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Elastic Next.js Starter](https://github.com/elastic/next-eui-starter) - on which this repo was originally based.
- [Elastic EUI Documentation](https://eui.elastic.co/) - Elastic's react component library.
