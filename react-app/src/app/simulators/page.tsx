'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { SimulatorParams } from '@/components/simulators/SimulatorParams';
// import { SimulationTrajectories } from '@/components/simulators/SimulationTrajectories'; // Uses Chart.js - disabled
import { SuccessRateCard } from '@/components/simulators/SuccessRateCard';
// import { DrawdownDistribution } from '@/components/simulators/DrawdownDistribution'; // Uses Chart.js - disabled

export default function SimulatorsPage() {
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);
  const runMC = useDashboardStore(s => s.runMC);

  useEffect(() => {
    if (!data) {
      const dataUrl = withBasePath('/data.json');
      fetch(dataUrl)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(d => {
          setData(d);
          // Run initial simulation with default params
          runMC();
        })
        .catch(e => console.error('Failed to load data:', e));
    } else {
      // Run initial simulation if not already done
      runMC();
    }
  }, [data, setData, runMC]);

  return (
    <div>
      <h1>🧪 Simulators</h1>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Adjust parameters below to stress-test your FIRE plan. Results update in real-time.
      </p>

      <SimulatorParams />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <SuccessRateCard />
        {/* <DrawdownDistribution /> */}
      </div>

      {/* <SimulationTrajectories /> */}
    </div>
  );
}
