# Detection Rules Explorer

A UI for exploring and learning about Elastic Security Detection Rules.

## How do I get to the site?

The explorer is publicly available at
https://elastic.github.io/detection-rules-explorer. It is rebuilt daily with the
latest published rules.

## What rules are included?

Everything is ingested from [elastic/detection-rules](https://github.com/elastic/detection-rules),
from three directories in the repository's default branch:

| Source                  | Contents                          |
| ----------------------- | --------------------------------- |
| `rules/`                | Prebuilt security detection rules |
| `rules_building_block/` | Building-block rules              |
| `hunting/`              | Threat hunting queries            |

Anything under a `_deprecated/` directory is skipped. As of 2026-08-21 that
yields roughly 2,200 rules and hunts.

> **Note:** earlier versions of this README also listed the DGA, Living off the
> Land, Lateral Movement and Data Exfiltration integration packages. Those were
> never actually ingested — the code that would have fetched them was present but
> never called, and it has since been removed. If you want that coverage back,
> please open an issue.

## Getting started with development

The site is built with Next.js and Elastic EUI, and published to GitHub Pages. It
was originally based on [Elastic's Next.js EUI Starter](https://github.com/elastic/next-eui-starter).

```bash
nvm use          # Node version comes from .nvmrc
npm ci
npm run prebuild # download the rules and generate src/data/
npm run dev      # http://localhost:3000, hot reloads
```

`npm run prebuild` is only needed before `npm run dev`. **`npm run build` runs it
automatically** — `prebuild` is an npm lifecycle hook, so npm invokes it before
`build` without anything referencing it. That is why neither GitHub Actions
workflow mentions it, and it is easy to break by accident: renaming the script
silently stops the data from being generated.

### Commands

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Development server on :3000                             |
| `npm run prebuild`  | Regenerate `src/data/` from the detection-rules tarball |
| `npm run build`     | `prebuild` (implicit) then a static export into `out/`  |
| `npm start`         | Serve the built `out/` directory                        |
| `npm run lint`      | ESLint                                                  |
| `npm run typecheck` | Typecheck the app and the prebuild script               |
| `npm test`          | Vitest unit tests                                       |

`npm run typecheck` covers both TypeScript projects, and the app half needs
`src/data/` to exist — run `npm run prebuild` first on a fresh clone.

## How it works

### Data pipeline (build time only — there is no runtime API)

```
scripts/prebuild/           streams the detection-rules tarball, normalises each
  index.ts                  TOML, and writes one JSON file per rule
  fetch_rules.ts
  normalize_rule.ts
  summarize.ts
  write_output.ts
        │  tsc -p tsconfig.scripts.json   →  .prebuild/scripts/prebuild/index.js
        ▼
src/data/                   generated, gitignored, cleared on every run
  ├── rules/<rule_id>.json   one document per rule
  ├── newestRules.json       summaries, newest first (home page)
  └── tagSummaries.json      tag → count (filter controls)
```

Set `GITHUB_TOKEN` to authenticate the tarball download if you hit GitHub's
anonymous rate limit. The script fails loudly rather than writing a partial data
set: it exits non-zero if fewer than 1,500 rules parse or more than 10 fail.

### Site

| Path                          | Role                                                 |
| ----------------------------- | ---------------------------------------------------- |
| `src/pages/index.tsx`         | Home page: search box, eight tag filters, rule cards |
| `src/pages/rules/[id].tsx`    | One statically generated page per rule               |
| `src/lib/use_rule_filters.ts` | Search and tag-filter state                          |
| `src/lib/tags.ts`             | The tag taxonomy — labels, colours, icons, ordering  |
| `src/lib/rule_types.ts`       | `rule.type` → human-readable label                   |
| `src/lib/rules.server.ts`     | Reads generated rule JSON (server-side only)         |
| `src/components/home/`        | Header, hero, filters, rule cards                    |
| `src/components/details/`     | Rule detail panels                                   |

Rule tags are `"Type: Name"` strings (e.g. `"Domain: Endpoint"`). `src/lib/tags.ts`
is the single place that decides how each tag type is labelled, coloured and
ordered — add a new type there and the filter controls follow.

### Build and deploy

```
npm run build
  ├─ prebuild (implicit)  →  src/data/
  └─ next build           →  out/   (output: 'export' in next.config.js)
```

Two workflows:

- `.github/workflows/ci.yml` — on every pull request and push to `main`:
  lint, tests and the prebuild-script typecheck in a fast job; a full build plus
  the app typecheck in a second job.
- `.github/workflows/gh-pages.yml` — on push to `main` and daily at 00:15 UTC:
  build and publish `out/` to the `gh-pages` branch, which GitHub Pages serves.

`PATH_PREFIX` sets the base path the site is served under. The workflows set it
to `/detection-rules-explorer`; leave it unset locally so everything is served
from `/`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to verify a change — in
particular, why a raw `diff` of two builds is misleading and what to do instead.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Elastic EUI documentation](https://eui.elastic.co/)
- [elastic/detection-rules](https://github.com/elastic/detection-rules) — where the rules come from
