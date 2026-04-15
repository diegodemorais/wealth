'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TrackingFireChart } from '@/components/charts/TrackingFireChart';
import { NetWorthProjectionChart } from '@/components/charts/NetWorthProjectionChart';
import { EarliestFireCard } from '@/components/charts/EarliestFireCard';
import { EventosVidaChart } from '@/components/charts/EventosVidaChart';

export default function FirePage() {
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);

  useEffect(() => {
    if (!data) {
      const dataUrl = '/data.json';
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
    return <div>Loading FIRE data...</div>;
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
