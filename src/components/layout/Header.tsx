'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { BookButton } from '../booking/BookButton';
import { Icon, WhatsAppIcon } from '../ui/Icon';

type Item = { label: string; href: string };

/**
 * Slim info bar (open-now status, address, phone, sign-in) + a white sticky header with a FIXED 72px height.
 * Scrolling only toggles a shadow, never the height or padding: a height change at the scroll threshold moved the page
 * back across the threshold and made the header bounce (fixed 26 Oct 2026). Plain text nav links, underline for the
 * current page. Below xl the navigation moves into a full-height sheet.
 */
export function Header({
  logo, items, signInHref, registerHref, callHref, callDisplay, whatsappHref, topLine, status,
}: {
  logo: ReactNode; items: Item[]; signInHref: string; registerHref: string; callHref: string | null; callDisplay: string | null; whatsappHref: string | null; topLine: string; status: ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menu]);

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="on-dark hidden bg-navy text-[0.85rem] text-onDarkMuted md:block">
        <div className="container-site flex h-11 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-5">
            <span className="shrink-0 font-semibold text-onDark">{status}</span>
            <p className="hidden min-w-0 items-center gap-1.5 truncate lg:flex">
              <Icon name="map-pin" className="h-4 w-4 shrink-0 text-cta" /> <span className="truncate">{topLine}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            {callHref && (
              <a href={callHref} className="inline-flex h-11 items-center gap-2 whitespace-nowrap font-semibold text-onDark hover:underline">
                <Icon name="phone" className="h-4 w-4 text-cta" /> {callDisplay}
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 whitespace-nowrap font-semibold text-onDark hover:underline">
                <WhatsAppIcon className="h-4 w-4 text-cta" /> WhatsApp
              </a>
            )}
            <a href={signInHref} className="inline-flex h-11 items-center gap-2 whitespace-nowrap font-semibold text-onDark hover:underline">
              <Icon name="log-in" className="h-4 w-4 text-cta" /> Patient sign in
            </a>
          </div>
        </div>
      </div>
      <header className={cn('sticky top-0 z-50 border-b bg-surface transition-shadow duration-200', scrolled || menu ? 'border-border shadow-soft' : 'border-transparent')}>
        <div className="container-site flex h-[72px] items-center justify-between gap-4">
          {logo}
          <nav aria-label="Main" className="hidden h-full xl:block">
            <ul className="flex h-full items-center">
              {items.map((it) => (
                <li key={it.href} className="h-full">
                  <Link href={it.href} aria-current={active(it.href) ? 'page' : undefined} className="nav-link">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            {callHref && (
              <a href={callHref} aria-label={`Call ${callDisplay}`} className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-border text-primary hover:bg-tint md:hidden">
                <Icon name="phone" className="h-5 w-5" />
              </a>
            )}
            <BookButton className="btn-cta hidden whitespace-nowrap !min-h-[44px] !px-4 !text-[0.95rem] sm:inline-flex">
              <Icon name="calendar-check" className="h-4 w-4" /> Book appointment
            </BookButton>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-onDark hover:bg-primaryHover xl:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              onClick={() => setMenu((m) => !m)}
            >
              <Icon name={menu ? 'x' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav id="mobile-menu" aria-label="Mobile" hidden={!menu} className="fixed inset-x-0 bottom-0 top-[73px] overflow-y-auto bg-surface xl:hidden">
          <ul className="container-site grid py-3">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} aria-current={active(it.href) ? 'page' : undefined} className="mobile-nav-link">
                  {it.label} <Icon name="chevron-right" className="h-5 w-5 text-primary" />
                </Link>
              </li>
            ))}
            <li className="mt-5">
              <BookButton className="btn-cta w-full">
                <Icon name="calendar-check" className="h-4 w-4" /> Book appointment
              </BookButton>
            </li>
            <li className="mt-2 grid grid-cols-2 gap-2">
              <a href={signInHref} className="btn-ghost !px-3">
                <Icon name="log-in" className="h-4 w-4" /> Sign in
              </a>
              <a href={registerHref} className="btn-ghost !px-3">
                <Icon name="user-plus" className="h-4 w-4" /> Register
              </a>
            </li>
            {callHref && (
              <li className="mt-2">
                <a href={callHref} className="btn-ghost w-full">
                  <Icon name="phone" className="h-4 w-4" /> Call {callDisplay}
                </a>
              </li>
            )}
            {whatsappHref && (
              <li className="mt-2">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp the clinic
                </a>
              </li>
            )}
            <li className="mt-4 rounded-brand bg-tint p-4 text-sm">{status}</li>
          </ul>
        </nav>
      </header>
    </>
  );
}
