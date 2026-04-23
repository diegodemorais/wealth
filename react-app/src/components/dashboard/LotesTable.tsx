'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

interface Lot {
  symbol: string;
  date: string;
  qty: number;
  price_usd: number;
  cost_usd: number;
  commission_usd: number;
  bucket: string;
  status: string;
  domicilio: string;
}

interface SymbolSummary {
  symbol: string;
  n_lotes: number;
  qty_total: number;
  cost_usd_total: number;
  pm_usd: number;
  status: string;
  domicilio: string;
  oldest_lot: string;
  newest_lot: string;
}

interface Props {
  lots: Lot[];
  summary: { by_symbol: Record<string, SymbolSummary> };
  prices: Record<string, number>; // current prices by symbol
  cambio: number;
}

const STATUS_COLORS: Record<string, string> = {
  alvo: 'var(--green)',
  transitorio: 'var(--yellow)',
  legado: 'var(--red)',
};

const STATUS_LABELS: Record<string, string> = {
  alvo: 'ALVO',
  transitorio: 'TRANSITÓRIO',
  legado: 'LEGADO',
};

export function LotesTable({ lots, summary, prices, cambio }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const privacyMode = useUiStore(s => s.privacyMode);

  const toggle = (sym: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(sym) ? next.delete(sym) : next.add(sym);
      return next;
    });
  };

  const fmtUsd = (v: number) => privacyMode ? '••••' : `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtBrl = (v: number) => privacyMode ? '••••' : `R$${(v / 1e3).toFixed(0)}k`;
  const fmtQty = (v: number) => v.toFixed(v >= 10 ? 0 : 2);
  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;

  const symbols = Object.keys(summary.by_symbol).sort();

  return (
    <div style={{ fontSize: 'var(--text-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>ETF</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Lotes</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Custo USD</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Valor USD</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>P&L</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map(sym => {
            const s = summary.by_symbol[sym];
            const price = prices[sym] ?? 0;
            const valorUsd = s.qty_total * price;
            const pnlUsd = valorUsd - s.cost_usd_total;
            const pnlPct = s.cost_usd_total > 0 ? pnlUsd / s.cost_usd_total : 0;
            const isExpanded = expanded.has(sym);
            const symLots = lots.filter(l => l.symbol === sym);
            const statusColor = STATUS_COLORS[s.status] ?? 'var(--muted)';

            return (
              <>
                <tr
                  key={sym}
                  onClick={() => toggle(sym)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '8px 8px', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {sym}
                      <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 400 }}>{s.domicilio}</span>
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 8px', color: 'var(--muted)' }}>{s.n_lotes}</td>
                  <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtQty(s.qty_total)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtUsd(s.cost_usd_total)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtUsd(valorUsd)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 8px', fontWeight: 700, color: pnlUsd >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {fmtUsd(pnlUsd)} <span style={{ fontWeight: 400, fontSize: 'var(--text-xs)' }}>{fmtPct(pnlPct)}</span>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, textTransform: 'uppercase' }}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                </tr>
                {isExpanded && symLots.map((lot, i) => {
                  const lotValue = lot.qty * price;
                  const lotPnl = lotValue - lot.cost_usd;
                  return (
                    <tr key={`${sym}-${i}`} style={{ borderBottom: '1px solid var(--border)', backgroundColor: lotPnl < 0 ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                      <td style={{ padding: '4px 8px 4px 32px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{lot.date}</td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}></td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>{fmtQty(lot.qty)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>{fmtUsd(lot.cost_usd)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>{fmtUsd(lotValue)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)', fontWeight: 600, color: lotPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {fmtUsd(lotPnl)}
                        {lotPnl < 0 && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--red)', fontWeight: 700 }}>TLH</span>}
                      </td>
                      <td style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        @${lot.price_usd.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </>
            );
          })}
        </tbody>
      </table>

      {/* Footer: TLH summary */}
      {(() => {
        let tlhCount = 0;
        let tlhLoss = 0;
        for (const lot of lots) {
          const price = prices[lot.symbol] ?? 0;
          const pnl = lot.qty * price - lot.cost_usd;
          if (pnl < 0) {
            tlhCount++;
            tlhLoss += pnl;
          }
        }
        if (tlhCount === 0) return (
          <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Nenhum lote elegível para TLH. Todos no lucro.
          </div>
        );
        return (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 'var(--text-xs)' }}>
            <strong style={{ color: 'var(--red)' }}>TLH disponível:</strong> {tlhCount} lotes com perda total de {fmtUsd(Math.abs(tlhLoss))} USD.
            Benefício fiscal potencial: {fmtUsd(Math.abs(tlhLoss) * 0.15)} (15% IR).
            <span style={{ color: 'var(--muted)' }}> · Gatilho ativo em drawdown &gt;15%.</span>
          </div>
        );
      })()}
    </div>
  );
}
