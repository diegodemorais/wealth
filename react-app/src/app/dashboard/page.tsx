'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import { KpiCard } from '@/components/primitives/KpiCard';
import { Semaforo } from '@/components/primitives/Semaforo';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TornadoChart } from '@/components/charts/TornadoChart';
import { FanChart } from '@/components/charts/FanChart';
import { SankeyChart } from '@/components/charts/SankeyChart';

export default function DashboardPage() {
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);

  useEffect(() => {
    // Load data dynamically from public path
    // Use window.location.origin to build the full URL to account for basePath
    const dataUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/wealth-dash/data.json`
      : '/wealth-dash/data.json';

    fetch(dataUrl)
      .then(r => r.json())
      .then(data => setData(data))
      .catch(e => console.error('Failed to load data from', dataUrl, ':', e));
  }, [setData]);

  if (!derived) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1>📡 Dashboard</h1>

      {/* Hero Strip */}
      <KpiHero
        networth={derived.networth}
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
      />

      {/* Wellness Status */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Wellness Status</h2>
        <Semaforo
          status={derived.wellnessStatus}
          label={`Portfolio Health: ${derived.wellnessStatus.toUpperCase()}`}
          description={`Wellness score: ${(derived.wellnessScore * 100).toFixed(0)}%`}
        />
      </section>

      {/* Key Metrics Grid */}
      <CollapsibleSection id="section-metrics" title="Key Metrics" defaultOpen={true}>
        <div style={styles.grid}>
          <KpiCard
            label="Equity Allocation"
            value={((derived.equityPercentage || 0) * 100).toFixed(1)}
            unit="%"
            icon="📊"
          />
          <KpiCard
            label="RF Allocation"
            value={((derived.rfPercentage || 0) * 100).toFixed(1)}
            unit="%"
            icon="🏦"
          />
          <KpiCard
            label="International Exposure"
            value={((derived.internationalPercentage || 0) * 100).toFixed(1)}
            unit="%"
            icon="🌍"
          />
          <KpiCard
            label="Brazil Concentration"
            value={((derived.concentrationBrazil || 0) * 100).toFixed(1)}
            unit="%"
            icon="🇧🇷"
            status={
              (derived.concentrationBrazil || 0) > 0.2 ? 'warning' : 'ok'
            }
          />
          <KpiCard
            label="Monthly Income"
            value={derived.monthlyIncome.toLocaleString('pt-BR')}
            unit="R$"
            icon="💵"
          />
          <KpiCard
            label="Yearly Expense"
            value={derived.yearlyExpense.toLocaleString('pt-BR')}
            unit="R$"
            icon="💸"
          />
        </div>
      </CollapsibleSection>

      {/* FIRE Countdown */}
      <CollapsibleSection id="section-fire" title="FIRE Countdown" defaultOpen={true}>
        <div style={styles.fireBox}>
          <h3>Target FIRE Date</h3>
          <p style={styles.largeDate}>
            {derived.fireDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p style={styles.subtitle}>
            {Math.floor(derived.fireMonthsAway / 12)} years,{' '}
            {derived.fireMonthsAway % 12} months away
          </p>
        </div>
      </CollapsibleSection>

      {/* Charts Section */}
      {data && (
        <CollapsibleSection
          id="section-charts"
          title="Analysis & Projections"
          defaultOpen={true}
          icon="📈"
        >
          <TornadoChart data={data} />
          <FanChart data={data} />
          <SankeyChart data={data} />
        </CollapsibleSection>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    padding: '16px 0',
  },
  fireBox: {
    backgroundColor: '#1f2937',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  largeDate: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '16px 0',
    color: '#fff',
  },
  subtitle: {
    color: '#9ca3af',
    margin: 0,
  },
  placeholder: {
    backgroundColor: '#1f2937',
    border: '1px dashed #4b5563',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};
