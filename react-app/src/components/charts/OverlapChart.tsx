'use client';

/**
 * OverlapChart — Overlap Detection entre ETFs (SWRD / AVGS / AVEM).
 * Horizontal stacked bar: top holdings compartilhados com peso consolidado na carteira.
 * Equivalente ao Stock Intersection do Morningstar X-Ray.
 *
 * Feature: DEV-overlap-detection (2026-05-01)
 * v2: ticker no Y-axis + % inline + Top-5 concentrações (DEV-overlap-chart-v2 2026-05-01)
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface OverlapEntry {
  name: string;
  ticker?: string;
  isin: string;
  etfs: string[];
  weight_combined_pct: number;
  weight_per_etf: Record<string, number>;
  /** Peso no MSCI World (factsheet abr/2026). null = fora do MSCI World (ex.: Samsung 005930, coreana). */
  msci_world_pct?: number | null;
  /** Nota opcional quando msci_world_pct é null (DEV-top5-msci-benchmark 2026-05-02). */
  msci_world_note?: string | null;
}

export interface OverlapData {
  total_overlap_pct: number;
  unique_coverage_pct: number;
  top_overlaps: OverlapEntry[];
  top_concentrations?: OverlapEntry[];
  last_updated?: string;
  data_source?: string;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const ETF_COLORS: Record<string, string> = {
  SWRD: EC.accent,
  AVGS: EC.blue600,
  AVEM: EC.cyan,
};

const ETF_ORDER = ['SWRD', 'AVGS', 'AVEM'];
const MAX_ENTRIES = 12;
const INLINE_LABEL_THRESHOLD = 0.05; // % — segmentos abaixo disso não recebem label inline

// ── Helpers ───────────────────────────────────────────────────────────────────

function badgeStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    marginRight: 5,
    flexShrink: 0,
  };
}

/** Label "(TICKER) Nome…" truncada para o eixo Y. */
function formatYLabel(name: string, ticker?: string): string {
  const maxLen = 22;
  const tickerPart = ticker ? `(${ticker}) ` : '';
  const room = Math.max(8, maxLen - tickerPart.length);
  const trimmed = name.length > room ? name.slice(0, room - 1) + '…' : name;
  return `${tickerPart}${trimmed}`;
}

// ── Sub-chart genérico ────────────────────────────────────────────────────────

interface BarsProps {
  entries: OverlapEntry[];
  /** Se true, fundo da barra é stack ETF; se false, mostra um único segmento por ETF dominante. */
  stacked: boolean;
  privacyMode: boolean;
  ariaLabel: string;
  /** Se true, renderiza marcador amarelo do MSCI World inline + Δ no tooltip (DEV-top5-msci-benchmark). */
  showMsciBenchmark?: boolean;
}

function StackedEtfBars({ entries, stacked, privacyMode, ariaLabel, showMsciBenchmark = false }: BarsProps) {
  const chartRef = useChartResize();

  const option = useMemo(() => {
    if (!entries.length) return {};

    // Y-axis labels: "(TICKER) Nome…"; reverse para maior peso no topo.
    const reversed = [...entries].reverse();
    const labels = reversed.map(e => formatYLabel(e.name, e.ticker));

    const series: Array<Record<string, unknown>> = ETF_ORDER.map(etf => ({
      name: etf,
      type: 'bar' as const,
      stack: stacked ? 'overlap' : undefined,
      data: reversed.map(e => {
        const w = e.weight_per_etf[etf];
        return e.etfs.includes(etf) && w != null ? parseFloat(w.toFixed(4)) : null;
      }),
      itemStyle: { color: ETF_COLORS[etf] ?? EC.muted },
      barMaxWidth: 18,
      emphasis: { itemStyle: { opacity: 0.85 } },
      // % inline em cada segmento (omitir se < threshold ou em privacy)
      label: {
        show: !privacyMode,
        position: 'inside' as const,
        color: '#fff',
        fontSize: 9,
        fontWeight: 600,
        formatter: (p: any) => {
          const v = typeof p.value === 'number' ? p.value : null;
          if (v == null || v < INLINE_LABEL_THRESHOLD) return '';
          return `${v.toFixed(2)}%`;
        },
      },
    }));

    // MSCI World benchmark — marcador amarelo inline (mesmo padrão do SectorExposureChart).
    // Suprime symbol quando msci_world_pct é null (Samsung 005930, fora do MSCI World).
    if (showMsciBenchmark) {
      series.push({
        name: 'MSCI World',
        type: 'scatter' as const,
        data: reversed.map((e, i) => {
          const v = e.msci_world_pct;
          // ECharts: usar null para suprimir o symbol no índice (Samsung)
          return v == null ? [null, i] : [parseFloat(v.toFixed(4)), i];
        }) as Array<[number | null, number]>,
        symbol: 'rect',
        symbolSize: [3, 18],
        itemStyle: { color: EC.yellow },
        z: 10,
        tooltip: { show: false },
      });
    }

    return {
      backgroundColor: 'transparent',
      animation: false,
      grid: { left: 140, right: 30, top: 16, bottom: 36 },
      xAxis: {
        type: 'value' as const,
        name: 'Peso na carteira (%)',
        nameLocation: 'middle' as const,
        nameGap: 24,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        axisLabel: {
          ...EC_AXIS_LABEL,
          formatter: (v: number) => `${v.toFixed(2)}%`,
        },
        splitLine: EC_SPLIT_LINE,
        axisLine: { lineStyle: { color: EC.border2 } },
      },
      yAxis: {
        type: 'category' as const,
        data: labels,
        axisLabel: {
          ...EC_AXIS_LABEL,
          fontSize: 10,
          width: 130,
          overflow: 'truncate' as const,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        ...EC_TOOLTIP,
        formatter: (params: any[]) => {
          if (!params?.length) return '';
          const idx = entries.length - 1 - (params[0]?.dataIndex ?? 0);
          const entry = entries[idx];
          if (!entry) return '';
          const rows = ETF_ORDER
            .filter(etf => entry.etfs.includes(etf))
            .map(etf => {
              const w = entry.weight_per_etf[etf] ?? 0;
              const label = privacyMode ? '••%' : `${w.toFixed(3)}%`;
              return `<div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:${ETF_COLORS[etf]}">● ${etf}</span>
                <span style="font-weight:600">${label}</span>
              </div>`;
            }).join('');
          const combined = privacyMode ? '••%' : `${entry.weight_combined_pct.toFixed(3)}%`;
          const tickerLine = entry.ticker
            ? `<div style="font-size:9px;color:${EC.muted};margin-bottom:2px">${entry.ticker} · ${entry.isin}</div>`
            : `<div style="font-size:9px;color:${EC.muted};margin-bottom:6px">${entry.isin}</div>`;

          // Bloco benchmark MSCI World — só no Top-5 (DEV-top5-msci-benchmark 2026-05-02).
          // Mesmo padrão do SectorExposureChart: linha "MSCI World" + Δ vs benchmark.
          let benchBlock = '';
          if (showMsciBenchmark) {
            const mw = entry.msci_world_pct;
            if (mw != null) {
              const mwLabel = privacyMode ? '••%' : `${mw.toFixed(2)}%`;
              const delta = entry.weight_combined_pct - mw;
              const sign = delta >= 0 ? '+' : '';
              const dColor = Math.abs(delta) < 0.5 ? EC.muted : (delta > 0 ? EC.green : EC.red);
              const dLabel = privacyMode ? '••pp' : `${sign}${delta.toFixed(2)}pp`;
              benchBlock = `
                <div style="border-top:1px solid ${EC.border2};margin-top:6px;padding-top:4px;display:flex;justify-content:space-between">
                  <span style="color:${EC.yellow}">▮ MSCI World</span>
                  <span style="font-weight:600;color:${EC.yellow}">${mwLabel}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:12px;font-size:10px">
                  <span style="color:${EC.muted}">Δ vs benchmark</span>
                  <span style="color:${dColor};font-weight:600">${dLabel}</span>
                </div>`;
            } else {
              const note = entry.msci_world_note ?? 'fora do MSCI World';
              benchBlock = `
                <div style="border-top:1px solid ${EC.border2};margin-top:6px;padding-top:4px;display:flex;justify-content:space-between;gap:12px">
                  <span style="color:${EC.yellow}">▮ MSCI World</span>
                  <span style="font-weight:600;color:${EC.muted}">n/a</span>
                </div>
                <div style="font-size:10px;color:${EC.muted};margin-top:2px">${note}</div>`;
            }
          }

          return `<div style="padding:6px 10px;min-width:210px" aria-label="${ariaLabel}">
            <div style="font-weight:700;margin-bottom:4px;color:${EC.text}">${entry.name}</div>
            ${tickerLine}
            <div style="margin-top:4px">${rows}</div>
            <div style="border-top:1px solid ${EC.border2};margin-top:6px;padding-top:4px;display:flex;justify-content:space-between">
              <span style="color:${EC.muted}">Peso combinado</span>
              <span style="font-weight:700;color:${EC.text}">${combined}</span>
            </div>
            ${benchBlock}
          </div>`;
        },
      },
      series,
    };
  }, [entries, stacked, privacyMode, ariaLabel, showMsciBenchmark]);

  if (!entries.length) {
    return (
      <div style={{ color: EC.muted, fontSize: 13, padding: '12px 0' }}>
        Sem dados.
      </div>
    );
  }

  return (
    <EChart
      ref={chartRef}
      option={option}
      style={{ height: Math.max(260, entries.length * 28 + 60) }}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function OverlapChart({ data }: { data: OverlapData | null | undefined }) {
  const { privacyMode } = useEChartsPrivacy();

  const overlapEntries = useMemo(
    () => (data?.top_overlaps ?? []).slice(0, MAX_ENTRIES),
    [data],
  );
  const concentrationEntries = useMemo(
    () => (data?.top_concentrations ?? []).slice(0, 5),
    [data],
  );

  if (!data) {
    return (
      <div style={{ padding: '24px 16px', color: EC.muted, fontSize: 13, textAlign: 'center' }}>
        Dados de overlap não disponíveis.
      </div>
    );
  }

  const overlapPct = data.total_overlap_pct?.toFixed(1) ?? '—';
  const uniquePct  = data.unique_coverage_pct?.toFixed(1) ?? '—';

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Badges de resumo */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div
          data-testid="overlap-total-pct"
          style={{
            background: 'var(--card2)',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 13,
          }}
        >
          <span style={{ color: EC.muted }}>Overlap direto: </span>
          <span style={{ fontWeight: 700, color: EC.yellow }}>
            {privacyMode ? '••%' : `${overlapPct}%`}
          </span>
        </div>
        <div
          data-testid="overlap-unique-pct"
          style={{
            background: 'var(--card2)',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 13,
          }}
        >
          <span style={{ color: EC.muted }}>Diversificação única: </span>
          <span style={{ fontWeight: 700, color: EC.green }}>
            {privacyMode ? '••%' : `${uniquePct}%`}
          </span>
        </div>
      </div>

      {/* Legenda compartilhada */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10, fontSize: 11 }}>
        {ETF_ORDER.map(etf => (
          <span key={etf} style={{ display: 'flex', alignItems: 'center', color: EC.muted }}>
            <span style={badgeStyle(ETF_COLORS[etf])} />
            {etf}
          </span>
        ))}
      </div>

      {/* Grid: overlap (esq) + top concentrações (dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div data-testid="overlap-chart-overlaps">
          <div style={{ fontSize: 11, color: EC.muted, marginBottom: 4 }}>
            Top holdings compartilhados (≥2 ETFs)
          </div>
          <StackedEtfBars
            entries={overlapEntries}
            stacked
            privacyMode={privacyMode}
            ariaLabel="Top holdings compartilhados entre ETFs"
          />
        </div>
        <div data-testid="overlap-chart-top-concentrations">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: EC.muted }}>
              Top-5 concentrações totais (peso agregado)
            </div>
            <span style={{ display: 'flex', alignItems: 'center', color: EC.muted, fontSize: 10 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: 12,
                  background: EC.yellow,
                  marginRight: 6,
                  flexShrink: 0,
                }}
              />
              MSCI World (benchmark)
            </span>
          </div>
          <StackedEtfBars
            entries={concentrationEntries}
            stacked
            privacyMode={privacyMode}
            ariaLabel="Top-5 maiores concentrações da carteira"
            showMsciBenchmark
          />
        </div>
      </div>

      {/* Fonte dos dados */}
      {data.data_source && (
        <div style={{ marginTop: 8, fontSize: 10, color: EC.muted }}>
          Fonte: {data.data_source}
          {data.last_updated ? ` · Atualizado em ${data.last_updated}` : ''}
          {data.data_source?.includes('synthetic') && (
            <span style={{ color: EC.yellow, marginLeft: 6 }}>
              ⚠ Dados proxy — integração com CSVs dos emissores pendente
            </span>
          )}
        </div>
      )}
    </div>
  );
}
