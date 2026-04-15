'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { HistoricalReturnsTable } from '@/components/backtest/HistoricalReturnsTable';
import { BacktestR7Chart } from '@/components/charts/BacktestR7Chart';
import { DrawdownHistChart } from '@/components/charts/DrawdownHistChart';

export default function BacktestPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Loading backtest data...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Error loading backtest:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">⚠️ Data loaded but backtest section not ready</div>;
  }

  return (
    <div>
      <h1>📊 Backtest</h1>

      <HistoricalReturnsTable />

      <CollapsibleSection id="section-r7" title="Portfolio vs R7 Benchmark" defaultOpen={true}>
        <BacktestR7Chart data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="section-drawdown" title="Drawdown Analysis" defaultOpen={true}>
        <DrawdownHistChart data={data} />
      </CollapsibleSection>
    </div>
  );
}
