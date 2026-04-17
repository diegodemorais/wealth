'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { AttributionChart } from '@/components/charts/AttributionChart';
import { DeltaBarChart } from '@/components/charts/DeltaBarChart';
import { RollingSharpChart } from '@/components/charts/RollingSharpChart';
import { InformationRatioChart } from '@/components/charts/InformationRatioChart';
import { PremisesTable } from '@/components/performance/PremisesTable';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { Button } from '@/components/ui/button';

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
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const privacyMode = useUiStore(s => s.privacyMode);
  const [timelinePeriod, setTimelinePeriod] = useState<Period>('all');

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados de performance...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>Erro ao carregar performance:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">Dados carregados mas seção de performance não disponível</div>;
  }

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
        <TimelineChart data={data} period={timelinePeriod} />
        <div className="src">
          Aportes cumulativos + Rentabilidade equity USD + Câmbio e RF. Decomposição via TWR.
        </div>
      </section>

      {/* 2. Performance Attribution — Decomposição do Patrimônio (moved second: explica de onde veio o retorno) */}
      <section className="section" id="attrSection">
        <h2>
          {secTitle('performance', 'attribution', 'Performance Attribution — Decomposição do Patrimônio')}{' '}
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'var(--muted)' }}>
            {data.attribution?._inicio ? `(desde ${data.attribution._inicio})` : ''}
          </span>
        </h2>
        <AttributionChart data={data} />
        {/* Attribution KPI cards — valores monetários em R$ */}
        {(() => {
          const attr = data.attribution;
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
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: c.color }}>{fmtR(c.value)}</div>
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
        <DeltaBarChart data={data} height={200} />
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
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                  Alpha desde início
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: alphaItdPp != null && alphaItdPp >= 0 ? 'var(--green)' : 'var(--red)', lineHeight: 1.1 }}>
                  {privacyMode ? '••%' : fmt(alphaItdPp)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  vs VWRA (market-cap global)
                </div>
              </div>

              {/* Card B: Alpha anualizado */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                  Alpha anualizado
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: alphaAnualizadoPp != null && alphaAnualizadoPp >= 0 ? 'var(--green)' : 'var(--red)', lineHeight: 1.1 }}>
                  {privacyMode ? '••%' : fmt(alphaAnualizadoPp)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  média / ano desde início
                </div>
              </div>

              {/* Card C: Alpha líquido esperado pós-haircut (académico) */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                  Alpha líquido esperado
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

      {/* 5. Rolling 12m — AVGS vs SWRD (collapsible, collapsed) */}
      <CollapsibleSection id="section-factor-rolling" title={secTitle('performance', 'rolling-12m', 'Rolling 12m — AVGS vs SWRD (retorno relativo)')} defaultOpen={secOpen('performance', 'rolling-12m', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <DeltaBarChart data={data} title="AVGS vs SWRD — Retorno Relativo (Rolling 12m)" chartType="factor-rolling" />
          <div className="src">
            Linha vermelha = threshold −5pp (gatilho de revisão da tese fatorial). Janela: 12 meses.
          </div>
        </div>
      </CollapsibleSection>

      {/* 6. Information Ratio vs VWRA (collapsible, collapsed) */}
      <CollapsibleSection id="section-ir" title={secTitle('performance', 'ir', 'Information Ratio vs VWRA — Desde o Início + Rolling 36m')} defaultOpen={secOpen('performance', 'ir', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <InformationRatioChart data={data} />
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
          <div className="src">
            Regressão FF5+Mom · Negrito = significativo (t ≥ 1.65, 90%+) · Desbotado = não significativo<br />
            *AVGS proxy = 58% AVUV + 42% AVDV (proxies canônicos Tier A — mesma metodologia Avantis · fonte: proxies-canonicos.md)
          </div>
        </div>
      </CollapsibleSection>

      {/* 8. Retornos Mensais — Heatmap (collapsible, collapsed) */}
      <CollapsibleSection id="section-heatmap" title={secTitle('performance', 'heatmap', 'Retornos Mensais — Heatmap')} defaultOpen={secOpen('performance', 'heatmap', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <MonthlyReturnsHeatmap data={(() => {
            if (data.monthly_returns && Object.keys(data.monthly_returns).length > 0) return data.monthly_returns;
            const rm = (data as any).retornos_mensais;
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
          <RollingSharpChart data={data} />
          <div className="src" style={{ lineHeight: 1.6 }}>
            <strong>Como ler:</strong> Sharpe mede retorno ajustado ao risco em janela de 12 meses.<br />
            <span style={{ color: 'rgba(34,197,94,.9)' }}>■</span> <strong>&gt;1</strong> = excelente{' '}
            <span style={{ color: 'rgba(234,179,8,.9)' }}>■</span> <strong>0–1</strong> = neutro{' '}
            <span style={{ color: 'rgba(239,68,68,.9)' }}>■</span> <strong>&lt;0</strong> = negativo (CDI venceu a carteira no período)
          </div>
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
                  const fmtM = (v: number) => `R$ ${(v / 1e6).toFixed(2)}M`;
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
