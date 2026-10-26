import { BookButton } from '@/components/booking/BookButton';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/primitives';
import { siteHome } from '@/lib/content';

/**
 * Stylised open smile: almond-shaped mouth, upper gum band, upper and lower teeth clipped inside the lips, and one gap
 * (the "missing tooth" spot). Pure SVG, decorative: the hotspots and the list carry the meaning.
 */
const MOUTH = 'M16 112 C 90 18, 310 18, 384 112 C 310 226, 90 226, 16 112Z';
function SmileDrawing() {
  const upper = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  const lower = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
  const gap = 4; // missing upper tooth on the right
  return (
    <svg viewBox="0 0 400 240" className="h-auto w-full drop-shadow-xl" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="sm-mouth">
          <path d={MOUTH} />
        </clipPath>
        <linearGradient id="sm-tooth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--c-surface))" />
          <stop offset="1" stopColor="rgb(var(--c-mint))" />
        </linearGradient>
      </defs>
      <path d={MOUTH} fill="rgb(var(--c-navy))" />
      <g clipPath="url(#sm-mouth)">
        <path d="M0 0 H400 V70 C 300 40, 100 40, 0 70Z" fill="rgb(var(--c-primary) / 0.75)" />
        {upper.map((i) => {
          if (i === gap) return null;
          const cx = 200 + (i + 0.5) * 29;
          const top = 46 + ((i + 0.5) * (i + 0.5)) * 0.9;
          return <rect key={`u${i}`} x={cx - 13} y={top} width="26" height={52 - Math.abs(i + 0.5) * 2.2} rx="9" fill="url(#sm-tooth)" stroke="rgb(var(--c-border))" />;
        })}
        <path d="M0 240 H400 V176 C 300 206, 100 206, 0 176Z" fill="rgb(var(--c-primary) / 0.75)" />
        {lower.map((i) => {
          const cx = 200 + (i + 0.5) * 28;
          const bottom = 186 - ((i + 0.5) * (i + 0.5)) * 0.95;
          const h = 42 - Math.abs(i + 0.5) * 1.6;
          return <rect key={`l${i}`} x={cx - 12.5} y={bottom - h} width="25" height={h} rx="8" fill="url(#sm-tooth)" stroke="rgb(var(--c-border))" />;
        })}
      </g>
      <path d={MOUTH} fill="none" stroke="rgb(var(--c-primary))" strokeWidth="7" strokeLinejoin="round" />
    </svg>
  );
}

export function SmileMap() {
  const s = siteHome.smileMap;
  return (
    <section className="section bg-surfaceAlt" aria-labelledby="smile-map">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="relative mx-auto w-full max-w-[560px]">
          <SmileDrawing />
          {s.spots.map((sp, i) => (
            <span key={sp.problem} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${sp.x}%`, top: `${sp.y}%` }}>
              <BookButton prefill={{ problem: sp.problem }} ariaLabel={`Book about: ${sp.label}`} className="group relative flex h-11 w-11 items-center justify-center">
                <span aria-hidden="true" className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-cta opacity-50 motion-reduce:hidden" />
                <span aria-hidden="true" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-sm font-bold text-onDark shadow-lift transition-transform group-hover:scale-110">
                  {i + 1}
                </span>
              </BookButton>
            </span>
          ))}
        </div>
        <div>
          <SectionHead eyebrow={s.eyebrow} title={s.title} lead={s.lead} id="smile-map" />
          <ol className="-mt-4 grid gap-2.5">
            {s.spots.map((sp, i) => (
              <li key={sp.problem}>
                <BookButton prefill={{ problem: sp.problem }} className="group flex min-h-[52px] w-full items-center gap-3 rounded-brand border border-border bg-surface px-3 py-2 text-left font-semibold text-text transition-colors hover:border-primary hover:bg-tint">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-onDark">{i + 1}</span>
                  <span className="flex-1">{sp.label}</span>
                  <Icon name="arrow-right" className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </BookButton>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
