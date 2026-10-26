import 'server-only';
import { Nunito_Sans, Sora } from 'next/font/google';
import { siteBrand } from './content';

// next/font must be declared statically; brand.json picks from this registry by name (max 2 fonts).
// display: 'swap' so the chosen fonts always appear; next/font preloads both and uses metric-matched fallbacks.
// Headings: Sora (clean geometric sans, clinical and modern). Body: Nunito Sans (friendly, very legible on phones).
// Both variable fonts; neither is used by the other ClinicFlow247 clinic sites.
const sora = Sora({ subsets: ['latin'], weight: 'variable', variable: '--font-sora', display: 'swap' });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: 'variable', variable: '--font-nunito', display: 'swap' });

const registry: Record<string, { variable: string; cssVar: string; fallback: string }> = {
  Sora: { variable: sora.variable, cssVar: '--font-sora', fallback: "system-ui, 'Segoe UI', Arial, sans-serif" },
  'Nunito Sans': { variable: nunito.variable, cssVar: '--font-nunito', fallback: "system-ui, 'Segoe UI', Arial, sans-serif" },
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
