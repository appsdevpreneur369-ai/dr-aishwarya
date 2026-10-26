import { Icon } from '@/components/ui/Icon';
import { siteClinic } from '@/lib/content';
import type { GoogleReviews } from '@/lib/google-reviews';
import { cn } from '@/lib/cn';

/** Google's "G" mark. Third-party brand asset: drawn in Google's own colours (the one exception to the brand palette). */
export function GoogleG({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

/** Five stars filled to the rating (Google's review-star yellow). */
export function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} viewBox="0 0 20 20" className={className}>
            <defs>
              <linearGradient id={`star-${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#FBBC04" />
                <stop offset={`${fill * 100}%`} stopColor="#E3E0EC" />
              </linearGradient>
            </defs>
            <path fill={`url(#star-${i}-${Math.round(fill * 100)})`} d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z" />
          </svg>
        );
      })}
    </span>
  );
}

const checked = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Compact badge (hero): Google G + rating (if known) + review count, linking to the Google listing. */
export function GoogleBadge({ g, className }: { g: GoogleReviews; className?: string }) {
  return (
    <a href={g.url} target="_blank" rel="noopener noreferrer" className={cn('group inline-flex min-h-[48px] items-center gap-3 rounded-[10px] bg-surface/95 px-3.5 py-2 text-text shadow-lift', className)}>
      <GoogleG className="h-7 w-7 shrink-0" />
      <span className="leading-tight">
        {g.rating ? (
          <span className="flex items-center gap-1.5">
            <span className="font-heading text-lg font-bold">{g.rating.toFixed(1)}</span>
            <Stars rating={g.rating} className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="block font-heading text-[0.95rem] font-bold">{g.count} Google reviews</span>
        )}
        <span className="block text-xs font-semibold text-textSecondary group-hover:text-primary">
          {g.rating ? `${g.count} Google reviews` : 'Read them on Google'} <span aria-hidden="true">→</span>
        </span>
      </span>
    </a>
  );
}

/** Reviews section: Google attribution, rating/count, verbatim reviews when available, links to read and write. */
export function GoogleReviewsSection({ g, writeReviewUrl }: { g: GoogleReviews; writeReviewUrl?: string }) {
  return (
    <section className="section" aria-labelledby="reviews">
      <div className="container-site">
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="flex items-center gap-5">
              <span className="flex h-16 w-16 items-center justify-center rounded-brand border border-border bg-surface shadow-soft">
                <GoogleG className="h-9 w-9" />
              </span>
              <div>
                {g.rating ? (
                  <p className="flex items-center gap-3">
                    <span className="font-heading text-5xl font-bold leading-none">{g.rating.toFixed(1)}</span>
                    <Stars rating={g.rating} className="h-5 w-5" />
                  </p>
                ) : (
                  <p className="font-heading text-5xl font-bold leading-none">{g.count}</p>
                )}
                <p className="mt-1.5 text-sm text-textSecondary">
                  {g.rating ? `${g.count} reviews on Google` : 'reviews on Google'} · {g.live ? 'updated daily' : `checked ${checked(g.checkedOn)}`}
                  <span className="sr-only">{g.rating ? `, rated ${g.rating.toFixed(1)} out of 5` : ''}</span>
                </p>
              </div>
            </div>
            <div>
              <p className="eyebrow">Patient reviews</p>
              <h2 id="reviews" className="mt-2 text-[1.6rem] sm:text-[2rem]">
                What patients say about {siteClinic.shortName}
              </h2>
              <p className="mt-2 text-textSecondary">Real, unedited reviews from patients, published on Google.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:flex-col">
              <a href={g.url} target="_blank" rel="noopener noreferrer" className="btn-cta">
                Read all reviews on Google <Icon name="external-link" className="h-4 w-4" />
              </a>
              {writeReviewUrl && (
                <a href={writeReviewUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  Write a review <Icon name="arrow-up-right" className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          {g.reviews.length > 0 && (
            <ul className="grid gap-4 border-t border-border bg-surfaceAlt p-6 sm:p-10 md:grid-cols-2 lg:grid-cols-3">
              {g.reviews.slice(0, 6).map((r) => (
                <li key={r.author + r.when} className="card flex flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Stars rating={r.rating} />
                    <GoogleG className="h-5 w-5" />
                  </div>
                  <blockquote className="mt-3 flex-1 text-[0.97rem] text-text">
                    <p className="line-clamp-6">“{r.text}”</p>
                  </blockquote>
                  <p className="mt-4 text-sm">
                    {r.authorUrl ? (
                      <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
                        {r.author}
                      </a>
                    ) : (
                      <span className="font-bold">{r.author}</span>
                    )}
                    <span className="text-textSecondary"> · {r.when}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
