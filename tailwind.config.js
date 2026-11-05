import typography from '@tailwindcss/typography';

/**
 * FyndRx design tokens.
 *
 * - `brand`  : trust blue. 500 is the logo/CTA blue (#246BFD).
 * - `accent` : warm orange for secondary actions & highlights. 500 is #FE9615.
 * - `primary`: alias of `brand` so legacy `primary-*` classes stay on-brand.
 *
 * Use these tokens, never raw hex values, in templates.
 */
const brand = {
  50: '#eef4ff',
  100: '#dbe7ff',
  200: '#bcd3ff',
  300: '#8fb4ff',
  400: '#5089FF',
  500: '#246BFD',
  600: '#1A56D6',
  700: '#1745ad',
  800: '#163a8a',
  900: '#15336f',
  950: '#0f2250',
};

const accent = {
  50: '#fff8eb',
  100: '#ffeccc',
  200: '#ffd999',
  300: '#FFB547',
  400: '#ffa52e',
  500: '#FE9615',
  600: '#e07a0a',
  700: '#b95a0b',
  800: '#94460f',
  900: '#783a10',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand,
        accent,
        primary: brand,
        surface: {
          dark: '#0F172A',
          'dark-raised': '#1A2233',
        },
      },
      fontFamily: {
        sans: [
          'MADEOkineSans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -8px rgb(15 23 42 / 0.10)',
        'card-hover': '0 2px 4px rgb(15 23 42 / 0.05), 0 16px 40px -12px rgb(36 107 253 / 0.25)',
        float: '0 12px 40px -12px rgb(15 23 42 / 0.30)',
        'glow-brand': '0 8px 24px -6px rgb(36 107 253 / 0.45)',
        'glow-accent': '0 8px 24px -6px rgb(254 150 21 / 0.45)',
      },
      transitionTimingFunction: {
        // Strong ease-out: fast start, gentle settle. Use for entering / hover.
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'float-y': 'float-y 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.25, 1, 0.5, 1) infinite',
      },
    },
  },
  plugins: [typography],
};
