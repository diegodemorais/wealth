'use client';

/**
 * EfficientFrontierChart — Fronteira Eficiente Markowitz dual.
 * DEV-efficient-frontier (v1, 2026-05-01) + DEV-efficient-frontier-v2 (2026-05-02).
 *
 * v2 adiciona:
 *  - Banner permanente "diagnóstico, não meta"
 *  - Regime label do value spread (factor.value_spread.percentile_hml)
 *  - Toggle "Histórica ↔ Black-Litterman" (substitui "Forward")
 *  - Sharpe líquido (custos + IR) lado-a-lado com bruto
 *  - Tabela delta R$ + IR para Max Sharpe e Min Vol
 *  - Disclaimer Idzorek prominente em modo BL
 *
 * Eixos: X = volatilidade anual (%), Y = retorno anual (%).
 */

import { useMemo, useState } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useChartResize } from '@/hooks/useChartResize';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface RebalanceDelta {
  delta_brl: number[];
  delta_pp: number[];
  spread_total_brl: number;
  ir_total_brl: number;
  ir_per_asset_brl: number[];
  total_cost_brl: number;
}

interface FrontierPoint {
  vol: number;
  ret: number;
  sharpe: number;
  weights: Record<string, number>;
  // v2 fields
  sharpe_net?: number;
  ret_net?: number;
  haircut_anual?: number;
  rebalance_delta?: RebalanceDelta;
}

interface FrontierScenarioVariant {
  points: FrontierPoint[];
  current: FrontierPoint & { feasible: boolean };
  max_sharpe: FrontierPoint;
  min_vol: FrontierPoint;
  n_portfolios: number;
  saturation_warnings?: string[];
}

interface FrontierScenario {
  crypto_on: FrontierScenarioVariant;
  crypto_off: FrontierScenarioVariant;
  rf: number;
  cov_method: string;
  mu: Record<string, number>;
  assets: string[];
  caps: Record<string, [number, number]>;
  group_constraints: {
    equity_group: string[];
    equity_bounds: [number, number];
    rf_group: string[];
    rf_bounds: [number, number];
  };
  as_of: string;
  metodologia_version: string;
  panel: { n_months: number; start: string; end: string; rf_real_brl: number };
  patrimonio_total_brl?: number;
  transaction_spread?: number;
  tax_rates?: Record<string, number>;
  disclaimer?: string;
  bl_meta?: {
    lambda: number;
    tau: number;
    omega_diag: number[];
    view_assets: string[];
    Q_views_brl_real: number[];
    prior_pi_brl_real: number[];
    posterior_mu_brl_real: number[];
    w_mkt: Record<string, number>;
    method: string;
    sanity_check: { passed: boolean; violations: unknown[]; rules: string[] };
  };
}

interface ValueSpread {
  percentile_hml?: number;
  percentile_sv?: number;
  status?: string;
  status_label?: string;
  hml_composite_3m_pct?: number;
  sv_proxy_3m_pct?: number;
}

export interface EfficientFrontierChartProps {
  data: { historica: FrontierScenario; bl: FrontierScenario } | null | undefined;
  valueSpread?: ValueSpread | null;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const ASSET_LABELS: Record<string, string> = {
  SWRD:   'SWRD',
  AVGS:   'AVGS',
  AVEM:   'AVEM',
  RF_EST: 'IPCA+ 2040',
  RF_TAT: 'Renda+ 2065',
  HODL11: 'HODL11',
};

const ASSETS_ORDER = ['SWRD', 'AVGS', 'AVEM', 'RF_EST', 'RF_TAT', 'HODL11'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function regimeFromPercentile(p?: number): {
  emoji: string;
  label: string;
  color: string;
} {
  if (p === undefined || p === null || Number.isNaN(p)) {
    return { emoji: '⚪', label: 'Value spread indisponível', color: EC.muted };
  }
  if (p >= 70) {
    return {
      emoji: '🟢',
      label: `Value spread amplo (P${p.toFixed(0)}) — premium fatorial elevado`,
      color: EC.green,
    };
  }
  if (p < 30) {
    return {
      emoji: '🔴',
      label: `Value spread comprimido (P${p.toFixed(0)}) — premium fatorial reduzido`,
      color: EC.red ?? EC.pink,
    };
  }
  return {
    emoji: '⚪',
    label: `Value spread neutro (P${p.toFixed(0)})`,
    color: EC.muted,
  };
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EfficientFrontierChart({ data, valueSpread }: EfficientFrontierChartProps) {
  const chartRef = useChartResize();
  const { privacyMode } = usePrivacyMode();
  const [scenario, setScenario] = useState<'historica' | 'bl'>('historica');
  const [cryptoOn, setCryptoOn] = useState<boolean>(true);

  const scen = data?.[scenario];
  const variant = scen?.[cryptoOn ? 'crypto_on' : 'crypto_off'];
  const rf = scen?.rf ?? 0.0534;
  const patrimonio = scen?.patrimonio_total_brl ?? 0;

  const regime = regimeFromPercentile(valueSpread?.percentile_hml);

  const option = useMemo(() => {
    if (!variant) return {};

    const sorted = [...variant.points].sort((a, b) => a.vol - b.vol);
    const lineData = sorted.map(p => [p.vol * 100, p.ret * 100]);

    const currentData = [[
      variant.current.vol * 100,
      variant.current.ret * 100,
    ]];
    const maxSharpeData = [[
      variant.max_sharpe.vol * 100,
      variant.max_sharpe.ret * 100,
    ]];
    const minVolData = [[
      variant.min_vol.vol * 100,
      variant.min_vol.ret * 100,
    ]];

    const rfPct = rf * 100;

    return {
      backgroundColor: 'transparent',
      grid: { left: 56, right: 24, top: 24, bottom: 36 },
      xAxis: {
        type: 'value' as const,
        name: 'Volatilidade anual (%)',
        nameLocation: 'middle' as const,
        nameGap: 24,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        min: 0,
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => `${v.toFixed(0)}%` },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Retorno anual (%)',
        nameLocation: 'middle' as const,
        nameGap: 40,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => `${v.toFixed(1)}%` },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
      },
      tooltip: {
        trigger: 'item' as const,
        ...EC_TOOLTIP,
        formatter: (params: { seriesName?: string; data?: [number, number]; color?: string; dataIndex?: number }) => {
          if (!params.data) return '';
          const [vol, ret] = params.data;
          let weights: Record<string, number> | undefined;
          let sharpe: number | undefined;
          let sharpeNet: number | undefined;
          let feasible: boolean | undefined;
          if (params.seriesName === 'Fronteira') {
            const pt = sorted[params.dataIndex ?? 0];
            weights = pt.weights;
            sharpe = pt.sharpe;
            sharpeNet = pt.sharpe_net;
          } else if (params.seriesName === 'Carteira atual') {
            weights = variant.current.weights;
            sharpe = variant.current.sharpe;
            sharpeNet = variant.current.sharpe_net;
            feasible = variant.current.feasible;
          } else if (params.seriesName === 'Max Sharpe') {
            weights = variant.max_sharpe.weights;
            sharpe = variant.max_sharpe.sharpe;
            sharpeNet = variant.max_sharpe.sharpe_net;
          } else if (params.seriesName === 'Min Vol') {
            weights = variant.min_vol.weights;
            sharpe = variant.min_vol.sharpe;
            sharpeNet = variant.min_vol.sharpe_net;
          }
          const wRows = weights
            ? Object.entries(weights)
                .filter(([, w]) => w > 0.001)
                .map(([k, w]) => `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">${ASSET_LABELS[k] ?? k}</span><span style="font-weight:700">${(w * 100).toFixed(1)}%</span></div>`)
                .join('')
            : '';
          return `
            <div style="padding:6px 10px;min-width:200px">
              <div style="font-weight:700;color:${params.color};margin-bottom:4px">${params.seriesName}</div>
              <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Retorno</span><span style="font-weight:700">${ret.toFixed(2)}%</span></div>
              <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Vol</span><span style="font-weight:700">${vol.toFixed(2)}%</span></div>
              ${sharpe !== undefined ? `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Sharpe (bruto)</span><span style="font-weight:700">${sharpe.toFixed(3)}</span></div>` : ''}
              ${sharpeNet !== undefined ? `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Sharpe (líquido)</span><span style="font-weight:700;color:${EC.yellow}">${sharpeNet.toFixed(3)}</span></div>` : ''}
              ${feasible === false ? `<div style="margin-top:4px;color:${EC.warning};font-size:10px">⚠️ fora do espaço de busca (caps)</div>` : ''}
              ${wRows ? `<div style="margin-top:6px;border-top:1px solid ${EC.border2};padding-top:4px">${wRows}</div>` : ''}
            </div>`;
        },
      },
      legend: { show: false },
      series: [
        {
          name: 'Fronteira',
          type: 'line' as const,
          data: lineData,
          showSymbol: false,
          lineStyle: { color: EC.accent, width: 2 },
          smooth: true,
          z: 1,
        },
        {
          name: 'Min Vol',
          type: 'scatter' as const,
          data: minVolData,
          symbol: 'triangle',
          symbolSize: 18,
          itemStyle: { color: EC.green },
          z: 3,
        },
        {
          name: 'Max Sharpe',
          type: 'scatter' as const,
          data: maxSharpeData,
          symbol: 'diamond',
          symbolSize: 22,
          itemStyle: { color: EC.yellow },
          z: 4,
        },
        {
          name: 'Carteira atual',
          type: 'scatter' as const,
          data: currentData,
          symbol: 'circle',
          symbolSize: 22,
          itemStyle: { color: EC.pink, borderColor: EC.text, borderWidth: 2 },
          z: 5,
        },
        {
          name: 'Risk-free',
          type: 'line' as const,
          markLine: {
            silent: true,
            symbol: 'none',
            label: { formatter: `Rf=${(rfPct).toFixed(2)}%`, color: EC.muted, fontSize: 9, position: 'end' as const },
            lineStyle: { color: EC.muted, type: 'dashed' as const, opacity: 0.5 },
            data: [{ yAxis: rfPct }],
          },
          data: [],
        },
      ],
    };
  }, [variant, rf]);

  if (!data) {
    return (
      <div style={{ color: 'var(--muted)', fontSize: 12, padding: 16 }}>
        Fronteira eficiente não disponível neste build.
      </div>
    );
  }

  const cur = variant?.current;
  const ms = variant?.max_sharpe;
  const mv = variant?.min_vol;

  return (
    <div data-testid="efficient-frontier-chart" style={{ padding: '0 16px 16px' }}>
      {/* Banner v2 — diagnóstico, não meta (sempre visível) */}
      <div
        data-testid="ef-diagnostic-banner"
        style={{
          background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          border: `1px solid ${EC.accent}`,
          borderLeft: `4px solid ${EC.accent}`,
          borderRadius: 4,
          padding: '8px 12px',
          marginBottom: 10,
          fontSize: 11,
          color: 'var(--text)',
          lineHeight: 1.4,
        }}
      >
        <strong>⚠️ Use como diagnóstico, não como meta.</strong> Max Sharpe histórico ≠ portfolio
        ótimo prospectivo. Carteira atual 50/30/20 está dentro do IC estatístico
        (Michaud Resampled abr/2026). Mudanças exigem evidência forte; rebalance
        custoso (custos + IR descontam Sharpe líquido em 2-5pp tipicamente).
      </div>

      {/* Toggles + regime label */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['historica', 'bl'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              style={{
                padding: '4px 12px',
                borderRadius: 4,
                border: `1px solid ${scenario === s ? EC.accent : 'var(--border)'}`,
                background: scenario === s ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                color: scenario === s ? EC.accent : 'var(--muted)',
                fontSize: 12,
                fontWeight: scenario === s ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {s === 'historica' ? 'Histórica (10y)' : 'Black-Litterman'}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={cryptoOn}
            onChange={e => setCryptoOn(e.target.checked)}
            style={{ accentColor: EC.accent }}
          />
          Crypto (HODL11) na otimização
        </label>

        {/* Regime label do value spread */}
        <div
          data-testid="ef-regime-label"
          title="Percentil histórico do HML composite (AQR HML Devil + KF SMB). Source: factor.value_spread.percentile_hml"
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: regime.color,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            border: `1px solid ${regime.color}`,
            borderRadius: 4,
            background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
          }}
        >
          <span>{regime.emoji}</span>
          <span>{regime.label}</span>
        </div>
      </div>

      {/* Disclaimer BL prominente */}
      {scenario === 'bl' && scen?.disclaimer && (
        <div
          data-testid="ef-bl-disclaimer"
          style={{
            background: 'color-mix(in srgb, var(--yellow) 10%, transparent)',
            border: `1px solid var(--yellow)`,
            borderRadius: 4,
            padding: '6px 10px',
            marginBottom: 8,
            fontSize: 11,
            color: 'var(--text)',
          }}
        >
          <strong>⚠️ Black-Litterman:</strong> {scen.disclaimer}
          {scen.bl_meta && (
            <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
              (λ={scen.bl_meta.lambda}, τ={scen.bl_meta.tau})
            </span>
          )}
        </div>
      )}

      {/* Legenda inline */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginBottom: 8, fontSize: 10, color: 'var(--muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 2, background: EC.accent, display: 'inline-block' }} /> Fronteira
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, background: EC.pink, borderRadius: '50%', display: 'inline-block', border: `2px solid var(--text)` }} /> Carteira atual
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `10px solid ${EC.yellow}`,
            transform: 'rotate(45deg)',
            display: 'inline-block',
          }} /> Max Sharpe
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `10px solid ${EC.green}`,
            display: 'inline-block',
          }} /> Min Vol
        </div>
      </div>

      {/* Chart */}
      <EChart ref={chartRef} option={option} style={{ height: 360 }} />

      {/* Tabela comparativa */}
      {cur && ms && mv && (
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 8, marginTop: 12 }}>
          {[
            { label: 'CARTEIRA ATUAL', pt: cur, color: EC.pink, extra: cur.feasible ? null : 'fora do espaço de busca' },
            { label: 'MAX SHARPE',     pt: ms,  color: EC.yellow, extra: null },
            { label: 'MIN VOL',        pt: mv,  color: EC.green, extra: null },
          ].map(({ label, pt, color, extra }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg)',
                border: `1px solid var(--border)`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 6,
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: 10, color, fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                ret {(pt.ret * 100).toFixed(2)}% / vol {(pt.vol * 100).toFixed(2)}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                Sharpe {pt.sharpe.toFixed(3)}
                {pt.sharpe_net !== undefined && (
                  <span style={{ color: EC.yellow, marginLeft: 4 }}>
                    (líq {pt.sharpe_net.toFixed(3)})
                  </span>
                )}
                {extra ? ` · ${extra}` : ''}
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>
                {Object.entries(pt.weights)
                  .filter(([, w]) => w > 0.005)
                  .map(([k, w]) => `${ASSET_LABELS[k] ?? k} ${(w * 100).toFixed(0)}%`)
                  .join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela delta R$ + IR (Max Sharpe e Min Vol) */}
      {(ms?.rebalance_delta || mv?.rebalance_delta) && cur && (
        <div
          data-testid="ef-rebalance-delta-table"
          style={{ marginTop: 16 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Custo de rebalance (atual → ponto especial)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'MAX SHARPE', pt: ms, color: EC.yellow },
              { label: 'MIN VOL',    pt: mv, color: EC.green },
            ].filter(x => x.pt?.rebalance_delta).map(({ label, pt, color }) => {
              const rd = pt!.rebalance_delta!;
              return (
                <div
                  key={label}
                  style={{
                    background: 'var(--bg)',
                    border: `1px solid var(--border)`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 6,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 4 }}>
                    Para chegar em {label}
                  </div>
                  <table style={{ width: '100%', fontSize: 10, color: 'var(--muted)', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid var(--border)`, color: 'var(--muted)' }}>
                        <th style={{ textAlign: 'left',  padding: '2px 4px', fontWeight: 600 }}>Ativo</th>
                        <th style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 600 }}>Atual</th>
                        <th style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 600 }}>Alvo</th>
                        <th style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 600 }}>Δ pp</th>
                        <th style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 600 }}>Δ R$</th>
                        <th style={{ textAlign: 'right', padding: '2px 4px', fontWeight: 600 }}>IR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASSETS_ORDER.map((a, i) => {
                        const wCur = cur.weights[a] ?? 0;
                        const wTgt = pt!.weights[a] ?? 0;
                        const dpp = rd.delta_pp[i] ?? 0;
                        const dbrl = rd.delta_brl[i] ?? 0;
                        const ir = rd.ir_per_asset_brl[i] ?? 0;
                        const sign = dpp > 1e-4 ? '+' : '';
                        const dColor = dpp > 1e-4 ? EC.green : (dpp < -1e-4 ? (EC.red ?? EC.pink) : 'var(--muted)');
                        return (
                          <tr key={a}>
                            <td style={{ padding: '2px 4px', color: 'var(--text)' }}>{ASSET_LABELS[a] ?? a}</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>{(wCur * 100).toFixed(1)}%</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>{(wTgt * 100).toFixed(1)}%</td>
                            <td style={{ padding: '2px 4px', textAlign: 'right', color: dColor, fontWeight: 600 }}>
                              {sign}{(dpp * 100).toFixed(1)}pp
                            </td>
                            <td style={{ padding: '2px 4px', textAlign: 'right', color: dColor }}>
                              {fmtPrivacy(dbrl, privacyMode, { compact: true })}
                            </td>
                            <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                              {ir > 0 ? fmtPrivacy(ir, privacyMode, { compact: true }) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: `1px solid var(--border)`, fontWeight: 700, color: 'var(--text)' }}>
                        <td style={{ padding: '2px 4px' }}>Total</td>
                        <td colSpan={3} style={{ padding: '2px 4px', textAlign: 'right' }}>
                          spread {fmtPrivacy(rd.spread_total_brl, privacyMode, { compact: true })}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                          {fmtPrivacy(rd.total_cost_brl, privacyMode, { compact: true })}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                          {fmtPrivacy(rd.ir_total_brl, privacyMode, { compact: true })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          <div className="src" style={{ marginTop: 6, fontSize: 9 }}>
            Spread 0.05% sobre |Δ|. IR 15% sobre vendas (Δ&lt;0): ETF exterior (Lei 14.754),
            HODL11 e Renda+ come-cotas. RF_EST (Tesouro IPCA+ HTM PF) isento. Premissa
            conservadora: 100% do valor vendido tratado como ganho realizado.
            {patrimonio > 0 && (
              <> Patrimônio base: {fmtPrivacy(patrimonio, privacyMode, { compact: true })}.</>
            )}
          </div>
        </div>
      )}

      <div className="src" style={{ marginTop: 8 }}>
        Markowitz mean-variance · cov via Ledoit-Wolf shrinkage (T={scen?.panel.n_months ?? '?'} meses, N=6) · RF Estratégica HTM tratada como ancora-real (vol=0).
        Caps anti-corner: SWRD≤50%, AVGS≤35%, AVEM≤25%, RF_EST≤30%, RF_TAT≤10%, HODL11≤5%; Equity∈[50,90]%, RF∈[5,30]%.
        Sensibilidade alta a μ (Michaud 1989) — cov shrinkage mitiga ruído. Correlação SWRD-AVGS histórica ~0.85-0.92.
        v2: BL via Idzorek 2005 (prior MSCI ACWI, views AQR/RA, Ω diagonal). Sharpe líquido amortiza custos one-off em 10y.
      </div>
    </div>
  );
}
