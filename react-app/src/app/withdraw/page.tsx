'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { GuardrailsChart } from '@/components/charts/GuardrailsChart';
import { IncomeChart } from '@/components/charts/IncomeChart';
import { IncomeProjectionChart } from '@/components/charts/IncomeProjectionChart';
import { GuardrailsRetirada } from '@/components/dashboard/GuardrailsRetirada';
import { BondPoolReadiness } from '@/components/dashboard/BondPoolReadiness';
import { BondPoolRunwayChart } from '@/components/charts/BondPoolRunwayChart';

export default function WithdrawPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Loading withdrawal data...</div>;
  }

  if (dataError) {
    return (
      <div style={{ padding: '20px', color: '#ef4444' }}>
        <strong>❌ Error loading withdrawal:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: '20px', color: '#f59e0b' }}>⚠️ Data loaded but withdrawal section not ready</div>;
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

      {data.fire?.bond_pool_readiness && (
        <CollapsibleSection id="section-bond-pool-readiness" title="Bond Pool — Readiness" defaultOpen={true}>
          <BondPoolReadiness data={data.fire.bond_pool_readiness} />
        </CollapsibleSection>
      )}

      {(data.bond_pool_runway || data.fire?.bond_pool_runway) && (
        <CollapsibleSection id="section-bond-pool-runway" title="Bond Pool — Runway Projection" defaultOpen={true}>
          <BondPoolRunwayChart data={data.bond_pool_runway || data.fire?.bond_pool_runway} />
        </CollapsibleSection>
      )}
    </div>
  );
}
