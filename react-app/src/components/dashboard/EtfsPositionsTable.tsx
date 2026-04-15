'use client';

import React, { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    if (!data || Object.keys(data).length === 0) {
      return [];
    }

    // Convert to array and sort by bucket priority
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

  const getStatusColor = (status: string): string => {
    return status === 'alvo' ? '#22c55e' : '#eab308'; // green for alvo, yellow for transitorio
  };

  const getStatusLabel = (status: string): string => {
    return status === 'alvo' ? 'Alvo' : 'Transição';
  };

  if (positions.length === 0) {
    return (
      <Card className="bg-slate-900/30">
        <CardContent className="text-xs text-slate-400 text-center py-6">
          No ETF positions available
        </CardContent>
      </Card>
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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          ETF Positions — IBKR Holdings
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-700/25">
          <table className="w-full border-collapse text-xs bg-slate-900/50">
          <thead>
            <tr className="border-b-2 border-slate-700/30">
              <th className="px-3 py-2 text-left font-semibold text-slate-400 bg-slate-900/40 uppercase">
                ETF
              </th>
              {['Qty', 'Avg Cost', 'Price', 'Total Value', 'P/L', 'P/L %'].map(label => (
                <th key={label} className="px-2 py-2 text-right font-semibold text-slate-400 bg-slate-900/40 uppercase">
                  {label}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-semibold text-slate-400 bg-slate-900/40 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, idx) => {
              const pl = pos.currentValue - pos.totalCost;
              const plPct = pos.totalCost > 0 ? pl / pos.totalCost : 0;
              const bgClass = idx % 2 === 0 ? '' : 'bg-slate-700/10';
              return (
                <tr key={pos.etf} className={`border-b border-slate-700/15 ${bgClass}`}>
                  <td className="px-3 py-2 font-medium text-slate-200">
                    {pos.etf}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-200 tabular-nums">
                    {privacyMode ? '••••' : pos.qty.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-200 tabular-nums">
                    {privacyMode ? '••' : `R$ ${pos.avg_cost.toFixed(2)}`}
                  </td>
                  <td className="px-2 py-2 text-right text-slate-200 tabular-nums">
                    {privacyMode ? '••' : `R$ ${pos.price.toFixed(2)}`}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-slate-200 tabular-nums">
                    {privacyMode ? '••••' : fmtBrl(pos.currentValue)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium tabular-nums" style={{ color: pl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {privacyMode ? '••••' : `${pl >= 0 ? '+' : ''}${fmtBrl(pl)}`}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums" style={{ color: plPct >= 0 ? '#22c55e' : '#ef4444' }}>
                    {privacyMode ? '••' : `${plPct >= 0 ? '+' : ''}${(plPct * 100).toFixed(1)}%`}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold" style={{
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
            <tr style={{
              borderTop: '2px solid rgba(71, 85, 105, 0.3)',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
              fontWeight: 600,
            }}>
              <td style={{
                padding: '10px 12px',
                color: '#cbd5e1',
              }}>
                TOTAL
              </td>
              <td style={{
                padding: '8px 6px',
                textAlign: 'right',
                color: '#cbd5e1',
              }}>
                {privacyMode ? '••••' : totals.quantity.toFixed(2)}
              </td>
              <td colSpan={2} style={{
                padding: '8px 6px',
              }}></td>
              <td style={{
                padding: '8px 6px',
                textAlign: 'right',
                color: '#cbd5e1',
              }}>
                {privacyMode ? '••••' : fmtBrl(totals.currentValue)}
              </td>
              <td style={{
                padding: '8px 6px',
                textAlign: 'right',
                color: totalPL >= 0 ? '#22c55e' : '#ef4444',
              }}>
                {privacyMode ? '••••' : `${totalPL >= 0 ? '+' : ''}${fmtBrl(totalPL)}`}
              </td>
              <td style={{
                padding: '8px 6px',
                textAlign: 'right',
                color: totalPLPct >= 0 ? '#22c55e' : '#ef4444',
              }}>
                {privacyMode ? '••' : `${totalPLPct >= 0 ? '+' : ''}${(totalPLPct * 100).toFixed(1)}%`}
              </td>
              <td style={{
                padding: '8px 6px',
              }}></td>
            </tr>
          </tbody>
        </table>
      </div>

        {/* Legend & TER Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <div className="p-3 bg-slate-950/30 rounded text-xs">
            <div className="text-slate-400 mb-1">Alvo Status</div>
            <div className="text-green-500 font-semibold">Permanent holding</div>
          </div>
          <div className="p-3 bg-slate-950/30 rounded text-xs">
            <div className="text-slate-400 mb-1">Transição Status</div>
            <div className="text-yellow-500 font-semibold">Being rebalanced</div>
          </div>
          <div className="p-3 bg-slate-950/30 rounded text-xs">
            <div className="text-slate-400 mb-1">Total P/L</div>
            <div className="text-slate-200 font-semibold">Unrealized gain/loss</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
