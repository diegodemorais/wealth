'use client';

import React from 'react';

/**
 * AllInCostTable — custos all-in (TER + transaction costs + tax friction)
 *
 * Fonte: Annual Reports 2025 (Deloitte audit) + Lei 14.754 BR para HODL11.
 * TER é "headline" do KIID; "all-in" inclui custos de transação dentro do fundo,
 * spread de réplica e (no caso HODL11) come-cotas pós-ago/2026.
 *
 * Drag agregado da carteira target (50/30/20): 0.511%/ano vs 0.201% TER —
 * custo "real" é 2.5× o TER reportado.
 */

interface CostRow {
  ticker: string;
  weight: number;
  ter: number;        // % a.a.
  allIn: number;      // % a.a.
  source: string;
}

const ROWS: CostRow[] = [
  { ticker: 'SWRD.L',  weight: 0.50, ter: 0.12, allIn: 0.380, source: 'Annual Report 2025 (Deloitte)' },
  { ticker: 'AVGS.L',  weight: 0.30, ter: 0.39, allIn: 0.707, source: 'Annual Report 2025 (Deloitte)' },
  { ticker: 'AVEM.L',  weight: 0.20, ter: 0.35, allIn: 1.184, source: 'Annual Report 2025 (Deloitte)' },
];

// HODL11 entra em separado (não compõe equity sleeve nos ROWS) — keeping for reference.
const HODL_ROW = {
  ticker: 'HODL11',
  ter: 0.20,
  allInPre: 0.20,
  allInPost: 0.40,  // pós-ago/2026 (come-cotas)
  source: 'Hashdex factsheet + Lei 14.754',
};

export function AllInCostTable() {
  // Drag ponderado por equity sleeve (apenas 3 ETFs)
  const equityWeight = ROWS.reduce((s, r) => s + r.weight, 0);
  const dragAggregate = ROWS.reduce((s, r) => s + r.weight * r.allIn, 0);
  const terAggregate = ROWS.reduce((s, r) => s + r.weight * r.ter, 0);

  return (
    <div
      data-testid="all-in-cost-table"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        Custo All-in por ETF — Annual Reports 2025
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
        TER (headline KIID) vs all-in (TER + transaction costs + spread de réplica). Drag real da carteira é {dragAggregate.toFixed(3)}%/ano — {(dragAggregate / terAggregate).toFixed(1)}× o TER ponderado.
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>Ticker</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>Peso</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>TER</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>All-in</th>
              <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>Δ</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>Fonte</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => {
              const delta = r.allIn - r.ter;
              return (
                <tr key={r.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 6px', fontWeight: 700, color: 'var(--text)' }}>{r.ticker}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text)' }}>{(r.weight * 100).toFixed(0)}%</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text)' }}>{r.ter.toFixed(2)}%</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>{r.allIn.toFixed(3)}%</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: delta > 0.3 ? 'var(--red)' : delta > 0.15 ? 'var(--yellow)' : 'var(--muted)' }}>
                    +{delta.toFixed(3)}pp
                  </td>
                  <td style={{ padding: '8px 6px', color: 'var(--muted)', fontSize: 11 }}>{r.source}</td>
                </tr>
              );
            })}
            <tr style={{ background: 'var(--card2)' }}>
              <td style={{ padding: '8px 6px', fontWeight: 700, color: 'var(--text)' }}>{HODL_ROW.ticker}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--muted)' }}>—</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text)' }}>{HODL_ROW.ter.toFixed(2)}%</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                {HODL_ROW.allInPre.toFixed(2)}% / <span style={{ color: 'var(--yellow)' }}>{HODL_ROW.allInPost.toFixed(2)}%</span>
              </td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>pós-ago/26</td>
              <td style={{ padding: '8px 6px', color: 'var(--muted)', fontSize: 11 }}>{HODL_ROW.source}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: '10px 12px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 6,
          fontSize: 12,
          color: 'var(--text)',
        }}
      >
        <strong>Custo all-in ponderado da carteira target (equity {(equityWeight * 100).toFixed(0)}%):</strong>{' '}
        <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>{dragAggregate.toFixed(3)}%/ano</span>
        {' · vs TER ponderado '}
        <span style={{ color: 'var(--muted)' }}>{terAggregate.toFixed(3)}%/ano</span>
      </div>
    </div>
  );
}

export default AllInCostTable;
