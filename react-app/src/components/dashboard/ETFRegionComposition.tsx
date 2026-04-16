'use client';

import React, { useState, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

const COLORS = ['var(--accent)', 'var(--purple)', 'var(--red)', 'var(--yellow)', 'var(--green)', 'var(--orange)', '#a371f7'];
const ETF_COLORS: Record<string, string> = {
  SWRD: 'var(--accent)',
  AVGS: 'var(--cyan, #56d364)',
  AVEM: 'var(--green)',
};
const ETF_NAMES: Record<string, string> = {
  SWRD: 'SWRD — MSCI World',
  AVGS: 'AVGS — Global Small Cap Value',
  AVEM: 'AVEM — Emerging Markets Value',
};

const ETFRegionComposition: React.FC = () => {
  const data = useDashboardStore(s => s.data);
  const [selectedTab, setSelectedTab] = useState<'SWRD' | 'AVGS' | 'AVEM'>('SWRD');

  const etfData = useMemo(() => {
    const etfs = (data as any)?.etf_composition?.etfs ?? {};
    const result: Record<string, { label: string; regioes: Array<{ name: string; pct: number }> }> = {};
    for (const key of ['SWRD', 'AVGS', 'AVEM']) {
      const etf = etfs[key] ?? {};
      const regioes = etf.regioes ?? {};
      result[key] = {
        label: ETF_NAMES[key] ?? key,
        regioes: Object.entries(regioes)
          .map(([name, val]) => ({ name, pct: Math.round((val as number) * 100) }))
          .sort((a, b) => b.pct - a.pct),
      };
    }
    return result;
  }, [data]);

  const current = etfData[selectedTab];
  // All unique region names across ETFs for comparison table
  const allRegions = useMemo(() => {
    const set = new Set<string>();
    Object.values(etfData).forEach(e => e.regioes.forEach(r => set.add(r.name)));
    return Array.from(set);
  }, [etfData]);

  return (
    <div style={styles.container}>
      {/* Tab buttons */}
      <div style={styles.tabs}>
        {(['SWRD', 'AVGS', 'AVEM'] as const).map(key => (
          <button
            key={key}
            onClick={() => setSelectedTab(key)}
            style={{
              ...styles.tab,
              backgroundColor: selectedTab === key ? (ETF_COLORS[key] + '22') : 'transparent',
              border: `1px solid ${selectedTab === key ? ETF_COLORS[key] : 'var(--border)'}`,
              color: selectedTab === key ? ETF_COLORS[key] : 'var(--muted)',
              fontWeight: selectedTab === key ? 700 : 500,
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Current ETF bars */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
          {current?.label}
        </div>
        {current?.regioes.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>Sem dados de composição regional</div>
        )}
        {current?.regioes.map((r, i) => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ flexShrink: 0, width: '90px', fontSize: '.72rem', color: 'var(--muted)' }}>{r.name}</div>
            <div style={{ flex: 1, height: '18px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${r.pct}%`,
                backgroundColor: COLORS[i % COLORS.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: r.pct > 8 ? '4px' : 0,
                transition: 'width 0.3s',
              }}>
                {r.pct > 8 && (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>{r.pct}%</span>
                )}
              </div>
            </div>
            <div style={{ flexShrink: 0, width: '32px', textAlign: 'right', fontSize: '.75rem', fontWeight: 700, color: COLORS[i % COLORS.length] }}>
              {r.pct}%
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Comparação
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.75rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Região</th>
                {(['SWRD', 'AVGS', 'AVEM'] as const).map(key => (
                  <th key={key} style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: ETF_COLORS[key] }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRegions.map(region => (
                <tr key={region}>
                  <td style={{ padding: '4px 6px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{region}</td>
                  {(['SWRD', 'AVGS', 'AVEM'] as const).map(key => {
                    const val = etfData[key]?.regioes.find(r => r.name === region)?.pct;
                    return (
                      <td key={key} style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid var(--border)', color: val ? 'var(--text)' : 'var(--muted)' }}>
                        {val != null ? `${val}%` : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  tabs: {
    display: 'flex',
    gap: '6px',
    marginBottom: '14px',
  },
  tab: {
    padding: '5px 14px',
    borderRadius: '4px',
    fontSize: '.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export default ETFRegionComposition;
