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
            className="px-3 py-2 rounded text-xs cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: selectedTab === key ? etfs[key].color + '20' : 'transparent',
              border: selectedTab === key ? `1px solid ${etfs[key].color}` : '1px solid rgba(71, 85, 105, 0.25)',
              color: selectedTab === key ? etfs[key].color : '#94a3b8',
              fontWeight: selectedTab === key ? 600 : 500,
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
              <div key={region.label} className="flex items-center gap-2.5">
                {/* Bar chart */}
                <div className="flex-shrink-0 w-[120px]">
                  <div className="text-[0.75rem] text-slate-400 mb-1">
                    {region.label}
                  </div>
                  <div className="h-5 bg-slate-700/10 rounded-sm overflow-hidden flex items-center">
                    <div
                      className="h-full flex items-center justify-center text-[0.65rem] font-semibold text-white"
                      style={{
                        width: `${value}%`,
                        backgroundColor: region.color,
                      }}
                    >
                      {value > 5 && `${value}%`}
                    </div>
                  </div>
                </div>

                {/* Percentage value */}
                <div className="flex-shrink-0 w-10 text-right text-sm font-bold" style={{ color: region.color }}>
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
          <table className="w-full border-collapse text-[0.75rem]">
            <thead>
              <tr>
                <th className="text-left p-2 border-b border-slate-700/25 text-slate-400 font-semibold">
                  Região
                </th>
                {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
                  <th
                    key={key}
                    className="text-right p-2 border-b border-slate-700/25 font-bold"
                    style={{ color: etfs[key].color }}
                  >
                    {etfs[key].name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regions.map(region => (
                <tr key={region.label}>
                  <td className="p-2 border-b border-slate-700/15 text-slate-300">
                    {region.label}
                  </td>
                  {(Object.keys(etfs) as Array<'swrd' | 'avgs' | 'avem'>).map(key => (
                    <td
                      key={`${key}-${region.label}`}
                      className="p-2 text-right border-b border-slate-700/15 font-semibold"
                      style={{ color: region.color }}
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
