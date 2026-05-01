'use client';

/**
 * EfficientFrontierChart — Fronteira Eficiente Markowitz dual.
 * DEV-efficient-frontier (Head + Quant decisões 2026-05-01).
 *
 * Eixos: X = volatilidade anual (%), Y = retorno anual (%).
 * Série 'Fronteira': linha curva dos pontos ótimos (vol crescente).
 * Marcadores: carteira atual (bubble grande), Max Sharpe (estrela), Min Vol (triângulo).
 *
 * Toggles:
 *  - Cenário: Histórica vs Forward (radiogroup)
 *  - Crypto: ON/OFF (checkbox) — recalcula fronteira sem HODL11
 *
 * Tooltip: pesos ótimos do ponto + métricas.
 * Disclaimer Forward: prominente quando selecionado.
 */

import { useMemo, useState } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FrontierPoint {
  vol: number;
  ret: number;
  sharpe: number;
  weights: Record<string, number>;
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
  disclaimer?: string;
}

export interface EfficientFrontierChartProps {
  data: { historica: FrontierScenario; forward: FrontierScenario } | null | undefined;
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

// ── Componente ────────────────────────────────────────────────────────────────

export function EfficientFrontierChart({ data }: EfficientFrontierChartProps) {
  const chartRef = useChartResize();
  const [scenario, setScenario] = useState<'historica' | 'forward'>('historica');
  const [cryptoOn, setCryptoOn] = useState<boolean>(true);

  const scen = data?.[scenario];
  const variant = scen?.[cryptoOn ? 'crypto_on' : 'crypto_off'];
  const rf = scen?.rf ?? 0.0534;

  const option = useMemo(() => {
    if (!variant) return {};

    // Linha da fronteira (vol, ret) — pontos ordenados
    const sorted = [...variant.points].sort((a, b) => a.vol - b.vol);
    const lineData = sorted.map(p => [p.vol * 100, p.ret * 100]);

    // Pontos por categoria
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

    // Risk-free line: Capital Market Line
    // Não desenhamos CML completa (constraints distorcem); apenas anotação Y-axis em rf
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
          let feasible: boolean | undefined;
          if (params.seriesName === 'Fronteira') {
            const pt = sorted[params.dataIndex ?? 0];
            weights = pt.weights;
            sharpe = pt.sharpe;
          } else if (params.seriesName === 'Carteira atual') {
            weights = variant.current.weights;
            sharpe = variant.current.sharpe;
            feasible = variant.current.feasible;
          } else if (params.seriesName === 'Max Sharpe') {
            weights = variant.max_sharpe.weights;
            sharpe = variant.max_sharpe.sharpe;
          } else if (params.seriesName === 'Min Vol') {
            weights = variant.min_vol.weights;
            sharpe = variant.min_vol.sharpe;
          }
          const wRows = weights
            ? Object.entries(weights)
                .filter(([, w]) => w > 0.001)
                .map(([k, w]) => `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">${ASSET_LABELS[k] ?? k}</span><span style="font-weight:700">${(w * 100).toFixed(1)}%</span></div>`)
                .join('')
            : '';
          return `
            <div style="padding:6px 10px;min-width:180px">
              <div style="font-weight:700;color:${params.color};margin-bottom:4px">${params.seriesName}</div>
              <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Retorno</span><span style="font-weight:700">${ret.toFixed(2)}%</span></div>
              <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Vol</span><span style="font-weight:700">${vol.toFixed(2)}%</span></div>
              ${sharpe !== undefined ? `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${EC.muted}">Sharpe</span><span style="font-weight:700">${sharpe.toFixed(3)}</span></div>` : ''}
              ${feasible === false ? `<div style="margin-top:4px;color:${EC.warning};font-size:10px">⚠️ fora do espaço de busca (caps)</div>` : ''}
              ${wRows ? `<div style="margin-top:6px;border-top:1px solid ${EC.border2};padding-top:4px">${wRows}</div>` : ''}
            </div>`;
        },
      },
      legend: { show: false },
      series: [
        // Linha da fronteira
        {
          name: 'Fronteira',
          type: 'line' as const,
          data: lineData,
          showSymbol: false,
          lineStyle: { color: EC.accent, width: 2 },
          smooth: true,
          z: 1,
        },
        // Min Vol (triangle)
        {
          name: 'Min Vol',
          type: 'scatter' as const,
          data: minVolData,
          symbol: 'triangle',
          symbolSize: 18,
          itemStyle: { color: EC.green },
          z: 3,
        },
        // Max Sharpe (star)
        {
          name: 'Max Sharpe',
          type: 'scatter' as const,
          data: maxSharpeData,
          symbol: 'diamond',
          symbolSize: 22,
          itemStyle: { color: EC.yellow },
          z: 4,
        },
        // Carteira atual (large circle)
        {
          name: 'Carteira atual',
          type: 'scatter' as const,
          data: currentData,
          symbol: 'circle',
          symbolSize: 22,
          itemStyle: { color: EC.pink, borderColor: EC.text, borderWidth: 2 },
          z: 5,
        },
        // RF marker (Y-axis horizontal line)
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
      {/* Toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['historica', 'forward'] as const).map(s => (
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
              {s === 'historica' ? 'Histórica (10y)' : 'Forward (AQR/RA)'}
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
      </div>

      {/* Disclaimer Forward */}
      {scenario === 'forward' && scen?.disclaimer && (
        <div style={{
          background: 'color-mix(in srgb, var(--yellow) 10%, transparent)',
          border: `1px solid var(--yellow)`,
          borderRadius: 4,
          padding: '6px 10px',
          marginBottom: 8,
          fontSize: 11,
          color: 'var(--text)',
        }}>
          <strong>⚠️ Forward:</strong> {scen.disclaimer}
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
                Sharpe {pt.sharpe.toFixed(3)} {extra ? `· ${extra}` : ''}
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

      <div className="src" style={{ marginTop: 8 }}>
        Markowitz mean-variance · cov via Ledoit-Wolf shrinkage (T={scen?.panel.n_months ?? '?'} meses, N=6) · RF Estratégica HTM tratada como ancora-real (vol=0).
        Caps anti-corner: SWRD≤50%, AVGS≤35%, AVEM≤25%, RF_EST≤30%, RF_TAT≤10%, HODL11≤5%; Equity∈[50,90]%, RF∈[5,30]%.
        Sensibilidade alta a μ (Michaud 1989) — cov shrinkage mitiga ruído. Correlação SWRD-AVGS histórica ~0.85-0.92.
      </div>
    </div>
  );
}
