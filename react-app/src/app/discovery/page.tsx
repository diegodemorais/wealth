'use client';

/**
 * Discovery — 17 componentes únicos renderizados com dados reais.
 * Duplicados já removidos (RollingSharp, Heatmap, DrawdownHist,
 * StackedAlloc, Income, BondPoolComposition, SoRR, CAPEAporte).
 */

import { usePageData } from '@/hooks/usePageData';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// Chart components
import { TornadoChart } from '@/components/charts/TornadoChart';
import { ShadowChart } from '@/components/charts/ShadowChart';
import { FanChart } from '@/components/charts/FanChart';
import { BucketAllocationChart } from '@/components/charts/BucketAllocationChart';
import { TerChart } from '@/components/charts/TerChart';

// Dashboard feature components
import { FactorLoadingsTable } from '@/components/dashboard/FactorLoadingsTable';
import { BtcFIREProjectionCard } from '@/components/dashboard/BtcFIREProjectionCard';
import BondLadderTimeline from '@/components/dashboard/BondLadderTimeline';
import BondMaturityLadder from '@/components/dashboard/BondMaturityLadder';
import AttributionAnalysis from '@/components/dashboard/AttributionAnalysis';
import IRShield from '@/components/dashboard/IRShield';
import TLHMonitor from '@/components/dashboard/TLHMonitor';
import TaxDeferralClock from '@/components/dashboard/TaxDeferralClock';
import { LifeEventsTable } from '@/components/dashboard/LifeEventsTable';

// Store-based components
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

  const bt = d?.backtest?.metrics ?? {};
  const totalEquity = Object.values(posicoes).reduce((s: number, p: any) => s + (p?.valor_brl ?? 0), 0) as number;
  const rfTotal = (rf.ipca2029?.valor ?? 0) + (rf.ipca2040?.valor ?? 0) + (rf.ipca2050?.valor ?? 0) + (rf.renda2065?.valor ?? 0);
  const grandTotal = totalEquity + rfTotal;

  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          17 componentes únicos — decida: integrar a uma aba permanente ou deletar.
        </p>
      </div>

      {/* ══════════════════ CHARTS ══════════════════ */}

      <CollapsibleSection id="disc-tornado" title="Tornado — Sensibilidade FIRE" defaultOpen={true}>
        <DiscLabel target="FIRE" />
        {d?.tornado?.length > 0 ? <TornadoChart data={data!} /> : <NoData name="tornado" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-fan" title="Fan Chart — Projeção Probabilística">
        <DiscLabel target="FIRE / Withdraw" />
        <FanChart data={data!} />
      </CollapsibleSection>

      <CollapsibleSection id="disc-shadow" title="Shadow Portfolio — Real vs Benchmark">
        <DiscLabel target="Performance" />
        {d?.backtest?.shadowA ? <ShadowChart data={data!} /> : <NoData name="backtest.shadowA" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-bucket" title="Bucket Allocation">
        <DiscLabel target="Withdraw" />
        <BucketAllocationChart data={data!} />
      </CollapsibleSection>

      <CollapsibleSection id="disc-ter" title="TER Comparison">
        <DiscLabel target="Portfolio" />
        <TerChart data={data!} />
      </CollapsibleSection>

      {/* ══════════════════ FACTOR & PERFORMANCE ══════════════════ */}

      <CollapsibleSection id="disc-factor-loadings" title="Factor Loadings Table — FF5 por ETF">
        <DiscLabel target="Performance" />
        {factorLoadings ? <FactorLoadingsTable data={factorLoadings} /> : <NoData name="factor_loadings" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-attribution" title="Attribution Analysis">
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

      <CollapsibleSection id="disc-networth" title="Net Worth Table — Patrimônio Anual">
        <DiscLabel target="Performance" />
        <NetWorthTable />
      </CollapsibleSection>

      {/* ══════════════════ BOND STRATEGY ══════════════════ */}

      <CollapsibleSection id="disc-bond-ladder" title="Bond Ladder Timeline">
        <DiscLabel target="Withdraw" />
        <BondLadderTimeline
          ipca2029={rf.ipca2029 ? { valor: rf.ipca2029.valor, taxa: rf.ipca2029.taxa } : undefined}
          ipca2040={rf.ipca2040 ? { valor: rf.ipca2040.valor, taxa: rf.ipca2040.taxa } : undefined}
          ipca2050={rf.ipca2050 ? { valor: rf.ipca2050.valor, taxa: rf.ipca2050.taxa } : undefined}
          renda2065={rf.renda2065 ? { valor: rf.renda2065.valor, taxa: rf.renda2065.taxa } : undefined}
          custoVidaMensal={premissas.custo_vida_base ? premissas.custo_vida_base / 12 : 20000}
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-bond-maturity" title="Bond Maturity Ladder">
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

      {/* ══════════════════ TAX & TLH ══════════════════ */}

      <CollapsibleSection id="disc-tax-deferral" title="Tax Deferral Clock">
        <DiscLabel target="Assumptions" />
        <TaxDeferralClock
          irDiferidoTotal={tax.ir_diferido_total_brl ?? 0}
          patrimonioTotal={premissas.patrimonio_atual ?? 0}
        />
      </CollapsibleSection>

      <CollapsibleSection id="disc-ir-shield" title="IR Shield — TLH Opportunities">
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

      <CollapsibleSection id="disc-tax-grid" title="Tax Analysis Grid">
        <DiscLabel target="Portfolio" />
        <TaxAnalysisGrid />
      </CollapsibleSection>

      {/* ══════════════════ FIRE & APOSENTADORIA ══════════════════ */}

      <CollapsibleSection id="disc-btc-fire" title="BTC FIRE Projection">
        <DiscLabel target="FIRE" />
        {btcProjection ? (
          <BtcFIREProjectionCard
            hodl11BrlAtual={btcProjection.hodl11_brl_atual}
            btcAtualUsd={btcProjection.btc_atual_usd}
            cenarios={btcProjection.cenarios}
          />
        ) : <NoData name="hodl11.fire_projection" />}
      </CollapsibleSection>

      <CollapsibleSection id="disc-life-events" title="Life Events Table">
        <DiscLabel target="FIRE" />
        {lifeEvents ? <LifeEventsTable data={lifeEvents} /> : <NoData name="life_events" />}
      </CollapsibleSection>

      {/* ══════════════════ MONITORAMENTO ══════════════════ */}

      <CollapsibleSection id="disc-brasil-monitor" title="Brasil Monitor Card">
        <DiscLabel target="Portfolio" />
        <BrasilMonitorCard />
      </CollapsibleSection>
    </div>
  );
}
