'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { SimulatorParams } from '@/components/simulators/SimulatorParams';
// import { SimulationTrajectories } from '@/components/simulators/SimulationTrajectories'; // Uses Chart.js - disabled
import { SuccessRateCard } from '@/components/simulators/SuccessRateCard';
// import { DrawdownDistribution } from '@/components/simulators/DrawdownDistribution'; // Uses Chart.js - disabled

export default function SimulatorsPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const runMC = useDashboardStore(s => s.runMC);

  // Load data once
  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  // Run MC simulation when data is ready
  useEffect(() => {
    if (data && !isLoading && !dataError) {
      runMC();
    }
  }, [data, isLoading, dataError, runMC]);

  return (
    <div>
      <h1>🧪 Simulators</h1>
      <p className="text-muted" style={{ marginBottom: '24px' }}>
        Adjust parameters below to stress-test your FIRE plan. Results update in real-time.
      </p>

      <SimulatorParams />

      <div className="grid-2-col">
        <SuccessRateCard />
        {/* <DrawdownDistribution /> */}
      </div>

      {/* <SimulationTrajectories /> */}
    </div>
  );
}
