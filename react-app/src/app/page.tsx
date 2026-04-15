'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { KpiHero } from '@/components/primitives/KpiHero';
import { KpiCard } from '@/components/primitives/KpiCard';
import { Semaforo } from '@/components/primitives/Semaforo';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TornadoChart } from '@/components/charts/TornadoChart';
import { FanChart } from '@/components/charts/FanChart';
import { SankeyChart } from '@/components/charts/SankeyChart';
import SemaforoGatilhos from '@/components/dashboard/SemaforoGatilhos';
import FireProgressWellness from '@/components/dashboard/FireProgressWellness';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { FireMatrixTable } from '@/components/dashboard/FireMatrixTable';
import { FamilyScenarioCards } from '@/components/dashboard/FamilyScenarioCards';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { LifeEventsTable } from '@/components/dashboard/LifeEventsTable';
import { EtfsPositionsTable } from '@/components/dashboard/EtfsPositionsTable';
import { FireSimulator } from '@/components/dashboard/FireSimulator';

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    // Use singleton pattern to load data once and cache it
    loadDataOnce().catch(e => {
      console.error('NOW page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Loading dashboard data...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Error loading dashboard:</strong> {dataError}
      </div>
    );
  }

  if (!derived) {
    return <div className="warning-state">⚠️ Data loaded but derived values not computed</div>;
  }

  return (
    <div>
      <h1>🕐 Now</h1>

      {/* 1. HERO STRIP — Patrimônio, Anos FIRE, Progresso, [vazio] */}
      <KpiHero
        networth={derived.networth}
        networthUsd={derived.networthUsd}
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
        pfire={derived.pfire}
        cambio={derived.CAMBIO}
      />

      {/* 2. KPI GRID: Indicadores Primários — P(Aspiracional), Drift Máx, Aporte Mês */}
      <CollapsibleSection id="section-indicators" title="Primary Indicators" defaultOpen={true}>
        <div style={styles.grid}>
          <KpiCard
            label="P(Aspiracional)"
            value={derived.pfireAspiracional?.toFixed(1)}
            unit="%"
            icon="🚀"
          />
          <KpiCard
            label="Max Drift"
            value={Math.max(0, ...(data?.drift ? Object.values(data.drift as Record<string, any>).map(d => Math.abs((d?.atual || 0) - (d?.alvo || 0))) : [0])).toFixed(2)}
            unit="pp"
            icon="📊"
          />
          <KpiCard
            label="Monthly Contribution"
            value={derived.aporteMensal.toLocaleString('pt-BR')}
            unit="R$"
            icon="💰"
          />
        </div>
      </CollapsibleSection>

      {/* 3. KPI GRID: Contexto Mercado — Dólar, Bitcoin, IPCA+ 2040, Renda+ 2065 */}
      <CollapsibleSection id="section-market-context" title="Market Context" defaultOpen={true}>
        <div style={styles.grid}>
          <KpiCard
            label="USD/BRL"
            value={derived.CAMBIO?.toFixed(2)}
            unit="₽"
            icon="💵"
          />
          <KpiCard
            label="Bitcoin"
            value={data?.hodl11?.pnl_pct?.toFixed(1)}
            unit="%"
            icon="₿"
            status={(data?.hodl11?.pnl_pct || 0) >= 0 ? 'ok' : 'warning'}
          />
          <KpiCard
            label="IPCA+ 2040 Rate"
            value={data?.rf?.ipca2040?.taxa?.toFixed(2)}
            unit="%"
            icon="📈"
          />
          <KpiCard
            label="Renda+ 2065 Rate"
            value={data?.rf?.renda2065?.taxa?.toFixed(2)}
            unit="%"
            icon="📈"
          />
        </div>
      </CollapsibleSection>

      {/* 4. SEÇÃO: Time to FIRE — Big number + Progresso */}
      <TimeToFireProgressBar
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
      />

      {/* 5. SEÇÃO: Semáforos de Gatilhos [COLLAPSIBLE, CRITICAL] */}
      {derived && derived.gatilhos && (
        <SemaforoGatilhos
          gatilhos={derived.gatilhos}
          resumo={derived.resumoGatilhos}
          statusIpca={derived.statusIpca}
        />
      )}

      {/* 6. GRID 2-COL: Progresso FIRE + Aporte do Mês */}
      <div style={styles.grid2col}>
        <FireProgressWellness
          firePercentage={derived.firePercentage}
          firePatrimonioAtual={derived.firePatrimonioAtual}
          firePatrimonioGatilho={derived.firePatrimonioGatilho}
          swrFireDay={derived.swrFireDay}
          wellnessScore={derived.wellnessScore * 100}
          wellnessLabel={derived.wellnessLabel}
          wellnessMetrics={derived.wellnessMetrics}
        />
        {derived && (
          <AporteDoMes
            aporteMensal={derived.aporteMensal}
            ultimoAporte={derived.ultimoAporte}
            ultimoAporteData={derived.ultimoAporteData}
            acumuladoMes={derived.acumuladoMes}
            acumuladoAno={derived.acumuladoAno}
          />
        )}
      </div>

      {/* 7. SEÇÃO: P(FIRE) — Monte Carlo + Tornado [GRID 2-COL] */}
      {derived && (
        <PFireMonteCarloTornado
          pfireBase={derived.pfireBase}
          pfireFav={derived.pfireFav}
          pfireStress={derived.pfireStress}
          tornadoData={derived.tornadoData}
        />
      )}

      {/* 8. SEÇÃO: Macro Context [COLLAPSIBLE, OPEN] */}
      <CollapsibleSection id="section-macro" title="Macro Context" defaultOpen={true}>
        <div style={styles.grid}>
          <KpiCard label="Selic Rate" value={data?.premissas?.taxa_selic?.toFixed(1)} unit="%" icon="🏦" />
          <KpiCard label="IPCA YTD" value="—" unit="%" icon="📊" />
          <KpiCard label="FX Volatility" value="—" unit="pp" icon="📈" />
        </div>
      </CollapsibleSection>

      {/* 9. SEÇÃO: Sankey Chart [COLLAPSIBLE, OPEN] */}
      {derived && (
        <CollapsibleSection id="section-sankey" title="Cash Flow Analysis" defaultOpen={true}>
          <CashFlowSankey
            aporteMensal={derived.aporteMensal}
            ipcaFlow={derived.ipcaFlowMonthly}
            equityFlow={derived.equityFlowMonthly}
            rendaPlusFlow={derived.rendaPlusFlowMonthly}
            cryptoFlow={derived.cryptoFlowMonthly}
          />
        </CollapsibleSection>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
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
