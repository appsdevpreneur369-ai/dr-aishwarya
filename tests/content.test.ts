import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { checkReferences, ContentError, FILES, parseAll, parseFile, type RawContent } from '@/lib/content/load';
import { ArticleFrontmatter, ClinicSchema, DoctorSchema, LegalFrontmatter } from '@/lib/content/schemas';

const dir = path.join(__dirname, '..', 'content');
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const raw = () => Object.fromEntries(Object.keys(FILES).map((f) => [f, read(f)])) as RawContent;

describe('content schema', () => {
  it('every content file parses and all cross-references resolve', () => {
    expect(() => parseAll(raw())).not.toThrow();
  });

  it('a bad field fails with the file and field named', () => {
    const r = raw();
    (r['clinic.json'] as { hours: { days: { sessions: { opens: string }[] }[] } }).hours.days[0].sessions[0].opens = '25:00';
    expect(() => parseAll(r)).toThrowError(/content\/clinic\.json: hours\.days\.0\.sessions\.0\.opens/);
  });

  it('an unknown doctor id in services.json is caught', () => {
    const r = raw();
    (r['services.json'] as { categories: { doctors: string[] }[] }).categories[0].doctors = ['dr-nobody'];
    expect(() => parseAll(r)).toThrowError(ContentError);
  });

  it('an approved phone must be a real +91 mobile; placeholders may be anything', () => {
    const c = parseAll(raw());
    const bad = structuredClone(c);
    bad['clinic.json'].phone = { status: 'approved', display: '+91 XXXXX XXXXX', e164: '+91XXXXXXXXXX' };
    expect(checkReferences(bad).join()).toMatch(/approved phone/);
    const ok = structuredClone(c);
    ok['clinic.json'].phone = { status: 'placeholder', display: '+91 XXXXX XXXXX', e164: '+91XXXXXXXXXX' };
    expect(checkReferences(ok)).toEqual([]);
  });

  it("doctor photos must be the clinic's own (a stock photo with a credit is rejected); none yet → initials", () => {
    const c = parseAll(raw());
    expect(c['doctors.json'].doctors[0].photo).toBeNull();
    const bad = structuredClone(c);
    bad['doctors.json'].doctors[0].photo = 'treat-gums';
    expect(checkReferences(bad).join()).toMatch(/stock photo/);
  });

  it("clinic-* photos are the clinic's own (approved, no credit); every other photo is credited stock, captioned 'representative'", () => {
    const imgs = read('images.json').images;
    const credits = read('photo-credits.json');
    for (const [id, img] of Object.entries(imgs) as [string, { src: string; status: string; credit?: string }][]) {
      if (id === 'og') continue;
      const file = img.src.split('/').pop()!;
      if (id.startsWith('clinic-')) {
        expect(img.status).toBe('approved');
        expect(img.credit).toBeUndefined();
        expect(credits.own[file]).toBeTruthy();
      } else {
        expect(img.status).toBe('placeholder');
        expect(img.credit).toBeTruthy();
        expect(credits.photos[file]).toBeTruthy();
      }
    }
    for (const g of read('gallery.json').items) {
      if (imgs[g.image].credit) expect(g.caption).toMatch(/representative/i);
      else expect(g.caption).not.toMatch(/representative/i);
    }
  });

  it('no Google rating is shown until one is copied by hand, and none is ever emitted as aggregateRating JSON-LD', () => {
    expect(read('clinic.json').google).toBeUndefined();
    expect(fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'jsonld.ts'), 'utf8')).not.toMatch(/aggregateRating/);
  });

  it('review link: placeholder until a real Google write-review URL is pasted (one-field swap)', () => {
    const clinic = read('clinic.json');
    expect(clinic.googleReview.status).toBe('placeholder');
    expect(clinic.googleReview.writeReviewUrl).toBe('');
    const withLink = (url: string) => ({ ...clinic, googleReview: { ...clinic.googleReview, status: 'approved', writeReviewUrl: url } });
    expect(ClinicSchema.safeParse(withLink(clinic.googleReview.stagingDemoUrl)).success).toBe(false);
    expect(ClinicSchema.safeParse(withLink('https://search.google.com/local/writereview?placeid=ChIJabc123')).success).toBe(true);
    expect(ClinicSchema.safeParse(withLink('https://g.page/r/CabcXYZ/review')).success).toBe(true);
  });

  it('the 24x7 emergency line stays a Draft until the doctor confirms it', () => {
    const e = read('emergency.json');
    expect(e.availability.status).toBe('placeholder');
    expect(e.availability.label).toMatch(/24×7/);
  });

  it('PIN is empty or 6 digits', () => {
    const c = read('clinic.json');
    c.address.postalCode = '5225';
    expect(() => parseFile('clinic.json', ClinicSchema, c)).toThrow(/postalCode/);
  });

  it('articles and legal pages have valid frontmatter, slug = file name, and real HTML text', () => {
    for (const [sub, schema] of [['education', ArticleFrontmatter], ['legal', LegalFrontmatter]] as const) {
      const files = fs.readdirSync(path.join(dir, sub)).filter((f) => f.endsWith('.md'));
      expect(files.length).toBeGreaterThan(0);
      for (const f of files) {
        const { data, content } = matter(fs.readFileSync(path.join(dir, sub, f), 'utf8'));
        const meta = parseFile(`${sub}/${f}`, schema, data);
        expect(`${meta.slug}.md`).toBe(f);
        expect(content.split(/\s+/).length).toBeGreaterThan(150);
      }
    }
  });

  it('includes the required patient education and the four legal pages; privacy mentions the DPDP Act 2023', () => {
    expect(fs.readdirSync(path.join(dir, 'education')).length).toBeGreaterThanOrEqual(4);
    for (const l of ['privacy', 'terms', 'disclaimer', 'cookies']) expect(fs.existsSync(path.join(dir, 'legal', `${l}.md`))).toBe(true);
    expect(fs.readFileSync(path.join(dir, 'legal', 'privacy.md'), 'utf8')).toMatch(/Digital Personal Data Protection Act, 2023/);
  });

  it('no content mentions another ClinicFlow247 clinic (tenant isolation)', () => {
    const all = [...Object.keys(FILES).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')), ...['education', 'legal'].flatMap((s) => fs.readdirSync(path.join(dir, s)).map((f) => fs.readFileSync(path.join(dir, s, f), 'utf8')))];
    for (const text of all) expect(text.toLowerCase()).not.toMatch(/sindhu|suhasini|drsdc|smsdc|ashramam|parvathi|ramakanth|spdc|tadepal|perreddy/);
  });

  it('the clinic is "Aishwarya Dental Clinic and Implant Centre" with the supplied address, phone and hours; map pin still to come', () => {
    const c = read('clinic.json');
    expect(c.name.value).toBe('Aishwarya Dental Clinic and Implant Centre');
    expect(c.address.postalCode).toBe('522007');
    expect(c.phone.e164).toBe('+917075565444');
    expect(c.whatsapp.e164).toBe('+917075565444');
    expect(c.hours.days.find((d: { day: string }) => d.day === 'sunday').sessions).toEqual([]);
    expect(c.maps.status).toBe('placeholder');
    expect(c.maps.geo).toBeNull();
  });

  it('never publishes prices or invented stats', () => {
    const home = read('home.json');
    // Every stat names its source; no experience figure until the clinic gives one.
    for (const s of home.stats.items) expect(s.source.length).toBeGreaterThan(2);
    const docs = read('doctors.json').doctors;
    expect(docs.filter((d: { experienceYears: number | null }) => d.experienceYears !== null)).toEqual([]);
    expect(home.beforeAfter.items).toEqual([]);
    const services = JSON.stringify(read('services.json'));
    expect(services).not.toMatch(/₹|Rs\.?\s?\d|INR/);
  });
});

describe('placeholders waiting for the clinic (email, registration number)', () => {
  it('email: placeholder text is fine; an approved email must be a real address', () => {
    const clinic = read('clinic.json');
    expect(clinic.email.status).toBe('placeholder');
    expect(ClinicSchema.safeParse({ ...clinic, email: { status: 'approved', value: 'email to be confirmed' } }).success).toBe(false);
    expect(ClinicSchema.safeParse({ ...clinic, email: { status: 'approved', value: 'care@aishwaryadental.example.in' } }).success).toBe(true);
  });
  it('registration number: empty until confirmed, never the PENDING marker, accepts a real number', () => {
    const d = read('doctors.json').doctors[0];
    expect(d.registrationNumber).toBe('');
    expect(DoctorSchema.safeParse({ ...d, registrationNumber: 'PENDING-VERIFICATION-AISHWARYA' }).success).toBe(false);
    expect(DoctorSchema.safeParse({ ...d, registrationNumber: 'A-12345' }).success).toBe(true);
  });
});
