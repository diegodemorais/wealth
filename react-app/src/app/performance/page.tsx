'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { AttributionChart } from '@/components/charts/AttributionChart';
import { DeltaBarChart } from '@/components/charts/DeltaBarChart';
import { RollingSharpChart } from '@/components/charts/RollingSharpChart';
import { InformationRatioChart } from '@/components/charts/InformationRatioChart';
import { BacktestChart } from '@/components/charts/BacktestChart';
import { ShadowChart } from '@/components/charts/ShadowChart';
import { FactorLoadingsTable } from '@/components/dashboard/FactorLoadingsTable';
import { PremisesTable } from '@/components/performance/PremisesTable';
import { NetWorthTable } from '@/components/performance/NetWorthTable';

export default function PerformancePage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Loading performance data...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Error loading performance:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">⚠️ Data loaded but performance section not ready</div>;
  }

  return (
    <div>
      <h1>📈 Performance</h1>

      <PremisesTable />

      <NetWorthTable />

      <CollapsibleSection id="section-history" title="Historical Performance" defaultOpen={true}>
        <TimelineChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-attribution" title="Return Attribution" defaultOpen={true}>
        <AttributionChart data={data} />
        <DeltaBarChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-risk" title="Risk Metrics" defaultOpen={true}>
        <RollingSharpChart data={data} />
        <InformationRatioChart data={data} />
      </CollapsibleSection>

      {data.factor_loadings && (
        <CollapsibleSection id="section-factor-quality" title="Factor Model Fit — R² Quality" defaultOpen={true}>
          <FactorLoadingsTable data={data.factor_loadings} />
        </CollapsibleSection>
      )}

      <CollapsibleSection id="section-backtest" title="Backtest & Comparisons" defaultOpen={false}>
        <BacktestChart data={data} />
        <ShadowChart data={data} />
      </CollapsibleSection>
    </div>
  );
}
