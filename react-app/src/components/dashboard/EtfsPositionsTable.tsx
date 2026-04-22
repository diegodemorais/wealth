'use client';

import React, { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';

interface EtfPosition {
  qty: number;
  avg_cost: number;
  price: number;
  bucket: string;
  status: string;
  ter?: number | null;
}

interface EtfsPositionsData {
  [etf: string]: EtfPosition;
}

interface EtfsPositionsTableProps {
  data?: EtfsPositionsData;
}

export function EtfsPositionsTable({ data }: EtfsPositionsTableProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const positions = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];
    const bucketOrder = { SWRD: 0, AVGS: 1, AVEM: 2, JPGL: 3 };
    return Object.entries(data)
      .map(([etf, pos]) => ({
        etf,
        ...pos,
        currentValue: pos.qty * pos.price,
        totalCost: pos.qty * pos.avg_cost,
      }))
      .sort((a, b) => {
        const aOrder = bucketOrder[a.bucket as keyof typeof bucketOrder] ?? 999;
        const bOrder = bucketOrder[b.bucket as keyof typeof bucketOrder] ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.etf.localeCompare(b.etf);
      });
  }, [data]);

  const getStatusColor = (status: string): string => status === 'alvo' ? 'var(--green)' : 'var(--yellow)';
  const getStatusLabel = (status: string): string => status === 'alvo' ? 'Alvo' : 'Transição';

  if (positions.length === 0) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
        No ETF positions available
      </div>
    );
  }

  const totals = {
    quantity: positions.reduce((sum, p) => sum + p.qty, 0),
    currentValue: positions.reduce((sum, p) => sum + p.currentValue, 0),
    totalCost: positions.reduce((sum, p) => sum + p.totalCost, 0),
  };

  const totalPL = totals.currentValue - totals.totalCost;
  const totalPLPct = totals.totalCost > 0 ? totalPL / totals.totalCost : 0;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        ETF Positions — IBKR Holdings
      </h2>

      <div style={{ overflowX: 'auto', borderRadius: '4px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg)', textTransform: 'uppercase', fontSize: 'var(--text-xs)' }}>ETF</th>
              {['Qty', 'Avg Cost', 'Price', 'Total Value', 'P/L', 'P/L %'].map(label => (
                <th key={label} style={{ padding: 'var(--space-2)', textAlign: 'right', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg)', textTransform: 'uppercase', fontSize: 'var(--text-xs)' }}>
                  {label}
                </th>
              ))}
              <th style={{ padding: 'var(--space-2)', textAlign: 'center', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg)', textTransform: 'uppercase', fontSize: 'var(--text-xs)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, idx) => {
              const pl = pos.currentValue - pos.totalCost;
              const plPct = pos.totalCost > 0 ? pl / pos.totalCost : 0;
              return (
                <tr key={pos.etf} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 1 ? 'var(--bg)' : 'transparent' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text)' }}>{pos.etf}</td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {privacyMode ? '••••' : pos.qty.toFixed(2)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {privacyMode ? '••••' : `R$ ${pos.avg_cost.toFixed(2)}`}
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {privacyMode ? '••••' : `R$ ${pos.price.toFixed(2)}`}
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right', fontWeight: 500, color: 'var(--text)', fontFamily: 'monospace' }}>
                    {privacyMode ? '••••' : fmtBrl(pos.currentValue)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right', fontWeight: 500, fontFamily: 'monospace', color: pl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {privacyMode ? '••••' : `${pl >= 0 ? '+' : ''}${fmtBrl(pl)}`}
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace', color: plPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {privacyMode ? '••%' : `${plPct >= 0 ? '+' : ''}${(plPct * 100).toFixed(1)}%`}
                  </td>
                  <td style={{ padding: 'var(--space-2)', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: 'var(--text-xs)', fontWeight: 600,
                      backgroundColor: `${getStatusColor(pos.status)}15`,
                      color: getStatusColor(pos.status),
                    }}>
                      {getStatusLabel(pos.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {/* Totals Row */}
            <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--bg)', fontWeight: 600 }}>
              <td style={{ padding: '8px 12px', color: 'var(--text)' }}>TOTAL</td>
              <td style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                {privacyMode ? '••••' : totals.quantity.toFixed(2)}
              </td>
              <td colSpan={2} style={{ padding: 'var(--space-2)' }}></td>
              <td style={{ padding: 'var(--space-2)', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                {privacyMode ? '••••' : fmtBrl(totals.currentValue)}
              </td>
              <td style={{ padding: 'var(--space-2)', textAlign: 'right', fontFamily: 'monospace', color: totalPL >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {privacyMode ? '••••' : `${totalPL >= 0 ? '+' : ''}${fmtBrl(totalPL)}`}
              </td>
              <td style={{ padding: 'var(--space-2)', textAlign: 'right', fontFamily: 'monospace', color: totalPLPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {privacyMode ? '••%' : `${totalPLPct >= 0 ? '+' : ''}${(totalPLPct * 100).toFixed(1)}%`}
              </td>
              <td style={{ padding: 'var(--space-2)' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
        {[
          { label: 'Alvo Status', value: 'Permanent holding', color: 'var(--green)' },
          { label: 'Transição Status', value: 'Being rebalanced', color: 'var(--yellow)' },
          { label: 'Total P/L', value: 'Unrealized gain/loss', color: 'var(--text)' },
        ].map(item => (
          <div key={item.label} style={{ padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: '4px', fontSize: 'var(--text-sm)' }}>
            <div style={{ color: 'var(--muted)', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontWeight: 600, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
