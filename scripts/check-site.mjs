#!/usr/bin/env node
// Checks the static site in site/ before it is deployed (no dependencies; Node 20+).
//   node scripts/check-site.mjs
// Fails if a page is missing a title or a single <h1>, or if any local link, asset or #anchor is broken.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const SITE_URL = 'https://mjcodeworks.org/';
const problems = [];
const idCache = new Map();

const files = walk(root);
const pages = files.filter((f) => f.endsWith('.html'));

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const name = relative(root, page);

  if (!/<html[^>]*\slang="[^"]+"/.test(html)) problems.push(`${name}: <html> is missing a lang attribute`);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${name}: missing <title>`);
  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) problems.push(`${name}: expected exactly one <h1>, found ${h1s.length}`);
  if (/\{\{\w+\}\}/.test(html)) problems.push(`${name}: unreplaced {{placeholder}}`);

  for (const [, attr] of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(attr)) continue; // external, mailto:, tel:, data:
    const [pathPart, hash] = attr.split('#');
    const cleanPath = pathPart.split('?')[0];

    let target = page;
    if (cleanPath) {
      target = cleanPath.startsWith('/') ? join(root, cleanPath) : join(dirname(page), cleanPath);
      if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
      if (!existsSync(target)) {
        problems.push(`${name}: broken link "${attr}"`);
        continue;
      }
    }
    if (hash && target.endsWith('.html') && !ids(target).has(hash)) {
      problems.push(`${name}: link "${attr}" points to a missing #${hash}`);
    }
  }
}

const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!loc.startsWith(SITE_URL)) {
    problems.push(`sitemap.xml: ${loc} is not under ${SITE_URL}`);
    continue;
  }
  const target = join(root, loc.slice(SITE_URL.length), 'index.html');
  if (!existsSync(target)) problems.push(`sitemap.xml: ${loc} has no matching page`);
}

if (problems.length) {
  console.error(`Site check failed (${problems.length}):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`Site check passed: ${pages.length} pages, ${files.length} files.`);

function ids(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}
