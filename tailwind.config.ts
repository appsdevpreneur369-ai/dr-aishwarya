import type { Config } from 'tailwindcss';
import brand from './content/brand.json';

// Every colour is a CSS variable generated from content/brand.json (src/lib/theme.ts). Never hard-code a hex in a component.
const colors = Object.fromEntries(Object.keys(brand.colors).map((k) => [k, `rgb(var(--c-${k}) / <alpha-value>)`]));

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: { xs: '400px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    extend: {
      colors,
      fontFamily: { heading: ['var(--font-heading)'], body: ['var(--font-body)'] },
      // One radius family: brand (12px) for cards/images, 10px for buttons and inputs (globals.css). 'blob' kept as an alias.
      borderRadius: { brand: 'var(--radius)', blob: 'var(--radius)' },
      maxWidth: { site: '78rem', prose: '42rem' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--c-navy) / 0.04), 0 4px 16px -8px rgb(var(--c-navy) / 0.12)',
        lift: '0 2px 4px rgb(var(--c-navy) / 0.05), 0 16px 32px -16px rgb(var(--c-primaryDeep) / 0.28)',
        glow: '0 8px 20px -10px rgb(var(--c-primary) / 0.6)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        drift: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-8px,0)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        drift: 'drift 7s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
