import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BrasilConcentrationCardProps {
  hodl11: number;
  ipcaTotal: number;
  rendaPlus: number;
  cryptoLegado: number;
  totalBrl: number;
  concentrationBrazil: number;
}

const BrasilConcentrationCard: React.FC<BrasilConcentrationCardProps> = ({
  hodl11,
  ipcaTotal,
  rendaPlus,
  cryptoLegado,
  totalBrl,
  concentrationBrazil,
}) => {
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fmtPct = (val: number) => {
    return (val * 100).toFixed(1);
  };

  // Get color based on concentration risk
  const getConcentrationColor = (pct: number): string => {
    if (pct > 0.65) return '#ef4444'; // red - high risk
    if (pct > 0.55) return '#eab308'; // yellow - moderate
    return '#22c55e'; // green - acceptable
  };

  const concentrationColor = getConcentrationColor(concentrationBrazil);
  const concentrationBg = concentrationBrazil > 0.65
    ? 'rgba(239, 68, 68, 0.1)'
    : concentrationBrazil > 0.55
    ? 'rgba(234, 179, 8, 0.1)'
    : 'rgba(34, 197, 94, 0.1)';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Brasil Concentration Risk
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main concentration metric */}
        <div
          className="p-3 rounded border text-center"
          style={{
            backgroundColor: concentrationBg,
            borderColor: concentrationColor,
          }}
        >
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Brasil Concentration
          </div>
          <div className="text-3xl font-extrabold mb-1" style={{ color: concentrationColor }}>
            {privacyMode ? '••' : `${fmtPct(concentrationBrazil)}%`}
          </div>
          <div className="text-xs text-slate-500">
            {concentrationBrazil > 0.65
              ? '⚠️ Alto risco — acima de 65%'
              : concentrationBrazil > 0.55
              ? '⚠️ Moderado — 55-65%'
              : '✅ Aceitável — abaixo de 55%'}
          </div>
        </div>

      {/* Breakdown by asset class */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-2 uppercase font-semibold">
          Composição
        </div>

        {/* RF Ladder */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-200 font-medium">
              Renda Fixa (IPCA+ Ladder)
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {privacyMode ? 'R$••••' : fmtBrl(ipcaTotal)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pl-3 mb-2">
            <span>IPCA+ 2029/2040/2050</span>
            <span>{privacyMode ? '••' : `${fmtPct(ipcaTotal / totalBrl)}%`}</span>
          </div>
        </div>

        {/* Renda+ */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-200 font-medium">
              Renda+ 2065
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {privacyMode ? 'R$••••' : fmtBrl(rendaPlus)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pl-3 mb-2">
            <span>Título prefixado</span>
            <span>{privacyMode ? '••' : `${fmtPct(rendaPlus / totalBrl)}%`}</span>
          </div>
        </div>

        {/* HODL11 */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-200 font-medium">
              Criptoativos (HODL11)
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {privacyMode ? 'R$••••' : fmtBrl(hodl11)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pl-3 mb-2">
            <span>Bitcoin + Crypto Legado</span>
            <span>{privacyMode ? '••' : `${fmtPct(hodl11 / totalBrl)}%`}</span>
          </div>
        </div>

        {/* Crypto Legado */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-200 font-medium">
              Crypto Legado
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {privacyMode ? 'R$••••' : fmtBrl(cryptoLegado)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pl-3 mb-2">
            <span>Posições anteriores</span>
            <span>{privacyMode ? '••' : `${fmtPct(cryptoLegado / totalBrl)}%`}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/15 my-3" />

      {/* Risk note */}
      <div className="text-xs text-slate-500 p-2 bg-slate-800/20 rounded">
        <strong>📌 Nota:</strong> Concentração acima de 65% em Brasil aumenta risco de taxa (Selic), câmbio e inflação. Meta: reduzir para 50-60% via alocação internacional.
      </div>
    </CardContent>
  </Card>
  );
};

export default BrasilConcentrationCard;
