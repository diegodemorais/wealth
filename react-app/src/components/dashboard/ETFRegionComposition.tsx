import React, { useState } from 'react';

interface ETFCompositionData {
  usa: number;
  europe: number;
  japan: number;
  otherDm: number;
  em: number;
}

interface ETFRegionCompositionProps {
  swrd?: ETFCompositionData;
  avgs?: ETFCompositionData;
  avem?: ETFCompositionData;
}

const ETFRegionComposition: React.FC<ETFRegionCompositionProps> = ({
  swrd = { usa: 48, europe: 20, japan: 8, otherDm: 12, em: 12 },
  avgs = { usa: 45, europe: 25, japan: 10, otherDm: 12, em: 8 },
  avem = { usa: 30, europe: 15, japan: 8, otherDm: 12, em: 35 },
}) => {
  const [selectedTab, setSelectedTab] = useState<'swrd' | 'avgs' | 'avem'>('swrd');

  const etfs = {
    swrd: { name: 'SWRD (Global Large Cap)', color: '#3b82f6', data: swrd },
    avgs: { name: 'AVGS (Global Quality)', color: '#06b6d4', data: avgs },
    avem: { name: 'AVEM (Global EM Value)', color: '#10b981', data: avem },
  };

  const currentEtf = etfs[selectedTab];
  const regions: Array<{ label: string; key: keyof ETFCompositionData; color: string }> = [
    { label: 'USA', key: 'usa', color: '#3b82f6' },
    { label: 'Europe', key: 'europe', color: '#8b5cf6' },
    { label: 'Japan', key: 'japan', color: '#ec4899' },
    { label: 'Other DM', key: 'otherDm', color: '#f59e0b' },
    { label: 'EM', key: 'em', color: '#10b981' },
  ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        ETF Região Composição
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedTab === key ? etfs[key].color + '20' : 'transparent',
                border: selectedTab === key ? `1px solid ${etfs[key].color}` : '1px solid var(--border)',
                color: selectedTab === key ? etfs[key].color : 'var(--muted)',
                fontWeight: selectedTab === key ? 600 : 500,
              }}
            >
              {etfs[key].name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Current ETF composition */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            {currentEtf.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {regions.map(region => {
              const value = currentEtf.data[region.key];
              return (
                <div key={region.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flexShrink: 0, width: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>{region.label}</div>
                    <div style={{ height: '20px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                      <div style={{ height: '100%', width: `${value}%`, backgroundColor: region.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {value > 5 && <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'white' }}>{value}%</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: region.color }}>
                    {value}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Comparação — 3 ETFs
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Região</th>
                  {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
                    <th key={key} style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: etfs[key].color }}>
                      {etfs[key].name.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regions.map(region => (
                  <tr key={region.label}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{region.label}</td>
                    {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
                      <td key={`${key}-${region.label}`} style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: region.color }}>
                        {etfs[key].data[region.key]}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETFRegionComposition;
