import React, { useState } from 'react';

interface RegionData {
  region: string;
  percentage: number;
}

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
    swrd: {
      name: 'SWRD (Global Large Cap)',
      color: '#3b82f6',
      data: swrd,
    },
    avgs: {
      name: 'AVGS (Global Quality)',
      color: '#06b6d4',
      data: avgs,
    },
    avem: {
      name: 'AVEM (Global EM Value)',
      color: '#10b981',
      data: avem,
    },
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
    <div
      style={{
        padding: '16px 18px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
        borderRadius: '8px',
        marginBottom: '14px',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
      }}
    >
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 14px', padding: 0 }}>
        ETF Região Composição
      </h2>

      {/* Tab buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
          paddingBottom: '8px',
        }}
      >
        {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
          <button
            key={key}
            onClick={() => setSelectedTab(key)}
            style={{
              padding: '8px 12px',
              backgroundColor: selectedTab === key ? etfs[key].color + '20' : 'transparent',
              border: selectedTab === key ? `1px solid ${etfs[key].color}` : '1px solid rgba(71, 85, 105, 0.25)',
              borderRadius: '6px',
              color: selectedTab === key ? etfs[key].color : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: selectedTab === key ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {etfs[key].name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Current ETF composition */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          {currentEtf.name}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {regions.map(region => {
            const value = currentEtf.data[region.key];
            return (
              <div key={region.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Bar chart */}
                <div style={{ flex: '0 0 120px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    {region.label}
                  </div>
                  <div
                    style={{
                      height: '20px',
                      backgroundColor: 'rgba(71, 85, 105, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${value}%`,
                        backgroundColor: region.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: 'white',
                      }}
                    >
                      {value > 5 && `${value}%`}
                    </div>
                  </div>
                </div>

                {/* Percentage value */}
                <div
                  style={{
                    flex: '0 0 40px',
                    textAlign: 'right',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: region.color,
                  }}
                >
                  {value}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(71, 85, 105, 0.15)',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Comparação — 3 ETFs
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.75rem',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  Região
                </th>
                {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
                  <th
                    key={key}
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                      color: etfs[key].color,
                      fontWeight: 700,
                    }}
                  >
                    {etfs[key].name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regions.map(region => (
                <tr key={region.label}>
                  <td
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#cbd5e1',
                    }}
                  >
                    {region.label}
                  </td>
                  {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
                    <td
                      key={`${key}-${region.label}`}
                      style={{
                        padding: '8px',
                        textAlign: 'right',
                        borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                        color: region.color,
                        fontWeight: 600,
                      }}
                    >
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
  );
};

export default ETFRegionComposition;
