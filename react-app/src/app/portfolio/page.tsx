'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { DonutCharts } from '@/components/charts/DonutCharts';
import { StackedAllocChart } from '@/components/charts/StackedAllocChart';
import { GlidePathChart } from '@/components/charts/GlidePathChart';
import { HeatmapChart } from '@/components/charts/HeatmapChart';
import { BucketAllocationChart } from '@/components/charts/BucketAllocationChart';
import { TerChart } from '@/components/charts/TerChart';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { BrasilMonitorCard } from '@/components/portfolio/BrasilMonitorCard';
import { RFCryptoComposition } from '@/components/portfolio/RFCryptoComposition';
import { TaxAnalysisGrid } from '@/components/portfolio/TaxAnalysisGrid';

export default function PortfolioPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Loading portfolio data...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Error loading portfolio:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">⚠️ Data loaded but portfolio not ready</div>;
  }

  return (
    <div>
      <h1>🎯 Portfolio</h1>

      <CollapsibleSection id="section-allocation" title="Asset Allocation" defaultOpen={true}>
        <DonutCharts data={data} />
        <StackedAllocChart data={data} />
      </CollapsibleSection>

      <HoldingsTable />

      <BrasilMonitorCard />

      <RFCryptoComposition />

      <TaxAnalysisGrid />

      <CollapsibleSection id="section-glide" title="Lifecycle Planning" defaultOpen={false}>
        <GlidePathChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-correlation" title="Risk Analysis" defaultOpen={false}>
        <HeatmapChart data={data} />
        <BucketAllocationChart data={data} />
        <ConcentrationChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-costs" title="Cost Analysis" defaultOpen={false}>
        <TerChart data={data} />
      </CollapsibleSection>
    </div>
  );
}
