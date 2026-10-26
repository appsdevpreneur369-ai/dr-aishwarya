import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ImageRef } from '@/lib/content/schemas';
import { cn } from '@/lib/cn';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { JsonLd } from '../seo/JsonLd';
import { Icon } from '../ui/Icon';

export type Crumb = { name: string; path: string };

/**
 * Image layouts for the banner photo:
 *  - 'default'  : framed photo on the right, desktop only (treatment pages).
 *  - 'wide'     : larger photo, also shown full width under the heading on mobile (About).
 *  - 'portrait' : 4:5 frame (doctor pages).
 * The photo is priority-loaded (usually the LCP element) and cropped around image.objectPosition.
 */
type Layout = 'default' | 'wide' | 'portrait';
const GRID: Record<Layout, string> = {
  default: 'lg:grid-cols-[1.25fr_1fr]',
  wide: 'lg:grid-cols-[1fr_1.2fr]',
  portrait: 'lg:grid-cols-[1fr_auto]',
};
const FRAME: Record<Layout, string> = {
  default: 'hidden lg:block',
  wide: 'block',
  portrait: 'mx-auto block w-full max-w-[320px] lg:mx-0 lg:w-[320px] lg:max-w-none',
};
const ASPECT: Record<Layout, string> = { default: 'aspect-[4/3]', wide: 'aspect-[16/11]', portrait: 'aspect-[4/5]' };
const SIZES: Record<Layout, string> = {
  default: '(min-width:1024px) 38vw, 0px',
  wide: '(min-width:1280px) 640px, (min-width:1024px) 52vw, 100vw',
  portrait: '(min-width:1024px) 320px, min(320px, 100vw)',
};

/** Inner-page banner on a light lavender wash: breadcrumbs (+ BreadcrumbList JSON-LD), the page's single H1, intro, optional photo. */
export function PageHeader({
  title, intro, crumbs, badge, children, image, imageLayout = 'default',
}: { title: string; intro?: string; crumbs: Crumb[]; badge?: ReactNode; children?: ReactNode; image?: ImageRef; imageLayout?: Layout }) {
  const all = [{ name: 'Home', path: '/' }, ...crumbs];
  return (
    <section className="bg-hero border-b border-border">
      <JsonLd data={breadcrumbJsonLd(all)} />
      <div className={cn('container-site relative grid items-center gap-8 py-10 sm:py-14 lg:gap-14', image && GRID[imageLayout])}>
        <div>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-textSecondary">
              {all.map((c, i) => (
                <li key={c.path} className="flex items-center gap-1">
                  {i > 0 && <Icon name="chevron-right" className="h-3.5 w-3.5" />}
                  {i < all.length - 1 ? (
                    <Link href={c.path} className="inline-flex min-h-[44px] items-center hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-semibold text-primary">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-2 max-w-3xl text-balance">
            {title} {badge}
          </h1>
          {intro && <p className="lead mt-5 max-w-2xl">{intro}</p>}
          {children}
        </div>
        {image && (
          <div className={cn('relative', FRAME[imageLayout])}>
            <div className="overflow-hidden rounded-brand border border-border bg-surface shadow-soft">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
                sizes={SIZES[imageLayout]}
                className={cn('w-full object-cover', ASPECT[imageLayout])}
                style={{ objectPosition: image.objectPosition }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
