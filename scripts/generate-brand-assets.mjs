// Builds web assets from the logo masters in images/ in brand.json colours.
// Run: npm run brand   (re-run after replacing the logo files or changing colours)
// Outputs: public/brand/logo-mark.png, (public/brand/logo-title.png only if logo.full is set), src/app/icon.png, src/app/apple-icon.png,
//          src/app/favicon.ico, public/images/og.png. Photos come from scripts/fetch-photos.mjs.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const { colors: c, wordmark: brandWord } = read('content/brand.json');
const images = read('content/images.json');
const clinic = read('content/clinic.json');
const out = (p) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  return full;
};

// ---------- Logo ----------
const markSrc = path.join(root, images.logo.source.src);
const mark = sharp(markSrc, { density: 300 }).resize({ width: 1024 }).trim();
const markBuf = await mark.png().toBuffer();
const markMeta = await sharp(markBuf).metadata();
await sharp(markBuf).resize({ width: 512 }).png({ compressionLevel: 9, palette: false }).toFile(out('public/brand/logo-mark.png'));
const markOut = await sharp(out('public/brand/logo-mark.png')).metadata();
console.log(`logo-mark ${markOut.width}x${markOut.height} (from ${markMeta.width}x${markMeta.height})`);
// The logo-with-name is published only when images.json has logo.full (none supplied yet). Remove any stale copy.
if (images.logo.full && images.logo.sourceTitle) {
  const titleBuf = await sharp(path.join(root, images.logo.sourceTitle.src)).trim().png().toBuffer();
  await sharp(titleBuf).png({ compressionLevel: 9 }).toFile(out(`public${images.logo.full.src}`));
} else {
  fs.rmSync(path.join(root, 'public/brand/logo-title.png'), { force: true });
}

// Square icons: the mark centred on transparent (icon) or on the warm background (apple-icon, needs opaque).
async function squareIcon(size, bg, pad) {
  const inner = Math.round(size * (1 - pad * 2));
  const m = await sharp(markBuf).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([{ input: m, gravity: 'center' }]).png().toBuffer();
}
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const hexRgb = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), alpha: 1 });
fs.writeFileSync(out('src/app/icon.png'), await squareIcon(512, transparent, 0.04));
fs.writeFileSync(out('src/app/apple-icon.png'), await squareIcon(180, hexRgb(c.background), 0.1));
// favicon.ico with embedded 16/32/48 PNGs.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => squareIcon(s, transparent, 0)));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((p, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(icoSizes[i] % 256, o);
  header.writeUInt8(icoSizes[i] % 256, o + 1);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(p.length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += p.length;
});
fs.writeFileSync(out('src/app/favicon.ico'), Buffer.concat([header, ...pngs]));

// ---------- Open Graph image (1200x630) ----------
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const doctors = read('content/doctors.json').doctors;
const head = doctors.find((d) => d.isHead) ?? doctors[0];
const services = read('content/services.json').categories.filter((x) => x.status === 'approved').slice(0, 4).map((x) => x.shortTitle);
const ogSvg = svg(1200, 630,
  `<rect width="1200" height="630" fill="${c.navy}"/>` +
  `<circle cx="1110" cy="30" r="320" fill="${c.primary}" opacity=".40"/><circle cx="40" cy="660" r="240" fill="${c.mint}" opacity=".08"/>` +
  `<rect x="80" y="170" width="250" height="290" rx="48" fill="${c.surface}"/>` +
  `<text x="390" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700" fill="${c.onDark}">${esc(brandWord.primary)}</text>` +
  `<text x="392" y="300" font-family="Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="5" fill="${c.mint}">${esc(brandWord.secondary.toUpperCase())}</text>` +
  `<rect x="392" y="330" width="120" height="6" rx="3" fill="${c.cta}"/>` +
  `<text x="392" y="390" font-family="Arial, sans-serif" font-size="28" fill="${c.onDarkMuted}">${esc(`${head.displayName}, MDS · ${clinic.address.locality}`)}</text>` +
  `<text x="392" y="440" font-family="Arial, sans-serif" font-size="26" fill="${c.onDark}">${esc(services.join(' · '))}</text>`);
const ogMark = await sharp(markBuf).resize({ width: 210, height: 250, fit: 'contain', background: transparent }).png().toBuffer();
await sharp(Buffer.from(ogSvg)).composite([{ input: ogMark, left: 100, top: 190 }]).png({ compressionLevel: 9 }).toFile(out('public/images/og.png'));

console.log('brand assets written');
