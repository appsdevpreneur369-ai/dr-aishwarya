// Builds public/images/photos/ from two kinds of source:
//  1. The clinic's OWN photos in images/ (supplied by the account owner, 25 Oct 2026): converted locally, no network.
//  2. Representative stock photos (Unsplash License / Pexels License: free to use, no attribution required; sources
//     still recorded in content/photo-credits.json). PLACEHOLDERS ONLY: none of them show Aishwarya Dental Clinic,
//     its staff or Dr. Aishwarya. Every photo with people shows Indian faces, across age groups.
// Run: node scripts/fetch-photos.mjs           (own photos only, offline; keeps the stock files and credits)
//      node scripts/fetch-photos.mjs --stock   (also re-downloads the stock photos; needs internet)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

// Clinic's own photos: images/<file> → [output file, description, optional crop]. Never upscaled. A crop
// ({ left, top, width, height }) cuts one source into several shots, e.g. to leave out a printed name label.
const OWN = {
  'dr-aishwarya.png': ['doctor-aishwarya-wide.jpg', 'Dr. Aishwarya P smiling beside the clinic’s lit tooth-shaped mirror', { left: 0, top: 0, width: 593, height: 268 }],
  'clinic-interior-1.png': ['clinic-operatory.jpg', 'Treatment room with two dental chairs under a curved, back-lit ceiling'],
  'clinic-interior-2.png': ['clinic-reception.jpg', 'Reception desk and waiting sofas, with the clinic logo on the walnut panel'],
  'clinic-interior-3.png': ['clinic-corridor.jpg', 'Corridor leading to the operatories, lit by ceiling light lines'],
  'clinic-exterior-1.png': ['clinic-exterior.jpg', 'Clinic frontage and signboard on Sai Baba Road, Vidyanagar'],
};

// Unsplash CDN id → [output file, width, height, description]
const UNSPLASH = {
  '1777793389944-f7165259a05c': ['treat-root-canal.jpg', 1200, 800, 'Cross-section tooth model showing the root canals'],
  '1771442873038-dda05b6ca447': ['treat-extraction.jpg', 1200, 800, 'Sterile dental instruments in a gloved hand'],
  '1687811233721-70ebc025f8c0': ['treat-crowns.jpg', 1200, 800, 'Row of dental crowns on a dark background'],
  '1588776814546-1ffcf47267a5': ['treat-implants.jpg', 1200, 800, 'Dental X-ray scans on a light box'],
  '1720685193942-5a1c5ac7fd80': ['treat-braces.jpg', 1200, 800, 'Dental models with clear aligners and braces'],
  '1681939282781-341ac4f61996': ['article-root-canal-pain.jpg', 1200, 750, 'Patient in a dental chair during treatment'],
  '1580471260026-2a8acbc7c7a7': ['article-missing-tooth.jpg', 1200, 750, 'Smiling elderly Indian woman'],
  '1607613009820-a29f7bb81c04': ['space-toothbrushes.jpg', 1200, 900, 'Bamboo toothbrushes in a glass jar'],
  '1659352790654-058e9077a4f4': ['smile-family.jpg', 1200, 900, 'Cheerful Indian family of four'],
};

// Pexels photo id → [output file, width, height, description]
const PEXELS = {
  8224633: ['treat-general.jpg', 1200, 800, 'Indian dentist checking a young boy’s teeth'],
  8720868: ['treat-cosmetic.jpg', 1200, 800, 'Young Indian woman with a bright, natural smile'],
  12474261: ['treat-gums.jpg', 1200, 800, 'Close-up of a healthy smile, teeth and gums'],
  33313773: ['article-sensitive-teeth.jpg', 1200, 750, 'Indian girl laughing while brushing her teeth'],
  18557359: ['smile-young-woman.jpg', 1200, 900, 'Young Indian woman in a blue saree, smiling'],
  18394078: ['smile-grandparents.jpg', 1200, 900, 'Indian grandparents laughing with their grandchild'],
  6472469: ['smile-elder.jpg', 1200, 900, 'Elderly Indian man in an orange turban, smiling warmly'],
};

const STOCK = process.argv.includes('--stock');
const outDir = path.join(root, 'public', 'images', 'photos');
const creditsFile = path.join(root, 'content', 'photo-credits.json');
if (STOCK) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const credits = STOCK ? {} : JSON.parse(fs.readFileSync(creditsFile, 'utf8')).photos;
const own = {};

const OWN_EXTRA = [['dr-aishwarya.png', 'doctor-aishwarya-portrait.jpg', 'Portrait of Dr. Aishwarya P', { left: 30, top: 0, width: 310, height: 323 }]];
for (const [src, file, description, crop] of [...Object.entries(OWN).map(([k, v]) => [k, ...v]), ...OWN_EXTRA]) {
  // PNGs with alpha are flattened on white (the supplied photos carry an opaque alpha channel).
  const img = sharp(path.join(root, 'images', src)).rotate();
  await (crop ? img.extract(crop) : img).flatten({ background: '#ffffff' }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(outDir, file));
  own[file] = { source: `images/${src}`, description };
  console.log(file, '(clinic)');
}

async function save(url, file, w, h, position) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  // .rotate() applies EXIF orientation; output carries no EXIF/GPS metadata.
  await sharp(Buffer.from(await res.arrayBuffer())).rotate().resize(w, h, { fit: 'cover', position }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(outDir, file));
  console.log(file);
}
for (const [id, [file, w, h, description]] of STOCK ? Object.entries(UNSPLASH) : []) {
  await save(`https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=faces,entropy&q=82&fm=jpg`, file, w, h, 'centre');
  credits[file] = { source: 'Unsplash', license: 'Unsplash License (https://unsplash.com/license)', cdn: `https://images.unsplash.com/photo-${id}`, description };
}
for (const [id, [file, w, h, description]] of STOCK ? Object.entries(PEXELS) : []) {
  // Pexels' CDN crops from the centre, so take a large original and let sharp keep the faces in frame.
  await save(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`, file, w, h, sharp.strategy.attention);
  credits[file] = { source: 'Pexels', license: 'Pexels License (https://www.pexels.com/license/)', page: `https://www.pexels.com/photo/${id}/`, description };
}

fs.writeFileSync(
  creditsFile,
  `${JSON.stringify(
    {
      _note: "Stock photos (Unsplash / Pexels licences) are REPRESENTATIVE placeholders, not Aishwarya Dental Clinic or its doctor; all people shown are Indian. 'own' lists the clinic's own photos. Generated by scripts/fetch-photos.mjs.",
      own,
      photos: credits,
    },
    null,
    2,
  )}\n`,
);
