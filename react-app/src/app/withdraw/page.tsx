'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { GuardrailsChart } from '@/components/charts/GuardrailsChart';
import { IncomeChart } from '@/components/charts/IncomeChart';
import { IncomeProjectionChart } from '@/components/charts/IncomeProjectionChart';
import { GuardrailsRetirada } from '@/components/dashboard/GuardrailsRetirada';

export default function WithdrawPage() {
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);

  useEffect(() => {
    if (!data) {
      const dataUrl = withBasePath('/data.json');
      fetch(dataUrl)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(d => setData(d))
        .catch(e => console.error('Failed to load data:', e));
    }
  }, [data, setData]);

  if (!data) {
    return <div>Loading withdrawal data...</div>;
  }

  return (
    <div>
      <h1>💸 Withdraw</h1>

      {/* Tier-1: Guardrails de Retirada */}
      {data && data.guardrails_retirada && (
        <CollapsibleSection id="section-guardrails-table" title="Guardrails de Retirada" defaultOpen={true} icon="🚨">
          <GuardrailsRetirada guardrails={data.guardrails_retirada} />
        </CollapsibleSection>
      )}

      <CollapsibleSection id="section-guardrails" title="Safe Spending Guardrails" defaultOpen={true}>
        <GuardrailsChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-income" title="Current Income Sources" defaultOpen={true}>
        <IncomeChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-income-projection" title="Income Projection" defaultOpen={false}>
        <IncomeProjectionChart data={data} />
      </CollapsibleSection>
    </div>
  );
}
