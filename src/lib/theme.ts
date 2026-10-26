import 'server-only';
import { Manrope, Playfair_Display } from 'next/font/google';
import { siteBrand } from './content';

// next/font must be declared statically; brand.json picks from this registry by name (max 2 fonts).
// display: 'swap' so the chosen fonts always appear; next/font preloads both and uses metric-matched fallbacks.
// Headings: Playfair Display (high-contrast serif, matches the 'premium' logo). Body: Manrope (clean, very legible on
// phones). Both variable fonts.
const playfair = Playfair_Display({ subsets: ['latin'], weight: 'variable', variable: '--font-playfair', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: 'variable', variable: '--font-manrope', display: 'swap' });

const registry: Record<string, { variable: string; cssVar: string; fallback: string }> = {
  'Playfair Display': { variable: playfair.variable, cssVar: '--font-playfair', fallback: "Georgia, 'Times New Roman', serif" },
  Manrope: { variable: manrope.variable, cssVar: '--font-manrope', fallback: "system-ui, 'Segoe UI', Arial, sans-serif" },
};

function font(name: string) {
  const f = registry[name];
  if (!f) throw new Error(`brand.json font "${name}" is not registered in src/lib/theme.ts`);
  return f;
}

const heading = font(siteBrand.fonts.heading);
const body = font(siteBrand.fonts.body);

export const fontClassNames = [heading.variable, body.variable].join(' ');

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** :root CSS variables generated from brand.json (colours as "r g b" so Tailwind opacity modifiers work). */
export const themeCss = `:root{${Object.entries(siteBrand.colors)
  .map(([k, v]) => `--c-${k}:${hexToRgb(v)};`)
  .join('')}--radius:${siteBrand.radius};--font-heading:var(${heading.cssVar}),${heading.fallback};--font-body:var(${body.cssVar}),${body.fallback};}`;
