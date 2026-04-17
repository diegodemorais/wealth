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

  // Primary display value: último aporte real (when available) > premissa
  const primaryValue = ultimoAporte > 0 ? ultimoAporte : aporteMensal;
  const isPremissa = ultimoAporte === 0;

  // Savings rate: ultimo aporte / renda mensal líquida
  const rendaMensal = data?.premissas?.renda_mensal_liquida ?? 0;
  const savingsRate = rendaMensal > 0 ? (primaryValue / rendaMensal) * 100 : null;

  // Savings rate color
  const srColor =
    savingsRate != null && savingsRate >= 50 ? 'var(--green)' :
    savingsRate != null && savingsRate >= 40 ? 'var(--yellow)' :
    'var(--red)';

  // Progress vs meta: how much of this month's target was met
  const metaPct = aporteMensal > 0 ? Math.min(100, (acumuladoMes / aporteMensal) * 100) : null;

  return (
    <section className="bg-card border border-border/50 rounded p-4 mb-3.5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted m-0">Aporte do Mês</h2>
        <div className="flex items-center gap-2">
          {savingsRate != null && (
            <span className="text-xs font-bold font-mono" style={{ color: srColor }}>
              {privacyMode ? '••%' : `${savingsRate.toFixed(0)}% SR`}
            </span>
          )}
          {ultimoAporteData && (
            <span className="text-xs text-muted font-mono">{ultimoAporteData}</span>
          )}
        </div>
      </div>

      {/* Compact grid: Último Aporte | Meta | Acumulado Mês | Acumulado Ano */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">{isPremissa ? 'Meta mensal' : 'Último aporte'}</div>
          <div className="text-base font-bold" style={{ color: 'var(--green)' }}>
            {privacyMode ? '••••' : fmtShort(primaryValue)}
          </div>
          {!isPremissa && savingsRate != null && (
            <div className="text-xs mt-0.5" style={{ color: srColor }}>
              {privacyMode ? '••%' : `${savingsRate.toFixed(0)}% da renda`}
            </div>
          )}
        </div>
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Meta mensal</div>
          <div className="text-base font-bold" style={{ color: 'var(--accent)' }}>
            {privacyMode ? '••••' : fmtShort(aporteMensal)}
          </div>
          {metaPct != null && (
            <div className="text-xs text-muted mt-0.5">{metaPct.toFixed(0)}% acumulado</div>
          )}
        </div>
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Acumulado mês</div>
          <div className="text-base font-bold text-text">
            {privacyMode ? '••••' : fmtShort(acumuladoMes)}
          </div>
        </div>
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Acumulado ano</div>
          <div className="text-base font-bold text-text">
            {privacyMode ? '••••' : fmtShort(acumuladoAno)}
          </div>
        </div>
      </div>

      {/* Savings rate bar — compact */}
      {savingsRate != null && (
        <div className="mt-2.5">
          <div className="h-1.5 bg-card2/40 rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-500"
              style={{ width: Math.min(100, savingsRate) + '%', background: srColor }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default AporteDoMes;
