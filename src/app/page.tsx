import Image from 'next/image';
import Link from 'next/link';
import { BookButton } from '@/components/booking/BookButton';
import { ArticleCard, DoctorCard, TreatmentCard } from '@/components/cards';
import { MapFacade } from '@/components/contact/MapFacade';
import { AfterVisit } from '@/components/sections/AfterVisit';
import { ClinicTour } from '@/components/sections/ClinicTour';
import { EmergencyLine } from '@/components/sections/EmergencyLine';
import { GoogleBadge, GoogleReviewsSection } from '@/components/sections/GoogleReviews';
import { HeroHoursChip } from '@/components/sections/HeroHoursChip';
import { ImplantJourney } from '@/components/sections/ImplantJourney';
import { NextSlotChip } from '@/components/sections/NextSlotChip';
import { SmileMap } from '@/components/sections/SmileMap';
import { Icon, WhatsAppIcon } from '@/components/ui/Icon';
import { OpenStatus } from '@/components/ui/OpenStatus';
import { Accordion, DraftBadge, SectionHead } from '@/components/ui/primitives';
import { ToothMark } from '@/components/ui/ToothMark';
import { articles, categories, getImage, headDoctor, siteClinic, siteEmergency, siteFaqs, siteGallery, siteHome, sitePages } from '@/lib/content';
import { getGoogleReviews } from '@/lib/google-reviews';
import { dayRangeShort, formatSessions, groupDays } from '@/lib/hours';
import { channels, directionsHref, generalWhatsappHref, mapEmbedSrc } from '@/lib/links';
import { pageMetadata } from '@/lib/seo';
import { fill, fullAddress } from '@/lib/vars';

export const metadata = pageMetadata({ path: '/', title: sitePages.home.title, description: sitePages.home.description, absoluteTitle: true });
// Rendered per request so the live Google reviews are fetched while Cloud Run gives the request CPU (cached a day in
// src/lib/google-reviews.ts). Static pages refreshed in the background timed out on Cloud Run.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const h = siteHome;
  const hero = getImage(h.hero.image);
  const portrait = headDoctor.photo ? getImage(headDoctor.photo) : null;
  const homeFaqs = siteFaqs.items.filter((f) => f.home);
  const [hoursChip, doctorChip, bookChip] = h.hero.chips;
  const google = await getGoogleReviews();
  const review = siteClinic.googleReview;
  const tour = siteGallery.items
    .filter((g) => !getImage(g.image).credit)
    .map((g) => {
      const img = getImage(g.image);
      return { src: img.src, alt: img.alt, width: img.width, height: img.height, caption: g.caption, objectPosition: img.objectPosition };
    });

  const quick = [
    { icon: 'calendar-check', label: 'Book a visit', sub: bookChip.sub, book: true as const },
    channels.call && { icon: 'phone', label: 'Call the clinic', sub: channels.call.display, href: channels.call.href },
    generalWhatsappHref && { icon: 'whatsapp', label: 'WhatsApp', sub: 'Quick questions', href: generalWhatsappHref, external: true },
    { icon: 'navigation', label: 'Directions', sub: 'Vidyanagar, Guntur', href: directionsHref, external: true },
  ].filter(Boolean) as { icon: string; label: string; sub?: string; href?: string; external?: boolean; book?: true }[];

  return (
    <>
      {/* ---------- Hero: the clinic itself, under a violet veil ---------- */}
      <section className="on-dark relative isolate overflow-hidden bg-navy text-onDark">
        <div className="absolute inset-x-0 top-0 -z-20 h-[360px] sm:h-[440px] lg:h-full">
          <Image src={hero.src} alt={hero.alt} fill priority fetchPriority="high" sizes="100vw" className="object-cover" style={{ objectPosition: hero.objectPosition }} />
          <div aria-hidden="true" className="hero-veil-mobile absolute inset-0 lg:hidden" />
          <div aria-hidden="true" className="hero-veil absolute inset-0 hidden lg:block" />
        </div>
        <ToothMark className="pointer-events-none absolute -left-10 bottom-0 -z-10 h-80 w-56 text-onDark/[0.05]" strokeWidth={1.2} />
        <div className="container-site grid items-center gap-10 pb-28 pt-60 sm:pt-72 lg:min-h-[640px] lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pb-32 lg:pt-20">
          <div>
            <p className="eyebrow animate-fade-up">
              {h.hero.badge} <DraftBadge status={h.status} onDark />
            </p>
            <h1 className="mt-4 animate-fade-up text-balance !text-onDark [animation-delay:60ms]" style={{ fontSize: 'clamp(2.3rem, 5.4vw, 4rem)' }}>
              {h.hero.titleLine1} <span className="bg-gradient-to-r from-cta to-onDark bg-clip-text text-transparent">{h.hero.titleLine2}</span>
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-lg text-onDarkMuted [animation-delay:120ms]">{h.hero.lead}</p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:180ms]">
              <BookButton className="btn-cta !min-h-[52px] !px-6 !text-base">
                <Icon name="calendar-check" className="h-5 w-5" /> {h.hero.primaryCta}
              </BookButton>
              {channels.call && (
                <a href={channels.call.href} className="btn-dark-ghost !min-h-[52px]">
                  <Icon name="phone" className="h-4 w-4" /> {channels.call.display}
                </a>
              )}
            </div>
            <ul className="mt-8 flex animate-fade-up flex-wrap gap-2.5 [animation-delay:240ms]">
              {h.hero.checks.map((c) => (
                <li key={c} className="glass-dark inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-onDark">
                  <Icon name="badge-check" className="h-4 w-4 text-cta" /> {c}
                </li>
              ))}
              {channels.call && (
                <li className="glass-dark inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-onDark">
                  <Icon name="siren" className="h-4 w-4 text-cta" /> {siteEmergency.availability.short}
                  <DraftBadge status={siteEmergency.availability.status} onDark />
                </li>
              )}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[400px] animate-fade-up [animation-delay:200ms] lg:mr-0">
            {portrait && (
              <div className="glass-dark overflow-hidden rounded-brand p-2 shadow-lift">
                <Image src={portrait.src} alt={portrait.alt} width={portrait.width} height={portrait.height} sizes="(min-width:1024px) 384px, 90vw" className="aspect-[5/4] w-full rounded-[10px] object-cover" style={{ objectPosition: portrait.objectPosition }} />
                <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3">
                  <div>
                    <p className="font-heading text-lg font-bold text-onDark">{doctorChip.text}</p>
                    <p className="text-sm text-onDarkMuted">{doctorChip.sub}</p>
                  </div>
                  <ToothMark className="h-10 w-7 shrink-0 text-cta" strokeWidth={2.4} />
                </div>
                <p className="mx-1 mb-1 flex items-center gap-2 rounded-[10px] bg-onDark/10 px-3 py-2 text-sm font-semibold text-onDark">
                  <Icon name={hoursChip.icon} className="h-4 w-4 text-cta" />
                  <HeroHoursChip hours={siteClinic.hours.days} timeZone={siteClinic.timezone} fallback={fill(hoursChip.text)} />
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {google && <GoogleBadge g={google} />}
              <NextSlotChip />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Quick actions (overlap the hero) ---------- */}
      <section aria-label="Quick actions" className="container-site relative z-10 -mt-14">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quick.map((q) => {
            const inner = (
              <>
                <span className="icon-tile transition-colors group-hover:bg-primary group-hover:text-onDark">{q.icon === 'whatsapp' ? <WhatsAppIcon className="h-5 w-5" /> : <Icon name={q.icon} className="h-5 w-5" />}</span>
                <span className="min-w-0 text-left">
                  <span className="block font-heading text-[0.98rem] font-semibold text-text">{q.label}</span>
                  {q.sub && <span className="block text-sm text-textSecondary sm:truncate">{q.sub}</span>}
                </span>
              </>
            );
            const cls = 'group card flex h-full w-full flex-col items-start gap-3 p-4 shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:border-primary sm:flex-row sm:items-center';
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
      <section aria-label="Clinic at a glance" className="container-site pt-8">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-brand border border-border bg-border lg:grid-cols-4">
          {h.stats.items.map((s) => (
            <li key={s.label} className="bg-surface p-5 sm:p-6">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                <Icon name={s.icon} className="h-4 w-4" /> {s.label}
              </p>
              <p className="mt-2 font-heading text-[1.8rem] font-bold leading-none text-primaryDeep sm:text-[2.2rem]">{fill(s.value)}</p>
              <p className="mt-1.5 text-sm text-textSecondary">{fill(s.sub)}</p>
            </li>
          ))}
        </ul>
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

      <SmileMap />

      {/* ---------- Doctor ---------- */}
      <section className="section" aria-labelledby="doctors">
        <div className="container-site">
          <SectionHead eyebrow={h.doctors.eyebrow} title={h.doctors.title} lead={fill(h.doctors.lead ?? '')} id="doctors" />
          <DoctorCard d={headDoctor} />
        </div>
      </section>

      <ImplantJourney />

      <AfterVisit />

      {google && <GoogleReviewsSection g={google} writeReviewUrl={review.status === 'approved' ? review.writeReviewUrl : undefined} />}

      {/* ---------- Clinic tour ---------- */}
      <section className="section bg-surfaceAlt" aria-labelledby="tour">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-x-6">
            <SectionHead eyebrow={h.tour.eyebrow} title={h.tour.title} lead={h.tour.lead} id="tour" />
            <Link href="/gallery" className="btn-ghost mb-10">
              Full gallery <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <ClinicTour photos={tour} />
        </div>
      </section>

      {/* ---------- Emergency ---------- */}
      <section className="container-site pt-14 sm:pt-20">
        <EmergencyLine />
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
