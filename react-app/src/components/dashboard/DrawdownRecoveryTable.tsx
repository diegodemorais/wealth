'use client';

interface DrawdownEvent {
  name?: string;
  depth_pct?: number;
  duration_months?: number;
  recovery_months?: number;
  total_months?: number;
  recovered?: boolean;
}

export interface DrawdownRecoveryTableProps {
  events: DrawdownEvent[];
}

export default function DrawdownRecoveryTable({ events }: DrawdownRecoveryTableProps) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Drawdown Recovery Table</h3>
      {events.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sem eventos registrados</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Evento', 'Queda', 'Meses↓', 'Meses rec.', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 500, color: 'var(--text)' }}>{ev.name ?? '—'}</td>
                  <td style={{ padding: '4px 6px', fontWeight: 700, color: (ev.depth_pct ?? 0) <= -20 ? '#dc2626' : '#ca8a04' }}>
                    {ev.depth_pct != null ? `${ev.depth_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{ev.duration_months ?? '—'}</td>
                  <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{ev.recovery_months ?? '—'}</td>
                  <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{ev.total_months ?? '—'}</td>
                  <td style={{ padding: '4px 6px' }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: ev.recovered ? '#16a34a' : '#ca8a04', color: '#fff' }}>
                      {ev.recovered ? 'Recuperado' : 'Em curso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
