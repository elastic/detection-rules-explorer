# Contributing

## Before opening a pull request

```bash
npm ci
npm run lint
npm run typecheck    # needs src/data/ — run `npm run prebuild` first on a fresh clone
npm test
npm run build
```

CI runs all of these. The build is the slowest but most valuable check: it
exercises the prebuild script against the live detection-rules tarball and
statically renders every rule page.

## Verifying that a change did not alter the site

Most changes here are refactors that should leave the rendered site untouched.
**Do not verify that with a plain `diff -rq` of two `out/` directories** — it will
report thousands of differences that mean nothing. Seven things change between
two builds on their own:

| Noise source                   | Why                                               |
| ------------------------------ | ------------------------------------------------- |
| Next build ID                  | new on every build                                |
| Content-hashed chunk filenames | change if any app code changes                    |
| Webpack chunk _ids_            | renumbered when modules are added or removed      |
| EUI DOM ids (`i<uuid>`)        | regenerated per render, even for identical source |
| Emotion class hashes           | derived from the CSS text                         |
| Relative dates ("a month ago") | `moment().fromNow()` runs at build time           |
| The rule corpus                | upstream merges land continuously                 |

The last two are not normalisable — they are functions of _when_ you build. So a
baseline captured yesterday is worthless. Always build both trees in one sitting:

```bash
git stash push -m wip        # tracked changes only; leaves untracked files alone
npm run build && cp -r out /tmp/out-baseline
git stash pop
npm run build
# then compare /tmp/out-baseline against out/
```

Normalise the noise above before comparing, and require **zero** remaining
differences. If you are comparing across a framework upgrade, byte comparison
stops being meaningful entirely — compare the rendered _text_ of each page
instead (strip tags, collapse whitespace), which is what actually matters to a
reader.

When a diff shows _every_ page changed, suspect a new noise source before
suspecting a regression. Comparing file lengths first is a quick tell: thousands
of pages with identical lengths is a strong parity signal.

## Things that are easy to get wrong

- **`prebuild` is an npm lifecycle hook.** `npm run build` runs it automatically.
  Renaming the script silently stops rule data from being generated.
- **Prettier reflow can change rendered HTML.** If an 80-column reflow moves a
  JSX expression onto a different line, React's text nodes merge or split and the
  server-rendered markup changes. A trailing `{' '}` means Prettier wrapped there
  and the wrapping is load-bearing.
- **Tests must not depend on generated `src/data/`.** They run in the fast CI job,
  before any prebuild. Anything needing real rule data belongs in the build job.
- **Rule ids are not unique.** A few upstream rules share a `rule_id`, so the
  second silently overwrites the first. Be careful using ids as React keys.
- **The EUI theme `<link>` mechanism is dead code.** `next.config.js` looks for
  prebuilt `eui_theme_*.min.css` files that EUI no longer ships, so it finds
  none. Theming works entirely through `EuiProvider`'s `colorMode`.

## Adding a tag type

`src/lib/tags.ts` is the single source of truth for the tag taxonomy — display
name, colour, icon and on-screen order. Add an entry to `TAG_TYPES` and the home
page filter appears automatically.
