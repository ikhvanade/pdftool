import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function buildLast7DaysData(items) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      pdf: 0,
      qr: 0,
    });
  }

  const dayMap = Object.fromEntries(days.map((d) => [d.key, d]));

  items.forEach((item) => {
    const key = item.created_at.slice(0, 10);
    const bucket = dayMap[key];
    if (!bucket) return; // di luar 7 hari terakhir
    if (item.tool_type === 'qr_generate') {
      bucket.qr += 1;
    } else {
      bucket.pdf += 1;
    }
  });

  return days;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-accent-muted/30 rounded-lg px-3 py-2 shadow-lg">
      <p className="font-body text-caption text-accent-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-body text-body" style={{ color: entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function UsageChart({ items }) {
  const data = buildLast7DaysData(items);
  const hasActivity = data.some((d) => d.pdf > 0 || d.qr > 0);

  return (
    <div className="bg-surface rounded-xl border border-accent-muted/20 p-6">
      <h3 className="font-heading text-h3 text-on-surface mb-4">Aktivitas 7 Hari Terakhir</h3>
      {!hasActivity ? (
        <p className="font-body text-body text-accent-muted text-center py-12">
          Belum ada aktivitas minggu ini.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#948979', fontSize: 12, fontFamily: 'Geist' }}
              axisLine={{ stroke: '#948979', strokeOpacity: 0.2 }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#948979', fontSize: 12, fontFamily: 'Geist' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#DFD0B8', opacity: 0.08 }} />
            <Legend
              wrapperStyle={{ fontFamily: 'Geist', fontSize: 12, color: '#948979' }}
              formatter={(value) => (value === 'pdf' ? 'PDF' : 'QR Code')}
            />
            <Bar dataKey="pdf" name="pdf" fill="#DFD0B8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="qr" name="qr" fill="#948979" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
