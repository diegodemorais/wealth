'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { BacktestR7Chart } from '@/components/charts/BacktestR7Chart';
import { DrawdownHistChart } from '@/components/charts/DrawdownHistChart';

export default function BacktestPage() {
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
    return <div>Loading backtest data...</div>;
  }

  return (
    <div>
      <h1>📊 Backtest</h1>

      <CollapsibleSection id="section-r7" title="Portfolio vs R7 Benchmark" defaultOpen={true}>
        <BacktestR7Chart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-drawdown" title="Drawdown Analysis" defaultOpen={true}>
        <DrawdownHistChart data={data} />
      </CollapsibleSection>
    </div>
  );
}
