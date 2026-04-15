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
import { SemaforoTriggers } from '@/components/dashboard/SemaforoTriggers';
import { DCAStatusGrid } from '@/components/dashboard/DCAStatusGrid';
import { BondPoolComposition } from '@/components/dashboard/BondPoolComposition';

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);

  useEffect(() => {
    // Load data dynamically from public path
    // Use basePath + filename for GitHub Pages deployment
    const basePath = '/wealth/dash';
    const dataUrl = `${basePath}/data.json`;

    console.log('NOW page: fetching from', dataUrl);
    fetch(dataUrl)
      .then(r => {
        console.log('NOW page: fetch response', r.status, r.ok);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log('NOW page: data loaded, keys:', Object.keys(data).slice(0, 5));
        setData(data);
      })
      .catch(e => {
        console.error('NOW page: Failed to load data from', dataUrl, ':', e);
      });
  }, [setData]);

  if (!derived) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1>🕐 Now</h1>

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

      {/* Tier-1: Semáforos de Gatilhos */}
      {data && data.semaforo_triggers && (
        <CollapsibleSection
          id="section-semaforo"
          title="Semáforos de Gatilhos"
          defaultOpen={true}
          icon="🚦"
        >
          <SemaforoTriggers triggers={data.semaforo_triggers} />
        </CollapsibleSection>
      )}

      {/* Tier-1: DCA Status Grid */}
      {data && data.dca_status && (
        <CollapsibleSection
          id="section-dca"
          title="DCA Status"
          defaultOpen={true}
          icon="📊"
        >
          <DCAStatusGrid
            items={[
              {
                id: 'ipca2040',
                nome: 'TD IPCA+ 2040',
                regime: data.dca_status.ipca2040?.ativo ? 'ATIVO' : 'PAUSADO',
                taxa_atual: data.dca_status.ipca2040?.taxa_atual || 0,
                piso_compra: data.dca_status.ipca2040?.piso || 0,
                gap_pp: data.dca_status.ipca2040?.gap_pp || 0,
                pct_carteira_atual: data.dca_status.ipca2040?.pct_carteira_atual || 0,
                alvo_pct: data.dca_status.ipca2040?.alvo_pct || 0,
                proxima_acao: data.dca_status.ipca2040?.proxima_acao || '',
              },
              {
                id: 'ipca2050',
                nome: 'TD IPCA+ 2050',
                regime: data.dca_status.ipca2050?.ativo ? 'ATIVO' : 'PAUSADO',
                taxa_atual: data.dca_status.ipca2050?.taxa_atual || 0,
                piso_compra: data.dca_status.ipca2050?.piso || 0,
                gap_pp: data.dca_status.ipca2050?.gap_pp || 0,
                pct_carteira_atual: data.dca_status.ipca2050?.pct_carteira_atual || 0,
                alvo_pct: data.dca_status.ipca2050?.alvo_pct || 0,
                proxima_acao: data.dca_status.ipca2050?.proxima_acao || '',
              },
              {
                id: 'renda2065',
                nome: 'Renda+ 2065',
                regime: data.dca_status.renda_plus?.ativo ? 'ATIVO' : 'PAUSADO',
                taxa_atual: data.dca_status.renda_plus?.taxa_atual || 0,
                piso_compra: data.dca_status.renda_plus?.piso_compra || 0,
                piso_venda: data.dca_status.renda_plus?.piso_venda,
                gap_pp: data.dca_status.renda_plus?.gap_pp || 0,
                pct_carteira_atual: data.dca_status.renda_plus?.pct_carteira_atual || 0,
                alvo_pct: data.dca_status.renda_plus?.alvo_pct || 0,
                proxima_acao: data.dca_status.renda_plus?.proxima_acao || '',
              },
            ]}
          />
        </CollapsibleSection>
      )}

      {/* Tier-2: Bond Pool Composition */}
      {data && data.fire && (
        <CollapsibleSection
          id="section-bond-pool"
          title="Bond Pool Composition"
          defaultOpen={false}
          icon="🏦"
        >
          <BondPoolComposition
            data={data.fire.bond_pool_readiness}
            runwayAnosPosFire={data.bond_pool_runway?.anos_cobertura_pos_fire || 0}
            poolTotal={data.fire.bond_pool_readiness?.valor_atual_brl || 0}
          />
        </CollapsibleSection>
      )}

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
