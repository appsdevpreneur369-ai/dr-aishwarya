import { describe, expect, it } from 'vitest';
import { doctorsForOption, findOption, resolvePrefill } from '@/lib/booking/treatments';
import { content, treatmentGroups } from './fixtures';

const groups = treatmentGroups();
const opt = (id: string) => findOption(groups, id)!.doctors;

describe('treatment → doctor routing map', () => {
  it('with one dentist, every reason and every treatment books with Dr. Aishwarya', () => {
    for (const g of groups) for (const o of g.options) expect(o.doctors).toEqual(['dr-aishwarya']);
    expect(opt('general')).toEqual(['dr-aishwarya']);
    expect(opt('problem:wisdom-tooth')).toEqual(['dr-aishwarya']);
  });

  it('only complex oral surgery is flagged for a possible referral (implants are her own specialty)', () => {
    const flagged = content.services.categories.filter((c: { confirmSpecialist: boolean }) => c.confirmSpecialist).map((c: { slug: string }) => c.slug).sort();
    expect(flagged).toEqual(['oral-surgery']);
  });

  it('her specialties and the signboard services are listed and approved; the rest are drafts', () => {
    const status = Object.fromEntries(content.services.categories.map((c: { slug: string; status: string }) => [c.slug, c.status]));
    for (const s of ['gum-care', 'dental-implants', 'laser-dentistry', 'root-canal-treatment', 'braces-aligners', 'cosmetic-dentistry']) expect(status[s]).toBe('approved');
    for (const s of ['general-dentistry', 'cleaning-prevention', 'oral-surgery', 'crowns-dentures']) expect(status[s]).toBe('placeholder');
  });

  it('there are 10 categories, each with at least one option and a doctor', () => {
    expect(groups.filter((g) => g.id.startsWith('category:'))).toHaveLength(10);
    for (const g of groups) {
      expect(g.options.length).toBeGreaterThan(0);
      for (const o of g.options) expect(o.doctors.length).toBeGreaterThan(0);
    }
  });

  it('every symptom chip links to an existing treatment category', () => {
    const cats = new Set(content.services.categories.map((c: { slug: string }) => c.slug));
    for (const p of content.routing.problems) expect(cats.has(p.category)).toBe(true);
  });

  it('deep links pre-fill the wizard', () => {
    expect(resolvePrefill(groups, { problem: 'toothache' }).treatmentId).toBe('problem:toothache');
    expect(resolvePrefill(groups, { treatment: 'root-canal-treatment' }).treatmentId).toBe('treatment:root-canal-treatment/single-sitting-rct');
    expect(resolvePrefill(groups, { treatment: 'oral-surgery/wisdom-tooth-removal' }).treatmentId).toBe('treatment:oral-surgery/wisdom-tooth-removal');
    expect(resolvePrefill(groups, { treatment: 'dental-implants/single-implant' }).treatmentId).toBe('treatment:dental-implants/single-implant');
    const doc = resolvePrefill(groups, { doctor: 'dr-aishwarya' });
    expect(findOption(groups, doc.treatmentId)!.doctors).toContain('dr-aishwarya');
    expect(resolvePrefill(groups, { problem: 'nope' }).treatmentId).toBeNull();
  });

  it('a preferred doctor narrows an option only when they treat it', () => {
    const o = findOption(groups, 'problem:toothache');
    expect(doctorsForOption(o, 'dr-aishwarya')).toEqual(['dr-aishwarya']);
    expect(doctorsForOption(o, 'dr-somebody-else')).toEqual(o!.doctors);
  });
});
