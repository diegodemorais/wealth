import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AporteDoMesProps {
  aporteMensal: number;
  ultimoAporte: number;
  ultimoAporteData: string;
  acumuladoMes: number;
  acumuladoAno: number;
}

const AporteDoMes: React.FC<AporteDoMesProps> = ({
  aporteMensal,
  ultimoAporte,
  ultimoAporteData,
  acumuladoMes,
  acumuladoAno,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCalculate = () => {
    const adjustment = parseFloat(inputValue);
    if (!isNaN(adjustment)) {
      const result = aporteMensal + adjustment;
      setCalculatedValue(Math.max(0, result));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Aporte do Mês
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Aporte Mensal */}
        <div className="p-2.5 bg-green-500/10 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Aporte Mensal
          </div>
          <div className="text-xl font-bold text-green-500">
            {privacyMode ? '••••' : fmtBrl(aporteMensal).replace('R$', '')}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {privacyMode ? 'R$••••' : fmtBrl(aporteMensal)}
          </div>
        </div>

        {/* Último Aporte */}
        <div className="p-2.5 bg-cyan-500/10 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Último Aporte
          </div>
          <div className="text-lg font-bold text-cyan-500">
            {privacyMode ? '••••' : fmtBrl(ultimoAporte).replace('R$', '').substring(0, 8)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {ultimoAporteData}
          </div>
        </div>
      </div>

      {/* Accumulated values */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="p-2 bg-slate-800/20 rounded">
          <div className="text-slate-400 mb-1">Acumulado Mês</div>
          <div className="font-semibold text-slate-200">
            {privacyMode ? 'R$••••' : fmtBrl(acumuladoMes)}
          </div>
        </div>
        <div className="p-2 bg-slate-800/20 rounded">
          <div className="text-slate-400 mb-1">Acumulado Ano</div>
          <div className="font-semibold text-slate-200">
            {privacyMode ? 'R$••••' : fmtBrl(acumuladoAno)}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/15 my-3" />

      {/* Calculation form */}
      <div className="mt-4">
        <div className="text-xs text-slate-400 mb-2 font-medium">
          Simular Aporte (+/-)
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Valor em R$ (ex: +5000)"
            className="flex-1 px-2.5 py-2 bg-slate-950 border border-slate-700/30 rounded text-slate-200 text-sm font-mono placeholder:text-slate-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCalculate();
              }
            }}
          />
          <button
            onClick={handleCalculate}
            className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold cursor-pointer transition-colors duration-200"
          >
            Calcular
          </button>
        </div>

        {/* Result display */}
        {calculatedValue !== null && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded mt-2">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Aporte Ajustado
            </div>
            <div className="text-lg font-bold text-blue-500">
              {privacyMode ? '••••' : fmtBrl(calculatedValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Diferença: {privacyMode ? '••••' : fmtBrl(calculatedValue - aporteMensal)}
            </div>
          </div>
        )}
      </div>
      </CardContent>
    </Card>
  );
};

export default AporteDoMes;
