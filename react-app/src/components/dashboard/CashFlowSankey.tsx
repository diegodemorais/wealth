'use client';

import React from 'react';
import { SankeyChart } from '@/components/charts/SankeyChart';
import { useUiStore } from '@/store/uiStore';
import { useDashboardStore } from '@/store/dashboardStore';

const CashFlowSankey: React.FC = () => {
  const { privacyMode } = useUiStore();
  const data = useDashboardStore(s => s.data);

  if (!data) return null;

  // Derive display values for footer note
  const ss = (data as any)?.spending_breakdown ?? (data as any)?.spending_summary ?? {};
  const rendaMensal = (data as any)?.premissas?.renda_mensal_liquida ?? (data as any)?.premissas?.renda_estimada ?? 45000;
  const aporteMensal = (data as any)?.premissas?.aporte_mensal ?? 25000;
  const gastoTotal = ss.total_anual ?? 236647;
  const investimentos = aporteMensal * 12;
  const renda = Math.max(rendaMensal * 12, gastoTotal + investimentos);
  const savingsRate = renda > 0 ? Math.round((investimentos / renda) * 100) : 0;

  const fmtK = (v: number) => {
    if (privacyMode) return 'R$••••';
    return `R$ ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v)}`;
  };

  return (
    <div>
      <SankeyChart data={data} />
      <div style={{
        marginTop: '8px',
        padding: '8px 12px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '4px',
        fontSize: '0.72rem',
        color: 'var(--muted)',
        lineHeight: 1.5,
      }}>
        ⚠ Valores estimados: renda = aporte mensal × 12 + gastos anuais auditados.
        Impostos = ~18% estimado (IR + INSS). Taxas &amp; Fees = ~2% estimado.
        {' '}Note: Savings Rate ≈ {savingsRate}%
        {' | '}Renda: {fmtK(renda)}/ano
        {' | '}Gastos: {fmtK(gastoTotal)}
        {' | '}Investimentos: {fmtK(investimentos)}
      </div>
    </div>
  );
};

export default CashFlowSankey;
