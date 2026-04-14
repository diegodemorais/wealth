'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { DonutCharts } from '@/components/charts/DonutCharts';
import { StackedAllocChart } from '@/components/charts/StackedAllocChart';
import { GlidePathChart } from '@/components/charts/GlidePathChart';
import { HeatmapChart } from '@/components/charts/HeatmapChart';
import { BucketAllocationChart } from '@/components/charts/BucketAllocationChart';
import { TerChart } from '@/components/charts/TerChart';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';

export default function PortfolioPage() {
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);

  useEffect(() => {
    if (!data) {
      fetch('/data.json')
        .then(r => r.json())
        .then(d => setData(d))
        .catch(e => console.error('Failed to load data:', e));
    }
  }, [data, setData]);

  if (!data) {
    return <div>Loading portfolio data...</div>;
  }

  return (
    <div>
      <h1>🎯 Portfolio</h1>

      <CollapsibleSection id="section-allocation" title="Asset Allocation" defaultOpen={true}>
        <DonutCharts data={data} />
        <StackedAllocChart data={data} />
      </CollapsibleSection>

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
