import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Base URL kosong karena Vite dev server proxy /api -> backend (lihat vite.config.js).
// Di production, Nginx yang route /api/* ke backend (sesuai CLAUDE.md deployment notes).
const client = axios.create({
  baseURL: '/api',
  withCredentials: true, // wajib, biar signed cookie guest_token ke-attach ke tiap request
});

// Attach JWT kalau user login. Guest (tanpa token) tetep jalan normal -
// backend yang nentuin guest vs login lewat ada/gaknya header ini.
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau backend balikin 401 (token invalid/expired), otomatis logout di client
// biar UI gak nyangkut nganggep masih login padahal token-nya udah mati.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (identifier, password) =>
    client.post('/auth/login', { identifier, password }).then((r) => r.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    client.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};

export const guestApi = {
  getQuota: () => client.get('/guest/quota').then((r) => r.data),
};

export const qrApi = {
  generate: (payload) => client.post('/qr/generate', payload).then((r) => r.data),
  generateFromImage: (file, darkColor, lightColor, format) => {
    const form = new FormData();
    form.append('image', file);
    form.append('darkColor', darkColor);
    form.append('lightColor', lightColor);
    form.append('format', format);
    return client.post('/qr/generate-from-image', form).then((r) => r.data);
  },
};

export const pdfApi = {
  compress: (file, level) => {
    const form = new FormData();
    form.append('file', file);
    form.append('level', level);
    return client.post('/pdf/compress', form).then((r) => r.data);
  },
  convert: (file, format) => {
    const form = new FormData();
    form.append('file', file);
    form.append('format', format);
    return client.post('/pdf/convert', form).then((r) => r.data);
  },
  protect: (file, password) => {
    const form = new FormData();
    form.append('file', file);
    form.append('password', password);
    return client.post('/pdf/protect', form).then((r) => r.data);
  },
  getJobStatus: (jobId) => client.get(`/pdf/jobs/${jobId}`).then((r) => r.data),
  getDownloadUrl: (jobId) => `/api/pdf/download/${jobId}`,
};

export const historyApi = {
  list: (params) => client.get('/history', { params }).then((r) => r.data),
  remove: (id) => client.delete(`/history/${id}`).then((r) => r.data),
};

export const presetsApi = {
  list: () => client.get('/presets').then((r) => r.data),
  create: (payload) => client.post('/presets', payload).then((r) => r.data),
};

export const activityApi = {
  log: (toolType, fileName) =>
    client.post('/activity/log', { tool_type: toolType, file_name: fileName }).then((r) => r.data),
};

export default client;
