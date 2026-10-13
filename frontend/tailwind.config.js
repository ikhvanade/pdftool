/** @type {import('tailwindcss').Config} */
// Warna dibaca dari CSS variable (lihat src/styles/index.css) biar light/dark
// ganti otomatis tanpa tiap komponen nulis `dark:` satu-satu.
const rgb = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // === Token baru - design.md §3 ===
        page: rgb('--c-bg'),
        surface: rgb('--c-surface'),
        line: rgb('--c-border'),
        primary: rgb('--c-primary'),
        ink: rgb('--c-text'),
        muted: rgb('--c-muted'),
        'accent-heading': rgb('--c-accent-heading'),
        // === Alias nama lama (era CozyDash) ===
        // Komponen lama yang belum di-rewrite (QR, History, Settings, panel
        // PDF) otomatis ikut ke-skin biru tanpa diedit satu-satu.
        'base-dark': rgb('--c-bg'),
        'accent-muted': rgb('--c-muted'),
        'on-surface': rgb('--c-text'),
        highlight: rgb('--c-highlight'),
        // Warna fungsional (rule #5 boleh)
        error: rgb('--c-error'),
        success: rgb('--c-success'),
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'sidebar-width': '260px',
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '2rem',
        'gutter-grid': '1.5rem',
        'margin-page': '2rem',
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
    },
  },
  plugins: [],
};
