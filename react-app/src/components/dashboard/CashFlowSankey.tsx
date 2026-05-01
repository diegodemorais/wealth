'use client';

import React from 'react';
import { SankeyChart } from '@/components/charts/SankeyChart';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { useDashboardStore } from '@/store/dashboardStore';

const CashFlowSankey: React.FC = () => {
  const { privacyMode } = useUiStore();
  const data = useDashboardStore(s => s.data);

  if (!data) return null;

  // All values from data.json — zero hardcoded fallbacks
  const ss = (data as any)?.spending_breakdown ?? (data as any)?.spending_summary ?? {};
  const rendaMensal: number = (data as any)?.premissas?.renda_mensal_liquida ?? (data as any)?.premissas?.renda_estimada ?? 0;
  const aporteMensal: number = (data as any)?.premissas?.aporte_mensal ?? 0;
  const gastoTotal: number = ss.total_anual ?? 0;
  const investimentos = aporteMensal * 12;
  const renda = Math.max(rendaMensal * 12, gastoTotal + investimentos);
  const savingsRate = renda > 0 ? Math.round((investimentos / renda) * 100) : 0;

  const fmtK = (v: number) => fmtPrivacy(v, privacyMode, { compact: false });

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
        ⚠ Impostos = ~10% estimado dos gastos totais. Taxas &amp; Fees = ~2% estimado.
        {' '}Savings Rate ≈ {savingsRate}%
        {' | '}Renda: {fmtK(renda)}/ano
        {' | '}Gastos: {fmtK(gastoTotal)}
        {' | '}Investimentos: {fmtK(investimentos)}
      </div>
    </div>
  );
};

export default CashFlowSankey;
