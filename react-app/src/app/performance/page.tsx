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
import { ExpectedReturnWaterfall } from '@/components/dashboard/ExpectedReturnWaterfall';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { Button } from '@/components/ui/button';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { InfoCard } from '@/components/primitives/InfoCard';
import AlphaVsSWRDChart from '@/components/dashboard/AlphaVsSWRDChart';
import RollingMetricsChart from '@/components/dashboard/RollingMetricsChart';
import ETFFactorComposition from '@/components/dashboard/ETFFactorComposition';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import PerformanceSummary from '@/components/dashboard/PerformanceSummary';
import { BarChart3 } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';
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

  // Gap J: Drawdown Context Banner data
  const ddHistory = (safeData as any)?.drawdown_history ?? {};
  const ddPctList: number[] = ddHistory.drawdown_pct ?? [];
  const ddAtual: number = ddPctList.length > 0 ? ddPctList[ddPctList.length - 1] : 0;
  const ddAtualAbs = Math.abs(ddAtual);
  const showDrawdownBanner = ddAtualAbs > 5;
  const ddGuardrailAtivo = (safeData as any)?.spending_guardrails?.zona !== 'normal';
  const ddGuardrailZona: string = (safeData as any)?.spending_guardrails?.zona ?? 'normal';

  return (
    <div>
      {/* Gap J: Drawdown Context Banner — aparece quando drawdown atual > 5% */}
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
              {ddGuardrailAtivo ? `Guardrail ativo — zona: ${ddGuardrailZona}` : 'Guardrail: zona normal'} ·
              Ação: {ddAtualAbs >= 35 ? 'corte de 28% (piso)' : ddAtualAbs >= 25 ? 'corte 20%' : ddAtualAbs >= 15 ? 'corte 10%' : 'monitorar · hold'}
            </div>
          </div>
        </div>
      )}

      {/* 0. Performance Summary — KPIs + Annual Returns Table */}
      <SectionDivider label="Resumo de Performance" />
      <section className="section" id="performanceSummarySection">
        <PerformanceSummary data={safeData} />
      </section>

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
          return (
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
              alphaLiquidoPctYear={0.16}
            />
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
                  {(data as any)?.premissas?.haircut_alpha_liquido ?? '+0.16%/ano'}
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
        <div className="src">
          Fonte: TWR reconstruído (IBKR+RF) · Retornos: pós-IPCA real BRL · Drawdown: histórico carteira · Dados auditados
        </div>
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

      <SectionDivider label="Fatores" />
      {/* Expected Return Waterfall — movido para primeiro em Fatores */}
      <CollapsibleSection id="section-expected-return-waterfall" title={secTitle('performance', 'factor-waterfall', 'Expected Return Waterfall — Decomposição Fatorial FF6')} defaultOpen={secOpen('performance', 'factor-waterfall', false)}>
        <ExpectedReturnWaterfall />
      </CollapsibleSection>

      {/* ETF Factor Composition — recebido de PORTFOLIO */}
      <div data-testid="factor-loadings-quality">
      <CollapsibleSection
        id="section-etf-factor"
        title={secTitle('performance', 'factor-regression', 'Exposição Fatorial — ETFs da Carteira')}
        defaultOpen={secOpen('performance', 'factor-regression', false)}
        icon={<BarChart3 size={18} />}
      >
        <div style={{ padding: '16px' }}>
          <ETFFactorComposition />
          <div className="src">Fonte: etf_composition.json · Fatores: Market, Value, Size, Quality (escala 0–100%)</div>
        </div>
      </CollapsibleSection>
      </div>

      {/* 7. Factor Loadings — Regressão Fama-French SF + Momentum (collapsible, collapsed) */}
      <div data-testid="factor-loadings-chart">
      <CollapsibleSection id="section-factor-loadings" title={secTitle('performance', 'factor-loadings', 'Factor Loadings — Regressão Fama-French SF + Momentum')} defaultOpen={secOpen('performance', 'factor-loadings', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const fl = (data as any)?.factor_loadings ?? {};
            const fKeys = ['mkt_rf', 'smb', 'hml', 'rmw', 'cma', 'mom'];
            const factors = [
              { label: 'Mkt-RF', key: 'mkt_rf' },
              { label: 'SMB', key: 'smb' },
              { label: 'HML', key: 'hml' },
              { label: 'RMW', key: 'rmw' },
              { label: 'CMA', key: 'cma' },
              { label: 'Mom', key: 'mom' },
            ];

            // AVGS proxy: blend AVUV (US) + AVDV (Intl) via pesos canônicos
            const wUS = config.ui?.performance?.weightUS ?? 0.58;
            const wIntl = config.ui?.performance?.weightIntl ?? 0.42;
            const avgsProxy: Record<string, number> = {};
            for (const fKey of fKeys) {
              const u = fl['AVUV']?.[fKey];
              const d = fl['AVDV']?.[fKey];
              if (u != null && d != null) avgsProxy[fKey] = wUS * u + wIntl * d;
            }
            const hasProxy = Object.keys(avgsProxy).length > 0;

            const etfsReal = ['AVDV', 'AVUV', 'DGS', 'EIMI', 'SWRD', 'USCC', 'IWVL'].filter(e => fl[e] != null);

            // Portfolio weighted row: use posicoes to compute USD value weights
            const posicoes = (data as any)?.posicoes ?? {};
            // Map target ETFs to their loadings source:
            //   AVGS → avgsProxy (58% AVUV + 42% AVDV), AVEM → EIMI proxy, others direct
            const etfToLoadingKey: Record<string, string | 'avgsProxy'> = {
              SWRD: 'SWRD', AVGS: 'avgsProxy', AVEM: 'EIMI',
              AVUV: 'AVUV', AVDV: 'AVDV', EIMI: 'EIMI', DGS: 'DGS', USSC: 'USCC', IWVL: 'IWVL',
            };
            let totalUsd = 0;
            const etfWeights: Array<{ etf: string; usd: number; loadingKey: string | 'avgsProxy' }> = [];
            for (const [etf, lk] of Object.entries(etfToLoadingKey)) {
              const pos = posicoes[etf];
              if (!pos?.qty || !pos?.price) continue;
              const hasLoading = lk === 'avgsProxy' ? hasProxy : fl[lk] != null;
              if (!hasLoading) continue;
              const usd = pos.qty * pos.price;
              totalUsd += usd;
              etfWeights.push({ etf, usd, loadingKey: lk });
            }
            const portfolioLoading: Record<string, number> = {};
            if (totalUsd > 0 && etfWeights.length > 0) {
              for (const fKey of fKeys) {
                let weighted = 0;
                let covered = 0;
                for (const { usd, loadingKey } of etfWeights) {
                  const w = usd / totalUsd;
                  const val = loadingKey === 'avgsProxy' ? avgsProxy[fKey] : fl[loadingKey]?.[fKey];
                  if (val != null) { weighted += w * val; covered += w; }
                }
                if (covered > 0.5) portfolioLoading[fKey] = weighted / covered;
              }
            }
            const hasPortfolioRow = Object.keys(portfolioLoading).length > 0;

            if (!etfsReal.length) return <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Sem dados de factor loadings</div>;
            return (
              <>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {etfsReal.map(etf => (
                    <span key={etf} style={{
                      background: 'var(--card2)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '3px 8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--accent)',
                    }}>
                      {etf}
                    </span>
                  ))}
                  {hasProxy && (
                    <span style={{
                      background: 'rgba(88,166,255,.12)',
                      border: '1px dashed var(--accent)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '3px 8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--accent)',
                    }}>
                      AVGS* proxy
                    </span>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)' }}>Fator</th>
                        {etfsReal.map(etf => (
                          <th key={etf} style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)' }}>{etf}</th>
                        ))}
                        {hasProxy && (
                          <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)', opacity: 0.7, fontStyle: 'italic' }}>
                            AVGS*
                          </th>
                        )}
                        {hasPortfolioRow && (
                          <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)', fontWeight: 700 }}>
                            Portfolio
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {factors.map(({ label, key: fKey }) => (
                        <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{label}</td>
                          {etfsReal.map(etf => {
                            const val = fl[etf]?.[fKey];
                            const tstat = fl[etf]?.t_stats?.[fKey];
                            const sig = tstat != null && Math.abs(tstat) >= 1.65;
                            return (
                              <td key={etf} style={{
                                textAlign: 'right',
                                padding: '6px 8px',
                                color: val != null ? (val > 0.3 ? 'var(--green)' : val < -0.1 ? 'var(--red)' : 'var(--text)') : 'var(--muted)',
                                opacity: sig ? 1 : 0.55,
                                fontWeight: sig ? 600 : 400,
                              }}>
                                {val != null ? val.toFixed(2) : '—'}
                              </td>
                            );
                          })}
                          {hasProxy && (
                            <td style={{
                              textAlign: 'right',
                              padding: '6px 8px',
                              fontStyle: 'italic',
                              opacity: 0.75,
                              color: avgsProxy[fKey] != null ? (avgsProxy[fKey] > 0.3 ? 'var(--green)' : avgsProxy[fKey] < -0.1 ? 'var(--red)' : 'var(--text)') : 'var(--muted)',
                            }}>
                              {avgsProxy[fKey] != null ? avgsProxy[fKey].toFixed(2) : '—'}
                            </td>
                          )}
                          {hasPortfolioRow && (
                            <td style={{
                              textAlign: 'right',
                              padding: '6px 8px',
                              fontWeight: 700,
                              color: portfolioLoading[fKey] != null ? (portfolioLoading[fKey] > 0.3 ? 'var(--green)' : portfolioLoading[fKey] < -0.1 ? 'var(--red)' : 'var(--accent)') : 'var(--muted)',
                            }}>
                              {portfolioLoading[fKey] != null ? portfolioLoading[fKey].toFixed(2) : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    {hasPortfolioRow && (
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                          <td colSpan={etfsReal.length + (hasProxy ? 1 : 0) + 2} style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)', fontStyle: 'italic' }}>
                            Portfolio = média ponderada pelo valor atual (USD) de cada posição
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </>
            );
          })()}
          <div className="src">
            Regressão FF5+Mom · Negrito = significativo (t ≥ 1.65, 90%+) · Desbotado = não significativo<br />
            *AVGS proxy = 58% AVUV + 42% AVDV (proxies canônicos Tier A — mesma metodologia Avantis · fonte: proxies-canonicos.md)<br />
            Loadings calculados sobre proxies (AVUV/AVDV para AVGS, EIMI para AVEM) — ETFs alvo têm histórico &lt; 24 meses. Atualizar quando AVGS/AVEM completarem 24 meses de dados.
          </div>
        </div>
      </CollapsibleSection>
      </div>

      {/* Factor Regression FF5 — movido de BACKTEST */}
      <CollapsibleSection
        id="section-ff5-regression"
        title={secTitle('performance', 'ff5-regression', 'Factor Regression FF5 (técnico)')}
        defaultOpen={secOpen('performance', 'ff5-regression', false)}
        icon={<BarChart3 size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const r7 = (data as any)?.backtest_r7 ?? null;
            const ff5 = r7?.factor_regression ?? null;
            if (!ff5) {
              return <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Dados FF5 não disponíveis</div>;
            }
            return (
              <div style={{ fontSize: 'var(--text-sm)', background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                {/* Top-level scalars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-2">
                  {Object.entries(ff5)
                    .filter(([, v]) => typeof v === 'number')
                    .map(([k, v]: [string, any]) => (
                      <div key={k} style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{k}</div>
                        <div style={{ fontWeight: 700 }}>{v.toFixed(3)}</div>
                      </div>
                    ))}
                </div>
                {/* Betas sub-object */}
                {ff5.betas && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>Betas</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                      {Object.entries(ff5.betas).map(([k, v]: [string, any]) => (
                        <div key={k} style={{ textAlign: 'center', padding: '5px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{k}</div>
                          <div style={{ fontWeight: 700 }}>{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <div className="src">
            Regime 7 · 37 anos (1989–2026) · Regressão Fama-French 5 fatores. Dados: backtest_r7.factor_regression.
          </div>
        </div>
      </CollapsibleSection>

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
