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

export default function PerformancePage() {
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
    return <div>Loading performance data...</div>;
  }

  return (
    <div>
      <h1>📈 Performance</h1>

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
