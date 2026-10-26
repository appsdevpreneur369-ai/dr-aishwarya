// Duplicate-copy guard: no sentence (and no run of 9+ words) in /content may repeat the other ClinicFlow247 clinic
// sites (SPDC, DR-SINDHU, SMSDC), which would be duplicate content for Google. Reads their content folders READ-ONLY.
// Run: npm run originality   (skips a sibling site whose folder isn't on this machine, e.g. in Docker/CI)
// Ignores _note fields, keys, URLs, {{tokens}} and short generic phrases (fewer than 9 words, e.g. "Usually 1 visit").
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SIBLINGS = { SPDC: 'D:/SPDC/content', 'DR-SINDHU': 'D:/DR-SINDHU/content', SMSDC: 'D:/SMSDC/site/content' };
const N = 9; // shingle length in words
// Fixed legal names every Indian privacy policy must use verbatim.
const STATUTES = [/digital personal data protection act,? 2023( \(dpdp act\))?/gi, /data protection board of india/gi];

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(json|md)$/.test(e.name) ? [p] : [];
  });
}
function strings(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.md')) return [raw.replace(/^---[\s\S]*?---/, (fm) => fm.split('\n').filter((l) => /^(title|description):/.test(l)).join('\n'))];
  const out = [];
  (function walk(v, key) {
    if (typeof key === 'string' && key.startsWith('_')) return;
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
  })(JSON.parse(raw));
  return out;
}
const words = (s) =>
  STATUTES.reduce((t, re) => t.replace(re, ' '), s).replace(/https?:\/\/\S+/g, ' ').replace(/\{\{\w+\}\}/g, ' ').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);
function shingles(text) {
  const out = new Map();
  for (const s of text.split(/(?<=[.!?])\s+|\n+/)) {
    const w = words(s);
    for (let i = 0; i + N <= w.length; i++) out.set(w.slice(i, i + N).join(' '), s.trim());
  }
  return out;
}

const ours = new Map();
for (const f of files(path.join(root, 'content'))) {
  if (/photo-credits\.json$/.test(f)) continue; // stock descriptions are shared on purpose
  for (const s of strings(f)) for (const [k, v] of shingles(s)) ours.set(k, { file: path.relative(root, f), text: v });
}

let checked = 0;
const hits = [];
for (const [name, dir] of Object.entries(SIBLINGS)) {
  if (!fs.existsSync(dir)) {
    console.log(`skip  ${name} (${dir} not found)`);
    continue;
  }
  checked++;
  const theirs = new Set();
  for (const f of files(dir)) if (!/photo-credits\.json$/.test(f)) for (const s of strings(f)) for (const k of shingles(s).keys()) theirs.add(k);
  const seen = new Set();
  for (const [k, v] of ours) if (theirs.has(k) && !seen.has(v.text)) { seen.add(v.text); hits.push({ site: name, ...v, phrase: k }); }
  console.log(`check ${name}: ${theirs.size} phrases compared`);
}
for (const h of hits) console.log(`DUPLICATE (${h.site}) ${h.file}: "${h.phrase}"\n    in: ${h.text}`);
if (hits.length) {
  console.error(`\n${hits.length} passage(s) repeat another clinic's site. Rewrite them.`);
  process.exit(1);
}
console.log(checked ? `\nOriginal: no ${N}-word run repeats ${checked} sibling site(s).` : '\nNo sibling sites found; nothing compared.');
