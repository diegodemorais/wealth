'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IpcaTaxaProgressProps {
  taxaAtual: number; // Current IPCA+ yield
  ipca2040Valor: number; // Value in IPCA 2040 bond
  ipca2040AlvoPercent: number; // Target % of portfolio
  ipca2040AtualPercent: number; // Current % of portfolio
  ipca2050Valor: number; // Value in IPCA 2050 bond
  ipca2050AlvoPercent: number; // Target % of portfolio
  ipca2050AtualPercent: number; // Current % of portfolio
  ipcaTotalBrl: number; // Total IPCA+ value
  totalPortfolio: number; // Total portfolio value
}

const IpcaTaxaProgress: React.FC<IpcaTaxaProgressProps> = ({
  taxaAtual,
  ipca2040Valor,
  ipca2040AlvoPercent,
  ipca2040AtualPercent,
  ipca2050Valor,
  ipca2050AlvoPercent,
  ipca2050AtualPercent,
  ipcaTotalBrl,
  totalPortfolio,
}) => {
  const { privacyMode } = useUiStore();
  const [expandDetails, setExpandDetails] = useState(false);

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate progress towards targets
  const ipca2040Gap = ipca2040AlvoPercent - ipca2040AtualPercent;
  const ipca2050Gap = ipca2050AlvoPercent - ipca2050AtualPercent;
  const ipcaTotalCurrentPercent = totalPortfolio > 0 ? (ipcaTotalBrl / totalPortfolio) * 100 : 0;
  const ipcaTotalAlvoPercent = ipca2040AlvoPercent + ipca2050AlvoPercent;
  const ipcaTotalGap = ipcaTotalAlvoPercent - ipcaTotalCurrentPercent;

  // Color helpers
  const totalProgressBg = Math.abs(ipcaTotalGap) < 2
    ? 'bg-green-500/10'
    : ipcaTotalGap > 0
      ? 'bg-green-500/10'
      : 'bg-red-500/10';
  const totalProgressBorder = Math.abs(ipcaTotalGap) < 2
    ? 'border-green-500/25'
    : ipcaTotalGap > 0
      ? 'border-green-500/25'
      : 'border-red-500/25';
  const totalProgressText = Math.abs(ipcaTotalGap) < 2
    ? 'text-green-500'
    : ipcaTotalGap > 0
      ? 'text-green-500'
      : 'text-red-500';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          IPCA+ Taxa & Progresso
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Current Rate & Total Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Taxa Atual */}
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Taxa IPCA+ Atual
            </div>
            <div className="text-base font-bold text-cyan-400">
              {taxaAtual.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500">
              Rendimento real anual
            </div>
          </div>

          {/* Total IPCA+ Valor */}
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Total IPCA+
            </div>
            <div className="text-base font-bold text-cyan-400">
              {privacyMode ? 'R$••••' : fmtBrl(ipcaTotalBrl)}
            </div>
            <div className="text-xs text-slate-500">
              {ipcaTotalCurrentPercent.toFixed(1)}% da carteira
            </div>
          </div>

          {/* Total IPCA+ Progress */}
          <div className={`p-3 rounded border ${totalProgressBg} ${totalProgressBorder}`}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Meta Total IPCA+
            </div>
            <div className={`text-base font-bold mb-1 ${totalProgressText}`}>
              {ipcaTotalAlvoPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              {ipcaTotalGap > 0 ? '+' : ''}{ipcaTotalGap.toFixed(1)}pp faltando
            </div>
          </div>
        </div>

        {/* Progress by maturity */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Progresso por Vencimento
          </div>

          {/* IPCA 2040 */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
              <span>IPCA+ 2040</span>
              <span>{privacyMode ? '••' : `${ipca2040AtualPercent.toFixed(1)}% / ${ipca2040AlvoPercent.toFixed(1)}%`}</span>
            </div>
            <div className="h-3 bg-slate-700/15 rounded overflow-hidden relative">
              {/* Target line (dashed) */}
              <div
                className="absolute top-0 w-px h-full bg-slate-600 opacity-50 z-[2]"
                style={{
                  left: `${(ipca2040AlvoPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100}%`,
                }}
              />
              {/* Progress bar */}
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${ipca2040AtualPercent > 0 ? (ipca2040AtualPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100 : 0}%`,
                  backgroundColor: ipca2040Gap <= 0 ? '#06b6d4' : '#f59e0b',
                }}
              />
            </div>
          </div>

          {/* IPCA 2050 */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
              <span>IPCA+ 2050</span>
              <span>{privacyMode ? '••' : `${ipca2050AtualPercent.toFixed(1)}% / ${ipca2050AlvoPercent.toFixed(1)}%`}</span>
            </div>
            <div className="h-3 bg-slate-700/15 rounded overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${ipca2050AtualPercent > 0 ? (ipca2050AtualPercent / (ipca2040AlvoPercent + ipca2050AlvoPercent)) * 100 : 0}%`,
                  backgroundColor: ipca2050Gap <= 0 ? '#8b5cf6' : '#f59e0b',
                }}
              />
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer border-t border-slate-700/15 mt-3"
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 className="text-sm font-semibold m-0 text-slate-200">
            Detalhes da Alocação
          </h3>
          <span className="text-xs text-slate-400">
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* IPCA 2040 Details */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded">
                <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                  IPCA+ 2040
                </div>
                <div className="text-sm font-bold text-cyan-400 mb-1">
                  {privacyMode ? 'R$••••' : fmtBrl(ipca2040Valor)}
                </div>
                <div className="text-xs text-slate-500">
                  Alvo: {ipca2040AlvoPercent.toFixed(1)}%
                </div>
              </div>

              {/* IPCA 2050 Details */}
              <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
                <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                  IPCA+ 2050
                </div>
                <div className="text-sm font-bold text-violet-400 mb-1">
                  {privacyMode ? 'R$••••' : fmtBrl(ipca2050Valor)}
                </div>
                <div className="text-xs text-slate-500">
                  Alvo: {ipca2050AlvoPercent.toFixed(1)}%
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="p-3 bg-slate-700/10 border border-slate-700/40 rounded">
                <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                  Deficit Total
                </div>
                <div className="text-sm font-bold text-amber-500 mb-1">
                  {ipcaTotalGap > 0 ? '+' : ''}{ipcaTotalGap.toFixed(1)}pp
                </div>
                <div className="text-xs text-slate-500">
                  Ainda para alocar
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Footer note */}
      <div className="mt-3 text-[0.7rem] text-slate-500 p-2 bg-slate-700/10 rounded-sm">
        <strong>📌 Nota:</strong> Progresso é a razão entre alocação atual e meta alvo. DCA ativo busca reduzir o deficit ao longo do tempo, respeitando gatilhos de taxa.
      </div>
      </CardContent>
    </Card>
  );
};

export default IpcaTaxaProgress;
