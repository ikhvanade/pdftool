import { create } from 'zustand';

const KEY = 'pdftool_theme';

function apply(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function initial() {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* localStorage diblok - pakai default */
  }
  return 'dark';
}

export const useThemeStore = create((set) => ({
  theme: initial(),
  setTheme: (theme) => {
    try { localStorage.setItem(KEY, theme); } catch { /* abaikan */ }
    apply(theme);
    set({ theme });
  },
}));

apply(useThemeStore.getState().theme);
