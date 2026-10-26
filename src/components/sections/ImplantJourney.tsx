import Link from 'next/link';
import { BookButton } from '@/components/booking/BookButton';
import { Icon } from '@/components/ui/Icon';
import { ToothMark } from '@/components/ui/ToothMark';
import { siteHome } from '@/lib/content';

/** Four-step implant timeline on the dark band (content/home.json → journey). */
export function ImplantJourney() {
  const j = siteHome.journey;
  return (
    <section className="on-dark relative overflow-hidden bg-navy py-16 text-onDark sm:py-24" aria-labelledby="journey">
      <div aria-hidden="true" className="bg-waves pointer-events-none absolute inset-0" />
      <ToothMark className="pointer-events-none absolute -right-6 top-6 h-72 w-48 text-onDark/[0.06]" strokeWidth={1.5} />
      <div className="container-site relative">
        <div className="max-w-2xl">
          <p className="eyebrow">{j.eyebrow}</p>
          <h2 id="journey" className="mt-3 !text-onDark">
            {j.title}
          </h2>
          <p className="lead mt-4 !text-onDarkMuted">{j.lead}</p>
        </div>
        <ol className="relative mt-12 grid gap-5 md:grid-cols-4">
          <span aria-hidden="true" className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-cta/0 via-cta/60 to-cta/0 md:block" />
          {j.steps.map((s, i) => (
            <li key={s.title} className="reveal relative" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-[10px] bg-cta font-heading font-bold text-ctaInk shadow-lift">{i + 1}</span>
              <div className="mt-4 rounded-brand border border-onDark/10 bg-navySoft p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cta">{s.time}</p>
                <p className="mt-1.5 font-heading text-lg font-semibold text-onDark">{s.title}</p>
                <p className="mt-2 text-[0.95rem] text-onDarkMuted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <BookButton className="btn-light" prefill={{ treatment: 'dental-implants' }}>
            <Icon name="calendar-check" className="h-5 w-5" /> Book an implant consultation
          </BookButton>
          <Link href="/treatments/dental-implants" className="btn-dark-ghost">
            Implant options <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
