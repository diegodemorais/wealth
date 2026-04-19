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

export default function TLHMonitor({ lotes, gatilho, cambio }: TLHMonitorProps) {
  const { privacyMode } = useUiStore();

  // Calcular P&L por lote
  const lotesComPnl = lotes.map(l => {
    const pnl_pct = (l.price - l.pm) / l.pm;
    const pnl_usd = (l.price - l.pm) * l.qty;
    const pnl_brl = pnl_usd * cambio;
    let status: 'GANHO' | 'MONITORAR' | 'HARVEST';
    if (pnl_pct > 0) status = 'GANHO';
    else if (pnl_pct > -gatilho) status = 'MONITORAR';
    else status = 'HARVEST';
    return { ...l, pnl_pct, pnl_usd, pnl_brl, status };
  });

  // Oportunidade total = soma dos losses elegíveis (HARVEST)
  const totalLossUsd = lotesComPnl
    .filter(l => l.status === 'HARVEST')
    .reduce((s, l) => s + l.pnl_usd, 0);
  const totalLossBrl = totalLossUsd * cambio;
  const irEconomizado = Math.abs(totalLossBrl) * 0.15;
  const hasHarvest = lotesComPnl.some(l => l.status === 'HARVEST');

  const statusConfig = {
    GANHO:    { bg: '#16a34a22', color: '#16a34a', border: '#16a34a44', label: 'GANHO' },
    MONITORAR:{ bg: '#ca8a0422', color: '#ca8a04', border: '#ca8a0444', label: 'Monitorar' },
    HARVEST:  { bg: '#dc262622', color: '#dc2626', border: '#dc262644', label: 'HARVEST' },
  };

  return (
    <div>
      {/* Painel superior */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>TLH Opportunity (BRL)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: hasHarvest ? '#dc2626' : 'var(--muted)' }}>
            {hasHarvest ? fmtBRL(Math.abs(totalLossBrl), privacyMode) : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
            Losses elegíveis × câmbio R${cambio.toFixed(3)}
          </div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>IR Economizado Est.</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: hasHarvest ? '#16a34a' : 'var(--muted)' }}>
            {hasHarvest ? fmtBRL(irEconomizado, privacyMode) : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
            Loss BRL × 15% · Gatilho: -{(gatilho * 100).toFixed(0)}%
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
              <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {lotesComPnl.map(l => {
              const sc = statusConfig[l.status];
              const pnlColor = l.pnl_pct > 0 ? '#16a34a' : l.pnl_pct < -gatilho ? '#dc2626' : '#ca8a04';
              const isHarvest = l.status === 'HARVEST';
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
                      animation: isHarvest ? 'pulse 1.5s ease-in-out infinite' : undefined,
                    }}>
                      {isHarvest ? '⚡ ' : ''}{sc.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        Wash-sale rule: aguardar 30 dias antes de recomprar. UCITS = substituto equivalente (sem wash-sale no BR).
      </div>
    </div>
  );
}
