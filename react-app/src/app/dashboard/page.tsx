'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import { KpiCard } from '@/components/primitives/KpiCard';
import { Semaforo } from '@/components/primitives/Semaforo';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';

export default function DashboardPage() {
  const setData = useDashboardStore(s => s.setData);
  const derived = useDashboardStore(s => s.derived);

  useEffect(() => {
    // Load data dynamically from public path
    fetch('/data.json')
      .then(r => r.json())
      .then(data => setData(data))
      .catch(e => console.error('Failed to load data:', e));
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

      {/* Placeholder for charts - Phase 3 */}
      <CollapsibleSection
        id="section-charts"
        title="Charts (Coming in Phase 3)"
        defaultOpen={false}
        icon="📈"
      >
        <div style={styles.placeholder}>
          <p>🚀 Charts will be implemented in Phase 3</p>
          <ul>
            <li>Tornado sensitivity analysis</li>
            <li>Fan chart (uncertainty cone)</li>
            <li>Sankey allocation flow</li>
          </ul>
        </div>
      </CollapsibleSection>
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
