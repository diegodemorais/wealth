'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TrackingFireChart } from '@/components/charts/TrackingFireChart';
import { NetWorthProjectionChart } from '@/components/charts/NetWorthProjectionChart';
import { EarliestFireCard } from '@/components/charts/EarliestFireCard';
import { EventosVidaChart } from '@/components/charts/EventosVidaChart';

export default function FirePage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Loading FIRE data...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Error loading FIRE:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">⚠️ Data loaded but FIRE section not ready</div>;
  }

  return (
    <div>
      <h1>🔥 FIRE</h1>

      <CollapsibleSection id="section-tracking" title="FIRE Target Tracking" defaultOpen={true}>
        <TrackingFireChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-projection" title="Net Worth Projection" defaultOpen={true}>
        <NetWorthProjectionChart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-earliest" title="Earliest FIRE Scenario" defaultOpen={true}>
        <EarliestFireCard />
      </CollapsibleSection>

      <CollapsibleSection id="section-milestones" title="Life Milestones" defaultOpen={false}>
        <EventosVidaChart data={data} />
      </CollapsibleSection>
    </div>
  );
}
