/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 4 token resmi dari design.md - JANGAN nambah warna baru di luar ini
        // kecuali functional (error/success) yang emang di-exception-in di rule #5.
        'base-dark': '#222831',
        surface: '#393E46',
        'accent-muted': '#948979',
        highlight: '#DFD0B8',
        // Functional colors - dipilih supaya tetap kontras & harmonis
        // dengan palette warm/low-contrast di atas (bukan pure red/green).
        error: '#E5484D',
        success: '#4CAF7D',
      },
      fontFamily: {
        // design.md minta "Goat Font" tapi gak tersedia (lihat catatan di README) -
        // Epilogue dipakai sebagai pengganti paling dekat (keputusan user).
        heading: ['Epilogue', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
      },
      fontSize: {
        // Scale persis dari design.md §4
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
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
