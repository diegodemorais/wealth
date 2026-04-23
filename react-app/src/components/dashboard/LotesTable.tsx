'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

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
  // BRL enriched fields (from ibkr_lotes.py enrich_ir_brl)
  ptax_compra?: number;
  cost_brl?: number;
  value_brl?: number;
  pnl_brl?: number;
  ir_brl?: number;
  tlh_eligible?: boolean;
  tlh_benefit_brl?: number;
  price_atual_usd?: number;
}

interface SymbolSummary {
  symbol: string;
  n_lotes: number;
  qty_total: number;
  cost_usd_total: number;
  cost_brl_total: number;
  value_brl_total: number;
  pnl_brl_total: number;
  ir_brl_total: number;
  tlh_count: number;
  tlh_benefit_brl: number;
  pm_usd: number;
  status: string;
  domicilio: string;
}

interface SummaryData {
  by_symbol: Record<string, SymbolSummary>;
  ir_brl_total?: number;
  tlh_count?: number;
  tlh_benefit_brl?: number;
}

interface Props {
  lots: Lot[];
  summary: SummaryData;
  prices: Record<string, number>;
  cambio: number;
}

const STATUS_COLORS: Record<string, string> = {
  alvo: 'var(--green)',
  transitorio: 'var(--yellow)',
  legado: 'var(--red)',
};

const STATUS_LABELS: Record<string, string> = {
  alvo: 'ALVO',
  transitorio: 'TRANS.',
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

  const fmtBrl = (v: number) => fmtPrivacy(v, privacyMode, { compact: false });
  const fmtBrlK = (v: number) => fmtPrivacy(v, privacyMode);
  const fmtQty = (v: number) => v.toFixed(v >= 10 ? 0 : 2);

  const hasBrl = lots.some(l => l.cost_brl != null);
  const symbols = Object.keys(summary.by_symbol).sort();

  // Totals
  const irTotal = summary.ir_brl_total ?? 0;
  const tlhTotal = summary.tlh_count ?? 0;

  return (
    <div style={{ fontSize: 'var(--text-sm)' }}>
      {/* IR total header */}
      {hasBrl && irTotal > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, padding: '8px 12px', background: 'var(--card2)', borderRadius: 6, fontSize: 'var(--text-xs)' }}>
          <span>IR diferido total: <strong style={{ color: 'var(--red)' }}>{fmtBrl(irTotal)}</strong></span>
          <span style={{ color: 'var(--muted)' }}>|</span>
          <span>Lotes: <strong>{summary.by_symbol ? Object.values(summary.by_symbol).reduce((a, s) => a + s.n_lotes, 0) : 0}</strong></span>
          {tlhTotal > 0 && (
            <>
              <span style={{ color: 'var(--muted)' }}>|</span>
              <span>TLH elegíveis: <strong style={{ color: 'var(--yellow)' }}>{tlhTotal}</strong></span>
            </>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>ETF</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Lotes</th>
              {hasBrl ? (
                <>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Custo BRL</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Valor BRL</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>P&L BRL</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>IR 15%</th>
                </>
              ) : (
                <>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Custo USD</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>P&L USD</th>
                </>
              )}
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {symbols.map(sym => {
              const s = summary.by_symbol[sym];
              const isExpanded = expanded.has(sym);
              const symLots = lots.filter(l => l.symbol === sym);
              const statusColor = STATUS_COLORS[s.status] ?? 'var(--muted)';

              return (
                <tbody key={sym}>
                  <tr
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
                    {hasBrl ? (
                      <>
                        <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtBrlK(s.cost_brl_total)}</td>
                        <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtBrlK(s.value_brl_total)}</td>
                        <td style={{ textAlign: 'right', padding: '8px 8px', fontWeight: 700, color: s.pnl_brl_total >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {fmtBrlK(s.pnl_brl_total)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px 8px', color: 'var(--red)', fontWeight: 600 }}>
                          {fmtBrl(s.ir_brl_total)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtQty(s.qty_total)}</td>
                        <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtPrivacy(s.cost_usd_total, privacyMode, { prefix: '$', compact: false })}</td>
                        <td style={{ textAlign: 'right', padding: '8px 8px' }}>—</td>
                      </>
                    )}
                    <td style={{ padding: '8px 8px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, textTransform: 'uppercase' }}>
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && symLots.map((lot, i) => (
                    <tr key={`${sym}-${i}`} style={{ borderBottom: '1px solid var(--border)', backgroundColor: lot.tlh_eligible ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                      <td style={{ padding: '4px 8px 4px 32px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        {lot.date}
                        {lot.ptax_compra != null && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--muted)' }}>PTAX {lot.ptax_compra.toFixed(2)}</span>}
                      </td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{fmtQty(lot.qty)}</td>
                      {hasBrl && lot.cost_brl != null ? (
                        <>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>{fmtBrl(lot.cost_brl)}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>{fmtBrl(lot.value_brl ?? 0)}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)', fontWeight: 600, color: (lot.pnl_brl ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                            {fmtBrl(lot.pnl_brl ?? 0)}
                            {lot.tlh_eligible && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--red)', fontWeight: 700 }}>TLH</span>}
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)', color: 'var(--red)' }}>
                            {(lot.ir_brl ?? 0) > 0 ? fmtBrl(lot.ir_brl ?? 0) : '—'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>{fmtPrivacy(lot.cost_usd, privacyMode, { prefix: '$', compact: false })}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>—</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: 'var(--text-xs)' }}>—</td>
                        </>
                      )}
                      <td style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        @${lot.price_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
