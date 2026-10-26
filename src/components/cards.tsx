import Image from 'next/image';
import Link from 'next/link';
import { getDoctorById, getImage, headDoctor } from '@/lib/content';
import type { Category, Doctor } from '@/lib/content/schemas';
import { cn } from '@/lib/cn';
import { BookButton } from './booking/BookButton';
import { Icon } from './ui/Icon';
import { DraftBadge } from './ui/primitives';

/** Treatment card: photo on top, icon, title, short text, "who treats you". `layout` is kept for older callers. */
export function TreatmentCard({ c, headingLevel: H = 'h3', priority, className }: { c: Category; headingLevel?: 'h2' | 'h3'; priority?: boolean; layout?: 'stack' | 'feature'; className?: string }) {
  const img = getImage(c.image);
  const docs = c.doctors.map((id) => getDoctorById(id)?.displayName).filter(Boolean);
  const who = c.confirmSpecialist ? `First consultation with ${headDoctor.displayName}` : docs.join(' · ');
  return (
    <Link href={`/treatments/${c.slug}`} className={cn('reveal group card flex h-full flex-col overflow-hidden transition-colors hover:border-primary', className)}>
      <Image src={img.src} alt={img.alt} width={img.width} height={img.height} priority={priority} sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw" className="aspect-[16/9] w-full object-cover" style={{ objectPosition: img.objectPosition }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <span className="icon-tile !h-10 !w-10">
            <Icon name={c.icon} className="h-5 w-5" />
          </span>
          <H className="pt-1.5 text-[1.12rem] group-hover:text-primary">
            {c.title} <DraftBadge status={c.status} />
          </H>
        </div>
        <p className="mt-3 flex-1 text-[0.96rem] text-textSecondary">{c.short}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
          <span className="text-textSecondary">{who}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-bold text-primary">
            Learn more <Icon name="arrow-right" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Doctor card: the doctor's own photo (never stock) or an initials panel. */
export function DoctorCard({ d, headingLevel: H = 'h3', className }: { d: Doctor; index?: number; headingLevel?: 'h2' | 'h3'; className?: string }) {
  const photo = d.photo ? getImage(d.photo) : null;
  return (
    <article className={cn('reveal card grid overflow-hidden md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]', className)}>
      <div className="relative min-h-[300px] bg-tint">
        {photo ? (
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: photo.objectPosition ?? '50% 25%' }} />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-heading text-7xl font-bold text-primary">
            {d.initials}
          </span>
        )}
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        {d.isHead && <p className="eyebrow">{d.role}</p>}
        <H className="mt-2 text-[1.75rem]">
          <Link href={`/doctors/${d.slug}`} className="inline-flex min-h-[44px] items-center hover:text-primary">
            {d.displayName}
          </Link>{' '}
          <DraftBadge status={d.status} />
        </H>
        <p className="mt-1 font-semibold text-primary">{d.qualification}</p>
        <p className="text-[0.96rem] text-textSecondary">{d.specialty}</p>
        {d.experienceYears && (
          <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-[10px] bg-tint px-3 py-1 text-sm font-semibold text-primaryDeep">
            <Icon name="award" className="h-4 w-4" /> {d.experienceYears}+ years of experience
          </p>
        )}
        <p className="mt-4 text-textSecondary">{d.summary}</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {d.focus.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[0.95rem]">
              <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={3} /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <BookButton className="btn-cta" prefill={{ doctor: d.slug }} ariaLabel={`Book with ${d.displayName}`}>
            <Icon name="calendar-check" className="h-4 w-4" /> Book with {d.displayName}
          </BookButton>
          <Link href={`/doctors/${d.slug}`} className="btn-ghost" aria-label={`Profile of ${d.displayName}`}>
            Full profile <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ a, big }: { a: { slug: string; title: string; description: string; image: string; category: string; readingMinutes: number }; big?: boolean }) {
  const img = getImage(a.image);
  return (
    <article className="reveal group card h-full overflow-hidden transition-colors hover:border-primary">
      <Link href={`/patient-education/${a.slug}`} className={cn('flex h-full flex-col', big && 'md:grid md:grid-cols-[1.1fr_1fr]')}>
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes={big ? '(min-width:1024px) 34vw, 100vw' : '(min-width:1024px) 30vw, 100vw'} className={cn('w-full object-cover', big ? 'aspect-[16/9] md:aspect-auto md:h-full' : 'aspect-[16/9]')} />
        <div className={cn('flex flex-1 flex-col p-5', big && 'sm:p-8')}>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
            {a.category} · {a.readingMinutes} min read
          </p>
          <h3 className={cn('mt-2 group-hover:text-primary', big ? 'text-[1.5rem]' : 'text-[1.1rem]')}>{a.title}</h3>
          <p className={cn('mt-2 flex-1 text-[0.95rem] text-textSecondary', !big && 'line-clamp-3')}>{a.description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
            Read the guide <Icon name="arrow-right" className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}

/** Compact doctor row for sidebars ("Who treats you"). */
export function DoctorMini({ d }: { d: Doctor }) {
  const photo = d.photo ? getImage(d.photo) : null;
  return (
    <div className="card flex items-center gap-4 p-4">
      {photo ? (
        <Image src={photo.src} alt={photo.alt} width={64} height={64} sizes="64px" className="h-16 w-16 rounded-[10px] object-cover" style={{ objectPosition: photo.objectPosition ?? '50% 25%' }} />
      ) : (
        <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-tint font-heading text-2xl font-bold text-primary">
          {d.initials}
        </span>
      )}
      <div className="min-w-0">
        <Link href={`/doctors/${d.slug}`} className="inline-flex min-h-[44px] items-center font-heading text-lg font-semibold hover:text-primary hover:underline">
          {d.displayName}
        </Link>
        <p className="-mt-1 text-sm text-textSecondary">
          {d.qualification} · {d.specialty}
        </p>
      </div>
    </div>
  );
}
