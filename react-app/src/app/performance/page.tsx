'use client';

import { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useConfig } from '@/hooks/useConfig';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { AttributionChart } from '@/components/charts/AttributionChart';
import { DeltaBarChart } from '@/components/charts/DeltaBarChart';
import { InformationRatioChart } from '@/components/charts/InformationRatioChart';
import { PremisesTable } from '@/components/performance/PremisesTable';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { Button } from '@/components/ui/button';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { InfoCard } from '@/components/primitives/InfoCard';
import AlphaVsSWRDChart from '@/components/dashboard/AlphaVsSWRDChart';
import RollingMetricsChart from '@/components/dashboard/RollingMetricsChart';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import PerformanceSummary from '@/components/dashboard/PerformanceSummary';
import { BarChart3 } from 'lucide-react';
import { fmtPrivacy, pvText } from '@/utils/privacyTransform';
import { EC } from '@/utils/echarts-theme';

// Period buttons for timeline
const PERIODS = [
  { key: '6m', label: '6m' },
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1y' },
  { key: '3y', label: '3y' },
  { key: '5y', label: '5y' },
  { key: 'all', label: 'All' },
] as const;

type Period = (typeof PERIODS)[number]['key'];

export default function PerformancePage() {
  const { data, isLoading, dataError, privacyMode } = usePageData();
  const { config } = useConfig();
  const [timelinePeriod, setTimelinePeriod] = useState<Period>('all');
  const [alphaTab, setAlphaTab] = useState<'vwra' | 'swrd'>('vwra');

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data,
    loadingText: 'Carregando dados de performance...',
    errorPrefix: 'Erro ao carregar performance:',
    warningText: 'Dados carregados mas seção de performance não disponível',
  });
  if (stateEl) return stateEl;
  const safeData = data!;

  // Gap J: Drawdown Context Banner — só relevante na fase de desacumulação (pós-FIRE)
  const ddHistory = (safeData as any)?.drawdown_history ?? {};
  const ddPctList: number[] = ddHistory.drawdown_pct ?? [];
  const ddAtual: number = ddPctList.length > 0 ? ddPctList[ddPctList.length - 1] : 0;
  const ddAtualAbs = Math.abs(ddAtual);
  const idadeAtual: number = (safeData as any)?.premissas?.idade_atual ?? 39;
  const idadeFireAlvo: number = (safeData as any)?.premissas?.idade_fire_alvo ?? 53;
  const isFaseAcumulacao = idadeAtual < idadeFireAlvo;
  // Guardrails de spending são regras pós-FIRE — não exibir na acumulação
  const showDrawdownBanner = ddAtualAbs > 5 && !isFaseAcumulacao;

  return (
    <div>
      {/* Gap J: Drawdown Context Banner — só pós-FIRE (guardrails = regras de desacumulação) */}
      {showDrawdownBanner && (
        <div
          data-testid="drawdown-context-banner"
          style={{
            background: ddAtualAbs >= 25 ? 'rgba(239,68,68,0.08)' : ddAtualAbs >= 15 ? 'rgba(234,179,8,0.08)' : 'rgba(248,113,113,0.06)',
            border: `1px solid ${ddAtualAbs >= 25 ? 'rgba(239,68,68,0.4)' : 'rgba(234,179,8,0.4)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 22 }}>{ddAtualAbs >= 25 ? '🔴' : ddAtualAbs >= 15 ? '🟡' : '🟠'}</span>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: ddAtualAbs >= 25 ? 'var(--red)' : 'var(--yellow)' }}>
              Drawdown Ativo: {privacyMode ? '••%' : `${ddAtual.toFixed(1)}%`}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Ação: {ddAtualAbs >= 35 ? `corte de 28% (piso ${pvText('R$180k', privacyMode)})` : ddAtualAbs >= 25 ? 'corte 20%' : ddAtualAbs >= 15 ? 'corte 10%' : 'monitorar · hold'}
            </div>
          </div>
        </div>
      )}

      {/* 0. Performance Summary — KPIs + Annual Returns Table */}
      <SectionDivider label="Resumo de Performance" />
      <section className="section" id="performanceSummarySection">
        <PerformanceSummary data={safeData} />
      </section>

      {/* B1: Tracking Error + Information Ratio cards — logo após o resumo de performance */}
      {(() => {
        const backtest = (safeData as any)?.backtest ?? {};
        const btTarget: number[] = backtest.target ?? [];
        const btShadow: number[] = backtest.shadowA ?? [];
        const btDates: string[] = backtest.dates ?? [];

        if (btTarget.length < 13 || btShadow.length < 13) return null;

        // Compute monthly active returns (Target − VWRA proxy) in %
        const activeReturns: number[] = [];
        for (let i = 1; i < Math.min(btTarget.length, btShadow.length); i++) {
          const rTarget = (btTarget[i] / btTarget[i - 1] - 1) * 100;
          const rShadow = (btShadow[i] / btShadow[i - 1] - 1) * 100;
          activeReturns.push(rTarget - rShadow);
        }
        // TE = std dev of monthly active returns × sqrt(12)
        const n = activeReturns.length;
        const mean = activeReturns.reduce((s, v) => s + v, 0) / n;
        const variance = activeReturns.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
        const teAnnual = Math.sqrt(variance * 12);

        // Alpha anualizado = mean monthly active return × 12
        const alphaAnnual = mean * 12;

        // IR = alpha / TE
        const ir = teAnnual > 0 ? alphaAnnual / teAnnual : null;

        const irColor = ir == null ? 'var(--muted)'
          : ir > 0.5 ? 'var(--green)'
          : ir > 0 ? 'var(--yellow)'
          : 'var(--red)';
        const teColor = teAnnual < 3 ? 'var(--green)'
          : teAnnual < 6 ? 'var(--yellow)'
          : 'var(--red)';

        const anos = btDates.length > 1 ? (() => {
          const [y0, m0] = btDates[0].split('-').map(Number);
          const [y1, m1] = btDates[btDates.length - 1].split('-').map(Number);
          return ((y1 - y0) * 12 + (m1 - m0)) / 12;
        })() : n / 12;

        return (
          <div
            data-testid="te-ir-cards"
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            style={{ marginBottom: 12 }}
          >
            <div style={{ background: 'var(--card)', border: `1px solid var(--border)`, borderLeft: `3px solid ${teColor}`, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}
                title="TE = desvio-padrão anualizado dos retornos ativos mensais (Target − VWRA). Mede quanto a carteira se desvia do benchmark.">
                Tracking Error (TE)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: teColor, lineHeight: 1.1 }}>
                {teAnnual.toFixed(2)}%
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                vs VWRA · anualizado
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: `1px solid var(--border)`, borderLeft: `3px solid ${irColor}`, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}
                title="IR = Alpha anualizado / Tracking Error. Mede eficiência do alpha gerado por unidade de risco ativo. IR > 0.5 = bom.">
                Information Ratio (IR)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: irColor, lineHeight: 1.1 }}>
                {ir != null ? ir.toFixed(2) : '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                alpha / TE · {ir != null && ir > 0.5 ? 'bom' : ir != null && ir > 0 ? 'neutro' : 'negativo'}
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: `1px solid var(--border)`, borderLeft: `3px solid var(--accent)`, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
                Alpha Anualizado
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: alphaAnnual >= 0 ? 'var(--green)' : 'var(--red)', lineHeight: 1.1 }}>
                {alphaAnnual >= 0 ? '+' : ''}{alphaAnnual.toFixed(2)}%
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                {anos.toFixed(1)} anos · {n} obs
              </div>
            </div>
          </div>
        );
      })()}

      {/* 8. Retornos Mensais — Heatmap (logo após tabela anual para contexto temporal) */}
      <div data-testid="heatmap-retornos">
      <CollapsibleSection id="section-heatmap" title={secTitle('performance', 'heatmap', 'Retornos Mensais — Heatmap')} defaultOpen={secOpen('performance', 'heatmap', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <MonthlyReturnsHeatmap data={(() => {
            if (safeData.monthly_returns && Object.keys(safeData.monthly_returns).length > 0) return safeData.monthly_returns;
            const rm = (safeData as any).retornos_mensais;
            if (rm?.dates && rm?.values) {
              const result: Record<string, number> = {};
              (rm.dates as string[]).forEach((d: string, i: number) => {
                result[d] = (rm.values as number[])[i] / 100;
              });
              return result;
            }
            return {};
          })()} />
          <div className="src">
            Retornos mensais da carteira. Verde = positivo, vermelho = negativo. Acum. = retorno composto do ano.
          </div>
        </div>
      </CollapsibleSection>
      </div>

      <SectionDivider label="Visão Geral" />
      {/* 1. Patrimônio — Evolução Histórica (moved first: contexto geral antes de análise) */}
      <div data-testid="evolucao-carteira">
      <section className="section" id="timelineSection">
        <h2>{secTitle('performance', 'patrimonio', 'Patrimônio — Evolução Histórica')}</h2>
        <div className="period-btns" id="timelinePeriodBtns" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {PERIODS.map(p => (
            <Button
              key={p.key}
              variant={timelinePeriod === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimelinePeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <TimelineChart data={safeData} period={timelinePeriod} />
        <div className="src">
          Aportes cumulativos + Rentabilidade equity USD + Câmbio e RF. Decomposição via TWR.
        </div>
      </section>
      </div>

      {/* 2. Performance Attribution — Decomposição do Patrimônio (moved second: explica de onde veio o retorno) */}
      <div data-testid="retorno-decomposicao">
      <section className="section" id="attrSection">
        <h2>
          {secTitle('performance', 'attribution', 'Performance Attribution — Decomposição do Patrimônio')}{' '}
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--muted)' }}>
            {safeData.attribution?._inicio ? `(desde ${safeData.attribution._inicio})` : ''}
          </span>
        </h2>
        <AttributionChart data={safeData} />
        {/* Attribution KPI cards — valores monetários em R$ */}
        {(() => {
          const attr = safeData.attribution;
          if (!attr) return null;
          const fmtR = (v: number | null | undefined) => {
            if (v == null) return '—';
            const abs = Math.abs(v);
            if (v < 0) return `−R$${abs >= 1e3 ? Math.round(abs / 1e3) + 'k' : abs.toLocaleString('pt-BR')}`;
            if (abs >= 1e6) return `R$${(abs / 1e6).toFixed(2)}M`;
            if (abs >= 1e3) return `R$${Math.round(abs / 1e3)}k`;
            return `R$${v.toLocaleString('pt-BR')}`;
          };
          const total = (attr.aportes ?? 0) + (attr.retornoUsd ?? 0) + (attr.rf ?? 0) + (attr.cambio ?? 0) + (attr.fx ?? 0);
          const pct = (v: number) => total > 0 ? `${((v / total) * 100).toFixed(0)}%` : '';
          const cards = [
            { label: 'Aportes', value: attr.aportes, color: 'var(--accent)' },
            { label: 'Retorno USD', value: attr.retornoUsd, color: 'var(--green)' },
            { label: 'M+ Câmbio', value: attr.cambio, color: attr.cambio != null && attr.cambio >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Câmbio (FX)', value: attr.fx, color: attr.fx != null && attr.fx >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Retorno RF Brasil', value: attr.rf, color: 'var(--yellow)' },
          ];
          return (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginTop: 12 }}>
                {cards.map(c => (
                  <div key={c.label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '10px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: c.color }} data-testid={c.label === 'Retorno USD' ? 'retorno-usd' : undefined}>{fmtPrivacy(c.value, privacyMode)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--muted)', textAlign: 'center' }}>
                {pct(attr.aportes ?? 0)} aportes · {pct(attr.retornoUsd ?? 0)} retorno USD · {pct((attr.cambio ?? 0) + (attr.fx ?? 0))} câmbio · reste RF/custo
              </div>
            </>
          );
        })()}
        <div className="src">
          Decomposição do patrimônio acumulado: aportes + retorno USD por ETF + RF doméstica + variação cambial. Desde o início da carteira.
        </div>
      </section>
      </div>

      <SectionDivider label="Alpha & Benchmark" />
      {/* 3. Alpha vs Benchmark — tabs vs VWRA / vs SWRD */}
      <section className="section" id="alphaSwrdSection">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h2>{secTitle('performance', 'alpha', 'Alpha vs Benchmark — Carteira Target por Período')}</h2>
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
            {[
              { id: 'vwra' as const, label: 'vs VWRA' },
              { id: 'swrd' as const, label: 'vs SWRD' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setAlphaTab(t.id)}
                style={{
                  padding: '4px 12px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: 'none',
                  background: 'transparent',
                  borderBottom: alphaTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: alphaTab === t.id ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {alphaTab === 'vwra' && <DeltaBarChart data={safeData} height={200} />}
        {alphaTab === 'swrd' && (() => {
          const backtest = (data as any)?.backtest ?? {};
          // G8: detect if data is from fallback (metrics_by_period absent)
          const hasPeriodData = backtest.metrics_by_period != null;
          const hasAnyPeriod = hasPeriodData && (
            backtest.metrics_by_period?.since2020 != null ||
            backtest.metrics_by_period?.since2013 != null ||
            backtest.metrics_by_period?.since2009 != null ||
            backtest.metrics_by_period?.all != null
          );
          const isFallback = !hasAnyPeriod;
          return (
            <>
              {isFallback && (
                <div style={{ padding: '10px 0 6px', fontSize: 'var(--text-xs)', color: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚠</span>
                  <span>* Dados estimados (série histórica backtest.metrics_by_period indisponível)</span>
                </div>
              )}
              <AlphaVsSWRDChart
                oneYear={{
                  targetReturn: backtest.metrics_by_period?.since2020?.target?.cagr ?? backtest.metrics_by_period?.['5y']?.target?.cagr ?? 14.89,
                  swrdReturn: backtest.metrics_by_period?.since2020?.shadowA?.cagr ?? backtest.metrics_by_period?.['5y']?.shadowA?.cagr ?? 13.7,
                }}
                threeYear={{
                  targetReturn: backtest.metrics_by_period?.since2013?.target?.cagr ?? 14.89,
                  swrdReturn: backtest.metrics_by_period?.since2013?.shadowA?.cagr ?? 13.7,
                }}
                fiveYear={{
                  targetReturn: backtest.metrics_by_period?.since2009?.target?.cagr ?? 14.89,
                  swrdReturn: backtest.metrics_by_period?.since2009?.shadowA?.cagr ?? 13.7,
                }}
                tenYear={{
                  targetReturn: backtest.metrics_by_period?.all?.target?.cagr ?? backtest.metrics?.target?.cagr ?? 14.14,
                  swrdReturn: backtest.metrics_by_period?.all?.shadowA?.cagr ?? backtest.metrics?.shadowA?.cagr ?? 12.96,
                }}
                alphaLiquidoPctYear={((data as any)?.premissas?.haircut_alpha_liquido ?? 0.0016) * 100}
              />
            </>
          );
        })()}
        {/* KPI cards alinhados ao contexto de alpha */}
        {(() => {
          const backtest = (data as any)?.backtest ?? {};
          const btDates: string[] = backtest.dates ?? [];
          const btTarget: number[] = backtest.target ?? [];
          const btShadow: number[] = backtest.shadowA ?? [];

          // Alpha ITD em pp
          let alphaItdPp: number | null = null;
          let alphaAnualizadoPp: number | null = null;
          if (btDates.length > 1 && btTarget.length > 1 && btShadow.length > 1) {
            const tRet = (btTarget[btTarget.length - 1] / btTarget[0] - 1) * 100;
            const sRet = (btShadow[btShadow.length - 1] / btShadow[0] - 1) * 100;
            alphaItdPp = parseFloat((tRet - sRet).toFixed(1));
            // Anualizado: alpha / anos
            const [y0, m0] = btDates[0].split('-').map(Number);
            const [y1, m1] = btDates[btDates.length - 1].split('-').map(Number);
            const anos = ((y1 - y0) * 12 + (m1 - m0)) / 12;
            if (anos > 0) alphaAnualizadoPp = parseFloat((alphaItdPp / anos).toFixed(1));
          }

          const fmt = (v: number | null) => v != null
            ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}pp`
            : '—';

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ marginTop: 16 }}>
              {/* Card A: Alpha ITD */}
              <InfoCard
                label="Alpha desde início"
                value={fmt(alphaItdPp)}
                description="vs VWRA (market-cap global) · acumulado"
                accentColor={alphaItdPp != null && alphaItdPp >= 0 ? 'var(--green)' : 'var(--red)'}
                bg="var(--bg)"
              />

              {/* Card B: Alpha anualizado */}
              <InfoCard
                label="Alpha anualizado"
                value={fmt(alphaAnualizadoPp)}
                description="média / ano desde início"
                accentColor={alphaAnualizadoPp != null && alphaAnualizadoPp >= 0 ? 'var(--green)' : 'var(--red)'}
                bg="var(--bg)"
              />

              {/* Card C: Alpha líquido esperado pós-haircut (académico) */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  Alpha líquido esperado
                  <span
                    title="QUANT-006 validado by Factor: +0.16%/ano é esperado LONGO prazo (10+ anos) pós-haircut. CURTO prazo (1-3 anos) pode ser negativo — factor drought aceito explicitamente (>5pp underperformance em 24m dispara revisão). Spread total AVGS-SWRD ~130bps inclui small cap + value + alpha fatorial. McLean & Pontiff 2016: post-publication decay ~58%."
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(148,163,184,.2)', color: 'var(--muted)', fontSize: 10, cursor: 'help', flexShrink: 0, fontStyle: 'normal' }}
                  >
                    ⓘ
                  </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral)', lineHeight: 1.1 }}>
                  {/* QUANT-006: Alpha líquido = 0.20% bruto − 0.04% haircut = +0.16%/ano (POSITIVO) */}
                  {(() => { const v = (data as any)?.premissas?.haircut_alpha_liquido; return v != null ? `${v >= 0 ? '+' : ''}${(v * 100).toFixed(2)}%/ano` : '+0.16%/ano'; })()}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  McLean &amp; Pontiff 2016
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>
                  haircut 58% pós-publicação
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--orange)', marginTop: 6, borderTop: '1px solid var(--muted)', paddingTop: 4 }}>
                  ⚠️ Factor droughts common: 30-40% prob underperform by 10y
                </div>
              </div>
            </div>
          );
        })()}
        <div className="src" style={{ marginTop: 10 }}>
          Alpha = retorno cumulativo Target − VWRA (backtest.shadowA) por período ·
          Base rate persistência de factor premium: ~60–70% em 10a (AQR 2020) ·
          Gatilho revisão: AVGS &lt; SWRD por &gt;5pp em 24m consecutivos ·
          Alpha líquido esperado: McLean &amp; Pontiff 2016, haircut 58%
        </div>
      </section>

      <SectionDivider label="Histórico" />
      {/* 4. Premissas vs Realizado — 5 Anos (2021-2026) */}
      <section className="section" id="premissasVsRealizadoSection">
        <h2>{secTitle('performance', 'premissas', 'Premissas vs Realizado — 5 Anos (2021-2026)')}</h2>
        <PremisesTable />
      </section>

      {/* 6. Rolling 12m — AVGS vs SWRD (collapsible, collapsed) */}
      <div data-testid="factor-rolling-avgs">
      <CollapsibleSection id="section-factor-rolling" title={secTitle('performance', 'rolling-12m', 'Rolling 12m — AVGS vs SWRD (retorno relativo)')} defaultOpen={secOpen('performance', 'rolling-12m', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <DeltaBarChart data={safeData} title="AVGS vs SWRD — Retorno Relativo (Rolling 12m)" chartType="factor-rolling" />
          <div className="src">
            Linha vermelha = threshold −5pp (gatilho de revisão da tese fatorial). Janela: 12 meses.
          </div>
        </div>
      </CollapsibleSection>
      </div>

      {/* 6. Information Ratio vs VWRA (collapsible, collapsed) */}
      <div data-testid="information-ratio">
      <CollapsibleSection id="section-ir" title={secTitle('performance', 'ir', 'Information Ratio vs VWRA — Desde o Início + Rolling 36m')} defaultOpen={secOpen('performance', 'ir', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <InformationRatioChart data={safeData} />
          <div className="src" style={{ lineHeight: 1.6 }}>
            <strong>Como ler:</strong> IR = Active Return / Tracking Error (janela 36m).<br />
            <span style={{ color: 'rgba(34,197,94,.9)' }}>■</span> <strong>&gt;0</strong> = supera VWRA{' '}
            <span style={{ color: 'rgba(239,68,68,.9)' }}>■</span> <strong>&lt;0</strong> = underperformance
          </div>
        </div>
      </CollapsibleSection>
      </div>

      <SectionDivider label="Análise Técnica" />
      {/* NOTE: Rolling Metrics, Fee Analysis all defaultOpen=false (collapsed) */}
      {/* 9. Rolling Metrics Chart — superset (substitui RollingSharp) */}
      <div data-testid="rolling-sharpe">
      <CollapsibleSection id="section-rolling-metrics" title={secTitle('performance', 'rolling-metrics', 'Rolling Metrics — Sharpe / Sortino / Volatilidade')} defaultOpen={secOpen('performance', 'rolling-metrics', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const rollingSharpe = (data as any)?.rolling_sharpe ?? {};
            return (
              <RollingMetricsChart
                dates={rollingSharpe.dates ?? []}
                sharpeBRL={rollingSharpe.values ?? []}
                sharpeUSD={rollingSharpe.values_usd ?? []}
                sortino={rollingSharpe.sortino ?? []}
                volatilidade={rollingSharpe.volatilidade ?? []}
              />
            );
          })()}
          <div className="src">Rolling 12m. Sharpe BRL vs CDI, USD vs T-Bill. Sortino e volatilidade anualizada.</div>
        </div>
      </CollapsibleSection>
      </div>

      {/* 10. Fee Analysis — Custo de Complexidade (collapsible, collapsed) */}
      <div data-testid="fee-custo-complexidade">
      <CollapsibleSection id="section-fee-analysis" title={secTitle('performance', 'fee-analysis', 'Fee Analysis — Custo de Complexidade (14 anos até FIRE)')} defaultOpen={secOpen('performance', 'fee-analysis', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table id="feeTable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Portfolio</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>TER</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Custo 14a</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Alpha 14a</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Net vs VWRA</th>
                </tr>
              </thead>
              <tbody id="feeBody">
                {(() => {
                  const pt = (data as any)?.pesosTarget ?? {};
                  const wSwrd = pt.SWRD ?? 0.395;
                  const wAvgs = pt.AVGS ?? 0.237;
                  const wAvem = pt.AVEM ?? 0.158;
                  const wHodl11 = pt.HODL11 ?? 0.03;
                  const equityTotal = wSwrd + wAvgs + wAvem;
                  const terSwrd = config.ui?.performance?.terSwrd ?? 0.0012;
                  const terAvgs = config.ui?.performance?.terAvgs ?? 0.0039;
                  const terAvem = config.ui?.performance?.terAvem ?? 0.0035;
                  const terHodl11 = config.ui?.performance?.terHodl11 ?? 0.0020;
                  const terVwra = config.ui?.performance?.terVwra ?? 0.0022;
                  const terEquityPortfolio = equityTotal > 0
                    ? (wSwrd * terSwrd + wAvgs * terAvgs + wAvem * terAvem) / equityTotal
                    : 0.00171;
                  const totalAlloc = equityTotal + wHodl11;
                  const terFullPortfolio = totalAlloc > 0
                    ? (wSwrd * terSwrd + wAvgs * terAvgs + wAvem * terAvem + wHodl11 * terHodl11) / totalAlloc
                    : 0.00171;
                  const pat = (data as any)?.fire_swr_percentis?.patrimonio_p50_2040 ?? 11500000;
                  const patMedio = pat / 2;
                  const fmtM = (v: number) => fmtPrivacy(v, privacyMode);
                  const custoEquity14a = patMedio * terEquityPortfolio * 14;
                  const custoFull14a = patMedio * terFullPortfolio * 14;
                  const custoHodl14a = patMedio * terHodl11 * 14;
                  const custoVwra14a = patMedio * terVwra * 14;
                  const alpha14a = patMedio * 0.0016 * 14;
                  const netFull = alpha14a - custoFull14a;
                  const rows = [
                    {
                      name: 'Portfolio Equity (SWRD/AVGS/AVEM)',
                      ter: terEquityPortfolio,
                      custo_14a: fmtM(custoEquity14a),
                      alpha_14a: `+${fmtM(alpha14a)}`,
                      net_vs_vwra: `+${fmtM((alpha14a - custoEquity14a) - (-custoVwra14a))}`,
                      highlight: false,
                    },
                    {
                      name: 'HODL11 (Bitcoin)',
                      ter: terHodl11,
                      custo_14a: fmtM(custoHodl14a),
                      alpha_14a: '—',
                      net_vs_vwra: '—',
                      highlight: false,
                    },
                    {
                      name: 'Full Portfolio (incl. HODL11)',
                      ter: terFullPortfolio,
                      custo_14a: fmtM(custoFull14a),
                      alpha_14a: `+${fmtM(alpha14a)}`,
                      net_vs_vwra: `+${fmtM(netFull - (-custoVwra14a))}`,
                      highlight: true,
                    },
                    {
                      name: 'VWRA (equity benchmark)',
                      ter: terVwra,
                      custo_14a: fmtM(custoVwra14a),
                      alpha_14a: '—',
                      net_vs_vwra: '0',
                      highlight: false,
                    },
                  ];
                  return rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: row.highlight ? 'rgba(88,166,255,.06)' : 'transparent' }}>
                      <td style={{ padding: '6px 8px', fontWeight: row.highlight ? 700 : 400 }}>{row.name}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{(row.ter * 100).toFixed(3)}%</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--red)' }}>−{row.custo_14a}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--green)' }}>{row.alpha_14a}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px', color: row.highlight ? 'var(--green)' : 'var(--muted)' }}>{row.net_vs_vwra}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          <div className="src">
            TER × patrimônio médio projetado × 14 anos · Alpha: +0.16%/ano (McLean &amp; Pontiff 58% haircut) · Net = Alpha − custo extra vs VWRA
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Gap O: Vol Realizada vs MC ───────────────────────────────────────── */}
      {(() => {
        const vr = (safeData as any)?.vol_realizada;
        if (!vr) return null;
        const volReal: number = vr.anualizada_pct ?? 0;
        const volMc: number = vr.vol_mc_premissa_pct ?? 0;
        const acima: boolean = vr.acima_premissa ?? false;
        const delta = volReal - volMc;
        const cor = acima ? 'var(--red)' : 'var(--green)';
        const janela: number = vr.janela_meses ?? 12;
        return (
          <>
            <SectionDivider label="Risco Realizado" />
            <div data-testid="vol-realizada-vs-mc" style={{ background: 'var(--card)', border: `1px solid ${cor}40`, borderLeft: `3px solid ${cor}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Vol Realizada vs Premissa MC</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Vol realizada {janela}m</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cor }}>
                    {privacyMode ? '••%' : `${volReal.toFixed(2)}%`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Premissa MC</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                    {`${volMc.toFixed(1)}%`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Desvio</div>
                  <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: `${cor}22`, border: `1px solid ${cor}66`, color: cor, fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                    {acima ? '+' : ''}{delta.toFixed(2)}pp &nbsp;{acima ? '⚠ ACIMA' : '✓ abaixo'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                Vol anualizada = std dev TWR mensal × √12 (últimos {janela} meses). Premissa MC = config.py VOLATILIDADE_EQUITY.
                Vol acima da premissa → sequência-de-retornos pior que projetado; revisar P(FIRE).
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Gap R: Decomposição Retorno Cambial ──────────────────────────────── */}
      {(() => {
        const rd = (safeData as any)?.retorno_decomposicao;
        if (!rd) return null;
        const retUsd: number = rd.retorno_usd_pct ?? 0;
        const retFx: number = rd.variacao_cambial_pct ?? 0;
        const retBrl: number = rd.retorno_brl_pct ?? 0;
        const periodo: string = rd.periodo ?? 'YTD';
        const nMeses: number = rd.n_meses ?? 0;
        const fxPositive = retFx >= 0;
        return (
          <div
            data-testid="retorno-cambial-decomposicao"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12 }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
              Decomposição Retorno Cambial — {periodo} ({nMeses} meses)
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Equity USD</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: retUsd >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {privacyMode ? '••%' : `${retUsd >= 0 ? '+' : ''}${retUsd.toFixed(1)}%`}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>FX (BRL/USD)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: fxPositive ? 'var(--green)' : 'var(--red)' }}>
                  {privacyMode ? '••%' : `${retFx >= 0 ? '+' : ''}${retFx.toFixed(1)}%`}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {fxPositive ? 'BRL apreciou (headwind USD)' : 'BRL depreciou (tailwind USD)'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Retorno BRL</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: retBrl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {privacyMode ? '••%' : `${retBrl >= 0 ? '+' : ''}${retBrl.toFixed(1)}%`}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              Equity USD × FX ≈ BRL. FX negativo = BRL apreciou (retorno USD reduzido em BRL).
            </div>
          </div>
        );
      })()}

      {/* ── R5: Drawdown Monitor ─────────────────────────────────────────────── */}
      {(() => {
        const risk = (safeData as any)?.risk;
        const ddHistory = (safeData as any)?.drawdown_history;
        // max_drawdown_real em % (negativo): vem do risk.max_drawdown_real (via cummax histórico)
        const maxDdRaw: number | null = risk?.max_drawdown_real ?? ddHistory?.max_drawdown ?? null;
        // Drawdown atual = último valor da série (já em %)
        const ddSeries: number[] = ddHistory?.drawdown_pct ?? [];
        const currentDd: number | null = ddSeries.length > 0 ? ddSeries[ddSeries.length - 1] : null;
        const absCurrent = currentDd != null ? Math.abs(currentDd) : null;
        const absMax = maxDdRaw != null ? Math.abs(maxDdRaw) : null;
        // Badge color baseado em nível de guardrail
        const ddBadge = (dd: number | null): { color: string; label: string } => {
          if (dd == null) return { color: EC.muted, label: '—' };
          if (dd < 15) return { color: EC.green, label: 'Seguro' };
          if (dd < 25) return { color: EC.warning, label: 'Cautela 1' };
          if (dd < 35) return { color: EC.red, label: 'Cautela 2' };
          return { color: '#7c3aed', label: 'Defesa' };
        };
        const badge = ddBadge(absCurrent);
        return (
          <>
            <SectionDivider label="Monitor de Drawdown" />
            <div data-testid="drawdown-monitor" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Monitor de Drawdown</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Drawdown atual</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: badge.color }}>
                    {absCurrent != null ? (privacyMode ? '••%' : `-${absCurrent.toFixed(1)}%`) : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Max drawdown histórico</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                    {absMax != null ? (privacyMode ? '••%' : `-${absMax.toFixed(1)}%`) : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Guardrail</div>
                  <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: `${badge.color}22`, border: `1px solid ${badge.color}66`, color: badge.color, fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                    {badge.label}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                Níveis: &lt;15% seguro · 15–25% Cautela 1 (−10% gasto) · 25–35% Cautela 2 (−20%) · &gt;35% Defesa (piso essencial). Drawdown histórico = pico absoluto via cummax desde Apr/2021.
              </div>
            </div>
          </>
        );
      })()}
    </div>
    </div>
  );
}
