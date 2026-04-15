import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StackedAllocationBarProps {
  equityBrl: number;
  ipcaBrl: number;
  rendaPlusBrl: number;
  cryptoBrl: number;
  totalBrl: number;
}

const StackedAllocationBar: React.FC<StackedAllocationBarProps> = ({
  equityBrl,
  ipcaBrl,
  rendaPlusBrl,
  cryptoBrl,
  totalBrl,
}) => {
  const { privacyMode } = useUiStore();

  const equityPct = totalBrl > 0 ? equityBrl / totalBrl : 0;
  const ipcaPct = totalBrl > 0 ? ipcaBrl / totalBrl : 0;
  const rendaPlusPct = totalBrl > 0 ? rendaPlusBrl / totalBrl : 0;
  const cryptoPct = totalBrl > 0 ? cryptoBrl / totalBrl : 0;

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const assets = [
    { label: 'Equity', value: equityBrl, pct: equityPct, color: '#3b82f6' }, // blue
    { label: 'IPCA+ Ladder', value: ipcaBrl, pct: ipcaPct, color: '#06b6d4' }, // cyan
    { label: 'Renda+ 2065', value: rendaPlusBrl, pct: rendaPlusPct, color: '#f59e0b' }, // amber
    { label: 'Crypto', value: cryptoBrl, pct: cryptoPct, color: '#8b5cf6' }, // violet
  ];

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Alocação Total do Portfólio
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stacked bar chart */}
        <div className="flex gap-1 h-12 rounded-md overflow-hidden bg-slate-700/15 mb-4">
        {assets.map(asset => (
          asset.pct > 0 && (
            <div
              key={asset.label}
              className="flex items-center justify-center text-xs font-semibold text-white transition-all duration-300"
              style={{
                flex: asset.pct,
                backgroundColor: asset.color,
                minWidth: asset.pct > 0.05 ? 'auto' : '0px',
              }}
              title={`${asset.label}: ${(asset.pct * 100).toFixed(1)}%`}
            >
              {asset.pct > 0.08 && `${(asset.pct * 100).toFixed(0)}%`}
            </div>
          )
        ))}
      </div>

        {/* Legend and breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {assets.map(asset => (
            asset.value > 0 && (
              <div
                key={asset.label}
                className="p-3 rounded"
                style={{
                  backgroundColor: `${asset.color}10`,
                  border: `1px solid ${asset.color}40`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    {asset.label}
                  </span>
                </div>
                <div className="text-sm font-bold mb-1" style={{ color: asset.color }}>
                  {(asset.pct * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-600">
                  {privacyMode ? 'R$••••' : fmtBrl(asset.value)}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Total */}
        <div className="mt-3 p-3 bg-slate-700/10 rounded flex justify-between items-center border-l-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-200">
            Patrimônio Total
          </span>
          <span className="text-sm font-bold text-white">
            {privacyMode ? 'R$••••' : fmtBrl(totalBrl)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StackedAllocationBar;
