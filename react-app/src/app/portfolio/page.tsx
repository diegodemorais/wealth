'use client';

import { usePageData } from '@/hooks/usePageData';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import StackedAllocationBar from '@/components/dashboard/StackedAllocationBar';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { CustoBaseTable } from '@/components/portfolio/CustoBaseTable';
import { RFCryptoComposition } from '@/components/portfolio/RFCryptoComposition';
import ETFRegionComposition from '@/components/dashboard/ETFRegionComposition';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';
import { EtfsPositionsTable } from '@/components/dashboard/EtfsPositionsTable';
import BrasilConcentrationCard from '@/components/dashboard/BrasilConcentrationCard';
import BRLPurchasingPowerTimeline from '@/components/dashboard/BRLPurchasingPowerTimeline';
import RFStatusPanel from '@/components/dashboard/RFStatusPanel';
import { CryptoBandChart } from '@/components/dashboard/CryptoBandChart';
import RealYieldGauge from '@/components/dashboard/RealYieldGauge';
import IRDeferralSection from '@/components/dashboard/IRDeferralSection';
import { LotesTable } from '@/components/dashboard/LotesTable';
import DARFObligationsPanel from '@/components/dashboard/DARFObligationsPanel';
import HODL11PositionPanel from '@/components/dashboard/HODL11PositionPanel';
import { MetricCard } from '@/components/primitives/MetricCard';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { Globe, ClipboardList, Landmark, MapPin, BarChart3, Bitcoin } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { EChart } from '@/components/primitives/EChart';
import { EC, EC_AXIS_LABEL } from '@/utils/echarts-theme';

export default function PortfolioPage() {
  const { data, isLoading, dataError } = usePageData();
  const { privacyMode } = useUiStore();

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data,
    loadingText: 'Carregando dados da carteira...',
    errorPrefix: 'Erro ao carregar carteira:',
    warningText: 'Dados carregados mas carteira não disponível',
  });
  if (stateEl) return stateEl;

  const portfolioTotal = (data as any)?.patrimonio_holistico?.financeiro_brl ?? (data as any)?.premissas?.patrimonio_atual;
  const piorDrift = (() => {
    const drift = (data as any)?.drift;
    if (!drift) return null;
    let maxGap = 0;
    for (const [, v] of Object.entries(drift as Record<string, any>)) {
      if (v?.atual != null && v?.alvo != null) {
        const gap = Math.abs(v.atual - v.alvo);
        if (gap > maxGap) maxGap = gap;
      }
    }
    return maxGap > 0 ? maxGap : null;
  })();
  const irDiferido = (data as any)?.tax?.ir_diferido_total_brl;
  const concBrasil = (data as any)?.concentracao_brasil?.brasil_pct;
  const usSitusUsd = (data as any)?.tax?.estate_tax?.us_situs_total_usd;
  const showEstateAlert = usSitusUsd != null && usSitusUsd > 60000;

  const fmtBRL = (val: number | undefined | null) => {
    if (val == null) return '—';
    if (privacyMode) return fmtPrivacy(val ?? 0, true);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div>
      <SectionDivider label="Visão Geral" />
      {/* 0. Hero Strip */}
      <div className={`grid grid-cols-2 ${showEstateAlert ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-2 mb-4`}>
        <MetricCard
          label="Patrimônio Financeiro"
          value={fmtBRL(portfolioTotal)}
          size="sm"
        />
        <MetricCard
          label="Drift Máximo"
          value={piorDrift != null ? piorDrift.toFixed(1) + 'pp' : '—'}
          size="sm"
          valueColor={piorDrift != null && piorDrift > 5 ? 'text-red' : piorDrift != null && piorDrift > 3 ? 'text-yellow' : 'text-green'}
        />
        <MetricCard
          label="IR Diferido"
          value={fmtBRL(irDiferido)}
          size="sm"
        />
        <MetricCard
          label="Concentração Brasil"
          value={concBrasil != null ? concBrasil.toFixed(1) + '%' : '—'}
          size="sm"
        />
        {showEstateAlert && (
          <MetricCard
            label="US-Situs >$60k"
            value={fmtPrivacy(usSitusUsd / 1000, privacyMode, { prefix: '$' })}
            valueColor="text-red"
            size="sm"
            sub="Estate tax risk"
          />
        )}
      </div>

      {/* 1. Alocação — Por Classe de Ativo (moved first: visão geral antes do detalhe) */}
      <div data-testid="stacked-alloc" className="section">
        <h2>Alocação — Por Classe de Ativo</h2>
        {(() => {
          const conc = (data as any)?.concentracao_brasil ?? {};
          const comp = conc.composicao ?? {};
          const totalBrl = conc.total_portfolio_brl ?? 0;
          const rfDetalhe = comp.rf_detalhe ?? {};
          const ipcaBrl = (rfDetalhe.ipca2029 ?? 0) + (rfDetalhe.ipca2040 ?? 0) + (rfDetalhe.ipca2050 ?? 0);
          const rendaPlusBrl = rfDetalhe.renda2065 ?? 0;
          const cryptoBrl = (comp.hodl11_brl ?? 0) + (comp.crypto_legado_brl ?? 0);
          const rfTotal = comp.rf_total_brl ?? 0;
          const equityBrl = Math.max(0, totalBrl - rfTotal - cryptoBrl);
          return (
            <StackedAllocationBar
              equityBrl={equityBrl}
              ipcaBrl={ipcaBrl}
              rendaPlusBrl={rendaPlusBrl}
              cryptoBrl={cryptoBrl}
              totalBrl={totalBrl}
            />
          );
        })()}
      </div>

      <SectionDivider label="Alocação & Drift" />

      {/* Gap H: Factor Drought Counter — badge AVGS vs SWRD */}
      {(() => {
        const fs = (data as any)?.factor_signal;
        if (!fs) return null;
        const excessYtd: number = fs.excess_ytd_pp ?? 0;
        const excessSinceLaunch: number = fs.excess_since_launch_pp ?? 0;
        const mesesDesde: number = Math.round(fs.meses_desde_launch ?? 0);
        const avgsLaunchDate: string = fs.avgs_launch_date ?? '';
        // Drought = meses de underperformance consecutiva. Se excess > 0 atualmente, drought = 0.
        // Use backtest_r7.factor_drought for historical context (max drought = 153m).
        const maxMesesHistorico: number = (data as any)?.backtest_r7?.factor_drought?.max_meses ?? 153;
        // Current drought: approximation — if excess_since_launch >= 0, AVGS is ahead; no drought right now.
        const droughtAtual = excessSinceLaunch >= 0 ? 0 : mesesDesde;
        const droughtStatus = droughtAtual === 0 ? 'verde' : droughtAtual < 12 ? 'verde' : droughtAtual < 24 ? 'amarelo' : 'vermelho';
        const droughtColor = droughtStatus === 'verde' ? 'var(--green)' : droughtStatus === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
        return (
          <div
            data-testid="factor-drought-counter"
            style={{
              background: 'var(--card)',
              border: `1px solid ${droughtColor}40`,
              borderLeft: `3px solid ${droughtColor}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Factor Drought — AVGS vs SWRD</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: droughtColor }}>
                {droughtAtual === 0 ? 'Sem drought' : `${droughtAtual}m underperformance`}
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Excess YTD</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: excessYtd >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {excessYtd >= 0 ? '+' : ''}{excessYtd.toFixed(2)}pp
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Excess Desde Lançamento</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: excessSinceLaunch >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {excessSinceLaunch >= 0 ? '+' : ''}{excessSinceLaunch.toFixed(2)}pp · {mesesDesde}m
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: '100%', marginTop: -4 }}>
              Desde {avgsLaunchDate} · Pior drought histórico: {maxMesesHistorico}m · Threshold: verde &lt;12m · amarelo 12–24m · vermelho &gt;24m
            </div>
          </div>
        );
      })()}

      {/* Gap W: Factor Tracking Error Rolling 12m — AVGS vs SWRD */}
      {(() => {
        const fr = (data as any)?.factor_rolling;
        if (!fr?.dates?.length) return null;
        const dates: string[] = fr.dates;
        const diffs: number[] = fr.avgs_vs_swrd_12m;
        const thresholdYellow: number = fr.threshold ?? -5;
        const thresholdRed: number = fr.threshold_red ?? -10;
        const droughtMonths: number = fr.drought_months ?? 0;
        const status: string = fr.status ?? 'green';
        const latestDiff: number = diffs[diffs.length - 1] ?? 0;
        const statusColor = status === 'red' ? 'var(--red)' : status === 'yellow' ? 'var(--yellow)' : 'var(--green)';
        const droughtLabel = droughtMonths === 0
          ? 'Sem drought ativo'
          : `${droughtMonths}m consecutivos abaixo de 0`;

        const chartOption = {
          animation: false,
          grid: { top: 28, right: 16, bottom: 28, left: 40 },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: { color: 'var(--muted)', fontSize: 10, rotate: 45 },
            axisLine: { lineStyle: { color: 'var(--border)' } },
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: 'var(--muted)', fontSize: 10, formatter: (v: number) => `${v}pp` },
            splitLine: { lineStyle: { color: 'var(--border)', opacity: 0.4 } },
          },
          visualMap: {
            show: false,
            pieces: [
              { lte: thresholdRed,    color: 'var(--red)'    },
              { gt: thresholdRed, lte: thresholdYellow, color: 'var(--yellow)' },
              { gt: thresholdYellow,  color: 'var(--green)'  },
            ],
          },
          series: [
            {
              type: 'line',
              data: diffs,
              smooth: true,
              symbol: 'circle',
              symbolSize: 5,
              lineStyle: { width: 2 },
              markLine: {
                silent: true,
                data: [
                  { yAxis: 0,              lineStyle: { color: 'var(--border)',  type: 'dashed', width: 1 } },
                  { yAxis: thresholdYellow, lineStyle: { color: 'var(--yellow)', type: 'dashed', width: 1 } },
                  { yAxis: thresholdRed,    lineStyle: { color: 'var(--red)',    type: 'dashed', width: 1 } },
                ],
                label: { show: false },
              },
            },
          ],
          tooltip: {
            trigger: 'axis',
            formatter: (params: any[]) => {
              const p = params[0];
              return `${p.name}<br/>Excess: <b>${p.value >= 0 ? '+' : ''}${p.value}pp</b>`;
            },
          },
        };

        return (
          <div
            data-testid="factor-tracking-error"
            style={{
              background: 'var(--card)',
              border: `1px solid ${statusColor}40`,
              borderLeft: `3px solid ${statusColor}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  Tracking Error Rolling 12m — AVGS vs SWRD
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: statusColor }}>
                  {latestDiff >= 0 ? '+' : ''}{latestDiff.toFixed(2)}pp
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)', marginLeft: 8 }}>
                    {droughtLabel}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', lineHeight: 1.5 }}>
                Amarelo ≤{thresholdYellow}pp · Vermelho ≤{thresholdRed}pp<br />
                {dates.length} pontos · janela 12m
              </div>
            </div>
            <EChart option={chartOption} style={{ height: 160 }} />
          </div>
        );
      })()}

      {/* Gap U: Factor Value Spread — AQR HML Devil + KF SMB */}
      {(() => {
        const fvs = (data as any)?.factor?.value_spread;
        if (!fvs) return null;
        const status: string = fvs.status ?? 'neutral';
        const pctSv: number = fvs.percentile_sv ?? 0;
        const svPct: number = fvs.sv_proxy_3m_pct ?? 0;
        const lastUpdated: string = fvs.last_updated ?? '';
        const statusColor =
          status === 'wide'       ? 'var(--green)'  :
          status === 'compressed' ? 'var(--red)'    : 'var(--yellow)';
        const label: string = fvs.status_label ?? 'Neutro';
        return (
          <div
            data-testid="factor-value-spread"
            style={{
              background: 'var(--card)',
              border: `1px solid ${statusColor}40`,
              borderLeft: `3px solid ${statusColor}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Factor Value Spread — AVGS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: statusColor }}>
                {label}
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Percentil HML</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                P{Math.round(fvs.percentile_hml ?? 0)}
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Percentil SV</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: statusColor }}>
                P{Math.round(pctSv)}
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>SV Proxy (acum. 36m)</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: svPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {svPct >= 0 ? '+' : ''}{svPct.toFixed(2)}%
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: '100%', marginTop: -4 }}>
              AVGS · AQR HML Devil + KF SMB · Pesos 58/42 · {lastUpdated} · wide &gt;P75 · compressed &lt;P25
            </div>
          </div>
        );
      })()}

      {/* 2b. Drift Intra-Equity — SWRD / AVGS / AVEM */}
      {data?.drift && (() => {
        // Threshold constants (mirror dataWiring.ts)
        const DRIFT_VERDE_PP = 3;
        const DRIFT_AMARELO_PP = 5;
        const eq = ['SWRD', 'AVGS', 'AVEM'];
        const eqData = eq.map(k => ({ name: k, ...(data.drift as Record<string, any>)[k] })).filter(d => d.atual != null);
        if (!eqData.length) return null;
        const totalAtual = eqData.reduce((s, d) => s + d.atual, 0);
        const totalAlvo = eqData.reduce((s, d) => s + d.alvo, 0);
        return (
          <div data-testid="drift-semaforo-etf">
          <CollapsibleSection id="section-drift-intra-equity" title="Drift Intra-Equity — SWRD / AVGS / AVEM" defaultOpen={secOpen('portfolio', 'drift-intra-equity', true)}>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {eqData.map((etf) => {
                const pctAtual = totalAtual > 0 ? (etf.atual / totalAtual) * 100 : 0;
                const pctAlvo = totalAlvo > 0 ? (etf.alvo / totalAlvo) * 100 : 0;
                const delta = pctAtual - pctAlvo;
                const absGap = Math.abs(delta);
                const isAbove = delta > 0;
                const deltaColor = absGap <= DRIFT_VERDE_PP ? 'var(--green)'
                  : absGap <= DRIFT_AMARELO_PP ? 'var(--yellow)' : 'var(--red)';
                const sign = delta >= 0 ? '+' : '';
                // Threshold band markers on bar: bar goes 0→100% (allocation axis)
                // threshold lines placed at alvo ± N pp relative to 0-100 scale
                const barMax = Math.max(pctAtual, pctAlvo) + 6; // add headroom
                const verdeLine1Pct = Math.max(0, Math.min(100, ((pctAlvo - DRIFT_VERDE_PP) / barMax) * 100));
                const verdeLine2Pct = Math.max(0, Math.min(100, ((pctAlvo + DRIFT_VERDE_PP) / barMax) * 100));
                const amarLine1Pct = Math.max(0, Math.min(100, ((pctAlvo - DRIFT_AMARELO_PP) / barMax) * 100));
                const amarLine2Pct = Math.max(0, Math.min(100, ((pctAlvo + DRIFT_AMARELO_PP) / barMax) * 100));
                const alvoLinePct = Math.max(0, Math.min(100, (pctAlvo / barMax) * 100));
                const actualLinePct = Math.max(0, Math.min(100, (pctAtual / barMax) * 100));
                return (
                  <div key={etf.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{etf.name}</span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                          atual <strong style={{ color: 'var(--text)' }}>{pctAtual.toFixed(1)}%</strong>
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                          alvo <strong style={{ color: 'var(--text)' }}>{pctAlvo.toFixed(1)}%</strong>
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: deltaColor }}>
                          {sign}{delta.toFixed(1)}pp
                        </span>
                      </div>
                    </div>
                    {/* Bar track with threshold band markers */}
                    <div style={{ position: 'relative', height: 12, background: 'rgba(148,163,184,.15)', borderRadius: 5, overflow: 'visible' }}>
                      {/* Verde band background (alvo ± 3pp) */}
                      <div style={{
                        position: 'absolute', top: 0, height: '100%',
                        left: `${verdeLine1Pct}%`,
                        width: `${Math.max(0, verdeLine2Pct - verdeLine1Pct)}%`,
                        background: 'rgba(34,197,94,.10)',
                        borderRadius: 2,
                      }} />
                      {/* Actual fill */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${actualLinePct}%`,
                        background: deltaColor,
                        borderRadius: 5,
                        opacity: 0.8,
                        transition: 'width .4s',
                      }} />
                      {/* Threshold lines: ±3pp (verde) */}
                      <div style={{ position: 'absolute', left: `${verdeLine1Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--green)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', left: `${verdeLine2Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--green)', opacity: 0.6 }} />
                      {/* Threshold lines: ±5pp (amarelo) */}
                      <div style={{ position: 'absolute', left: `${amarLine1Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--yellow)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', left: `${amarLine2Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--yellow)', opacity: 0.6 }} />
                      {/* Target marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${alvoLinePct}%`,
                        top: -4, bottom: -4, width: 2,
                        background: 'var(--muted)',
                        transform: 'translateX(-50%)',
                        borderRadius: 1,
                      }} />
                      {/* Target label */}
                      <div style={{
                        position: 'absolute',
                        left: `${alvoLinePct}%`,
                        top: 16, fontSize: 'var(--text-xs)', color: 'var(--muted)',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}>▲ {pctAlvo.toFixed(0)}%</div>
                    </div>
                    <div style={{ marginBottom: 14 }} />
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <span style={{ color: 'var(--green)' }}>● verde ≤3pp</span>
              <span style={{ color: 'var(--yellow)' }}>● amarelo 3–5pp</span>
              <span style={{ color: 'var(--red)' }}>● vermelho &gt;5pp</span>
              <span>· rebalanceamento via aporte</span>
            </div>
            <div className="src">Drift = % intra-equity (sobre total equity). Alvo IPS: SWRD 50% / AVGS 30% / AVEM 20%.</div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* 3. Exposição Geográfica — via ETFRegionComposition (mais detalhado; DonutCharts removido por redundância) */}
      {/* 4. Composição por Região — ETFs da Carteira (collapsible) */}
      <div data-testid="exposicao-geografica">
      <CollapsibleSection
        id="section-etf-region"
        title={secTitle('portfolio', 'etf-region')}
        defaultOpen={secOpen('portfolio', 'etf-region')}
        icon={<Globe size={18} />}
      >
        <div style={{ padding: '16px' }}>
          <ETFRegionComposition />
          <div className="src">Fonte: etf_composition.json · SWRD=MSCI World, AVGS=Global Small Cap Value, AVEM=Emerging Markets</div>
        </div>
      </CollapsibleSection>
      </div>

      <SectionDivider label="Holdings" />
      {/* 5. Posições — ETFs Internacionais (IBKR) — com EtfsPositionsTable como sub-seção */}
      <HoldingsTable />

      {data?.posicoes && (
        <div data-testid="posicoes-etfs-ibkr">
        <CollapsibleSection
          id="section-etf-positions"
          title="Ver detalhe por lote IBKR"
          defaultOpen={secOpen('portfolio', 'etf-positions', false)}
          icon={<ClipboardList size={18} />}
        >
          <div style={{ padding: '16px' }}>
            <EtfsPositionsTable data={data.posicoes} />
          </div>
        </CollapsibleSection>
        </div>
      )}

      {/* 6. Base de Custo e Alocação — Equity por Bucket (collapsible) */}
      <div data-testid="custo-base-bucket">
      <CustoBaseTable defaultOpen={secOpen('portfolio', 'custo-base')} />
      </div>

      <SectionDivider label="Tax & Atividade" />

      {/* 6a. DARF Obligations Panel — Lei 14.754/2023 compliance */}
      {data?.realized_pnl && (
        <CollapsibleSection
          id="section-darf-obligations"
          title={secTitle('portfolio', 'darf-obligations', 'DARF & Obrigações Fiscais — Lei 14.754/2023')}
          defaultOpen={secOpen('portfolio', 'darf-obligations', true)}
          icon={<Landmark size={18} />}
        >
          <div style={{ padding: '16px' }}>
            <DARFObligationsPanel realizedPnl={(data as any).realized_pnl} cambio={data.cambio} />
          </div>
        </CollapsibleSection>
      )}

      {/* 7. IR Diferido — Alvo & Transitório + IR Shield (collapsible) */}
      <div data-testid="ir-diferido">
      <CollapsibleSection
        id="section-tax-ir"
        title={secTitle('portfolio', 'tax-ir')}
        defaultOpen={secOpen('portfolio', 'tax-ir', false)}
        icon={<Landmark size={18} />}
      >
        <div style={{ padding: '16px' }}>
          {(() => {
            const taxData = (data as any)?.tax ?? {};
            const irPorEtfRaw = taxData?.ir_por_etf ?? {};
            const irPorEtf = Object.entries(irPorEtfRaw)
              .map(([ticker, etf]: [string, any]) => ({
                ticker,
                custo_total_brl: etf.custo_total_brl ?? 0,
                valor_atual_brl: etf.valor_atual_brl ?? 0,
                ganho_brl: etf.ganho_brl ?? 0,
                ir_estimado: etf.ir_estimado ?? 0,
              }))
              .sort((a, b) => b.ir_estimado - a.ir_estimado);
            return (
              <IRDeferralSection
                irDiferidoTotal={taxData?.ir_diferido_total_brl ?? 0}
                patrimonioTotal={(data as any)?.patrimonio_holistico?.financeiro_brl ?? (data as any)?.premissas?.patrimonio_atual ?? 0}
                irPorEtf={irPorEtf}
                lotes={(data as any)?.tlh ?? []}
                gatilho={(data as any)?.tlhGatilho ?? 0.05}
                cambio={(data as any)?.mercado?.cambio_brl_usd ?? (data as any)?.patrimonio?.cambio ?? 5.15}
              />
            );
          })()}
        </div>
      </CollapsibleSection>
      </div>

      {/* Lotes IBKR — FIFO individuais com P&L e TLH eligibility */}
      {(() => {
        const tlhLotes = (data as any)?.tlh_lotes;
        if (!tlhLotes?.lots?.length) return null;
        const posicoes = (data as any)?.posicoes ?? {};
        const priceMap: Record<string, number> = {};
        for (const [tk, p] of Object.entries(posicoes as Record<string, any>)) {
          if (p?.price) priceMap[tk] = p.price;
        }
        // Also check tlh array for prices
        const tlhArr = (data as any)?.tlh ?? [];
        for (const t of tlhArr) {
          if (t.ticker && t.price) priceMap[t.ticker] = t.price;
        }
        const cambio = (data as any)?.mercado?.cambio_brl_usd ?? 5.0;
        return (
          <div data-testid="tlh-monitor">
          <CollapsibleSection
            id="section-lotes-ibkr"
            title="Lotes IBKR — FIFO Individual (213 lotes)"
            defaultOpen={secOpen('portfolio', 'section-lotes-ibkr', false)}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <LotesTable
                lots={tlhLotes.lots}
                summary={tlhLotes.summary}
                prices={priceMap}
                cambio={cambio}
              />
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      <SectionDivider label="Renda Fixa & Cripto" />

      {/* Gap D: Widget Gatilho Renda+ 2065 */}
      {(() => {
        const rp = (data as any)?.dca_status?.renda_plus;
        if (!rp) return null;
        const taxaAtual: number = rp.taxa_atual ?? 0;
        const pisoCompra: number = rp.piso_compra ?? 6.5;
        const pisoVenda: number = rp.piso_venda ?? 6.0;
        const gapPp: number = rp.gap_pp ?? 0; // distância para piso compra
        const dcaAtivo: boolean = rp.ativo ?? false;
        // Status: verde=longe, amarelo=dentro de 50bps, vermelho=abaixo do piso compra
        const rendaStatus = taxaAtual < pisoVenda ? 'vermelho' : taxaAtual < pisoCompra ? 'amarelo' : gapPp <= 0.5 ? 'amarelo' : 'verde';
        const rendaColor = rendaStatus === 'verde' ? 'var(--green)' : rendaStatus === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
        const gapParaGatilho = taxaAtual - pisoCompra; // positivo = acima do gatilho de compra
        return (
          <div
            data-testid="renda-plus-gatilho"
            style={{
              background: 'var(--card)',
              border: `1px solid ${rendaColor}40`,
              borderLeft: `3px solid ${rendaColor}`,
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Renda+ 2065 — Taxa Atual</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: rendaColor }}>{taxaAtual.toFixed(2)}%</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gatilho DCA (compra)</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>≥ {pisoCompra.toFixed(1)}%</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Distância do Gatilho</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: rendaColor }}>
                {gapParaGatilho >= 0 ? '+' : ''}{(gapParaGatilho * 100).toFixed(0)}bps
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Status DCA</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: dcaAtivo ? 'var(--green)' : 'var(--muted)' }}>
                {dcaAtivo ? '● Ativo' : '○ Pausado'}
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: '100%', marginTop: -4 }}>
              Gatilho venda: ≤{pisoVenda.toFixed(1)}% · {rp.proxima_acao ?? ''}
            </div>
          </div>
        );
      })()}

      {/* 8. Renda Fixa */}
      <RFCryptoComposition />

      {/* 8a. Concentração Brasil — MERGE de ConcentrationChart + BrasilConcentrationCard */}
      {data && (
        <CollapsibleSection
          id="section-brasil-concentration"
          title={secTitle('portfolio', 'brasil-concentration', 'Concentração Brasil — Exposição Soberana & RF')}
          defaultOpen={secOpen('portfolio', 'brasil-concentration', false)}
          icon={<MapPin size={18} />}
        >
          <div style={{ padding: '16px' }}>
            <ConcentrationChart data={data} />
            {data?.concentracao_brasil && (() => {
              const c = (data as any).concentracao_brasil ?? {};
              const comp = c.composicao ?? {};
              const rfDetalhe = comp.rf_detalhe ?? {};
              return (
                <div style={{ marginTop: 12 }}>
                  {/* DEV-coe-hodl11-classificacao: hodl11→coeNet; HODL11 é cripto global, não Brasil */}
                  <BrasilConcentrationCard
                    coeNet={comp.coe_net_brl ?? 0}
                    ipcaTotal={(rfDetalhe.ipca2029 ?? 0) + (rfDetalhe.ipca2040 ?? 0) + (rfDetalhe.ipca2050 ?? 0)}
                    rendaPlus={rfDetalhe.renda2065 ?? 0}
                    cryptoLegado={comp.crypto_legado_brl ?? 0}
                    totalBrl={c.total_brasil_brl ?? 0}
                    concentrationBrazil={(c.brasil_pct ?? 0) / 100}
                  />
                </div>
              );
            })()}
          </div>
        </CollapsibleSection>
      )}

      {/* 8b. Sensibilidade Cambial — movido de Decisão do Mês (contexto de risco, não de aporte) */}
      {(() => {
        const cambio = data?.mercado?.cambio_brl_usd ?? null;
        const exposicaoCambialPct = (data as any)?.macro?.exposicao_cambial_pct ?? 87.9;
        const patrimonioAtual = (data as any)?.premissas?.patrimonio_atual ?? null;
        const equityPctUsd = exposicaoCambialPct / 100;
        if (cambio == null || patrimonioAtual == null) return null;
        return (
          <CollapsibleSection
            id="section-brl-fx-portfolio"
            title={secTitle('portfolio', 'brl-fx', 'Sensibilidade Cambial — Equity USD em BRL')}
            defaultOpen={secOpen('portfolio', 'brl-fx', false)}
            icon="💱"
          >
            <div style={{ padding: '0 16px 16px' }}>
              <BRLPurchasingPowerTimeline
                cambio={cambio}
                equityPctUsd={equityPctUsd}
                patrimonioAtual={patrimonioAtual}
              />
              <div className="text-xs text-muted mt-2">
                Projeção do valor da equity em BRL sob diferentes cenários cambiais. Retorno USD nominal: 7% a.a.
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* 8e. Real Yield Gauge — rendimento real líquido de IR das NTN-Bs (defaultOpen=true) */}
      {data?.rf && (
        <CollapsibleSection
          id="section-real-yield"
          title={secTitle('portfolio', 'real-yield', 'Real Yield Gauge — NTN-Bs Líquido de IR')}
          defaultOpen={secOpen('portfolio', 'real-yield', false)}
          icon={<BarChart3 size={18} />}
        >
          <div style={{ padding: '16px' }}>
            <RealYieldGauge
              ipca2029={(data as any).rf.ipca2029}
              ipca2040={(data as any).rf.ipca2040}
              ipca2050={(data as any).rf.ipca2050}
              renda2065={(data as any).rf.renda2065}
              ipca12m={(data as any).macro?.ipca_12m ?? undefined}
              selicMeta={(data as any).macro?.selic_meta ?? undefined}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* 8f. RF Status — drill-down por instrumento (movido do home, pertence ao contexto RF) */}
      {data?.rf && (() => {
        const rf = (data as any).rf ?? {};
        const dcaStatus = (data as any).dca_status ?? {};
        const patAtual = (data as any)?.premissas?.patrimonio_atual ?? 0;
        const pct = (v: number) => patAtual > 0 ? (v / patAtual) * 100 : 0;
        const ipca2040V = rf.ipca2040?.valor ?? rf.ipca2040?.valor_brl ?? 0;
        const ipca2050V = rf.ipca2050?.valor ?? rf.ipca2050?.valor_brl ?? 0;
        const renda2065V = rf.renda2065?.valor ?? rf.renda2065?.valor_brl ?? 0;
        const rfRows = [
          { id: 'ipca2040', label: 'IPCA+ 2040', taxaAtual: rf.ipca2040?.taxa, piso: dcaStatus.ipca_longo?.piso, gap: dcaStatus.ipca_longo?.gap_alvo_pp, pctAtual: pct(ipca2040V), pctAlvo: dcaStatus.ipca2040?.alvo_pct ?? 12, valor: ipca2040V, dcaAtivo: dcaStatus.ipca_longo?.ativo ?? dcaStatus.ipca2040?.ativo, duration: 21.3 },
          { id: 'ipca2050', label: 'IPCA+ 2050', taxaAtual: rf.ipca2050?.taxa, piso: dcaStatus.ipca2050?.piso, gap: dcaStatus.ipca2050?.gap_alvo_pp, pctAtual: pct(ipca2050V), pctAlvo: dcaStatus.ipca2050?.alvo_pct ?? 3, valor: ipca2050V, dcaAtivo: dcaStatus.ipca2050?.ativo, duration: 24.5 },
          { id: 'renda2065', label: 'Renda+ 2065', taxaAtual: rf.renda2065?.distancia_gatilho?.taxa_atual ?? rf.renda2065?.taxa, piso: rf.renda2065?.distancia_gatilho?.piso_venda, gap: rf.renda2065?.distancia_gatilho?.gap_pp, pctAtual: pct(renda2065V), pctAlvo: dcaStatus.renda_plus?.alvo_pct ?? 5, valor: renda2065V, dcaAtivo: dcaStatus.renda_plus?.ativo, duration: 43.6 },
        ];
        return (
          <div data-testid="rf-posicoes">
          <CollapsibleSection
            id="section-rf-status"
            title={secTitle('portfolio', 'rf-status', 'RF Status — IPCA+ & Renda+ por Instrumento')}
            defaultOpen={secOpen('portfolio', 'rf-status', false)}
            icon={<BarChart3 size={18} />}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <RFStatusPanel rows={rfRows} />
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* 8g. COE + Empréstimo XP (DEV-coe-hodl11-classificacao 2026-04-24) */}
      {(data as any)?.coe_net_brl > 0 && (() => {
        const coeNet = (data as any).coe_net_brl;
        // Valores brutos da composição (disponíveis via concentracao_brasil.composicao)
        const coeBruto = (data as any)?.concentracao_brasil?.composicao?.coe_net_brl ?? coeNet;
        // Ativo ~R$172k, empréstimo ~-R$108k (derivados do net)
        const ativoEst = Math.round(coeBruto / 0.372);   // estimativa estrutural (net ≈ 37.2% do ativo)
        const emprestimoEst = ativoEst - coeBruto;
        return (
          <CollapsibleSection
            id="section-coe-xp"
            title={secTitle('portfolio', 'coe-xp', 'COE + Empréstimo XP — Operação Estruturada')}
            defaultOpen={secOpen('portfolio', 'coe-xp', false)}
            icon={<Landmark size={18} />}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', background: 'var(--bg)', padding: '8px 12px', borderRadius: 6 }}>
                Produto estruturado BRL na XP. Fonte de verdade: aba Histórico (Google Sheets, lida via gviz API).
                Classificação geográfica: <strong>Brasil</strong> (BRL soberano + risco XP).
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--card2)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>COE Ativo (est.)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>
                    {fmtPrivacy(ativoEst, privacyMode)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>XP0121A3C3W (BRL)</div>
                </div>
                <div style={{ background: 'var(--card)', border: '1px solid var(--card2)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Empréstimo XP (est.)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'var(--red)' }}>
                    {privacyMode ? '••••' : `-${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(emprestimoEst)}`}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Passivo BRL (XP)</div>
                </div>
                <div style={{ background: 'var(--card)', border: '1px solid var(--card2)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Posição Net</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'var(--green)' }}>
                    {fmtPrivacy(coeBruto, privacyMode)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Ativo − Empréstimo</div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* 9a. HODL11 Position Panel — recebido de BACKTEST */}
      {data?.hodl11 && (
        <div data-testid="hodl11-pnl">
        <HODL11PositionPanel hodl11={(data as any).hodl11} />
        </div>
      )}

      {/* 9b. Crypto Band Chart */}
      {data?.hodl11?.banda && (
        <CollapsibleSection
          id="section-crypto-band"
          title={secTitle('portfolio', 'crypto-band', 'HODL11 — Banda Criptográfica')}
          defaultOpen={secOpen('portfolio', 'crypto-band', false)}
          icon={<Bitcoin size={18} />}
        >
          <div style={{ padding: '16px' }}>
            <CryptoBandChart
              banda={(data as any).hodl11.banda}
              label="HODL11 — BTC Wrapper — B3"
              valor={(data as any).hodl11?.valor}
              pnl_pct={(data as any).hodl11?.pnl_pct}
            />
          </div>
        </CollapsibleSection>
      )}


      {/* ── R3: Risk Contribution Chart ─────────────────────────────────────── */}
      <SectionDivider label="Análise de Risco" />
      {(() => {
        const risk = (data as any)?.risk;
        const contribs: Array<{ name: string; weight: number; risk_contribution_pct: number }> =
          risk?.contribution_by_asset ?? [];
        if (contribs.length === 0) return null;
        const sortedContribs = [...contribs].sort((a, b) => b.risk_contribution_pct - a.risk_contribution_pct);
        const chartColors = [EC.accent, EC.green, EC.orange, EC.purple, EC.cyan];
        const barOption = {
          backgroundColor: 'transparent',
          grid: { left: 60, right: 20, top: 10, bottom: 20 },
          xAxis: {
            type: 'value' as const,
            axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
            splitLine: { lineStyle: { color: '#21262d' } },
          },
          yAxis: {
            type: 'category' as const,
            data: sortedContribs.map(c => c.name),
            axisLabel: EC_AXIS_LABEL,
            axisLine: { show: false },
          },
          series: [{
            type: 'bar' as const,
            data: sortedContribs.map((c, i) => ({
              value: c.risk_contribution_pct,
              itemStyle: { color: chartColors[i % chartColors.length] },
            })),
            barMaxWidth: 28,
            label: {
              show: !privacyMode,
              position: 'right' as const,
              color: EC.muted,
              fontSize: 10,
              formatter: (p: { value: number }) => `${(p.value * 100).toFixed(0)}%`,
            },
          }],
          tooltip: {
            backgroundColor: EC.card,
            borderColor: '#30363d',
            textStyle: { color: EC.text, fontSize: 11 },
            formatter: (p: { name: string; value: number }) =>
              `${p.name}: ${(p.value * 100).toFixed(1)}% risco`,
          },
        };
        return (
          <CollapsibleSection
            id="section-risk-contribution"
            title={secTitle('portfolio', 'risk-contribution', 'Contribuição ao Risco — por Ativo')}
            defaultOpen={secOpen('portfolio', 'risk-contribution', false)}
            icon={<BarChart3 size={18} />}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <div data-testid="risk-contribution-chart">
                <EChart option={barOption} style={{ height: 180 }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                {sortedContribs.map((c, i) => (
                  <div key={c.name} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: chartColors[i % chartColors.length], fontWeight: 700, textTransform: 'uppercase' }}>{c.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>
                      {privacyMode ? '••%' : `${(c.risk_contribution_pct * 100).toFixed(0)}% risco`}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                      peso {privacyMode ? '••%' : `${(c.weight * 100).toFixed(1)}%`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="src">
                Contribuição ao risco = volatilidade implícita × peso, normalizado. Não considera correlação entre ativos. Volatilidades: SWRD 14%, AVGS 19%, AVEM 18%, HODL11 75%, RF 5%.
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* ── R4: Duration Scenarios Table ─────────────────────────────────────── */}
      {(() => {
        const risk = (data as any)?.risk;
        const scenarios: Array<{
          shift_pp: number;
          renda_plus_mtm_pct: number;
          renda_plus_mtm_brl: number | null;
          renda_plus_mtm_portfolio_pct?: number;
          with_convexity_note?: boolean;
        }> = risk?.duration_scenarios ?? [];
        if (scenarios.length === 0) return null;
        return (
          <CollapsibleSection
            id="section-duration-scenarios"
            title={secTitle('portfolio', 'duration-scenarios', 'Cenários de Duration — Renda+ 2065')}
            defaultOpen={secOpen('portfolio', 'duration-scenarios', false)}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <div data-testid="duration-scenarios-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600 }}>Shift de Juros</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600 }}>MtM Renda+ (%)</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600 }}>MtM Renda+ (R$)</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600 }}>% do Portfólio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(s => (
                      <tr key={s.shift_pp} style={{ borderBottom: '1px solid var(--card2)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>+{s.shift_pp}pp</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--red)', fontWeight: 700 }}>
                          {privacyMode ? '••%' : `${(s.renda_plus_mtm_pct * 100).toFixed(2)}%`}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)' }}>
                          {privacyMode ? '••••' : (s.renda_plus_mtm_brl != null
                            ? fmtBRL(s.renda_plus_mtm_brl)
                            : '—')}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
                          {s.renda_plus_mtm_portfolio_pct != null
                            ? (privacyMode ? '••%' : `${(s.renda_plus_mtm_portfolio_pct * 100).toFixed(2)}%`)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="src">
                MtM = Mark-to-Market. Modified Duration × shift (sem convexidade — estimativa conservadora).
                Renda+ 2065 é posição tática (~3.4% do portfólio). Impacto no portfólio total = % Renda+ × peso da posição.
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* ── Gap S: Renda+ MtM P&L ────────────────────────────────────────────── */}
      {(() => {
        const mtm = (data as any)?.renda_plus_mtm;
        if (!mtm) return null;
        const pnlBrl: number = mtm.mtm_brl ?? 0;
        const pnlPct: number = mtm.mtm_pct ?? 0;
        const taxaEntrada: number = mtm.taxa_entrada ?? 0;
        const taxaAtual: number = mtm.taxa_atual ?? 0;
        const deltaTaxa: number = mtm.delta_taxa_pp ?? 0;
        const cor = pnlBrl >= 0 ? 'var(--green)' : 'var(--red)';
        return (
          <div data-testid="renda-plus-mtm-pnl">
          <CollapsibleSection
            id="section-renda-plus-mtm"
            title={secTitle('portfolio', 'renda-plus-mtm', 'Renda+ MtM P&L — Mark-to-Market')}
            defaultOpen={secOpen('portfolio', 'renda-plus-mtm', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Taxa Entrada</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                    {taxaEntrada.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>IPCA+ a.a.</div>
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Taxa Atual</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: deltaTaxa > 0 ? 'var(--red)' : deltaTaxa < 0 ? 'var(--green)' : 'var(--text)' }}>
                    {taxaAtual.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                    {deltaTaxa !== 0 ? `Δ ${deltaTaxa > 0 ? '+' : ''}${deltaTaxa.toFixed(2)}pp` : 'sem variação'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', border: `1px solid ${cor}40`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>P&L MtM (R$)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: cor }}>
                    {privacyMode ? fmtPrivacy(pnlBrl, true) : fmtBRL(pnlBrl)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>mark-to-market</div>
                </div>
                <div style={{ background: 'var(--bg)', border: `1px solid ${cor}40`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>P&L MtM (%)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: cor }}>
                    {privacyMode ? '••%' : `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>sobre valor investido</div>
                </div>
              </div>
              <div className="src">
                ΔP ≈ −ModDur × Δtaxa × valor investido. ModDur = {mtm.mod_dur?.toFixed(2)} anos.
                MtM = 0 quando taxa entrada = taxa atual (sem variação de mercado).
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* ── Gap Q: Break-Even IPCA+ vs Selic ─────────────────────────────────── */}
      {(() => {
        const be = (data as any)?.breakeven_ipca_selic;
        if (!be) return null;
        const anos: number = be.anos ?? 99;
        const taxaIpca: number = be.taxa_ipca_gross ?? 0;
        const taxaSelic: number = be.taxa_selic_gross ?? 0;
        const comparacoes: Array<{ ano: number; ipca_liq: number; selic_liq: number }> = be.comparacoes ?? [];
        const anosInfinito = anos >= 99;
        const cor = anosInfinito ? 'var(--red)' : anos <= 5 ? 'var(--green)' : 'var(--yellow)';
        return (
          <div data-testid="breakeven-year-ipca-selic">
          <CollapsibleSection
            id="section-breakeven-ipca-selic"
            title={secTitle('portfolio', 'breakeven-ipca-selic', 'Break-Even IPCA+ vs Selic')}
            defaultOpen={secOpen('portfolio', 'breakeven-ipca-selic', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <div
                style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}
              >
                <div style={{ background: 'var(--bg)', border: `1px solid ${cor}40`, borderLeft: `3px solid ${cor}`, borderRadius: 8, padding: '12px 16px', minWidth: 160 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Break-Even em</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: cor, lineHeight: 1 }}>
                    {anosInfinito ? '∞' : `${anos}a`}
                  </div>
                  <div style={{ fontSize: 10, color: cor, fontWeight: 600, marginTop: 4 }}>
                    {anosInfinito ? 'IPCA+ não supera Selic atual' : 'IPCA+ supera Selic líquida'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>IPCA+ gross</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{taxaIpca.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>Selic gross</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--red)' }}>{taxaSelic.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>Spread</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--red)' }}>
                      {(taxaSelic - taxaIpca - (be.inflacao_premissa ?? 0)).toFixed(2)}pp
                    </div>
                  </div>
                </div>
              </div>
              {comparacoes.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)', minWidth: 300 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ano</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>IPCA+ líq R$1</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Selic líq R$1</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Vantagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparacoes.slice(0, 10).map(c => {
                        const vantagem = c.ipca_liq - c.selic_liq;
                        return (
                          <tr key={c.ano} style={{ borderBottom: '1px solid var(--card2)', background: vantagem > 0 ? 'rgba(63,185,80,.04)' : 'transparent' }}>
                            <td style={{ padding: '5px 8px', fontWeight: 600 }}>{c.ano}a</td>
                            <td style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--green)', fontFamily: 'monospace' }}>{c.ipca_liq.toFixed(4)}</td>
                            <td style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--red)', fontFamily: 'monospace' }}>{c.selic_liq.toFixed(4)}</td>
                            <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 700, color: vantagem > 0 ? 'var(--green)' : 'var(--red)' }}>
                              {vantagem > 0 ? '+' : ''}{(vantagem * 100).toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="src">
                Acumula R$1 líquido de IR: IPCA+ alíquota {be.aliquota_ipca_final ?? 15}% flat (&gt;720d);
                Selic alíquota regressiva 22.5%→15%. Inflação premissa: {be.inflacao_premissa ?? 4}%a.a.
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* ── Gap P: Correlação em Stress ───────────────────────────────────────── */}
      {(() => {
        const cs = (data as any)?.correlation_stress;
        if (!cs) return null;
        const labels: string[] = cs.labels ?? ['Equity USD', 'RF (IPCA+)', 'FX'];
        const normais = cs.correlacoes_normais ?? {};
        const stress = cs.correlacoes_stress ?? {};
        const nStress: number = cs.n_stress_months ?? 0;
        const nTotal: number = cs.n_total_months ?? 0;

        const cellColor = (val: number | null) => {
          if (val == null) return 'var(--muted)';
          const abs = Math.abs(val);
          if (abs >= 0.6) return val > 0 ? 'var(--red)' : 'var(--accent)';
          if (abs >= 0.3) return val > 0 ? '#f97316' : '#60a5fa';
          return 'var(--text)';
        };

        const fmtCorr = (v: number | null) => v == null ? '—' : v.toFixed(3);

        return (
          <div data-testid="correlation-matrix-stress">
          <CollapsibleSection
            id="section-correlation-stress"
            title={secTitle('portfolio', 'correlation-stress', 'Correlação em Stress — Diversificação Real')}
            defaultOpen={secOpen('portfolio', 'correlation-stress', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <div>
                <div style={{ marginBottom: 12, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Normal: {nTotal - nStress} meses &nbsp;|&nbsp; Stress: {nStress} meses (retorno BRL &lt; −5%)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Normal', pairs: [{ k: 'equity_rf', l: 'Equity vs RF' }, { k: 'equity_fx', l: 'Equity vs FX' }], src: normais },
                    { label: 'Stress', pairs: [{ k: 'equity_rf', l: 'Equity vs RF' }, { k: 'equity_fx', l: 'Equity vs FX' }], src: stress },
                  ].map(({ label, pairs, src }) => (
                    <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, fontWeight: 700 }}>
                        {label} {label === 'Stress' && <span style={{ color: 'var(--red)' }}>({nStress}m)</span>}
                      </div>
                      {pairs.map(({ k, l }) => {
                        const val: number | null = (src as any)[k] ?? null;
                        return (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--card2)' }}>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{l}</span>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: cellColor(val), fontFamily: 'monospace' }}>
                              {fmtCorr(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, padding: 10, background: 'var(--bg)', borderRadius: 6, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  <strong>Interpretação:</strong> Correlação equity-FX negativa = hedge natural (BRL cai quando equity USD sobe).
                  Em stress: correlações se intensificam. Correlação equity-RF positiva em stress = diversificação limitada.
                </div>
              </div>
              <div className="src">
                Pearson. Proxy equity = TWR USD total (sem ETF individual). RF = IPCA+ mensais. FX = variação BRL/USD.
                {cs.nota ? ` ${cs.nota}` : ''}
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* 9. Últimas Operações */}
      {data?.minilog && Array.isArray(data.minilog) && data.minilog.length > 0 && (
        <div data-testid="minilog">
        <CollapsibleSection id="section-ultimas-operacoes" title={secTitle('portfolio', 'operacoes', 'Últimas Operações')} defaultOpen={secOpen('portfolio', 'operacoes', false)}>
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: 440, borderCollapse: 'collapse', fontSize: 'var(--text-base)', marginBottom: '8px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Data</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)' }}>Ativo</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }} className="hide-mobile">Corretora</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.minilog.slice(0, 10).map((op: any, i: number) => {
                  const valorStr = typeof op.valor === 'string' ? op.valor : String(op.valor ?? '—');
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--card2)' }}>
                      <td style={{ padding: '6px 6px', fontSize: 'var(--text-sm)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{op.data}</td>
                      <td style={{ padding: '6px 6px', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>{op.tipo}</td>
                      <td style={{ padding: '6px 6px', fontWeight: 600 }}>{op.ativo}</td>
                      <td style={{ padding: '6px 6px', fontSize: 'var(--text-sm)', color: 'var(--muted)' }} className="hide-mobile">{op.corretora}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', color: 'var(--green)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {privacyMode ? fmtPrivacy(parseFloat(String(op.valor ?? 0).replace(/[^\d.-]/g, '')) || 0, true) : valorStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="src">Fonte: IBKR · Nubank · Binance</div>
          </div>
        </CollapsibleSection>
        </div>
      )}

    </div>
  );
}
