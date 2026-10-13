import { create } from 'zustand';

// Dipicu otomatis dari interceptor axios kalau backend balikin GUEST_QUOTA_EXCEEDED
export const useQuotaModalStore = create((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
