import { PassThrough } from 'stream';

import axios from 'axios';
import * as tar from 'tar';

const TARBALL_URL =
  'https://api.github.com/repos/elastic/detection-rules/tarball';

/**
 * Paths inside the tarball we ingest. Anything under `_deprecated/` is skipped.
 */
const INCLUDED_PATHS = [
  /^elastic-detection-rules-.*\/rules\/.*\.toml$/,
  /^elastic-detection-rules-.*\/hunting\/.*\.toml$/,
  /^elastic-detection-rules-.*\/rules_building_block\/.*\.toml$/,
];
const EXCLUDED_PATH = /\/_deprecated\//;

export function isRulePath(entryPath: string): boolean {
  return (
    INCLUDED_PATHS.some(pattern => pattern.test(entryPath)) &&
    !EXCLUDED_PATH.test(entryPath)
  );
}

export interface RuleFile {
  path: string;
  contents: string;
}

/**
 * Stream the detection-rules tarball and hand each matching TOML to `onFile`.
 *
 * Two fixes over the previous implementation:
 *
 * 1. Entry contents are decoded with `toString('utf8')`. The old code passed a
 *    raw `Buffer` to `toml.parse`, which expects a string and only worked by
 *    implicit coercion.
 * 2. Each entry's completion is tracked in `pending` and awaited *after* the
 *    parser finishes. Previously the outer promise resolved on `finish` while
 *    per-entry `end` handlers were still queued, so the script could proceed --
 *    or exit -- with rules missing, non-deterministically.
 */
export async function fetchRuleFiles(
  onFile: (file: RuleFile) => void
): Promise<void> {
  const headers: Record<string, string> = {};
  // The anonymous tarball endpoint is rate-limited, which eventually bites the
  // daily cron. Both workflows pass secrets.GITHUB_TOKEN.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await axios.get(TARBALL_URL, {
    responseType: 'stream',
    headers,
  });

  const parser = response.data.pipe(new tar.Parser());
  const pending: Promise<void>[] = [];

  parser.on('entry', (entry: tar.ReadEntry) => {
    if (!isRulePath(entry.path)) {
      entry.resume();
      return;
    }

    pending.push(
      new Promise<void>((resolve, reject) => {
        const stream = new PassThrough();
        const chunks: Buffer[] = [];
        entry.pipe(stream);
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => {
          onFile({
            path: entry.path,
            contents: Buffer.concat(chunks).toString('utf8'),
          });
          resolve();
        });
      })
    );
  });

  await new Promise<void>((resolve, reject) => {
    parser.on('finish', resolve);
    parser.on('error', reject);
  });

  await Promise.all(pending);
}
