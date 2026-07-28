import { useCallback, useRef, useState } from 'react';
import { pdfApi } from '../../lib/api';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60000; // 1 menit - kalau lebih dari ini, kemungkinan ada yang salah

// Hook generik buat compress/convert/protect - semuanya punya alur yang sama:
// submit file -> dapet jobId -> polling status -> done (dapet download link) / failed (error message)
export function usePdfJob() {
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | failed
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const pollTimeoutRef = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(pollTimeoutRef.current);
    setStatus('idle');
    setError(null);
    setJobId(null);
  }, []);

  const run = useCallback(async (submitFn) => {
    setStatus('uploading');
    setError(null);
    try {
      const res = await submitFn();
      const newJobId = res.data.jobId;
      setJobId(newJobId);
      setStatus('processing');

      const startedAt = Date.now();
      const poll = async () => {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setStatus('failed');
          setError('Timeout - proses kelamaan, coba lagi atau cek log server.');
          return;
        }
        try {
          const jobRes = await pdfApi.getJobStatus(newJobId);
          const job = jobRes.data;
          if (job.status === 'done') {
            setStatus('done');
          } else if (job.status === 'failed') {
            setStatus('failed');
            setError(job.error_message || 'Proses gagal, gak ada detail error dari server.');
          } else {
            pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        } catch (err) {
          setStatus('failed');
          setError('Gagal cek status job - koneksi ke server terputus?');
        }
      };
      poll();
    } catch (err) {
      setStatus('failed');
      const code = err.response?.data?.error;
      if (code === 'GUEST_QUOTA_EXCEEDED') {
        setError('Kuota gratis kamu udah habis. Login buat pemakaian unlimited.');
      } else if (code === 'VALIDATION_ERROR') {
        setError('Input gak valid, cek lagi file/parameter yang kamu kirim.');
      } else {
        setError('Upload gagal. Coba lagi.');
      }
    }
  }, []);

  return { status, error, jobId, run, reset, downloadUrl: jobId ? pdfApi.getDownloadUrl(jobId) : null };
}
