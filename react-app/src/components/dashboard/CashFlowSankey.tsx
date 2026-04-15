import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CashFlowSankeyProps {
  aporteMensal: number;
  ipcaFlow: number; // R$ flowing to IPCA+
  equityFlow: number; // R$ flowing to Equity
  rendaPlusFlow: number; // R$ flowing to Renda+
  cryptoFlow: number; // R$ flowing to Crypto
}

const CashFlowSankey: React.FC<CashFlowSankeyProps> = ({
  aporteMensal,
  ipcaFlow,
  equityFlow,
  rendaPlusFlow,
  cryptoFlow,
}) => {
  const { privacyMode } = useUiStore();
  const [expandBreakdown, setExpandBreakdown] = useState(false);

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalFlow = ipcaFlow + equityFlow + rendaPlusFlow + cryptoFlow;
  const ipcaPct = totalFlow > 0 ? ipcaFlow / totalFlow : 0;
  const equityPct = totalFlow > 0 ? equityFlow / totalFlow : 0;
  const rendaPlusPct = totalFlow > 0 ? rendaPlusFlow / totalFlow : 0;
  const cryptoPct = totalFlow > 0 ? cryptoFlow / totalFlow : 0;

  const colors = {
    ipca: '#06b6d4', // cyan
    equity: '#3b82f6', // blue
    rendaPlus: '#f59e0b', // amber
    crypto: '#8b5cf6', // violet
  };

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Fluxo de Caixa Anual — Aporte Distribuição
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input card (Aporte) */}
        <div className="p-3 bg-green-500/10 border-2 border-green-500 rounded text-center">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Aporte Mensal
          </div>
          <div className="text-2xl font-bold text-green-500">
            {privacyMode ? 'R$••••' : fmtBrl(aporteMensal)}
          </div>
        </div>

        {/* Flow visualization: horizontal distribution */}
        <div className="flex gap-1 h-8 bg-slate-700/15 rounded overflow-hidden">
          {/* IPCA+ bar */}
          <div
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{
              flex: ipcaPct,
              backgroundColor: colors.ipca,
              minWidth: ipcaPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {ipcaPct > 0.08 ? `${(ipcaPct * 100).toFixed(0)}%` : ''}
          </div>

          {/* Equity bar */}
          <div
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{
              flex: equityPct,
              backgroundColor: colors.equity,
              minWidth: equityPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {equityPct > 0.08 ? `${(equityPct * 100).toFixed(0)}%` : ''}
          </div>

          {/* Renda+ bar */}
          <div
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{
              flex: rendaPlusPct,
              backgroundColor: colors.rendaPlus,
              minWidth: rendaPlusPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {rendaPlusPct > 0.08 ? `${(rendaPlusPct * 100).toFixed(0)}%` : ''}
          </div>

          {/* Crypto bar */}
          <div
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{
              flex: cryptoPct,
              backgroundColor: colors.crypto,
              minWidth: cryptoPct > 0.08 ? 'auto' : '0px',
            }}
          >
            {cryptoPct > 0.08 ? `${(cryptoPct * 100).toFixed(0)}%` : ''}
          </div>
        </div>

        {/* Expandable breakdown */}
        <div
          className="flex justify-between items-center cursor-pointer pt-4 border-t border-slate-700/15"
          onClick={() => setExpandBreakdown(!expandBreakdown)}
        >
          <h3 className="text-sm font-semibold text-slate-200">
            Destinos
          </h3>
          <span className="text-xs text-slate-400">
            {expandBreakdown ? '▼' : '▶'}
          </span>
        </div>

        {expandBreakdown && (
          <div className="mt-3 space-y-2">
            {/* IPCA+ row */}
            <div
              className="p-3 rounded flex justify-between items-center"
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', borderLeft: `4px solid ${colors.ipca}` }}
            >
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  IPCA+ Ladder
                </div>
                <div className="text-xs text-slate-400">
                  Renda fixa de longo prazo
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: colors.ipca }}>
                  {privacyMode ? 'R$••••' : fmtBrl(ipcaFlow)}
                </div>
                <div className="text-xs text-slate-500">
                  {(ipcaPct * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Equity row */}
            <div
              className="p-3 rounded flex justify-between items-center"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', borderLeft: `4px solid ${colors.equity}` }}
            >
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Equity International
                </div>
                <div className="text-xs text-slate-400">
                  SWRD / AVGS / AVEM
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: colors.equity }}>
                  {privacyMode ? 'R$••••' : fmtBrl(equityFlow)}
                </div>
                <div className="text-xs text-slate-500">
                  {(equityPct * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Renda+ row */}
            <div
              className="p-3 rounded flex justify-between items-center"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', borderLeft: `4px solid ${colors.rendaPlus}` }}
            >
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Renda+ 2065
                </div>
                <div className="text-xs text-slate-400">
                  Título prefixado tático
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: colors.rendaPlus }}>
                  {privacyMode ? 'R$••••' : fmtBrl(rendaPlusFlow)}
                </div>
                <div className="text-xs text-slate-500">
                  {(rendaPlusPct * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Crypto row */}
            <div
              className="p-3 rounded flex justify-between items-center"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', borderLeft: `4px solid ${colors.crypto}` }}
            >
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Criptoativos
                </div>
                <div className="text-xs text-slate-400">
                  Bitcoin via HODL11
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold" style={{ color: colors.crypto }}>
                  {privacyMode ? 'R$••••' : fmtBrl(cryptoFlow)}
                </div>
                <div className="text-xs text-slate-500">
                  {(cryptoPct * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowSankey;
