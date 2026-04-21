'use client';

// Supports two formats: normalized (name/depth_pct) and crises (nome/drawdown_max/inicio/fim)
interface DrawdownEvent {
  name?: string; nome?: string;
  depth_pct?: number; drawdown_max?: number;
  duration_months?: number;
  recovery_months?: number;
  total_months?: number;
  recovered?: boolean;
  inicio?: string; fim?: string;
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
                {['Evento', 'Queda', 'Início', 'Fim', 'Status'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => {
                const name = ev.name ?? ev.nome ?? '—';
                const depth = ev.depth_pct ?? ev.drawdown_max;
                const inicio = ev.inicio ?? '—';
                const fim = ev.fim ?? '—';
                const emAberto = depth === 0 || depth == null;
                const isRecovered = ev.recovered !== undefined ? ev.recovered : (!emAberto && fim !== '—');
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '4px 6px', fontWeight: 500, color: 'var(--text)' }}>{name}</td>
                    <td style={{ padding: '4px 6px', fontWeight: 700, color: depth != null && depth <= -10 ? '#dc2626' : '#ca8a04' }}>
                      {emAberto ? 'em aberto' : depth != null ? `${depth.toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{inicio}</td>
                    <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{fim}</td>
                    <td style={{ padding: '4px 6px' }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: isRecovered ? '#16a34a' : '#ca8a04', color: '#fff' }}>
                        {isRecovered ? 'Recuperado' : 'Em curso'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
