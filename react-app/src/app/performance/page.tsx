'use client';

import { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { AttributionChart } from '@/components/charts/AttributionChart';
import { DeltaBarChart } from '@/components/charts/DeltaBarChart';
import { RollingSharpChart } from '@/components/charts/RollingSharpChart';
import { InformationRatioChart } from '@/components/charts/InformationRatioChart';
import { PremisesTable } from '@/components/performance/PremisesTable';
import { ExpectedReturnWaterfall } from '@/components/dashboard/ExpectedReturnWaterfall';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { Button } from '@/components/ui/button';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { InfoCard } from '@/components/primitives/InfoCard';
import AlphaVsSWRDChart from '@/components/dashboard/AlphaVsSWRDChart';
import RollingMetricsChart from '@/components/dashboard/RollingMetricsChart';

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
  const [timelinePeriod, setTimelinePeriod] = useState<Period>('all');

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

  return (
    <div>
      {/* 1. Patrimônio — Evolução Histórica (moved first: contexto geral antes de análise) */}
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

      {/* 2. Performance Attribution — Decomposição do Patrimônio (moved second: explica de onde veio o retorno) */}
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
            { label: 'RF Local', value: attr.rf, color: 'var(--yellow)' },
          ];
          return (
            <>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                {cards.map(c => (
                  <div key={c.label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '10px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: c.color }}>{privacyMode ? '••••' : fmtR(c.value)}</div>
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

      {/* 3. Alpha vs VWRA — análise de performance diferencial */}
      <section className="section" id="alphaSwrdSection">
        <h2>{secTitle('performance', 'alpha', 'Alpha vs VWRA (benchmark) — Carteira Target por Período')}</h2>
        <DeltaBarChart data={safeData} height={200} />
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
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {/* Card A: Alpha ITD */}
              <InfoCard
                label="Alpha desde início"
                value={privacyMode ? '••%' : fmt(alphaItdPp)}
                description="vs VWRA (market-cap global) · acumulado"
                accentColor={alphaItdPp != null && alphaItdPp >= 0 ? 'var(--green)' : 'var(--red)'}
                bg="var(--bg)"
              />

              {/* Card B: Alpha anualizado */}
              <InfoCard
                label="Alpha anualizado"
                value={privacyMode ? '••%' : fmt(alphaAnualizadoPp)}
                description="média / ano desde início"
                accentColor={alphaAnualizadoPp != null && alphaAnualizadoPp >= 0 ? 'var(--green)' : 'var(--red)'}
                bg="var(--bg)"
              />

              {/* Card C: Alpha líquido esperado pós-haircut (académico) */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  Alpha líquido esperado
                  <span
                    title="Alpha líquido negativo no curto prazo é esperado — factor premiums emergem em horizontes >10 anos (McLean & Pontiff 2016, post-publication decay ~58%). O objetivo é capturar prêmios fatoriais, não superar o benchmark todo ano."
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(148,163,184,.2)', color: 'var(--muted)', fontSize: 10, cursor: 'help', flexShrink: 0, fontStyle: 'normal' }}
                  >
                    ⓘ
                  </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red)', lineHeight: 1.1 }}>
                  −0.16%/ano
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  McLean &amp; Pontiff 2016
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>
                  haircut 58% pós-publicação
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

      {/* 4. Premissas vs Realizado — 5 Anos (2021-2026) */}
      <section className="section" id="premissasVsRealizadoSection">
        <h2>{secTitle('performance', 'premissas', 'Premissas vs Realizado — 5 Anos (2021-2026)')}</h2>
        <PremisesTable />
        <div className="src">
          Fonte: TWR reconstruído (IBKR+RF) · Retornos: pós-IPCA real BRL · Drawdown: histórico carteira · Dados auditados
        </div>
      </section>

      {/* 5. Expected Return Waterfall — Decomposição Fatorial FF6 */}
      <CollapsibleSection id="section-expected-return-waterfall" title={secTitle('performance', 'factor-waterfall', 'Expected Return Waterfall — Decomposição Fatorial FF6')} defaultOpen={secOpen('performance', 'factor-waterfall', true)}>
        <ExpectedReturnWaterfall />
      </CollapsibleSection>

      {/* 6. Rolling 12m — AVGS vs SWRD (collapsible, collapsed) */}
      <CollapsibleSection id="section-factor-rolling" title={secTitle('performance', 'rolling-12m', 'Rolling 12m — AVGS vs SWRD (retorno relativo)')} defaultOpen={secOpen('performance', 'rolling-12m', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <DeltaBarChart data={safeData} title="AVGS vs SWRD — Retorno Relativo (Rolling 12m)" chartType="factor-rolling" />
          <div className="src">
            Linha vermelha = threshold −5pp (gatilho de revisão da tese fatorial). Janela: 12 meses.
          </div>
        </div>
      </CollapsibleSection>

      {/* 6. Information Ratio vs VWRA (collapsible, collapsed) */}
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

      {/* 7. Factor Loadings — Regressão Fama-French SF + Momentum (collapsible, collapsed) */}
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
            const wUS = 0.58;
            const wIntl = 0.42;
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

      {/* 8. Retornos Mensais — Heatmap (collapsible, collapsed) */}
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

      {/* 9. Rolling Sharpe — 12m (collapsible, collapsed) */}
      <CollapsibleSection id="section-rolling-sharpe" title={secTitle('performance', 'rolling-sharpe', 'Rolling Sharpe — 12m (BRL vs CDI + USD vs T-Bill)')} defaultOpen={secOpen('performance', 'rolling-sharpe', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <RollingSharpChart data={safeData} />
          <div className="src" style={{ lineHeight: 1.6 }}>
            <strong>Como ler:</strong> Sharpe mede retorno ajustado ao risco em janela de 12 meses.<br />
            <span style={{ color: 'rgba(34,197,94,.9)' }}>■</span> <strong>&gt;1</strong> = excelente{' '}
            <span style={{ color: 'rgba(234,179,8,.9)' }}>■</span> <strong>0–1</strong> = neutro{' '}
            <span style={{ color: 'rgba(239,68,68,.9)' }}>■</span> <strong>&lt;0</strong> = negativo (CDI venceu a carteira no período)
          </div>
        </div>
      </CollapsibleSection>

      {/* 9b. Alpha vs SWRD Chart — por período */}
      <CollapsibleSection id="section-alpha-chart" title={secTitle('performance', 'alpha-chart', 'Alpha vs SWRD — Gráfico por Período')} defaultOpen={secOpen('performance', 'alpha-chart', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
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
          <div className="src">
            since2020 ≈ 6a · since2013 ≈ 13a · since2009 ≈ 17a · all ≈ 21a. Alpha líquido: McLean &amp; Pontiff 2016, haircut 58%.
          </div>
        </div>
      </CollapsibleSection>

      {/* 9c. Rolling Metrics Chart */}
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

      {/* 10. Fee Analysis — Custo de Complexidade (collapsible, collapsed) */}
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
                  const equityTotal = wSwrd + wAvgs + wAvem;
                  const terSwrd = 0.0012;
                  const terAvgs = 0.0025;
                  const terAvem = 0.0018;
                  const terVwra = 0.0022;
                  const terPortfolio = equityTotal > 0
                    ? (wSwrd * terSwrd + wAvgs * terAvgs + wAvem * terAvem) / equityTotal
                    : 0.00171;
                  const pat = (data as any)?.fire_swr_percentis?.patrimonio_p50_2040 ?? 11500000;
                  const patMedio = pat / 2;
                  const fmtM = (v: number) => privacyMode ? '••••' : `R$ ${(v / 1e6).toFixed(2)}M`;
                  const custoPortfolio14a = patMedio * terPortfolio * 14;
                  const custoVwra14a = patMedio * terVwra * 14;
                  const alpha14a = patMedio * 0.0016 * 14;
                  const netPortfolio = alpha14a - custoPortfolio14a;
                  const rows = [
                    {
                      name: 'Portfolio Target (SWRD/AVGS/AVEM)',
                      ter: terPortfolio,
                      custo_14a: fmtM(custoPortfolio14a),
                      alpha_14a: `+${fmtM(alpha14a)}`,
                      net_vs_vwra: `+${fmtM(netPortfolio - (-custoVwra14a))}`,
                      highlight: true,
                    },
                    {
                      name: 'VWRA (benchmark)',
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
    </div>
  );
}
