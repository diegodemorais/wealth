'use client';

import React, { useState, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

const COLORS = ['var(--accent)', 'var(--purple)', 'var(--red)', 'var(--yellow)', 'var(--green)', 'var(--orange)', '#a371f7'];
const ETF_COLORS: Record<string, string> = {
  SWRD: 'var(--accent)',
  AVGS: '#56d364',
  AVEM: 'var(--green)',
};
const ETF_NAMES: Record<string, string> = {
  SWRD: 'SWRD — MSCI World',
  AVGS: 'AVGS — Global Small Cap Value',
  AVEM: 'AVEM — Emerging Markets Value',
};

type Tab = 'SWRD' | 'AVGS' | 'AVEM' | 'todos';

function BarRows({ regioes }: { regioes: Array<{ name: string; pct: number }> }) {
  return (
    <>
      {regioes.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Sem dados</div>
      )}
      {regioes.map((r, i) => (
        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ flexShrink: 0, width: '88px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{r.name}</div>
          <div style={{ flex: 1, height: '16px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
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
          <div style={{ flexShrink: 0, width: '32px', textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 700, color: COLORS[i % COLORS.length] }}>
            {r.pct}%
          </div>
        </div>
      ))}
    </>
  );
}

const ETFRegionComposition: React.FC = () => {
  const data = useDashboardStore(s => s.data);
  const [selectedTab, setSelectedTab] = useState<Tab>('SWRD');

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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'SWRD', label: 'SWRD' },
    { key: 'AVGS', label: 'AVGS' },
    { key: 'AVEM', label: 'AVEM' },
    { key: 'todos', label: 'Todos' },
  ];

  return (
    <div style={styles.container}>
      {/* Tab buttons */}
      <div style={styles.tabs}>
        {tabs.map(({ key, label }) => {
          const color = key === 'todos' ? 'var(--muted)' : ETF_COLORS[key];
          const active = selectedTab === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              style={{
                ...styles.tab,
                backgroundColor: active ? (key === 'todos' ? 'rgba(139,148,158,.15)' : color + '22') : 'transparent',
                border: `1px solid ${active ? (key === 'todos' ? 'var(--muted)' : color) : 'var(--border)'}`,
                color: active ? (key === 'todos' ? 'var(--text)' : color) : 'var(--muted)',
                fontWeight: active ? 700 : 500,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {selectedTab === 'todos' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {(['SWRD', 'AVGS', 'AVEM'] as const).map(key => (
            <div key={key}>
              <div style={{ fontSize: '.73rem', fontWeight: 700, color: ETF_COLORS[key], marginBottom: '8px', borderBottom: `1px solid ${ETF_COLORS[key]}33`, paddingBottom: '4px' }}>
                {etfData[key].label}
              </div>
              <BarRows regioes={etfData[key].regioes} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
            {etfData[selectedTab]?.label}
          </div>
          <BarRows regioes={etfData[selectedTab]?.regioes ?? []} />
        </div>
      )}
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
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export default ETFRegionComposition;
