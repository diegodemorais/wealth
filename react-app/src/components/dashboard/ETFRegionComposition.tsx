import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          ETF Região Composição
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab buttons */}
        <div className="flex gap-2 mb-4 border-b border-slate-700/25 pb-2">
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
      <div className="mt-3">
        <div className="text-xs font-semibold text-slate-200 mb-3">
          {currentEtf.name}
        </div>

        <div className="space-y-2">
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
      <div className="mt-4 pt-4 border-t border-slate-700/15">
        <div className="text-xs font-semibold text-slate-200 mb-3">
          Comparação — 3 ETFs
        </div>

        <div className="overflow-x-auto">
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
      </CardContent>
    </Card>
  );
};

export default ETFRegionComposition;
