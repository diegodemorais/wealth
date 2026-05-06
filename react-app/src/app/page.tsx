'use client';

import { usePageData } from '@/hooks/usePageData';
import { KpiHero } from '@/components/primitives/KpiHero';
import DecisaoDoMes from '@/components/dashboard/DecisaoDoMes';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { maxDriftPp } from '@/utils/drift';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import { IifptRadar } from '@/components/dashboard/IifptRadar';
import { DiagnosticBanner } from '@/components/banners/DiagnosticBanner';
import { maskMoneyValues } from '@/utils/privacyTransform';
import { NowHeroStrips } from '@/components/now/NowHeroStrips';
import { NowKpiPrimario } from '@/components/now/NowKpiPrimario';
import { NowWellnessScore } from '@/components/now/NowWellnessScore';
import { NowRiskPanel } from '@/components/now/NowRiskPanel';
import { NowIpsSummary } from '@/components/now/NowIpsSummary';
import { NowRebalancingWrapper } from '@/components/now/NowRebalancingWrapper';
import { NowPatrimonioLiquidoWrapper } from '@/components/now/NowPatrimonioLiquidoWrapper';
import { useScheduledStatus } from '@/hooks/useScheduledStatus';
import type { ScheduledJob } from '@/hooks/useScheduledStatus';

// ─── Scheduled Status Banner helpers ─────────────────────────────────────────

function formatJobDate(isoStr: string | null): string {
  if (!isoStr) return 'desconhecido';
  try {
    const dt = new Date(isoStr);
    return dt.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

function ScheduledStatusBanner() {
  const { data, isLoading } = useScheduledStatus();
  if (isLoading || !data) return null;

  const { summary } = data;
  if (summary.error === 0 && summary.stale === 0) return null;

  // Collect issues, errors first
  const errorJobs = data.jobs.filter(j => j.status === 'error');
  const staleJobs = data.jobs.filter(j => j.status === 'stale');
  const allIssues: ScheduledJob[] = [...errorJobs, ...staleJobs];
  if (allIssues.length === 0) return null;

  const primary = allIssues[0];
  const extra = allIssues.length - 1;

  const isError = primary.status === 'error';
  const message = isError
    ? `🔴 Rotina com falha: ${primary.label} — ${primary.last_line || 'ver logs/'}. Ver logs/.`
    : `⚠️ Rotina sem execução: ${primary.label} (último run: ${formatJobDate(primary.last_run_iso)})`;

  const extraSuffix = extra > 0 ? ` e mais ${extra}` : '';

  return (
    <DiagnosticBanner
      variant={isError ? 'warning' : 'info'}
      title="Rotinas Agendadas"
      testId="banner-scheduled-status"
      compact
    >
      {message}{extraSuffix}
    </DiagnosticBanner>
  );
}

export default function HomePage() {
  const { data, derived, isLoading, dataError, privacyMode } = usePageData();

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data: derived,
    loadingText: 'Carregando dados...',
    errorPrefix: 'Erro ao carregar dashboard:',
    warningText: 'Dados carregados mas valores derivados não computados',
  });
  if (stateEl) return stateEl;
  // pageStateElement guarantees derived is non-null past this point
  const d = derived!;

  // Aporte ETFs for DecisaoDoMes
  // retornos_por_etf schema: { SWRD: { retorno_usd_real: 0.037, fonte: '...' }, ... } (decimal, não %)
  const retornos = (data as any)?.premissas?.retornos_por_etf ?? {};
  const erPct = (ticker: string, fallback: number): number => {
    const raw = retornos[ticker]?.retorno_usd_real;
    return typeof raw === 'number' ? raw * 100 : fallback;
  };
  const aporteEtfs = [
    { ticker: 'SWRD', atual: (data?.drift as any)?.SWRD?.atual ?? 0, alvo: (data?.drift as any)?.SWRD?.alvo ?? 39.5, expectedReturn: erPct('SWRD', 3.7) },
    { ticker: 'AVGS', atual: (data?.drift as any)?.AVGS?.atual ?? 0, alvo: (data?.drift as any)?.AVGS?.alvo ?? 23.7, expectedReturn: erPct('AVGS', 5.0) },
    { ticker: 'AVEM', atual: (data?.drift as any)?.AVEM?.atual ?? 0, alvo: (data?.drift as any)?.AVEM?.alvo ?? 15.8, expectedReturn: erPct('AVEM', 5.0) },
  ];

  const maxDrift = maxDriftPp(data?.drift as Record<string, any> ?? {});

  const domainCoverage: Record<string, number> = (data as any)?.domain_coverage ?? {};
  const priorityWeights: Record<string, number> = (data as any)?.priority_matrix?.weights ?? {};

  return (
    <div>
      {/* Banners de diagnóstico — anti-ancoragem (Markowitz informativo) + conservadorismo P(FIRE) */}
      <DiagnosticBanner
        variant="warning"
        title="Markowitz é informativo, não prescritivo"
        testId="banner-markowitz-informativo"
      >
        Carteira atual 50/30/20 está dentro do IC estatístico da fronteira eficiente.
        Rebalance via venda gera IR (Lei 14.754) que aniquila ganho de Sharpe (Max Sharpe BL bruto 0.038 → líquido 0.001).
        Regra: aporte direciona ao gap, venda só sem lucro.
      </DiagnosticBanner>

      <DiagnosticBanner
        variant="info"
        title="P(FIRE) reportado é conservador por design"
        testId="banner-pfire-conservador"
      >
        {maskMoneyValues('Exclui INSS Katia (~R$113k/ano) e capital humano. Real ~82-84%.', privacyMode)}
      </DiagnosticBanner>

      {/* Banner condicional — rotinas com falha ou stale (só se problema) */}
      <ScheduledStatusBanner />

      {/* 1. HERO STRIP — Patrimônio Total | Anos até FIRE | Progresso FIRE */}
      <KpiHero
        networth={d.networth}
        networthUsd={d.networthUsd}
        fireProgress={d.firePercentage}
        yearsToFire={d.fireMonthsAway / 12}
        pfire={d.pfire}
        pfireFav={(data as Record<string, unknown>)?.pfire_base != null ? ((data as any).pfire_base.fav as number | null) : null}
        pfireStress={(data as Record<string, unknown>)?.pfire_base != null ? ((data as any).pfire_base.stress as number | null) : null}
        cambio={d.CAMBIO}
        fireDateFormatted={(d as any).fireDateFormatted}
        domainCoverageRm={domainCoverage.rm ?? null}
        domainCoverageEst={domainCoverage.est ?? null}
        tooltipPatrimonio={
          <>
            <strong>Patrimônio Total</strong> — soma financeira: IBKR (USD@PTAX) +
            RF Brasil (IPCA+ / Renda+ / pré) + cripto (HODL11 + custódia) + caixa.
            <br /><br />
            <em>Não inclui</em> capital humano, imóvel equity, terreno e INSS futuro.
            Ver aba FIRE → Balanço Holístico para visão completa.
          </>
        }
        tooltipFire={
          <>
            <strong>Anos até FIRE</strong> — tempo restante até o gatilho FIRE base
            (cenário conservador). Calculado a partir da data atual e da projeção
            do patrimônio atingir o gatilho.
            <br /><br />
            Sub: data alvo do FIRE Day. Cenário <em>aspiracional</em> (49 anos) é mais
            curto; ver KPI "P(Cenário Aspiracional)" abaixo.
          </>
        }
        tooltipProgresso={
          <>
            <strong>Progresso FIRE</strong> — patrimônio atual / patrimônio gatilho
            FIRE base. 100% = atingiu o número FIRE.
            <br /><br />
            Gatilho = SWR-target sobre gasto base anual. Ver aba FIRE para detalhe
            do cálculo (Trinity-equivalente ajustado para realidade brasileira).
          </>
        }
        tooltipPfire={
          <>
            <strong>P(FIRE) base</strong> — probabilidade Monte Carlo (10k simulações)
            de atingir e sustentar FIRE no cenário <em>conservador</em>: gasto base,
            premissas de retorno haircut, FF5 com haircut McLean-Pontiff 58%.
            <br /><br />
            <em>Conservador por design:</em> exclui INSS Katia e capital humano (real
            estimado ~82-84%). Sub mostra fav/stress. Bandas: ≥90% verde · 80-90%
            amarelo · &lt;80% vermelho.
          </>
        }
      />

      <NowHeroStrips data={data} privacyMode={privacyMode} />

      {/* 2. KPI GRID + Capital Humano Katia */}
      <NowKpiPrimario data={data} derived={d} privacyMode={privacyMode} maxDrift={maxDrift} />

      {/* Fluxo de Caixa — Receitas vs Gastos (Sankey) */}
      {data?.premissas && (
        <CollapsibleSection
          id="sankey"
          title={secTitle('now', 'sankey', 'Fluxo de Caixa — Receitas vs Gastos')}
          defaultOpen={secOpen('now', 'sankey', false)}
        >
          <div style={{ padding: '0 16px 16px' }}>
            <CashFlowSankey />
          </div>
        </CollapsibleSection>
      )}

      {/* ── CAMADA 2: Decisão do Mês ── */}
      <SectionDivider label="Decisão do Mês" />

      <DecisaoDoMes
        etfs={aporteEtfs}
        dcaItems={d.dcaItems}
        aporteMensal={d.aporteMensal}
        ultimoAporte={d.ultimoAporte}
        ultimoAporteData={d.ultimoAporteData}
        acumuladoMes={d.acumuladoMes}
        acumuladoAno={d.acumuladoAno}
        selic={(data as Record<string, any>)?.macro?.selic_meta ?? null}
        ipca12m={(data as Record<string, any>)?.macro?.ipca_12m ?? null}
        fedFunds={(data as Record<string, any>)?.macro?.fed_funds ?? null}
        cambio={d.CAMBIO}
        cambioMtdPct={data?.mercado?.cambio_mtd_pct ?? null}
        cdsBrazil5y={(data as Record<string, any>)?.macro?.cds_brazil_5y_bps ?? null}
        concentrationBrazil={d.concentrationBrazil ?? null}
        hodl11Brl={(data as Record<string, any>)?.hodl11?.valor ?? 0}
        cryptoLegadoBrl={(data as Record<string, any>)?.concentracao_brasil?.composicao?.crypto_legado_brl ?? 0}
        rfBrl={d.rfBrl ?? 0}
        exposicaoCambialPct={(data as Record<string, any>)?.macro?.exposicao_cambial_pct ?? 87.9}
      />

      {/* ── CAMADA 3: Evolução e Contexto ── */}
      <SectionDivider label="Evolução" />

      <div data-testid="fire-countdown">
        <TimeToFireProgressBar
          fireProgress={d.firePercentage}
          yearsToFire={d.fireMonthsAway / 12}
          patrimonioAtual={d.firePatrimonioAtual}
          patrimonioGatilho={d.firePatrimonioGatilho}
          swrFireDay={d.swrFireDay}
          idadeAtual={(data as any)?.premissas?.idade_atual ?? 39}
        />
      </div>

      <NowWellnessScore data={data} derived={d} />

      {/* DC1 — Domain Coverage Radar (IIFPT) — após wellness, antes do DCA */}
      {Object.keys(domainCoverage).length > 0 && (
        <IifptRadar
          domainCoverage={domainCoverage}
          priorityWeights={priorityWeights}
          bondPoolCoverageAnos={(data as any)?.bond_pool?.cobertura_anos ?? null}
          bondPoolMetaAnos={(data as any)?.bond_pool?.meta_anos ?? 7}
          yearsToFire={(() => {
            const idadeFire = (data as any)?.premissas?.idade_fire_alvo;
            const idadeAtual = (data as any)?.premissas?.idade_atual;
            return (idadeFire && idadeAtual) ? idadeFire - idadeAtual : null;
          })()}
        />
      )}

      <NowPatrimonioLiquidoWrapper data={data} privacyMode={privacyMode} />

      <NowRebalancingWrapper data={data} derived={d} />

      {/* ── R1/R2: Risk Score Gauge + Semáforos ── */}
      <SectionDivider label="Perfil de Risco" />
      <NowRiskPanel data={data} privacyMode={privacyMode} />

      <NowIpsSummary data={data} privacyMode={privacyMode} />
    </div>
  );
}
