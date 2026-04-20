'use client';

import { useUiStore } from '@/store/uiStore';

export interface TLHLote {
  ticker: string;
  nome: string;
  qty: number;
  pm: number;
  price: number;
  ucits: string;
}

export interface TLHMonitorProps {
  lotes: TLHLote[];
  gatilho: number; // ex: 0.05 = 5%
  cambio: number;
}

function fmtBRL(val: number, pm: boolean): string {
  if (pm) return '••••';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

function fmtUSD(val: number, pm: boolean): string {
  if (pm) return '••••';
  const sign = val >= 0 ? '+' : '';
  return sign + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

type LoteStatus = 'PERDA' | 'MONITOR' | 'GANHO';

export default function TLHMonitor({ lotes, gatilho, cambio }: TLHMonitorProps) {
  const { privacyMode } = useUiStore();

  const lotesComPnl = lotes.map(l => {
    const pnl_pct = (l.price - l.pm) / l.pm;
    const pnl_usd = (l.price - l.pm) * l.qty;
    const pnl_brl = pnl_usd * cambio;
    let status: LoteStatus;
    if (pnl_pct >= 0) status = 'GANHO';
    else if (pnl_pct > -gatilho) status = 'MONITOR';
    else status = 'PERDA';
    return { ...l, pnl_pct, pnl_usd, pnl_brl, status };
  });

  // Ordenar: PERDA primeiro (vender esses), depois MONITOR, depois GANHO (evitar)
  const sorted = [...lotesComPnl].sort((a, b) => {
    const order: Record<LoteStatus, number> = { PERDA: 0, MONITOR: 1, GANHO: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.pnl_pct - b.pnl_pct; // menor pnl primeiro dentro do mesmo status
  });

  const totalLossBrl = lotesComPnl
    .filter(l => l.status === 'PERDA')
    .reduce((s, l) => s + l.pnl_brl, 0);
  const irCompensavel = Math.abs(totalLossBrl) * 0.15;
  const hasPerda = totalLossBrl < 0;

  const statusConfig: Record<LoteStatus, { bg: string; color: string; border: string; label: string }> = {
    PERDA:   { bg: '#dc262622', color: '#dc2626', border: '#dc262644', label: 'VENDER PRIMEIRO' },
    MONITOR: { bg: '#ca8a0422', color: '#ca8a04', border: '#ca8a0444', label: 'MONITOR' },
    GANHO:   { bg: '#16a34a22', color: '#16a34a', border: '#16a34a44', label: 'EVITAR VENDER' },
  };

  return (
    <div>
      {/* Instrução de uso */}
      <div style={{
        background: '#2563eb18', border: '1px solid #2563eb44',
        borderRadius: 6, padding: '7px 10px', marginBottom: 12, fontSize: 10, color: '#2563eb',
      }}>
        <strong>Seletividade de Lotes:</strong> quando a venda for inevitável (Safety valve drift &gt;10pp
        ou fase de usufruto pós-FIRE), use os lotes em perda primeiro para minimizar IR (15%).
        Estratégia dominante: diferimento total — não vender.
      </div>

      {/* Painéis */}
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Perda Elegível (BRL)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: hasPerda ? '#dc2626' : 'var(--muted)' }}>
            {hasPerda ? fmtBRL(Math.abs(totalLossBrl), privacyMode) : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
            Lotes com perda ≥ {(gatilho * 100).toFixed(0)}% · câmbio {cambio.toFixed(3)}
          </div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>IR Compensável Est.</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: hasPerda ? '#16a34a' : 'var(--muted)' }}>
            {hasPerda ? fmtBRL(irCompensavel, privacyMode) : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
            Perda BRL × 15% · requer ganho a compensar
          </div>
        </div>
      </div>

      {/* Tabela de lotes */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%', minWidth: 340 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Ticker</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>UCITS</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>P&L %</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>P&L USD</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>Ordem de Venda</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '12px 6px', textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>
                  Nenhum lote registrado — preencher tlh_lotes.json
                </td>
              </tr>
            ) : sorted.map(l => {
              const sc = statusConfig[l.status];
              const pnlColor = l.status === 'GANHO' ? '#16a34a' : l.status === 'PERDA' ? '#dc2626' : '#ca8a04';
              return (
                <tr key={l.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '5px 6px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>{l.ticker}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 9 }}>{l.nome}</div>
                  </td>
                  <td style={{ padding: '5px 6px', color: 'var(--muted)', fontFamily: 'monospace' }}>{l.ucits}</td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, color: pnlColor }}>
                    {l.pnl_pct >= 0 ? '+' : ''}{(l.pnl_pct * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: pnlColor }}>
                    {fmtUSD(l.pnl_usd, privacyMode)}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3,
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      {sc.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        BR: perdas compensam ganhos do mesmo exercício + carryforward (sem prazo de prescrição explícito) ·
        Art. 21 Lei 14.654/2014. Diferimento puro (não vender) é superior quando horizonte &gt; 10 anos.
      </div>
    </div>
  );
}
