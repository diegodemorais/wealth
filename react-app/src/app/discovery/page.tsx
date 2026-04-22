'use client';

/**
 * Discovery — componentes órfãos renderizados com dados reais.
 * Diego decide: integrar a uma aba permanente ou deletar.
 */

import { usePageData } from '@/hooks/usePageData';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// Chart components (Pattern 1: data prop)
import { TornadoChart } from '@/components/charts/TornadoChart';
import { HeatmapChart } from '@/components/charts/HeatmapChart';
import { ShadowChart } from '@/components/charts/ShadowChart';
import { RollingSharpChart } from '@/components/charts/RollingSharpChart';
import { DrawdownHistChart } from '@/components/charts/DrawdownHistChart';
import { FanChart } from '@/components/charts/FanChart';
import { StackedAllocChart } from '@/components/charts/StackedAllocChart';
import { IncomeChart } from '@/components/charts/IncomeChart';
import { BucketAllocationChart } from '@/components/charts/BucketAllocationChart';
import { TerChart } from '@/components/charts/TerChart';

// Dashboard feature components (Pattern 2: individual props)
import { FactorLoadingsTable } from '@/components/dashboard/FactorLoadingsTable';
import { BtcFIREProjectionCard } from '@/components/dashboard/BtcFIREProjectionCard';
import BondLadderTimeline from '@/components/dashboard/BondLadderTimeline';
import BondMaturityLadder from '@/components/dashboard/BondMaturityLadder';
import { BondPoolComposition } from '@/components/dashboard/BondPoolComposition';
import AttributionAnalysis from '@/components/dashboard/AttributionAnalysis';
import IRShield from '@/components/dashboard/IRShield';
import TLHMonitor from '@/components/dashboard/TLHMonitor';
import TaxDeferralClock from '@/components/dashboard/TaxDeferralClock';
import SoRRBondTentTrigger from '@/components/dashboard/SoRRBondTentTrigger';
import CAPEAportePriority from '@/components/dashboard/CAPEAportePriority';
import { LifeEventsTable } from '@/components/dashboard/LifeEventsTable';

// Store-based components (Pattern 3: no props)
import { NetWorthTable } from '@/components/performance/NetWorthTable';
import { BrasilMonitorCard } from '@/components/portfolio/BrasilMonitorCard';
import { TaxAnalysisGrid } from '@/components/portfolio/TaxAnalysisGrid';

function NoData({ name }: { name: string }) {
  return (
    <div style={{ padding: 16, color: 'var(--muted)', fontSize: 13, textAlign: 'center', background: 'var(--bg)', borderRadius: 6 }}>
      {name}: dados indisponíveis em data.json
    </div>
  );
}

function DiscLabel({ target }: { target: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
      backgroundColor: 'var(--card2)', color: 'var(--muted)', border: '1px solid var(--border)',
      textTransform: 'uppercase' as const, letterSpacing: '0.03em', marginLeft: 8,
    }}>
      → {target}
    </span>
  );
}

export default function DiscoveryPage() {
  const { data, derived, isLoading, dataError } = usePageData();

  const guard = pageStateElement({ isLoading, dataError, data });
  if (guard) return guard;

  // Extract data for complex props
  const d = data as any;
  const rf = d?.rf ?? {};
  const tax = d?.tax ?? {};
  const premissas = d?.premissas ?? {};
  const hodl11 = d?.hodl11 ?? {};
  const posicoes = d?.posicoes ?? {};
  const cambio = d?.cambio ?? 5.0;
  const factorLoadings = d?.factor_loadings;
  const btcProjection = hodl11?.fire_projection;
  const tlhLotes = d?.ibkr_tlh?.lotes ?? d?.tlh_lotes ?? [];
  const lifeEvents = d?.life_events;

  // Attribution: extract from posicoes + backtest metrics
  const bt = d?.backtest?.metrics ?? {};
  const totalEquity = Object.values(posicoes).reduce((s: number, p: any) => s + (p?.valor_brl ?? 0), 0) as number;
  const rfTotal = (rf.ipca2029?.valor ?? 0) + (rf.ipca2040?.valor ?? 0) + (rf.ipca2050?.valor ?? 0) + (rf.renda2065?.valor ?? 0);
  const grandTotal = totalEquity + rfTotal;

  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Componentes órfãos renderizados com dados reais. Decida: integrar ou deletar.
        </p>
      </div>

      {/* ══════════════════ CHARTS ══════════════════ */}

      <CollapsibleSection id="disc-tornado-sensibilidade-fire" title="Tornado — Sensibilidade FIRE" defaultOpen={true}>
        <DiscLabel target="FIRE" />
        {d?.tornado?.length > 0 ? <TornadoChart data={data!} /> : <NoData name="tornado" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-fan-chart-proje-o-probabil-stica" title="Fan Chart — Projeção Probabilística">
        <DiscLabel target="FIRE / Withdraw" />
        <FanChart data={data!} />
      </CollapsibleSection>

      <CollapsibleSection id="disc-shadow-portfolio-real-vs-benchmark" title="Shadow Portfolio — Real vs Benchmark">
        <DiscLabel target="Performance" />
        {d?.backtest?.shadowA ? <ShadowChart data={data!} /> : <NoData name="backtest.shadowA" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-rolling-sharpe-ratio" title="Rolling Sharpe Ratio">
        <DiscLabel target="Backtest" />
        {d?.rolling_sharpe ? <RollingSharpChart data={data!} /> : <NoData name="rolling_sharpe" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-heatmap-factor-loadings-por-etf" title="Heatmap — Factor Loadings por ETF">
        <DiscLabel target="Performance" />
        {d?.etf_composition ? <HeatmapChart data={data!} /> : <NoData name="etf_composition" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-drawdown-hist-rico-echarts" title="Drawdown Histórico (ECharts)">
        <DiscLabel target="Backtest" />
        {d?.drawdown_history ? <DrawdownHistChart data={data!} /> : <NoData name="drawdown_history" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-stacked-allocation-evolu-o-drift" title="Stacked Allocation — Evolução Drift">
        <DiscLabel target="Portfolio" />
        <StackedAllocChart data={data!} />
      </CollapsibleSection>

      <CollapsibleSection id="disc-income-chart-renda-na-aposentadoria" title="Income Chart — Renda na Aposentadoria">
        <DiscLabel target="Withdraw" />
        <IncomeChart data={data!} />
      </CollapsibleSection>

      <CollapsibleSection id="disc-bucket-allocation" title="Bucket Allocation">
        <DiscLabel target="Withdraw" />
        <BucketAllocationChart data={data!} />
      </CollapsibleSection>

      <CollapsibleSection id="disc-ter-comparison" title="TER Comparison">
        <DiscLabel target="Portfolio" />
        <TerChart data={data!} />
      </CollapsibleSection>

      {/* ══════════════════ FACTOR & PERFORMANCE ══════════════════ */}

      <CollapsibleSection id="disc-factor-loadings-table-ff5-por-etf" title="Factor Loadings Table — FF5 por ETF">
        <DiscLabel target="Performance" />
        {factorLoadings ? <FactorLoadingsTable data={factorLoadings} /> : <NoData name="factor_loadings" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-attribution-analysis" title="Attribution Analysis">
        <DiscLabel target="Performance" />
        <AttributionAnalysis
          swrdAllocation={grandTotal > 0 ? ((posicoes.SWRD?.valor_brl ?? 0) / grandTotal) * 100 : 0}
          swrdReturn={bt.cagr_target ?? 0}
          avgsAllocation={grandTotal > 0 ? (((posicoes.AVGS?.valor_brl ?? 0) + (posicoes.AVUV?.valor_brl ?? 0) + (posicoes.AVDV?.valor_brl ?? 0)) / grandTotal) * 100 : 0}
          avgsReturn={bt.cagr_target ?? 0}
          avemAllocation={grandTotal > 0 ? (((posicoes.AVEM?.valor_brl ?? 0) + (posicoes.EIMI?.valor_brl ?? 0) + (posicoes.AVES?.valor_brl ?? 0)) / grandTotal) * 100 : 0}
          avemReturn={bt.cagr_target ?? 0}
          rfAllocation={grandTotal > 0 ? (rfTotal / grandTotal) * 100 : 0}
          rfReturn={0}
          totalReturn={bt.cagr_target ?? 0}
          periodLabel="Backtest"
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-net-worth-table-patrim-nio-anual" title="Net Worth Table — Patrimônio Anual">
        <DiscLabel target="Performance" />
        <NetWorthTable />
      </CollapsibleSection>

      {/* ══════════════════ BOND STRATEGY ══════════════════ */}

      <CollapsibleSection id="disc-bond-ladder-timeline" title="Bond Ladder Timeline">
        <DiscLabel target="Withdraw" />
        <BondLadderTimeline
          ipca2029={rf.ipca2029 ? { valor: rf.ipca2029.valor, taxa: rf.ipca2029.taxa } : undefined}
          ipca2040={rf.ipca2040 ? { valor: rf.ipca2040.valor, taxa: rf.ipca2040.taxa } : undefined}
          ipca2050={rf.ipca2050 ? { valor: rf.ipca2050.valor, taxa: rf.ipca2050.taxa } : undefined}
          renda2065={rf.renda2065 ? { valor: rf.renda2065.valor, taxa: rf.renda2065.taxa } : undefined}
          custoVidaMensal={premissas.custo_vida_base ? premissas.custo_vida_base / 12 : 20000}
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-bond-maturity-ladder" title="Bond Maturity Ladder">
        <DiscLabel target="Withdraw" />
        <BondMaturityLadder
          bonds1y={0}
          bonds2y={rf.ipca2029?.valor ?? 0}
          bonds3y={0}
          bonds5y={0}
          bonds10y={rf.ipca2040?.valor ?? 0}
          bondsOver10y={(rf.ipca2050?.valor ?? 0) + (rf.renda2065?.valor ?? 0)}
          totalBonds={rfTotal}
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-bond-pool-composition" title="Bond Pool Composition">
        <DiscLabel target="Withdraw" />
        {d?.bond_pool ? (
          <BondPoolComposition data={d.bond_pool} />
        ) : (
          <BondPoolComposition
            data={{
              valor_atual_brl: rfTotal,
              anos_gastos: rfTotal / (premissas.custo_vida_base ?? 250000),
              meta_anos: 7,
              status: 'on_track' as const,
              composicao: {
                ipca2029: rf.ipca2029?.valor,
                ipca2040: rf.ipca2040?.valor,
                ipca2050: rf.ipca2050?.valor,
              },
            }}
          />
        )}
      </CollapsibleSection>

      {/* ══════════════════ TAX & TLH ══════════════════ */}

      <CollapsibleSection id="disc-tax-deferral-clock" title="Tax Deferral Clock">
        <DiscLabel target="Assumptions" />
        <TaxDeferralClock
          irDiferidoTotal={tax.ir_diferido_total_brl ?? 0}
          patrimonioTotal={premissas.patrimonio_atual ?? 0}
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-ir-shield-tlh-opportunities" title="IR Shield — TLH Opportunities">
        <DiscLabel target="Portfolio" />
        {tlhLotes.length > 0 ? (
          <IRShield
            irDiferidoTotal={tax.ir_diferido_total_brl ?? 0}
            patrimonioTotal={premissas.patrimonio_atual ?? 0}
            lotes={tlhLotes}
            gatilho={0.05}
            cambio={cambio}
          />
        ) : <NoData name="tlh_lotes / ibkr_tlh" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-tlh-monitor" title="TLH Monitor">
        <DiscLabel target="Portfolio" />
        {tlhLotes.length > 0 ? (
          <TLHMonitor lotes={tlhLotes} gatilho={0.05} cambio={cambio} />
        ) : <NoData name="tlh_lotes / ibkr_tlh" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-tax-analysis-grid" title="Tax Analysis Grid">
        <DiscLabel target="Portfolio" />
        <TaxAnalysisGrid />
      </CollapsibleSection>

      {/* ══════════════════ FIRE & APOSENTADORIA ══════════════════ */}

      <CollapsibleSection id="disc-btc-fire-projection" title="BTC FIRE Projection">
        <DiscLabel target="FIRE" />
        {btcProjection ? (
          <BtcFIREProjectionCard
            hodl11BrlAtual={btcProjection.hodl11_brl_atual}
            btcAtualUsd={btcProjection.btc_atual_usd}
            cenarios={btcProjection.cenarios}
          />
        ) : <NoData name="hodl11.fire_projection" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-sorr-bond-tent-trigger" title="SoRR Bond Tent Trigger">
        <DiscLabel target="Withdraw" />
        <SoRRBondTentTrigger
          idadeAtual={premissas.idade_atual ?? 39}
          idadeFire={premissas.idade_cenario_base ?? 53}
          rfPctAtual={grandTotal > 0 ? rfTotal / grandTotal : undefined}
          patrimonioAtual={premissas.patrimonio_atual ?? 0}
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-life-events-table" title="Life Events Table">
        <DiscLabel target="FIRE" />
        {lifeEvents ? <LifeEventsTable data={lifeEvents} /> : <NoData name="life_events" />}
      </CollapsibleSection>

      {/* ══════════════════ APORTE & MONITORAMENTO ══════════════════ */}

      <CollapsibleSection id="disc-cape-aporte-priority" title="CAPE Aporte Priority">
        <DiscLabel target="NOW" />
        {d?.cape_aporte ? (
          <CAPEAportePriority etfs={d.cape_aporte} />
        ) : (
          <CAPEAportePriority etfs={[
            { ticker: 'SWRD', atual: 50, alvo: 50, expectedReturn: 3.4 },
            { ticker: 'AVGS', atual: 30, alvo: 30, expectedReturn: 5.0 },
            { ticker: 'AVEM', atual: 20, alvo: 20, expectedReturn: 9.0 },
          ]} />
        )}
      </CollapsibleSection>

      <CollapsibleSection id="disc-brasil-monitor-card" title="Brasil Monitor Card">
        <DiscLabel target="Portfolio" />
        <BrasilMonitorCard />
      </CollapsibleSection>
    </div>
  );
}
