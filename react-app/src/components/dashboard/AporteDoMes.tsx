import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { SimpleProgressBar } from '@/components/primitives/SimpleProgressBar';
import { fmtBrlCompact } from '@/utils/formatters';
import { CheckCircle } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';

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

  // Status badge: check if ultimo_aporte_data is the current month
  const anoAtual = (data?.premissas as any)?.ano_atual ?? new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  const mesAtualStr = `${anoAtual}-${String(mesAtual).padStart(2, '0')}`;
  const ultimoAporteMes = ultimoAporteData || (data?.premissas as any)?.ultimo_aporte_data || null;
  const executadoMesCorrente = ultimoAporteMes === mesAtualStr;
  const valorRealizado = executadoMesCorrente
    ? ((data?.premissas as any)?.ultimo_aporte_brl ?? (ultimoAporte > 0 ? ultimoAporte : null))
    : null;

  const fmtShort = fmtBrlCompact;

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
              {`${savingsRate.toFixed(0)}% SR`}
            </span>
          )}
          {/* Status badge */}
          {ultimoAporteMes == null ? (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.12)', color: 'var(--muted)' }}>
              — Sem dados
            </span>
          ) : executadoMesCorrente ? (
            <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
              <CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Executado{valorRealizado != null ? ` · ${fmtPrivacy(valorRealizado, privacyMode)}` : ''}
            </span>
          ) : (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(234,179,8,0.12)', color: 'var(--yellow)' }}>
              ⏳ Pendente · meta {fmtPrivacy(aporteMensal, privacyMode)}/mês
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
            {fmtPrivacy(primaryValue, privacyMode)}
          </div>
          {!isPremissa && savingsRate != null && (
            <div className="text-xs mt-0.5" style={{ color: srColor }}>
              {`${savingsRate.toFixed(0)}% da renda`}
            </div>
          )}
        </div>
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Meta mensal</div>
          <div className="text-base font-bold" style={{ color: 'var(--accent)' }}>
            {fmtPrivacy(aporteMensal, privacyMode)}
          </div>
          {metaPct != null && (
            <div className="text-xs text-muted mt-0.5">{metaPct.toFixed(0)}% acumulado</div>
          )}
        </div>
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Acumulado mês</div>
          <div className="text-base font-bold text-text">
            {fmtPrivacy(acumuladoMes, privacyMode)}
          </div>
        </div>
        <div className="bg-card2/40 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Acumulado ano</div>
          <div className="text-base font-bold text-text">
            {fmtPrivacy(acumuladoAno, privacyMode)}
          </div>
        </div>
      </div>

      {/* Savings rate bar — compact */}
      {savingsRate != null && (
        <div className="mt-2.5">
          <SimpleProgressBar value={savingsRate} color={srColor} />
        </div>
      )}
    </section>
  );
};

export default AporteDoMes;
