import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/primitives';
import { siteBrand, siteClinic, siteHome, siteImages } from '@/lib/content';

/**
 * Phone mock-up of the WhatsApp messages a patient receives (content/home.json → afterVisit), always labelled as
 * examples. Pure HTML/CSS; bubbles fade in one after another when the section scrolls into view (.reveal).
 */
export function AfterVisit() {
  const a = siteHome.afterVisit;
  const logo = siteImages.logo.mark;
  return (
    <section className="section overflow-hidden" aria-labelledby="after-visit">
      <div className="container-site grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHead eyebrow={a.eyebrow} title={a.title} lead={a.lead} id="after-visit" />
          <ul className="-mt-4 grid gap-3 sm:grid-cols-2">
            {a.points.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-brand bg-tint p-4 font-semibold">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={3} /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-textSecondary">{a.note}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[340px]">
          <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-3xl" />
          <figure className="overflow-hidden rounded-[2.2rem] border-[10px] border-navy bg-navy shadow-lift" aria-label="Example WhatsApp conversation with the clinic">
            <div className="flex items-center gap-3 bg-whatsapp px-4 py-3 text-onDark">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface">
                <Image src={logo.src} alt="" width={logo.width} height={logo.height} sizes="36px" className="h-7 w-auto" />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.95rem] font-bold">{siteBrand.wordmark.primary} Dental</span>
                <span className="block text-xs opacity-90">{siteClinic.shortName} · official</span>
              </span>
            </div>
            <ol className="space-y-3 bg-[rgb(236_229_221)] px-3 py-4">
              {a.messages.map((m, i) => (
                <li key={m.when} className="reveal" style={{ transitionDelay: `${i * 140}ms` }}>
                  <p className="mb-1 text-center text-[0.68rem] font-bold uppercase tracking-wide text-textSecondary">{m.when}</p>
                  <div className="max-w-[92%] rounded-[10px] rounded-tl-none bg-surface px-3 py-2 text-[0.86rem] leading-snug text-text shadow-soft">
                    {m.text}
                    <span className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] text-textSecondary">
                      {['9:41 AM', '8:15 AM', '12:30 PM', '10:02 AM'][i % 4]}
                      <Icon name="check" className="h-3 w-3 text-primary" strokeWidth={3} />
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </div>
    </section>
  );
}
