import { useCallback, useEffect, useRef, useState } from 'react';
import { imageApi } from '../../lib/api';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120000; // batch banyak file bisa lebih lama dari satu PDF

const SUBMIT_ERRORS = {
  GUEST_QUOTA_EXCEEDED: 'Kuota gratis kamu udah habis. Login buat pemakaian unlimited.',
  VALIDATION_ERROR: 'Parameter gak valid - cek lagi pilihan preset/ukuran kamu.',
  UNSUPPORTED_IMAGE_FORMAT: 'Ada file dengan format yang gak didukung (cuma JPG, PNG, WEBP, TIFF).',
  FILE_TOO_LARGE: 'Ada file yang kegedean (maksimal 50MB per file).',
  TOO_MANY_FILES: 'Kebanyakan file - maksimal 20 file sekali proses.',
  NO_FILE_UPLOADED: 'Belum ada file yang dipilih.',
};

export function useImageJob() {
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | failed
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const timer = useRef(null);
  const alive = useRef(true);

  // alive di-set true di dalam effect (bukan cuma di useRef) biar aman sama
  // React StrictMode yang nge-mount-unmount-mount ulang di dev.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    setStatus('idle');
    setError(null);
    setJobId(null);
  }, []);

  const run = useCallback(async (submitFn) => {
    setStatus('uploading');
    setError(null);
    try {
      const res = await submitFn();
      const id = res.data.jobId;
      setJobId(id);
      setStatus('processing');

      const startedAt = Date.now();
      const poll = async () => {
        if (!alive.current) return;
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setStatus('failed');
          setError('Timeout - proses kelamaan. Coba lagi dengan file lebih sedikit.');
          return;
        }
        try {
          const job = (await imageApi.getJobStatus(id)).data;
          if (!alive.current) return;
          if (job.status === 'done') setStatus('done');
          else if (job.status === 'failed') {
            setStatus('failed');
            setError(job.error_message || 'Proses gagal, server gak ngasih detail error.');
          } else {
            timer.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        } catch {
          setStatus('failed');
          setError('Gagal cek status job - koneksi ke server terputus?');
        }
      };
      poll();
    } catch (err) {
      setStatus('failed');
      setError(SUBMIT_ERRORS[err.response?.data?.error] || 'Upload gagal. Coba lagi.');
    }
  }, []);

  return { status, error, jobId, run, reset, downloadUrl: jobId ? imageApi.getDownloadUrl(jobId) : null };
}
