import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useQuotaModalStore } from '../store/quotaModalStore';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true, // wajib, biar signed cookie guest_token ikut kekirim
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const code = err.response?.data?.error;

    // Logout otomatis CUMA kalau token-nya yang bermasalah. Dulu semua 401 ikut
    // ke-logout, termasuk "password lama salah" di Settings (juga 401) - jadi
    // salah ketik password lama malah ke-lempar ke halaman login.
    if (status === 401 && (code === 'UNAUTHORIZED' || code === 'TOKEN_INVALID_OR_EXPIRED')) {
      useAuthStore.getState().logout();
    }
    // Kuota guest habis -> munculin modal (design.md §5.2.1) dari tool manapun
    if (status === 403 && code === 'GUEST_QUOTA_EXCEEDED') {
      useQuotaModalStore.getState().show();
    }
    return Promise.reject(err);
  }
);

// Download file hasil job LEWAT axios (bukan <a href> biasa). Link biasa gak
// bawa header Authorization (JWT cuma ada di localStorage), jadi user login
// kena 403 dan browser malah nyimpen JSON error-nya sebagai file.
export async function downloadAuthed(url) {
  const res = await client.get(url.replace(/^\/api/, ''), { responseType: 'blob' });
  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match ? match[1] : 'hasil';

  const objectUrl = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export const authApi = {
  login: (identifier, password) =>
    client.post('/auth/login', { identifier, password }).then((r) => r.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    client.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  updateProfile: (username, email, fullName) =>
    client.put('/auth/profile', { username, email, fullName }).then((r) => r.data),
  updateTheme: (theme) => client.put('/auth/theme', { theme }).then((r) => r.data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return client.post('/auth/avatar', form).then((r) => r.data);
  },
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
  toWord: (file) => {
    const form = new FormData();
    form.append('file', file);
    return client.post('/pdf/to-word', form).then((r) => r.data);
  },
  getJobStatus: (jobId) => client.get(`/pdf/jobs/${jobId}`).then((r) => r.data),
  getDownloadUrl: (jobId) => `/api/pdf/download/${jobId}`,
};

function imageForm(files, fields) {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') form.append(k, v);
  });
  return form;
}

export const imageApi = {
  compress: (files, preset) =>
    client.post('/image/compress', imageForm(files, { preset })).then((r) => r.data),
  resize: (files, { printSize, customWidth, customHeight }) =>
    client.post('/image/resize', imageForm(files, { printSize, customWidth, customHeight })).then((r) => r.data),
  convert: (files, format) =>
    client.post('/image/convert', imageForm(files, { format })).then((r) => r.data),
  getJobStatus: (jobId) => client.get(`/image/jobs/${jobId}`).then((r) => r.data),
  getDownloadUrl: (jobId) => `/api/image/download/${jobId}`,
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
