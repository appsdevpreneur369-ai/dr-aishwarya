import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { DraftBadge } from '@/components/ui/primitives';
import { siteEmergency } from '@/lib/content';
import { channels } from '@/lib/links';
import { cn } from '@/lib/cn';

/**
 * 24x7 emergency phone line (content/emergency.json → availability). Calls the approved clinic number; renders nothing
 * without one. Draft badge while the doctor has not confirmed round-the-clock cover.
 */
export function EmergencyLine({ className, showGuideLink = true }: { className?: string; showGuideLink?: boolean }) {
  const a = siteEmergency.availability;
  if (!channels.call) return null;
  return (
    <aside aria-labelledby="emergency-line" className={cn('on-dark relative overflow-hidden rounded-[1.5rem] bg-primaryDeep p-6 text-onDark shadow-lift sm:p-8', className)}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-onDark/10" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cta text-ctaInk">
            <Icon name="siren" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-mintOnDark">
              {a.label} <DraftBadge status={a.status} onDark className="ml-1" />
            </p>
            <h2 id="emergency-line" className="mt-1 text-xl !text-onDark sm:text-2xl">
              {a.title}
            </h2>
            <p className="mt-2 max-w-2xl text-onDarkMuted">{a.text}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a href={channels.call.href} className="btn-cta">
            <Icon name="phone" className="h-4 w-4" /> {channels.call.display}
          </a>
          {showGuideLink && (
            <Link href="/emergency" className="btn-dark-ghost">
              First-aid steps <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
