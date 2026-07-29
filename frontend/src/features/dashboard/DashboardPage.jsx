import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { historyApi } from '../../lib/api';
import RecentlyUsedCarousel from './components/RecentlyUsedCarousel';
import ToolCard from './components/ToolCard';
import StatsWidget from './components/StatsWidget';
import TipsWidget from './components/TipsWidget';
import UsageChart from './components/UsageChart';

function timeAwareGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [recentItems, setRecentItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [stats, setStats] = useState({ pdfCount: 0, qrCount: 0 });

  useEffect(() => {
    if (!user) return; // guest gak punya history tersimpan (sesuai PRD §6.1)

    historyApi.list({ page: 1, pageSize: 5 }).then((res) => {
      setRecentItems(res.data.items);
    });

    // Hitung stats & data chart dari semua history (page besar) - untuk v1 ini
    // cukup, kalau datanya udah banyak sebaiknya ada endpoint aggregate terpisah.
    historyApi.list({ page: 1, pageSize: 1000 }).then((res) => {
      setAllItems(res.data.items);
      const pdfCount = res.data.items.filter((i) => i.tool_type.startsWith('pdf_')).length;
      const qrCount = res.data.items.filter((i) => i.tool_type === 'qr_generate').length;
      setStats({ pdfCount, qrCount });
    });
  }, [user]);

  return (
    <>
      <section className="mb-8">
        <h2 className="font-heading text-h1 text-on-surface mb-2">
          {timeAwareGreeting()}{user ? `, ${user.username}` : ''}
        </h2>
        <p className="font-body text-body-lg text-accent-muted max-w-2xl">
          Ruang kerjamu sudah siap. Ada dokumen yang perlu diproses hari ini?
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-grid">
        <div className="lg:col-span-8 space-y-gutter-grid">
          {user && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-h3 text-on-surface">Baru Saja Digunakan</h3>
                <a href="/history" className="text-highlight font-body text-body hover:underline">
                  Lihat Semua
                </a>
              </div>
              <RecentlyUsedCarousel items={recentItems} />
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard
              icon="picture_as_pdf"
              title="PDF Toolkit"
              description="Gabungkan, pisahkan, kompres, dan kelola dokumen PDF Anda dengan mudah dan aman."
              ctaLabel="Buka Alat PDF"
              to="/pdf-toolkit"
              variant="primary"
            />
            <ToolCard
              icon="qr_code_2"
              title="QR Generator"
              description="Buat kode QR kustom untuk tautan, teks, kontak, dan lainnya."
              ctaLabel="Buat QR Code"
              to="/qr-generator"
              variant="secondary"
            />
          </section>

          {user && <UsageChart items={allItems} />}
        </div>

        <div className="lg:col-span-4 space-y-gutter-grid">
          {user ? (
            <StatsWidget pdfCount={stats.pdfCount} qrCount={stats.qrCount} />
          ) : (
            <div className="bg-surface rounded-xl border border-accent-muted/20 p-6 text-center">
              <p className="font-body text-body text-accent-muted">
                Login buat liat statistik & history pemakaian kamu.
              </p>
            </div>
          )}
          <TipsWidget />
        </div>
      </div>
    </>
  );
}
