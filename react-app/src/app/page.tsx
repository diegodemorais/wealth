'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { withBasePath } from '@/utils/basePath';
import { KpiHero } from '@/components/primitives/KpiHero';
import { KpiCard } from '@/components/primitives/KpiCard';
import { Semaforo } from '@/components/primitives/Semaforo';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
// Chart imports temporarily disabled
// import { TornadoChart } from '@/components/charts/TornadoChart';
// import { FanChart } from '@/components/charts/FanChart';
// import { SankeyChart } from '@/components/charts/SankeyChart';
import SemaforoGatilhos from '@/components/dashboard/SemaforoGatilhos';
import FireProgressWellness from '@/components/dashboard/FireProgressWellness';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import FinancialWellnessActions from '@/components/dashboard/FinancialWellnessActions';
import BrasilConcentrationCard from '@/components/dashboard/BrasilConcentrationCard';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import GeographicExposureChart from '@/components/dashboard/GeographicExposureChart';
import StackedAllocationBar from '@/components/dashboard/StackedAllocationBar';
import ETFRegionComposition from '@/components/dashboard/ETFRegionComposition';
import { DCAStatusGrid } from '@/components/dashboard/DCAStatusGrid';
import { BondPoolComposition } from '@/components/dashboard/BondPoolComposition';
import { CryptoBandChart } from '@/components/dashboard/CryptoBandChart';
import { WellnessActionsBox } from '@/components/dashboard/WellnessActionsBox';
import { FactorLoadingsTable } from '@/components/dashboard/FactorLoadingsTable';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const setData = useDashboardStore(s => s.setData);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);

  useEffect(() => {
    // Load data dynamically from public path
    // basePath is configured in next.config.ts and injected via env var
    const dataUrl = withBasePath('/data.json');

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
        networthUsd={derived.networthUsd}
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
        pfire={derived.pfire}
        cambio={derived.CAMBIO}
      />

      {/* Time to FIRE Progress Bar */}
      <TimeToFireProgressBar
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
      />

      {/* FIRE Progress & Wellness */}
      <section style={{ marginBottom: '30px' }}>
        <FireProgressWellness
          firePercentage={derived.firePercentage}
          firePatrimonioAtual={derived.firePatrimonioAtual}
          firePatrimonioGatilho={derived.firePatrimonioGatilho}
          swrFireDay={derived.swrFireDay}
          wellnessScore={derived.wellnessScore * 100}
          wellnessLabel={derived.wellnessLabel}
          wellnessMetrics={derived.wellnessMetrics}
        />
      </section>

      {/* Wellness Actions */}
      {data && data.wellness_config && (
        <CollapsibleSection
          id="section-wellness-actions"
          title="Wellness Actions"
          defaultOpen={true}
          icon="🎯"
        >
          <WellnessActionsBox
            wellnessConfig={data.wellness_config}
            pfire={data.pfire_base?.base}
            driftMaxPp={(() => {
              if (!data.drift) return undefined;
              const driftVals = Object.values(data.drift) as Array<{ atual: number; alvo: number }>;
              return Math.max(...driftVals.map(d =>
                (typeof d?.atual === 'number' && typeof d?.alvo === 'number')
                  ? Math.abs(d.atual - d.alvo)
                  : 0
              ));
            })()}
            savingsRate={(() => {
              const aporte = data.premissas?.aporte_mensal;
              const custo = data.premissas?.custo_vida_base;
              if (typeof aporte !== 'number' || typeof custo !== 'number' || custo === 0) return undefined;
              return aporte / (aporte + custo / 12);
            })()}
            ipcaGapPp={(() => {
              if (!data.drift?.IPCA) return undefined;
              return Math.abs((data.drift.IPCA.atual || 0) - (data.drift.IPCA.alvo || 0));
            })()}
            dcaActive={data.dca_status?.ipca2040?.ativo === true || data.dca_status?.ipca2050?.ativo === true}
          />
        </CollapsibleSection>
      )}

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
      {derived && derived.gatilhos && (
        <SemaforoGatilhos
          gatilhos={derived.gatilhos}
          resumo={derived.resumoGatilhos}
          statusIpca={derived.statusIpca}
        />
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

      {/* Tier-1: Aporte do Mês */}
      {derived && (
        <AporteDoMes
          aporteMensal={derived.aporteMensal}
          ultimoAporte={derived.ultimoAporte}
          ultimoAporteData={derived.ultimoAporteData}
          acumuladoMes={derived.acumuladoMes}
          acumuladoAno={derived.acumuladoAno}
        />
      )}

      {/* Tier-1: P(FIRE) Monte Carlo + Tornado */}
      {derived && (
        <PFireMonteCarloTornado
          pfireBase={derived.pfireBase}
          pfireFav={derived.pfireFav}
          pfireStress={derived.pfireStress}
          tornadoData={derived.tornadoData}
        />
      )}

      {/* Tier-1: Financial Wellness & Actions */}
      {derived && (
        <FinancialWellnessActions
          wellnessScore={derived.wellnessScore * 100}
          wellnessLabel={derived.wellnessLabel}
          topAcoes={derived.topAcoes}
        />
      )}

      {/* Tier-1: HODL11 Crypto Band */}
      {data && data.hodl11 && data.hodl11.banda && (
        <CollapsibleSection
          id="section-crypto-band"
          title="HODL11 — Crypto Band"
          defaultOpen={true}
          icon="₿"
        >
          <CryptoBandChart
            banda={data.hodl11.banda}
            valor={typeof data.hodl11.valor === 'number' ? data.hodl11.valor : undefined}
            pnl_pct={typeof data.hodl11.pnl_pct === 'number' ? data.hodl11.pnl_pct : undefined}
          />
        </CollapsibleSection>
      )}

      {/* Tier-2: Brasil Concentration Card */}
      {derived && (
        <BrasilConcentrationCard
          hodl11={derived.cryptoBrl || 0}
          ipcaTotal={derived.ipcaTotalBrl || 0}
          rendaPlus={data?.rf?.renda2065?.valor || 0}
          cryptoLegado={derived.cryptoLegado || 0}
          totalBrl={derived.totalBrl || 0}
          concentrationBrazil={derived.concentrationBrazil || 0}
        />
      )}

      {/* Tier-2: Cash Flow Sankey */}
      {derived && (
        <CashFlowSankey
          aporteMensal={derived.aporteMensal}
          ipcaFlow={derived.ipcaFlowMonthly}
          equityFlow={derived.equityFlowMonthly}
          rendaPlusFlow={derived.rendaPlusFlowMonthly}
          cryptoFlow={derived.cryptoFlowMonthly}
        />
      )}

      {/* Tier-2: Geographic Exposure Chart */}
      {derived && (
        <GeographicExposureChart
          usa={derived.geoUS || 0}
          europe={derived.geoDM || 0}
          japan={0}
          otherDm={0}
          em={derived.geoEM || 0}
          totalUsd={derived.totalEquityUsd || 0}
        />
      )}

      {/* Tier-2: Stacked Allocation Bar */}
      {derived && (
        <StackedAllocationBar
          equityBrl={derived.totalEquityUsd * derived.CAMBIO || 0}
          ipcaBrl={derived.ipcaTotalBrl || 0}
          rendaPlusBrl={data?.rf?.renda2065?.valor || 0}
          cryptoBrl={derived.cryptoBrl || 0}
          totalBrl={derived.totalBrl || 0}
        />
      )}

      {/* Tier-2: ETF Region Composition */}
      {data && data.etf_composition && (
        <ETFRegionComposition
          swrd={data.etf_composition.swrd}
          avgs={data.etf_composition.avgs}
          avem={data.etf_composition.avem}
        />
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

      {/* Tier-2: Factor Loadings */}
      {data && data.factor_loadings && (
        <CollapsibleSection
          id="section-factor-loadings"
          title="Factor Loadings"
          defaultOpen={false}
          icon="📐"
        >
          <FactorLoadingsTable data={data.factor_loadings} />
        </CollapsibleSection>
      )}

      {/* Charts Section - TODO: Fix missing data references */}
      {/* Temporarily disabled due to missing data fields in data.json
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
      */}
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
