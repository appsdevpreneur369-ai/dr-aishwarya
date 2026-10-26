'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

export type TourPhoto = { src: string; alt: string; width: number; height: number; caption: string; objectPosition?: string };

/** Swipeable strip of the clinic's own photos (CSS scroll-snap) with a native <dialog> lightbox. */
export function ClinicTour({ photos }: { photos: TourPhoto[] }) {
  const strip = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  const scroll = (dir: number) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: 'smooth' });
  const show = (i: number) => {
    setCurrent(i);
    dialog.current?.showModal();
  };
  const p = photos[current];
  return (
    <div className="relative">
      <ul ref={strip} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {photos.map((ph, i) => (
          <li key={ph.src} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[32%]">
            <button type="button" onClick={() => show(i)} className="group block w-full overflow-hidden rounded-brand border border-border bg-surface text-left" aria-label={`Enlarge photo: ${ph.caption}`}>
              <span className="block overflow-hidden">
                <Image src={ph.src} alt={ph.alt} width={ph.width} height={ph.height} sizes="(min-width:1024px) 32vw, (min-width:640px) 46vw, 82vw" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" style={{ objectPosition: ph.objectPosition }} />
              </span>
              <span className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold">
                {ph.caption} <Icon name="arrow-up-right" className="h-4 w-4 shrink-0 text-primary" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden justify-end gap-2 sm:flex">
        <button type="button" onClick={() => scroll(-1)} className="btn-ghost !min-h-[44px] !px-3" aria-label="Previous photos">
          <Icon name="chevron-left" className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => scroll(1)} className="btn-ghost !min-h-[44px] !px-3" aria-label="Next photos">
          <Icon name="chevron-right" className="h-5 w-5" />
        </button>
      </div>
      <dialog
        ref={dialog}
        className="w-[min(96vw,1100px)] max-w-none rounded-brand bg-navy p-0 text-onDark backdrop:bg-navy/80"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-label={p?.caption}
      >
        {p && (
          <figure>
            <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="96vw" className="max-h-[78vh] w-full object-contain" />
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-semibold">{p.caption}</span>
              <span className="flex gap-2">
                <button type="button" className="btn-dark-ghost !min-h-[44px] !px-3" aria-label="Previous photo" onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}>
                  <Icon name="chevron-left" className="h-5 w-5" />
                </button>
                <button type="button" className="btn-dark-ghost !min-h-[44px] !px-3" aria-label="Next photo" onClick={() => setCurrent((c) => (c + 1) % photos.length)}>
                  <Icon name="chevron-right" className="h-5 w-5" />
                </button>
                <button type="button" className="btn-light !min-h-[44px] !px-3" aria-label="Close" onClick={() => dialog.current?.close()}>
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </div>
  );
}
