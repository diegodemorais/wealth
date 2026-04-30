'use client';

import { fmtPrivacy } from '@/utils/privacyTransform';
import React, { useState, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

const COLORS = ['var(--accent)', 'var(--purple)', 'var(--green)', 'var(--yellow)'];
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
// A2: Separar RMW (Profitability) e CMA (Investment) em vez de colapsar em "Quality"
const FACTOR_LABELS: Record<string, string> = {
  market: 'Market',
  value: 'Value (HML)',
  size: 'Size (SMB)',
  rmw: 'Profitability (RMW)',
  cma: 'Investment (CMA)',
  quality: 'Quality (legacy)',
};

type Tab = 'SWRD' | 'AVGS' | 'AVEM' | 'todos';

function FactorBars({ fatores }: { fatores: Array<{ name: string; pct: number }> }) {
  return (
    <>
      {fatores.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Sem dados</div>
      )}
      {fatores.map((f, i) => (
        <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ flexShrink: 0, width: '64px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{f.name}</div>
          <div style={{ flex: 1, height: '16px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${f.pct}%`,
              backgroundColor: COLORS[i % COLORS.length],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: f.pct > 8 ? '4px' : 0,
              transition: 'width 0.3s',
            }}>
              {f.pct > 8 && (
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>{f.pct}%</span>
              )}
            </div>
          </div>
          <div style={{ flexShrink: 0, width: '32px', textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 700, color: COLORS[i % COLORS.length] }}>
            {f.pct}%
          </div>
        </div>
      ))}
    </>
  );
}

const ETFFactorComposition: React.FC = () => {
  const data = useDashboardStore(s => s.data);
  const [selectedTab, setSelectedTab] = useState<Tab>('SWRD');

  const etfData = useMemo(() => {
    const etfs = (data as any)?.etf_composition?.etfs ?? {};
    // A2: Use factor_loadings (FF5 regression) when available; fallback to etf_composition.fatores
    const factorLoadings = (data as any)?.factor_loadings ?? {};
    // Map ETF tickers to factor_loadings keys (AVGS = proxy via AVUV+AVDV, not in loadings directly)
    const loadingKeyMap: Record<string, string> = { SWRD: 'SWRD' };
    const result: Record<string, { label: string; fatores: Array<{ name: string; pct: number }> }> = {};
    for (const key of ['SWRD', 'AVGS', 'AVEM']) {
      const etf = etfs[key] ?? {};
      const legacyFatores = etf.fatores ?? {};
      const loadingKey = loadingKeyMap[key];
      const ff5 = loadingKey ? (factorLoadings[loadingKey] ?? null) : null;

      // If FF5 loadings available: use them (abs value scaled to %); otherwise legacy fatores
      let fatores: Array<{ name: string; pct: number }>;
      if (ff5 && (ff5.smb != null || ff5.hml != null)) {
        // Normalize FF5 loadings: show absolute values, scale for display (loading × 50 for visual range)
        const toDisplayPct = (v: number) => Math.min(100, Math.max(0, Math.round(Math.abs(v) * 50)));
        fatores = [
          { name: 'Market (Mkt-RF)', pct: Math.min(100, Math.round(Math.abs(ff5.mkt_rf ?? 1) * 80)) },
          { name: 'Value (HML)', pct: toDisplayPct(ff5.hml ?? 0) },
          { name: 'Size (SMB)', pct: toDisplayPct(ff5.smb ?? 0) },
          { name: 'Profitability (RMW)', pct: toDisplayPct(ff5.rmw ?? 0) },
          { name: 'Investment (CMA)', pct: toDisplayPct(ff5.cma ?? 0) },
        ].filter(f => f.pct > 0);
      } else {
        // Legacy fatores: use separate rmw/cma if available, otherwise split quality
        const hasRmwCma = legacyFatores.rmw != null || legacyFatores.cma != null;
        if (hasRmwCma) {
          fatores = [
            { name: 'Market', pct: Math.round((legacyFatores.market ?? 0) * 100) },
            { name: 'Value (HML)', pct: Math.round((legacyFatores.value ?? 0) * 100) },
            { name: 'Size (SMB)', pct: Math.round((legacyFatores.size ?? 0) * 100) },
            { name: 'Profitability (RMW)', pct: Math.round((legacyFatores.rmw ?? 0) * 100) },
            { name: 'Investment (CMA)', pct: Math.round((legacyFatores.cma ?? 0) * 100) },
          ].filter(f => f.pct > 0);
        } else {
          // Legacy: split "quality" into RMW+CMA estimate (60/40)
          const qualityRaw: number = legacyFatores.quality ?? 0;
          fatores = [
            { name: 'Market', pct: Math.round((legacyFatores.market ?? 0) * 100) },
            { name: 'Value (HML)', pct: Math.round((legacyFatores.value ?? 0) * 100) },
            { name: 'Size (SMB)', pct: Math.round((legacyFatores.size ?? 0) * 100) },
            { name: 'Profitability (RMW)', pct: Math.round(qualityRaw * 0.6 * 100) },
            { name: 'Investment (CMA)', pct: Math.round(qualityRaw * 0.4 * 100) },
          ].filter(f => f.pct > 0);
        }
      }

      result[key] = { label: ETF_NAMES[key] ?? key, fatores };
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
              <FactorBars fatores={etfData[key].fatores} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
            {etfData[selectedTab]?.label}
          </div>
          <FactorBars fatores={etfData[selectedTab]?.fatores ?? []} />
        </div>
      )}
      {/* A2: FF5 legend — RMW (Profitability) vs CMA (Investment) distinction */}
      <div style={{ marginTop: 10, fontSize: 9, color: 'var(--muted)', lineHeight: 1.5 }}>
        FF5: HML = value (book-to-market) · SMB = size · RMW = profitability · CMA = investment (asset growth)
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
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export default ETFFactorComposition;
