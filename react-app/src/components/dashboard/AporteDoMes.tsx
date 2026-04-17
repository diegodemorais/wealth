import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { useDashboardStore } from '@/store/dashboardStore';

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
  const { privacyMode } = useUiStore();
  const data = useDashboardStore(s => s.data);

  const fmtShort = (val: number) => {
    if (val >= 1_000_000) return `R$${(val / 1e6).toFixed(1)}M`;
    if (val >= 1_000) return `R$${Math.round(val / 1000)}k`;
    return `R$${Math.round(val)}`;
  };

  const fmtBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  // Savings rate: aporte / renda mensal líquida
  const rendaMensal = data?.premissas?.renda_mensal_liquida ?? 0;
  const savingsRate = rendaMensal > 0 ? (aporteMensal / rendaMensal) * 100 : null;

  // Savings rate color
  const srColor =
    savingsRate != null && savingsRate >= 50 ? 'var(--green)' :
    savingsRate != null && savingsRate >= 40 ? 'var(--yellow)' :
    'var(--red)';

  return (
    <section className="bg-card border border-border/50 rounded p-4 mb-3.5">
      <h2 className="text-base font-semibold text-text mb-3 m-0">Aporte do Mês</h2>

      {/* Big aporte value */}
      <div className="text-center py-2 px-0">
        <div className="text-4xl font-black leading-none text-green">
          {privacyMode ? '••••' : fmtShort(aporteMensal)}
        </div>
        {savingsRate != null && (
          <div className="text-xs text-muted mt-1.5">
            {privacyMode ? '••••' : `${savingsRate.toFixed(1)}% savings rate`}
            {rendaMensal > 0 && !privacyMode && ` · renda est. ${fmtShort(rendaMensal)}/mês`}
          </div>
        )}
      </div>

      {/* Savings rate bar */}
      {savingsRate != null && (
        <div className="my-2.5">
          <div className="h-2 bg-card2/40 rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-500"
              style={{
                width: Math.min(100, savingsRate) + '%',
                background: srColor,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>≥50% excelente</span>
            <span>≥40% ok</span>
            <span>≥35% atenção</span>
          </div>
        </div>
      )}

      {/* Accumulated values */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-card2/40 rounded px-2 py-2 text-center">
          <div className="text-xs uppercase font-semibold text-muted tracking-widest">Acumulado Mês</div>
          <div className="text-sm font-bold text-text mt-0.5">
            {privacyMode ? '••••' : fmtShort(acumuladoMes)}
          </div>
        </div>
        <div className="bg-card2/40 rounded px-2 py-2 text-center">
          <div className="text-xs uppercase font-semibold text-muted tracking-widest">Acumulado Ano</div>
          <div className="text-sm font-bold text-text mt-0.5">
            {privacyMode ? '••••' : fmtShort(acumuladoAno)}
          </div>
        </div>
      </div>

      {/* Last contribution */}
      {ultimoAporte > 0 && (
        <div className="mt-2.5 text-xs text-muted text-center">
          Último: {privacyMode ? '••••' : fmtBrl(ultimoAporte)} · {ultimoAporteData}
        </div>
      )}
    </section>
  );
};

export default AporteDoMes;
