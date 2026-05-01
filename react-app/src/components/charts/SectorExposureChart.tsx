'use client';

/**
 * SectorExposureChart — Exposição setorial GICS bottom-up por ETF.
 * Horizontal stacked bar: 11 setores GICS, contribuição SWRD/AVGS/AVEM + benchmark MSCI World.
 * Equivalente ao Sector Exposure do Morningstar X-Ray.
 *
 * Feature: DEV-sector-exposure (2026-05-01)
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_TOOLTIP, EC_AXIS_LABEL, EC_SPLIT_LINE } from '@/utils/echarts-theme';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface SectorRow {
  total_pct: number;
  swrd_pct: number;
  avgs_pct: number;
  avem_pct: number;
  msci_world_pct?: number | null;
}

export interface SectorExposureData {
  by_sector: Record<string, SectorRow>;
  dominant?: string;
  as_of?: string;
  data_source?: string;
  benchmark?: string;
}

// ── Constantes ────────────────────────────────────────────────────────────────

// Mesma paleta do OverlapChart — consistência cross-component
const ETF_COLORS: Record<string, string> = {
  SWRD: EC.accent,
  AVGS: EC.blue600,
  AVEM: EC.cyan,
};

const ETF_ORDER = ['SWRD', 'AVGS', 'AVEM'] as const;
const INLINE_LABEL_THRESHOLD = 1.0; // % — segmentos abaixo disso não mostram label inline

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

// ── Componente ────────────────────────────────────────────────────────────────

export function SectorExposureChart({ data }: { data: SectorExposureData | null | undefined }) {
  const { privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const sortedSectors = useMemo(() => {
    if (!data?.by_sector) return [];
    return Object.entries(data.by_sector)
      .map(([sector, row]) => ({ sector, ...row }))
      .sort((a, b) => b.total_pct - a.total_pct);
  }, [data]);

  const option = useMemo(() => {
    if (!sortedSectors.length) return {};

    // Reverse para maior peso no topo do eixo Y
    const reversed = [...sortedSectors].reverse();
    const labels = reversed.map(s => s.sector);

    // Stacks por ETF (carteira) + linha pontilhada como marker do MSCI World
    const stackedSeries = ETF_ORDER.map(etf => {
      const key = `${etf.toLowerCase()}_pct` as 'swrd_pct' | 'avgs_pct' | 'avem_pct';
      return {
        name: etf,
        type: 'bar' as const,
        stack: 'carteira',
        data: reversed.map(s => parseFloat((s[key] ?? 0).toFixed(4))),
        itemStyle: { color: ETF_COLORS[etf] },
        barMaxWidth: 18,
        emphasis: { itemStyle: { opacity: 0.85 } },
        label: {
          show: !privacyMode,
          position: 'inside' as const,
          color: '#fff',
          fontSize: 9,
          fontWeight: 600,
          formatter: (p: { value: number | null | undefined }) => {
            const v = typeof p.value === 'number' ? p.value : null;
            if (v == null || v < INLINE_LABEL_THRESHOLD) return '';
            return `${v.toFixed(1)}%`;
          },
        },
      };
    });

    // MSCI World como série separada (marker em barra fina abaixo)
    const benchmarkSeries = {
      name: 'MSCI World',
      type: 'scatter' as const,
      data: reversed.map((s, i) => [s.msci_world_pct ?? null, i] as [number | null, number]),
      symbol: 'rect',
      symbolSize: [3, 18],
      itemStyle: { color: EC.yellow },
      z: 10,
      tooltip: { show: false },
    };

    return {
      backgroundColor: 'transparent',
      animation: false,
      grid: { left: 150, right: 30, top: 16, bottom: 36 },
      xAxis: {
        type: 'value' as const,
        name: '% do equity (carteira)',
        nameLocation: 'middle' as const,
        nameGap: 24,
        nameTextStyle: { color: EC.muted, fontSize: 10 },
        axisLabel: {
          ...EC_AXIS_LABEL,
          formatter: (v: number) => `${v.toFixed(0)}%`,
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
          width: 140,
          overflow: 'truncate' as const,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        ...EC_TOOLTIP,
        formatter: (params: Array<{ dataIndex?: number }>) => {
          if (!params?.length) return '';
          const idx = sortedSectors.length - 1 - (params[0]?.dataIndex ?? 0);
          const entry = sortedSectors[idx];
          if (!entry) return '';
          const fmt = (v: number) => privacyMode ? '••%' : `${v.toFixed(2)}%`;
          const rows = ETF_ORDER.map(etf => {
            const key = `${etf.toLowerCase()}_pct` as 'swrd_pct' | 'avgs_pct' | 'avem_pct';
            const w = entry[key] ?? 0;
            return `<div style="display:flex;justify-content:space-between;gap:12px">
              <span style="color:${ETF_COLORS[etf]}">● ${etf}</span>
              <span style="font-weight:600">${fmt(w)}</span>
            </div>`;
          }).join('');
          const total = fmt(entry.total_pct);
          const benchLine = entry.msci_world_pct != null
            ? `<div style="border-top:1px solid ${EC.border2};margin-top:6px;padding-top:4px;display:flex;justify-content:space-between">
                 <span style="color:${EC.yellow}">▮ MSCI World</span>
                 <span style="font-weight:600;color:${EC.yellow}">${entry.msci_world_pct.toFixed(2)}%</span>
               </div>`
            : '';
          const deltaLine = entry.msci_world_pct != null
            ? (() => {
                const delta = entry.total_pct - entry.msci_world_pct;
                const sign = delta >= 0 ? '+' : '';
                const color = Math.abs(delta) < 1 ? EC.muted : (delta > 0 ? EC.green : EC.red);
                return `<div style="display:flex;justify-content:space-between;gap:12px;font-size:10px">
                  <span style="color:${EC.muted}">Δ vs benchmark</span>
                  <span style="color:${color};font-weight:600">${privacyMode ? '••pp' : `${sign}${delta.toFixed(2)}pp`}</span>
                </div>`;
              })()
            : '';
          return `<div style="padding:6px 10px;min-width:230px" aria-label="Sector exposure">
            <div style="font-weight:700;margin-bottom:6px;color:${EC.text}">${entry.sector}</div>
            <div>${rows}</div>
            <div style="border-top:1px solid ${EC.border2};margin-top:6px;padding-top:4px;display:flex;justify-content:space-between">
              <span style="color:${EC.muted}">Total carteira</span>
              <span style="font-weight:700;color:${EC.text}">${total}</span>
            </div>
            ${benchLine}
            ${deltaLine}
          </div>`;
        },
      },
      series: [...stackedSeries, benchmarkSeries],
    };
  }, [sortedSectors, privacyMode]);

  if (!data || !data.by_sector || !sortedSectors.length) {
    return (
      <div style={{ padding: '24px 16px', color: EC.muted, fontSize: 13, textAlign: 'center' }}>
        Dados de exposição setorial não disponíveis.
      </div>
    );
  }

  const dominant = data.dominant ?? sortedSectors[0]?.sector ?? '—';
  const dominantPct = sortedSectors[0]?.total_pct;

  return (
    <div data-testid="sector-exposure-chart" style={{ padding: '0 16px 16px' }}>
      {/* Badge de resumo */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div
          data-testid="sector-exposure-dominant"
          style={{
            background: 'var(--card2)',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 13,
          }}
        >
          <span style={{ color: EC.muted }}>Setor dominante: </span>
          <span style={{ fontWeight: 700, color: EC.accent }}>{dominant}</span>
          {dominantPct != null && (
            <span style={{ color: EC.muted, marginLeft: 6 }}>
              ({privacyMode ? '••%' : `${dominantPct.toFixed(1)}%`})
            </span>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10, fontSize: 11 }}>
        {ETF_ORDER.map(etf => (
          <span key={etf} style={{ display: 'flex', alignItems: 'center', color: EC.muted }}>
            <span style={badgeStyle(ETF_COLORS[etf])} />
            {etf}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', color: EC.muted }}>
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

      <EChart
        ref={chartRef}
        option={option}
        style={{ height: Math.max(360, sortedSectors.length * 30 + 60) }}
      />

      {/* Fonte */}
      {(data.data_source || data.benchmark) && (
        <div style={{ marginTop: 8, fontSize: 10, color: EC.muted }}>
          {data.benchmark && <>Benchmark: {data.benchmark}</>}
          {data.data_source && <> · Fonte: {data.data_source}</>}
          {data.as_of && <> · Atualizado em {data.as_of}</>}
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
