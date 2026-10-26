// Builds web assets from the logo masters in images/ in brand.json colours.
// Run: npm run brand   (re-run after replacing the logo files or changing colours)
// Outputs: public/brand/logo-mark.png, (public/brand/logo-title.png only if logo.full is set), src/app/icon.png, src/app/apple-icon.png,
//          src/app/favicon.ico, public/icons/icon-{192,512,maskable-512}.png, public/images/og.png. Photos come from scripts/fetch-photos.mjs.
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

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

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

// ---------- App icons ----------
// The white tooth on a violet rounded tile (on a bare transparent background it vanished on white browser tabs).
// Tile colours come from brand.json: iconTop (top of the gradient) to primary. 16/32/48 px are downscaled straight from the
// trimmed source (lanczos3), never from a bigger icon, so the small favicons stay crisp.
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const srcTrim = await sharp(await cutOutWhite(markSrc)).trim().png().toBuffer();

/** images/logo.png is the tooth on OPAQUE white, and the crown's top highlight is pure white with 1-2 px breaks in its outline.
 *  So: grow the tooth's non-white pixels by 2 px to close those breaks, flood-fill the background from the edges around
 *  that, then hand the white pixels right next to the fill (the closed gaps and the anti-aliased edge) back to the
 *  background. Highlights inside the outline stay; the 1 px rim is half-faded to soften the cut. */
async function cutOutWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const lum = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  const white = (i) => lum(i) >= 250; // the crown's light shading starts at ~240, so only near-pure white is background
  const halo = (i) => lum(i) >= 238; // anti-aliased edge pixels, absorbed next to the background
  const R = 2;
  const solid = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (white(y * w + x)) continue;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy >= 0 && yy < h && xx >= 0 && xx < w) solid[yy * w + xx] = 1;
    }
  }
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, x + (h - 1) * w);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || solid[i]) continue;
    bg[i] = 1;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < w * (h - 1)) stack.push(i + w);
  }
  const nextToBg = (i) => { const x = i % w; return (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < w * (h - 1) && bg[i + w]); };
  for (let pass = 0; pass < R; pass++) {
    const add = [];
    for (let i = 0; i < w * h; i++) if (!bg[i] && halo(i) && nextToBg(i)) add.push(i);
    for (const i of add) bg[i] = 1;
  }
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) { data[i * 4 + 3] = 0; continue; }
    if (nextToBg(i)) data[i * 4 + 3] = 150;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}
const srcMeta = await sharp(srcTrim).metadata();
// At 16 px the implant screw turns to noise: that size shows the crown (with the "A") only.
const CROWN = 0.56;
const crownBuf = await sharp(srcTrim).extract({ left: 0, top: 0, width: srcMeta.width, height: Math.round(srcMeta.height * CROWN) }).png().toBuffer();

function tileSvg(size, rounded) {
  const r = rounded ? Math.round(size * 0.22) : 0;
  return Buffer.from(svg(size, size,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.iconTop}"/><stop offset="1" stop-color="${c.primary}"/></linearGradient></defs>` +
    `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>`));
}

/** One icon: tile + tooth (height = toothFrac of the tile), soft shadow from 48 px up. */
async function appIcon(size, { rounded = true, toothFrac = 0.78, crown = false } = {}) {
  const source = crown ? crownBuf : srcTrim;
  let tooth = await sharp(source).resize({ width: Math.round(size * 0.86), height: Math.round(size * toothFrac), fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
  if (size >= 96) {
    // The source is only 167 px wide, so big sizes are upscaled: soften the alpha edge so the cut-out doesn't look stepped.
    const { data, info } = await sharp(tooth).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // 3x3 box blur of the alpha channel only (colours untouched).
    const { width: tw, height: th } = info;
    const a = new Uint8Array(tw * th);
    for (let i = 0; i < a.length; i++) a[i] = data[i * 4 + 3];
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      let sum = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < th && xx >= 0 && xx < tw) { sum += a[yy * tw + xx]; n++; }
      }
      data[(y * tw + x) * 4 + 3] = Math.round(sum / n);
    }
    tooth = await sharp(data, { raw: info }).png().toBuffer();
  }
  const t = await sharp(tooth).metadata();
  const left = Math.round((size - t.width) / 2);
  const top = Math.round((size - t.height) / 2);
  const layers = [];
  if (size >= 48) {
    // Shadow: the tooth's silhouette in black at 15% opacity, blurred and nudged down, so its white edge separates from the tile.
    const pad = Math.max(2, Math.round(size * 0.04));
    const { data, info } = await sharp(tooth).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) { data[i] = data[i + 1] = data[i + 2] = 0; data[i + 3] = Math.round(data[i + 3] * 0.15); }
    const shadow = await sharp(data, { raw: info }).extend({ top: pad, bottom: pad, left: pad, right: pad, background: transparent })
      .blur(Math.max(0.6, size * 0.012)).png().toBuffer();
    layers.push({ input: shadow, left: left - pad, top: top - pad + Math.max(1, Math.round(size * 0.012)) });
  }
  layers.push({ input: tooth, left, top });
  let img = sharp(tileSvg(size, rounded)).resize(size, size).composite(layers);
  // The square apple-icon must be fully opaque (iOS rounds it itself).
  if (!rounded) img = sharp(await img.png().toBuffer()).flatten({ background: c.primary });
  return img.png({ compressionLevel: 9 }).toBuffer();
}

fs.writeFileSync(out('src/app/icon.png'), await appIcon(512));
fs.writeFileSync(out('src/app/apple-icon.png'), await appIcon(180, { rounded: false }));
fs.writeFileSync(out('public/icons/icon-192.png'), await appIcon(192));
fs.writeFileSync(out('public/icons/icon-512.png'), await appIcon(512));
// Maskable: full-bleed square (the launcher applies its own mask), tooth inside the 80% safe zone.
fs.writeFileSync(out('public/icons/icon-maskable-512.png'), await appIcon(512, { rounded: false, toothFrac: 0.6 }));
// favicon.ico with embedded 16/32/48 PNGs.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => appIcon(s, { crown: s === 16, toothFrac: s === 16 ? 0.72 : 0.78 })));
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
