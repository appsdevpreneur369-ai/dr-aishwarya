import Image from 'next/image';
import Link from 'next/link';
import { BookButton } from '@/components/booking/BookButton';
import { ArticleCard, DoctorCard, TreatmentCard } from '@/components/cards';
import { MapFacade } from '@/components/contact/MapFacade';
import { EmergencyLine } from '@/components/sections/EmergencyLine';
import { HeroHoursChip } from '@/components/sections/HeroHoursChip';
import { Icon, WhatsAppIcon } from '@/components/ui/Icon';
import { OpenStatus } from '@/components/ui/OpenStatus';
import { Accordion, DraftBadge, SectionHead } from '@/components/ui/primitives';
import { articles, categories, getImage, headDoctor, siteClinic, siteFaqs, siteGallery, siteHome, sitePages, sitePlan, siteRouting } from '@/lib/content';
import { dayRangeShort, formatSessions, groupDays } from '@/lib/hours';
import { channels, directionsHref, generalWhatsappHref, mapEmbedSrc } from '@/lib/links';
import { patientBenefits } from '@/lib/plan';
import { pageMetadata } from '@/lib/seo';
import { fill, fullAddress } from '@/lib/vars';

export const metadata = pageMetadata({ path: '/', title: sitePages.home.title, description: sitePages.home.description, absoluteTitle: true });

export default function HomePage() {
  const h = siteHome;
  const hero = getImage(h.hero.image);
  const about = getImage(h.about.image);
  const homeFaqs = siteFaqs.items.filter((f) => f.home);
  const [hoursChip, doctorChip, bookChip] = h.hero.chips;
  const clinicPhotos = siteGallery.items.filter((g) => !getImage(g.image).credit).slice(0, 4);

  const quick = [
    { icon: 'calendar-check', label: 'Book a visit', sub: bookChip.sub, book: true as const },
    channels.call && { icon: 'phone', label: 'Call the clinic', sub: channels.call.display, href: channels.call.href },
    generalWhatsappHref && { icon: 'whatsapp', label: 'WhatsApp', sub: 'Quick questions', href: generalWhatsappHref, external: true },
    { icon: 'navigation', label: 'Directions', sub: 'Vidyanagar, Guntur', href: directionsHref, external: true },
  ].filter(Boolean) as { icon: string; label: string; sub?: string; href?: string; external?: boolean; book?: true }[];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="bg-hero border-b border-border">
        <div className="container-site grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20">
          <div>
            <p className="eyebrow">
              {h.hero.badge} <DraftBadge status={h.status} />
            </p>
            <h1 className="mt-4 text-balance">
              {h.hero.titleLine1} <span className="text-primary">{h.hero.titleLine2}</span>
            </h1>
            <p className="lead mt-5 max-w-xl">{h.hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton className="btn-cta">
                <Icon name="calendar-check" className="h-5 w-5" /> {h.hero.primaryCta}
              </BookButton>
              <Link href={h.hero.secondaryCta.href} className="btn-ghost">
                {h.hero.secondaryCta.label} <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-8 grid gap-2.5 text-[0.98rem] font-semibold sm:grid-cols-2">
              {h.hero.checks.map((c) => (
                <li key={c} className="flex items-center gap-2.5">
                  <Icon name="badge-check" className="h-5 w-5 shrink-0 text-primary" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-[600px] lg:mr-0">
            {/* Shown at its natural shape: the supplied photo is only ~600 px wide, so it is never cropped up or enlarged. */}
            <div className="overflow-hidden rounded-brand border border-border bg-surface shadow-lift">
              <Image src={hero.src} alt={hero.alt} width={hero.width} height={hero.height} priority sizes="(min-width:640px) 600px, 100vw" className="h-auto w-full" />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
                <div>
                  <p className="font-heading text-lg font-semibold">{doctorChip.text}</p>
                  <p className="text-sm text-textSecondary">{doctorChip.sub}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-[10px] bg-tint px-3 py-2 text-sm font-semibold text-primaryDeep">
                  <Icon name={hoursChip.icon} className="h-4 w-4" />
                  <HeroHoursChip hours={siteClinic.hours.days} timeZone={siteClinic.timezone} fallback={fill(hoursChip.text)} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Quick actions ---------- */}
      <section aria-label="Quick actions" className="container-site -mt-px py-6">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quick.map((q) => {
            const inner = (
              <>
                <span className="icon-tile">{q.icon === 'whatsapp' ? <WhatsAppIcon className="h-5 w-5" /> : <Icon name={q.icon} className="h-5 w-5" />}</span>
                <span className="min-w-0 text-left">
                  <span className="block font-heading text-[0.98rem] font-semibold text-text">{q.label}</span>
                  {q.sub && <span className="block text-sm text-textSecondary sm:truncate">{q.sub}</span>}
                </span>
              </>
            );
            const cls = 'card flex h-full w-full flex-col items-start gap-3 p-4 transition-colors hover:border-primary hover:bg-tint sm:flex-row sm:items-center';
            return (
              <li key={q.label}>
                {q.book ? (
                  <BookButton className={cls}>{inner}</BookButton>
                ) : (
                  <a href={q.href} className={cls} {...(q.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Facts ---------- */}
      <section aria-label="Clinic at a glance" className="container-site pb-6">
        <ul className="grid grid-cols-2 divide-border rounded-brand border border-border lg:grid-cols-4 lg:divide-x">
          {h.stats.items.map((s, i) => (
            <li key={s.label} className={`p-5 sm:p-6 ${i % 2 ? 'border-l border-border lg:border-l-0' : ''} ${i > 1 ? 'border-t border-border lg:border-t-0' : ''}`}>
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                <Icon name={s.icon} className="h-4 w-4" /> {s.label}
              </p>
              <p className="mt-2 font-heading text-[1.7rem] font-bold leading-none text-text sm:text-[2rem]">{fill(s.value)}</p>
              <p className="mt-1.5 text-sm text-textSecondary">{fill(s.sub)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Emergency ---------- */}
      <section className="container-site py-6">
        <EmergencyLine />
      </section>

      {/* ---------- Treatments ---------- */}
      <section className="section" aria-labelledby="treatments">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6">
            <SectionHead eyebrow={h.treatments.eyebrow} title={h.treatments.title} lead={fill(h.treatments.lead ?? '')} id="treatments" />
            <Link href="/treatments" className="btn-ghost mb-10">
              All {categories.length} treatments <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <TreatmentCard c={c} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Symptom finder ---------- */}
      <section className="section bg-surfaceAlt" aria-labelledby="symptoms">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <SectionHead eyebrow={h.symptoms.eyebrow} title={h.symptoms.title} lead={h.symptoms.lead} id="symptoms" />
          <ul className="grid content-start gap-3 sm:grid-cols-2">
            {siteRouting.problems.map((p) => (
              <li key={p.id}>
                <BookButton prefill={{ problem: p.id }} className="group flex min-h-[60px] w-full items-center gap-3 rounded-brand border border-border bg-surface px-4 py-3 text-left font-semibold text-text transition-colors hover:border-primary hover:bg-tint">
                  <span className="icon-tile !h-9 !w-9 group-hover:bg-primary group-hover:text-onDark">
                    <Icon name={p.icon} className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{p.label}</span>
                  <Icon name="chevron-right" className="h-4 w-4 text-primary" />
                </BookButton>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Doctor ---------- */}
      <section className="section" aria-labelledby="doctors">
        <div className="container-site">
          <SectionHead eyebrow={h.doctors.eyebrow} title={h.doctors.title} lead={fill(h.doctors.lead ?? '')} id="doctors" />
          <DoctorCard d={headDoctor} />
        </div>
      </section>

      {/* ---------- About + why ---------- */}
      <section className="section bg-surfaceAlt" aria-labelledby="about">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">{h.about.eyebrow}</p>
            <h2 id="about" className="mt-3 text-balance">
              {h.about.title}
            </h2>
            {h.about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 text-textSecondary">
                {p}
              </p>
            ))}
            <Link href={h.about.cta.href} className="btn-ghost mt-7">
              {h.about.cta.label} <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-brand border border-border">
            <Image src={about.src} alt={about.alt} width={about.width} height={about.height} sizes="(min-width:1024px) 45vw, 100vw" className="aspect-[3/2] w-full object-cover" style={{ objectPosition: about.objectPosition }} />
          </div>
        </div>
        <div className="container-site mt-14">
          <h3 id="why" className="text-xl">{h.why.title}</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {h.why.points.map((p) => (
              <li key={p.title} className="card flex gap-4 p-5">
                <span className="icon-tile">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading font-semibold">{p.title}</p>
                  <p className="mt-1 text-[0.95rem] text-textSecondary">{fill(p.text)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Your visit ---------- */}
      <section className="section" aria-labelledby="steps">
        <div className="container-site">
          <SectionHead eyebrow={h.steps.eyebrow} title={h.steps.title} id="steps" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {h.steps.items.map((s, i) => (
              <li key={s.title} className="card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary font-heading text-sm font-bold text-onDark">{i + 1}</span>
                <p className="mt-4 font-heading font-semibold">{s.title}</p>
                <p className="mt-1.5 text-[0.95rem] text-textSecondary">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-brand bg-tint p-5 sm:p-6">
            <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {patientBenefits(sitePlan).slice(0, 6).map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[0.95rem] font-semibold">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={3} /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Clinic photos ---------- */}
      <section className="section bg-surfaceAlt" aria-labelledby="gallery">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6">
            <SectionHead eyebrow={h.gallery.eyebrow} title={h.gallery.title} lead={h.gallery.lead} id="gallery" />
            <Link href="/gallery" className="btn-ghost mb-10">
              View gallery <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {clinicPhotos.map((g) => {
              const img = getImage(g.image);
              return (
                <li key={g.image} className="overflow-hidden rounded-brand border border-border bg-surface">
                  <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width:1024px) 25vw, 50vw" className="aspect-[4/3] w-full object-cover" style={{ objectPosition: img.objectPosition }} />
                  <p className="px-3 py-2.5 text-sm font-semibold">{g.caption}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- Learn ---------- */}
      <section className="section" aria-labelledby="education">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6">
            <SectionHead eyebrow={h.education.eyebrow} title={h.education.title} lead={h.education.lead} id="education" />
            <Link href="/patient-education" className="btn-ghost mb-10">
              All guides <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.meta.slug} a={a.meta} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ + Visit ---------- */}
      <section className="section bg-surfaceAlt" aria-labelledby="faq">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={h.faq.eyebrow} title={h.faq.title} id="faq" />
            <Accordion items={homeFaqs.map((f) => ({ q: fill(f.q), a: fill(f.a) }))} name="home-faq" />
            <Link href="/faqs" className="mt-4 inline-flex min-h-[44px] items-center gap-1 font-bold text-primary hover:underline">
              More questions <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <div>
            <SectionHead eyebrow={h.visit.eyebrow} title={h.visit.title} lead={h.visit.lead} />
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <span className="font-heading font-semibold">Clinic timings</span>
                <OpenStatus hours={siteClinic.hours.days} timeZone={siteClinic.timezone} className="text-sm" />
              </div>
              <dl className="divide-y divide-border px-5">
                {groupDays(siteClinic.hours.days).map((g) => (
                  <div key={g.days[0]} className="flex flex-wrap justify-between gap-2 py-3.5">
                    <dt className="font-semibold">{dayRangeShort(g.days)}</dt>
                    <dd className="text-textSecondary sm:text-right">{g.sessions.length ? formatSessions(g.sessions) : 'Closed'}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-border p-4">
                <MapFacade src={mapEmbedSrc} title={`Map: ${siteClinic.name.value}`} label="Show the map" />
              </div>
              <div className="border-t border-border bg-surfaceAlt px-5 py-5">
                <p className="flex gap-3">
                  <Icon name="map-pin" className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <span>{fullAddress}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <Icon name="navigation" className="h-4 w-4" /> Directions
                  </a>
                  {channels.call && (
                    <a href={channels.call.href} className="btn-primary">
                      <Icon name="phone" className="h-4 w-4" /> {channels.call.display}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
