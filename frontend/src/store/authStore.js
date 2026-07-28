import { create } from 'zustand';

const STORAGE_KEY = 'cozydash_token';

// Note: token disimpen di localStorage - ini bukan yang paling aman (rawan XSS
// dibanding httpOnly cookie), tapi konsisten dengan desain JWT Bearer token
// yang udah dipilih di backend (CLAUDE.md). Kalau mau lebih aman, backend
// perlu diubah buat set JWT sebagai httpOnly cookie juga - itu keputusan
// terpisah, bukan sesuatu yang gue ubah sepihak di sini.

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, user: null };
  }
}

export const useAuthStore = create((set) => ({
  ...loadInitialState(),

  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },
}));
