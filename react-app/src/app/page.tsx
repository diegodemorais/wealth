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
import BrasilConcentrationCard from '@/components/dashboard/BrasilConcentrationCard';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import GeographicExposureChart from '@/components/dashboard/GeographicExposureChart';
import StackedAllocationBar from '@/components/dashboard/StackedAllocationBar';
import ETFRegionComposition from '@/components/dashboard/ETFRegionComposition';
import TrackingFireChart from '@/components/dashboard/TrackingFireChart';
import ScenarioCompare from '@/components/dashboard/ScenarioCompare';
import AlphaVsSWRDChart from '@/components/dashboard/AlphaVsSWRDChart';
import IpcaTaxaProgress from '@/components/dashboard/IpcaTaxaProgress';
import GlidePath from '@/components/dashboard/GlidePath';
import AttributionAnalysis from '@/components/dashboard/AttributionAnalysis';
import BondPoolRunway from '@/components/dashboard/BondPoolRunway';
import BondMaturityLadder from '@/components/dashboard/BondMaturityLadder';
import DrawdownHistoryChart from '@/components/dashboard/DrawdownHistoryChart';
import RollingMetricsChart from '@/components/dashboard/RollingMetricsChart';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import RebalancingStatus from '@/components/dashboard/RebalancingStatus';
import { DCAStatusGrid } from '@/components/dashboard/DCAStatusGrid';
import { BondPoolComposition } from '@/components/dashboard/BondPoolComposition';
import { CryptoBandChart } from '@/components/dashboard/CryptoBandChart';
import { WellnessActionsBox } from '@/components/dashboard/WellnessActionsBox';
import { FactorLoadingsTable } from '@/components/dashboard/FactorLoadingsTable';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { FireMatrixTable } from '@/components/dashboard/FireMatrixTable';
import { FamilyScenarioCards } from '@/components/dashboard/FamilyScenarioCards';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { LifeEventsTable } from '@/components/dashboard/LifeEventsTable';
import { EtfsPositionsTable } from '@/components/dashboard/EtfsPositionsTable';
import { FireSimulator } from '@/components/dashboard/FireSimulator';

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

      {/* Family Scenarios — Impact Analysis */}
      {data && data.fire_matrix && (
        <CollapsibleSection
          id="section-family-scenarios"
          title="Family Scenarios"
          defaultOpen={true}
          icon="👨‍👩‍👧"
        >
          <FamilyScenarioCards
            data={data.fire_matrix}
            pfireBase={derived?.pfire || 90}
            pfireFav={derived?.pfire || 90}
            pfireStress={derived?.pfireStress || 87}
          />
        </CollapsibleSection>
      )}

      {/* Life Events — Impact Analysis */}
      {data && data.lumpy_events && (
        <CollapsibleSection
          id="section-life-events"
          title="Life Events"
          defaultOpen={false}
          icon="📅"
        >
          <LifeEventsTable data={data.lumpy_events} />
        </CollapsibleSection>
      )}

      {/* ETF Positions — IBKR Holdings */}
      {data && data.posicoes && (
        <CollapsibleSection
          id="section-etf-positions"
          title="ETF Positions"
          defaultOpen={false}
          icon="📊"
        >
          <EtfsPositionsTable data={data.posicoes} />
        </CollapsibleSection>
      )}

      {/* FIRE Simulator — What-If Analysis */}
      {data && data.premissas && (
        <CollapsibleSection
          id="section-fire-simulator"
          title="FIRE Simulator"
          defaultOpen={false}
          icon="🎯"
        >
          <FireSimulator
            patrimonioAtual={data.premissas.patrimonio_atual}
            patrimonioGatilho={data.premissas.patrimonio_gatilho}
            aporteMensalBase={data.premissas.aporte_mensal}
            custoVidaBase={data.premissas.custo_vida_base}
            retornoEquityBase={data.premissas.retorno_equity_base}
            idadeAtual={data.premissas.idade_atual}
            idadeAposentadoria={data.premissas.idade_cenario_base}
            swrGatilho={data.pfire_base?.swr_percent ? data.pfire_base.swr_percent / 100 : 0.03}
          />
        </CollapsibleSection>
      )}

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

      {/* Tier-2: Bond Pool & Runway Management */}
      {derived && (
        <CollapsibleSection
          id="section-bond-runway"
          title="Bond Pool & Runway Management"
          defaultOpen={false}
          icon="🏛️"
        >
          {/* 4.1: Bond Pool Runway */}
          <BondPoolRunway
            poolCurrentValue={data?.fire?.bond_pool_readiness?.valor_atual_brl || 0}
            fireAnnualExpense={data?.premissas?.custo_vida_fire || 250000}
            expectedReturn={6.5}
            projectedYears={10}
            yearsToFire={Math.ceil((derived.fireMonthsAway || 0) / 12)}
            swrPercent={data?.pfire_base?.swr_percent || 3.5}
          />

          {/* 4.2: Bond Maturity Ladder */}
          {data && data.rf && (
            <BondMaturityLadder
              bonds1y={data.rf.ipca2040?.valor ? data.rf.ipca2040.valor * 0.1 : 0}
              bonds2y={data.rf.ipca2040?.valor ? data.rf.ipca2040.valor * 0.15 : 0}
              bonds3y={data.rf.ipca2040?.valor ? data.rf.ipca2040.valor * 0.20 : 0}
              bonds5y={data.rf.ipca2040?.valor ? data.rf.ipca2040.valor * 0.25 : 0}
              bonds10y={data.rf.ipca2050?.valor ? data.rf.ipca2050.valor * 0.20 : 0}
              bondsOver10y={data.rf.ipca2050?.valor ? data.rf.ipca2050.valor * 0.10 : 0}
              totalBonds={(data.rf.ipca2040?.valor || 0) + (data.rf.ipca2050?.valor || 0)}
            />
          )}
        </CollapsibleSection>
      )}

      {/* Tier-3: Performance & Attribution */}
      <CollapsibleSection
        id="section-performance"
        title="Performance & Attribution"
        defaultOpen={false}
        icon="📈"
      >
        {/* 3.1: Tracking FIRE */}
        {derived && (
          <TrackingFireChart
            realizadoBrl={derived.totalBrl || 0}
            projetadoP50Brl={derived.totalBrl * 1.1 || 0}
            fireGatilhoBrl={derived.firePatrimonioGatilho || 0}
            patrimonioAtualBrl={derived.totalBrl || 0}
          />
        )}

        {/* 3.2: Scenario Compare */}
        {data && data.pfire_base && data.pfire_aspiracional && (
          <ScenarioCompare
            baseScenario={{
              patrimonio50anos: (data.pfire_base?.patrimonio_50anos ?? 0),
              pfirePercentual: (data.pfire_base?.base ?? 90.4),
              swrPercent: (data.pfire_base?.swr_percent ?? 3.5),
              mesesParaFire: derived.fireMonthsAway || 0,
            }}
            aspirationalScenario={{
              patrimonio50anos: (data.pfire_aspiracional?.patrimonio_50anos ?? 0),
              pfirePercentual: (data.pfire_aspiracional?.aspirational ?? 95.2),
              swrPercent: (data.pfire_aspiracional?.swr_percent ?? 4.0),
              mesesParaFire: Math.max(0, (derived.fireMonthsAway || 0) - 6),
            }}
            currentPatrimonio={derived.totalBrl || 0}
          />
        )}

        {/* 3.3: Alpha vs SWRD */}
        {data && data.backtest?.performance && (
          <AlphaVsSWRDChart
            oneYear={data.backtest.performance.oneYear || { targetReturn: 11.2, swrdReturn: 10.5 }}
            threeYear={data.backtest.performance.threeYear || { targetReturn: 10.8, swrdReturn: 9.9 }}
            fiveYear={data.backtest.performance.fiveYear || { targetReturn: 10.4, swrdReturn: 9.2 }}
            tenYear={data.backtest.performance.tenYear || { targetReturn: 9.8, swrdReturn: 8.6 }}
            alphaLiquidoPctYear={data.backtest.alpha_liquido_pct_year || 0.0016}
          />
        )}

        {/* 3.4: IPCA+ Taxa & Progress */}
        {data && data.rf && (
          <IpcaTaxaProgress
            taxaAtual={data.rf.ipca_taxa_atual || 6.5}
            ipca2040Valor={data.rf.ipca2040?.valor || 0}
            ipca2040AlvoPercent={data.dca_status?.ipca2040?.alvo_pct || 25}
            ipca2040AtualPercent={(data.rf.ipca2040?.valor || 0) / (derived?.totalBrl || 1) * 100}
            ipca2050Valor={data.rf.ipca2050?.valor || 0}
            ipca2050AlvoPercent={data.dca_status?.ipca2050?.alvo_pct || 25}
            ipca2050AtualPercent={(data.rf.ipca2050?.valor || 0) / (derived?.totalBrl || 1) * 100}
            ipcaTotalBrl={derived?.ipcaTotalBrl || 0}
            totalPortfolio={derived?.totalBrl || 0}
          />
        )}

        {/* 3.5: Glide Path */}
        {derived && (
          <GlidePath
            currentAge={39}
            retirementAge={50}
            currentEquityPercent={(derived.equityPercentage || 0) * 100}
            currentRfPercent={(derived.rfPercentage || 0) * 100}
            retirementEquityPercent={40}
            retirementRfPercent={60}
          />
        )}

        {/* 3.6: Attribution Analysis */}
        {data && data.backtest?.attribution && (
          <AttributionAnalysis
            swrdAllocation={data.backtest.attribution.swrd_allocation || 50}
            swrdReturn={data.backtest.attribution.swrd_return || 10.5}
            avgsAllocation={data.backtest.attribution.avgs_allocation || 30}
            avgsReturn={data.backtest.attribution.avgs_return || 11.8}
            avemAllocation={data.backtest.attribution.avem_allocation || 20}
            avemReturn={data.backtest.attribution.avem_return || 12.4}
            rfAllocation={(derived?.rfPercentage || 0) * 100}
            rfReturn={6.5}
            totalReturn={11.2}
            periodLabel="1 ano"
          />
        )}

        {/* 3.7: Drawdown History */}
        {data && data.drawdown_history && (
          <DrawdownHistoryChart
            dates={data.drawdown_history.dates || []}
            drawdownPct={data.drawdown_history.drawdown_pct || []}
            maxDrawdown={data.drawdown_history.max_drawdown || 0}
          />
        )}

        {/* 3.8: Rolling Metrics */}
        {data && data.rolling_sharpe && (
          <RollingMetricsChart
            dates={data.rolling_sharpe.dates || []}
            sharpeBRL={data.rolling_sharpe.values || []}
            sharpeUSD={data.rolling_sharpe.values_usd || []}
            sortino={data.rolling_sharpe.sortino || []}
            volatilidade={data.rolling_sharpe.volatilidade || []}
          />
        )}
      </CollapsibleSection>

      {/* Tier-4: Spending & Rebalancing */}
      {data && data.spending_breakdown && (
        <CollapsibleSection
          id="section-spending"
          title="Spending Breakdown"
          defaultOpen={false}
          icon="💰"
        >
          <SpendingBreakdown
            musthave={(data.spending_breakdown.must_spend_mensal || 0) * 12}
            likes={(data.spending_breakdown.like_spend_mensal || 0) * 12}
            imprevistos={(data.spending_breakdown.imprevistos_mensal || 0) * 12}
            totalAnual={((data.spending_breakdown.must_spend_mensal || 0) + (data.spending_breakdown.like_spend_mensal || 0) + (data.spending_breakdown.imprevistos_mensal || 0)) * 12}
          />
        </CollapsibleSection>
      )}

      {/* Tier-4: Rebalancing Status */}
      {derived && data && data.pesosTarget && data.drift && (
        <CollapsibleSection
          id="section-rebalancing"
          title="Rebalancing Status"
          defaultOpen={false}
          icon="🔄"
        >
          <RebalancingStatus
            swrdTarget={data.pesosTarget[0] || 50}
            swrdCurrent={derived.swrdCurrent || 50}
            avgsTarget={data.pesosTarget[1] || 30}
            avgsCurrent={derived.avgsCurrent || 30}
            avemTarget={data.pesosTarget[2] || 20}
            avemCurrent={derived.avemCurrent || 20}
            ipcaTarget={data.pesosTarget[3] || 0}
            ipcaCurrent={(derived?.ipcaPercentage || 0) * 100}
            hodl11Target={data.pesosTarget[4] || 0}
            hodl11Current={(derived?.hodl11Percentage || 0) * 100}
            driftThresholdPp={3}
          />
        </CollapsibleSection>
      )}

      {/* Charts Section — ECharts Analysis & Projections */}
      {data && (
        <CollapsibleSection
          id="section-charts"
          title="Analysis & Projections"
          defaultOpen={false}
          icon="📈"
        >
          {data.tornado && <TornadoChart data={data} />}
          {data.timeline && <FanChart data={data} />}
          {data.timeline_attribution && <SankeyChart data={data} />}
        </CollapsibleSection>
      )}

      {/* FIRE Matrix — P(FIRE) by Patrimônio × Gasto */}
      {data && data.fire_matrix && (
        <CollapsibleSection
          id="section-fire-matrix"
          title="FIRE Matrix"
          defaultOpen={false}
          icon="🔥"
        >
          <FireMatrixTable data={data.fire_matrix} />
        </CollapsibleSection>
      )}

      {/* Monthly Returns Heatmap */}
      <CollapsibleSection
        id="section-monthly-heatmap"
        title="Monthly Returns"
        defaultOpen={false}
        icon="📅"
      >
        <MonthlyReturnsHeatmap data={data?.retorno_mensal_heatmap} />
      </CollapsibleSection>
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
