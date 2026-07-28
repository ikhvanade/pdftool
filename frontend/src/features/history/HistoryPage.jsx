import { useEffect, useState } from 'react';
import { historyApi } from '../../lib/api';
import HistoryFilters from './components/HistoryFilters';
import HistoryTable from './components/HistoryTable';

export default function HistoryPage() {
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = { page: 1, pageSize: 50 };
    if (filter) params.tool_type = filter;
    historyApi
      .list(params)
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function handleDelete(id) {
    await historyApi.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <>
      <section className="mb-6">
        <h2 className="font-heading text-h1 text-on-surface mb-2">Riwayat Aktivitas</h2>
        <p className="font-body text-body-lg text-accent-muted">Semua yang pernah kamu proses.</p>
      </section>

      <HistoryFilters active={filter} onChange={setFilter} />

      <div className="mt-6">
        {loading ? (
          <p className="font-body text-body text-accent-muted">Memuat...</p>
        ) : (
          <HistoryTable items={items} onDelete={handleDelete} />
        )}
      </div>
    </>
  );
}
