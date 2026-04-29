'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { EC, EC_AXIS_LABEL, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';

import { pfireColor as pfireColorFn } from '@/utils/fire';
import { FIRE_RULES } from '@/config/business-rules';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { ScenarioBadge } from '@/components/primitives/ScenarioBadge';
import { AlertTriangle } from 'lucide-react';
import { TrackingFireChart } from '@/components/charts/TrackingFireChart';
import { NetWorthProjectionChart } from '@/components/charts/NetWorthProjectionChart';
import { GlidePathChart } from '@/components/charts/GlidePathChart';
import { FireScenariosTable } from '@/components/fire/FireScenariosTable';
import { SequenceOfReturnsRisk } from '@/components/fire/SequenceOfReturnsRisk';
import { FireMatrixTable } from '@/components/dashboard/FireMatrixTable';
import { EventosVidaChart } from '@/components/charts/EventosVidaChart';
import { BalancoHolistico } from '@/components/holistic/BalancoHolistico';
import { HumanCapitalCrossover } from '@/components/dashboard/HumanCapitalCrossover';
import { PFireDistribution } from '@/components/fire/PFireDistribution';
import { PQualityMatrix } from '@/components/fire/PQualityMatrix';
import { usePageData } from '@/hooks/usePageData';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { EChart } from '@/components/primitives/EChart';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { Landmark, Building2, Heart, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';

// ── FloorUpsideFire — Cobertura por Fase (FIRE Day vs pós-INSS) ─────────────
interface FloorUpsideFireProps {
  gastoPiso: number;
  custoVida: number;
  inssD: number;
  inssK: number;
  swrGatilho: number;
  patrimonio: number;
  privacyMode: boolean;
}

function FloorUpsideFire({
  gastoPiso,
  custoVida,
  inssD,
  inssK,
  swrGatilho,
  patrimonio,
  privacyMode,
}: FloorUpsideFireProps) {
  // Fase 1: FIRE Day (50–65) — floor só RF, INSS Diego ainda não ativo
  const floorFireDay = gastoPiso;
  const gapFireDay = Math.max(0, custoVida - floorFireDay);
  const patNecFireDay = swrGatilho > 0 ? gapFireDay / swrGatilho : null;
  const cobFireDay =
    gapFireDay === 0
      ? 100
      : patNecFireDay != null && patrimonio > 0
        ? Math.min(100, (patrimonio / patNecFireDay) * 100)
        : null;

  // Fase 2: pós-INSS (65+) — floor inclui INSS Diego + Katia
  const floorPosInss = gastoPiso + inssD + inssK;
  const gapPosInss = Math.max(0, custoVida - floorPosInss);
  const patNecPosInss = swrGatilho > 0 ? gapPosInss / swrGatilho : null;
  const cobPosInss =
    gapPosInss === 0
      ? 100
      : patNecPosInss != null && patrimonio > 0
        ? Math.min(100, (patrimonio / patNecPosInss) * 100)
        : null;

  // Fase 1 bar %
  const floorPct1 = custoVida > 0 ? (floorFireDay / custoVida) * 100 : 0;
  const gapPct1 = 100 - floorPct1;
  const cobPct1 = cobFireDay != null ? Math.min(gapPct1, (cobFireDay / 100) * gapPct1) : 0;
  const descPct1 = Math.max(0, gapPct1 - cobPct1);

  // Fase 2 bar %
  const floorPct2 = custoVida > 0 ? (Math.min(floorPosInss, custoVida) / custoVida) * 100 : 0;
  const gapPct2 = Math.max(0, 100 - floorPct2);
  const cobPct2 = cobPosInss != null ? Math.min(gapPct2, (cobPosInss / 100) * gapPct2) : 0;
  const descPct2 = Math.max(0, gapPct2 - cobPct2);

  const barOption = (floorBar: number, cobBar: number, descBar: number) => ({
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 4, bottom: 4 },
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: { type: 'category', data: [''], show: false },
    series: [
      { type: 'bar', stack: 'total', data: [floorBar], itemStyle: { color: EC.accent }, barMaxWidth: 32 },
      { type: 'bar', stack: 'total', data: [cobBar], itemStyle: { color: '#22c55e' }, barMaxWidth: 32 },
      { type: 'bar', stack: 'total', data: [descBar], itemStyle: { color: '#ef4444' }, barMaxWidth: 32 },
    ],
  });

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <h3
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          marginBottom: '12px',
          marginTop: 0,
          color: 'var(--text)',
        }}
      >
        🏦 Floor vs Upside — Cobertura por Fase
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fase 1 — FIRE Day */}
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '4px',
              fontWeight: 600,
            }}
          >
            FIRE Day (50–65 anos)
          </div>
          <EChart option={barOption(floorPct1, cobPct1, descPct1)} style={{ height: 44 }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-2">
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(59,130,246,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Floor RF</div>
              <div style={{ fontWeight: 700, color: EC.accent }} className="pv">
                {fmtPrivacy(floorFireDay / 1000, privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(239,68,68,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Gap equity</div>
              <div style={{ fontWeight: 700, color: '#ef4444' }} className="pv">
                {fmtPrivacy(gapFireDay / 1000, privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: `1px solid ${cobFireDay != null && cobFireDay >= 100 ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Cobertura</div>
              <div
                style={{
                  fontWeight: 700,
                  color: cobFireDay != null && cobFireDay >= 100 ? '#22c55e' : '#ef4444',
                }}
              >
                {cobFireDay != null ? `${cobFireDay.toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Fase 2 — pós-INSS */}
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '4px',
              fontWeight: 600,
            }}
          >
            Pós-INSS (65+ anos)
          </div>
          <EChart option={barOption(floorPct2, cobPct2, descPct2)} style={{ height: 44 }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-2">
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(59,130,246,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Floor c/INSS</div>
              <div style={{ fontWeight: 700, color: EC.accent }} className="pv">
                {fmtPrivacy(Math.min(floorPosInss, custoVida), privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(239,68,68,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Gap equity</div>
              <div style={{ fontWeight: 700, color: '#ef4444' }} className="pv">
                {fmtPrivacy(gapPosInss / 1000, privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: `1px solid ${cobPosInss != null && cobPosInss >= 100 ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Cobertura</div>
              <div
                style={{
                  fontWeight: 700,
                  color: cobPosInss != null && cobPosInss >= 100 ? '#22c55e' : '#ef4444',
                }}
              >
                {cobPosInss != null ? `${cobPosInss.toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="src" style={{ marginTop: '8px' }}>
        Floor FIRE Day: gasto_piso (RF) · Floor pós-INSS: + INSS Diego + INSS Katia · Cobertura: patrimônio / (gap/SWR)
      </div>
    </div>
  );
}

// ── ContributionReturnsCrossover ──────────────────────────────────────────────
// Mostra histórico e projeção de rentabilidade anual R$ vs aporte anual R$.
// Crossover = primeiro ano em que o portfólio ganha mais do que Diego aporta.
// Toggle nominal/real removido: com aportes fixos nominais, deflacionar pelos dois
// lados não altera o crossover — a leitura é matematicamente idêntica.
interface CrossoverTooltipParam {
  axisValue?: string;
  value?: number | null;
  seriesName?: string;
  marker?: string;
}
interface CrossoverDataPoint {
  ano: number;
  aporte_brl: number;
  ganho_mercado_brl: number;
  ganho_real_brl?: number;
  aporte_real_brl?: number;
  patrimonio_inicio_brl?: number;
  tipo: 'historico' | 'estimado' | 'projecao';
  parcial?: boolean;
  // Capital inicial (2021 XP, 2022 FIIs) — distingue de DCA recorrente
  capital_inicial_brl?: number;
  aporte_dca_brl?: number;
  nota?: string;
  meses_realizados?: number;
}

interface ContributionReturnsCrossoverData {
  historico: CrossoverDataPoint[];
  projecao: {
    base: CrossoverDataPoint[];
    fav: CrossoverDataPoint[];
    stress: CrossoverDataPoint[];
  };
  taxa_nominal_base: number;
  taxa_nominal_fav: number;
  taxa_nominal_stress: number;
  aporte_anual: number;
  ipca_projecao: number;
  crossover_historico_nominal_ano: number | null;
  crossover_projecao_nominal_ano: number | null;
  crossover_projecao_real_ano: number | null;
}

function ContributionReturnsCrossover({
  data: crc,
  privacyMode,
}: {
  data: ContributionReturnsCrossoverData;
  privacyMode: boolean;
}) {
  const { pv, pvLabel } = useEChartsPrivacy();

  // Merge historical (incl. 'estimado') + base projection into unified series
  const allYears = useMemo(() => {
    const hist = crc.historico ?? [];
    const proj = crc.projecao?.base ?? [];
    // Pipeline já exclui ANO_ATUAL da projeção (começa ANO_ATUAL+1)
    const histYears = new Set(hist.map(h => h.ano));
    const projFiltered = proj.filter(p => !histYears.has(p.ano));
    return [...hist, ...projFiltered];
  }, [crc]);

  const favProj = useMemo(() => {
    const fav = crc.projecao?.fav ?? [];
    const histYears = new Set((crc.historico ?? []).map(h => h.ano));
    return fav.filter(p => !histYears.has(p.ano));
  }, [crc]);

  const stressProj = useMemo(() => {
    const stress = crc.projecao?.stress ?? [];
    const histYears = new Set((crc.historico ?? []).map(h => h.ano));
    return stress.filter(p => !histYears.has(p.ano));
  }, [crc]);

  // "2026†" para estimado (dagger), string pura para outros
  const labels = allYears.map(d => d.tipo === 'estimado' ? `${d.ano}\u2020` : String(d.ano));
  const isHist = allYears.map(d => d.tipo === 'historico');
  const isParcial = allYears.map(d => d.tipo === 'estimado');
  // Anos com capital inicial não-DCA (2021 XP, 2022 FIIs)
  const hasCapitalInicial = allYears.map(d => (d.capital_inicial_brl ?? 0) > 0);

  // ── Chart 1: Valor Absoluto (R$) ─────────────────────────────────────────
  const aportesSeries = allYears.map(d => d.aporte_brl);
  const ganhosSeries = allYears.map(d => d.ganho_mercado_brl);
  const favSeries = allYears.map((d) => {
    if (d.tipo === 'historico') return null;
    const fp = favProj.find(p => p.ano === d.ano);
    return fp ? fp.ganho_mercado_brl : null;
  });
  const stressSeries = allYears.map((d) => {
    if (d.tipo === 'historico') return null;
    const sp = stressProj.find(p => p.ano === d.ano);
    return sp ? sp.ganho_mercado_brl : null;
  });

  // Crossover annotation year (nominal only — toggle removido)
  const crossYear = crc.crossover_historico_nominal_ano ?? crc.crossover_projecao_nominal_ano;

  const optionAbsoluto = useMemo(() => {
    const crossIdx = crossYear != null ? labels.indexOf(String(crossYear)) : -1;
    return {
      animation: false,
      // Fix 1: legenda explícita — ECharts não deriva legenda automaticamente quando há series silent/unnamed
      legend: {
        data: ['Rentabilidade Anual', 'Aportes Anuais'],
        bottom: 4,
        right: 16,
        textStyle: { color: EC.muted, fontSize: 11 },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 52 },
      tooltip: {
        trigger: 'axis' as const,
        ...EC_TOOLTIP,
        formatter: (params: CrossoverTooltipParam[]) => {
          const year = params[0]?.axisValue ?? '';
          const yearNum = parseInt(year);
          const pt = allYears.find(d => d.ano === yearNum);
          const lines = params
            .filter(p => p.value != null && p.seriesName !== 'Banda (fav-stress)')
            .map(p => {
              const v = typeof p.value === 'number' ? pvLabel(p.value) : '—';
              return `<div>${p.marker}${p.seriesName}: <b>${v}</b></div>`;
            })
            .join('');
          let extraNote = '';
          if (pt?.tipo === 'estimado') {
            extraNote = `<div style="color:${EC.yellow};margin-top:4px;font-size:11px">&#9888; ${pt.nota ?? 'Estimado'}</div>`;
          } else if (pt?.capital_inicial_brl) {
            const cap = pt.capital_inicial_brl.toLocaleString('pt-BR');
            const dca = (pt.aporte_dca_brl ?? 0).toLocaleString('pt-BR');
            extraNote = `<div style="color:${EC.muted};margin-top:4px;font-size:11px">Capital inicial: R$${cap} | DCA: R$${dca}</div>`;
          }
          return `<div style="font-size:12px"><b>${year}</b><br/>${lines}${extraNote}</div>`;
        },
      },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: { ...EC_AXIS_LABEL, fontSize: 11 },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        splitLine: EC_SPLIT_LINE,
        axisLabel: {
          ...EC_AXIS_LABEL,
          formatter: (v: number) => pvLabel(v),
        },
      },
      series: [
        // Banda fav-stress (área sombreada) — apenas projeção
        {
          name: 'Banda (fav-stress)',
          type: 'line' as const,
          data: favSeries.map((v, i) => v != null && stressSeries[i] != null ? pv(v) : null),
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0.15, color: EC.accent },
          stack: 'banda_upper',
          symbol: 'none',
          showSymbol: false,
          silent: true,
          // Excluir da legenda — é shape auxiliar
          legendHoverLink: false,
        },
        {
          name: 'Banda (fav-stress)',
          type: 'line' as const,
          data: stressSeries.map(v => v != null ? pv(v) : null),
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0, color: 'transparent' },
          stack: 'banda_upper',
          symbol: 'none',
          showSymbol: false,
          silent: true,
          legendHoverLink: false,
        },
        // Aportes Anuais — estimado com opacidade 80%, capital inicial com diamante amarelo
        {
          name: 'Aportes Anuais',
          type: 'line' as const,
          data: aportesSeries.map((v, i) => ({
            value: pv(v),
            symbol: hasCapitalInicial[i] ? 'diamond' : undefined,
            symbolSize: hasCapitalInicial[i] ? 10 : undefined,
            itemStyle: isParcial[i]
              ? { color: EC.muted, opacity: 0.6 }
              : hasCapitalInicial[i]
                ? { color: EC.yellow, opacity: 0.9 }
                : { color: EC.muted },
          })),
          lineStyle: { color: EC.muted, width: 2 },
          itemStyle: { color: EC.muted },
          symbol: 'circle',
          symbolSize: 5,
          smooth: false,
        },
        // Rentabilidade Anual — estimado com opacidade 80%
        {
          name: 'Rentabilidade Anual',
          type: 'line' as const,
          data: ganhosSeries.map((v, i) => ({
            value: pv(v),
            itemStyle: isParcial[i] ? { color: EC.accent, opacity: 0.6 } : { color: EC.accent },
          })),
          lineStyle: { color: EC.accent, width: 2.5 },
          itemStyle: { color: EC.accent },
          symbol: 'circle',
          symbolSize: 5,
          smooth: false,
          markLine: crossIdx >= 0 ? {
            silent: true,
            data: [{ xAxis: crossIdx }],
            label: { show: true, formatter: `Crossover ${crossYear}`, position: 'insideEndTop', fontSize: 11, color: EC.yellow },
            lineStyle: { type: 'dashed' as const, color: EC.yellow, width: 1.5 },
          } : undefined,
        },
      ],
    };
  }, [allYears, aportesSeries, ganhosSeries, favSeries, stressSeries, crossYear, labels, isParcial, isHist, hasCapitalInicial, pv, pvLabel]);

  const fmtAnno = (v: number | null) => v != null ? String(v) : '—';

  return (
    <div style={{ padding: '0 16px 16px' }} data-testid="contribuicao-retorno-crossover">
      {/* Header info strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginBottom: 12 }}>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Cross. Histórico</div>
          <div style={{ fontWeight: 700, color: EC.accent, fontSize: '1.1rem' }} data-testid="crossover-historico-ano">
            {fmtAnno(crc.crossover_historico_nominal_ano)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>primeiro ganho &gt; aporte</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Cross. Projetado Nominal</div>
          <div style={{ fontWeight: 700, color: EC.accent, fontSize: '1.1rem' }} data-testid="crossover-projecao-nominal-ano">
            {fmtAnno(crc.crossover_projecao_nominal_ano)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{(crc.taxa_nominal_base * 100).toFixed(0)}% nominal cenário base</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Cross. Projetado Real</div>
          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem' }} data-testid="crossover-projecao-real-ano">
            {fmtAnno(crc.crossover_projecao_real_ano)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>deflacionado IPCA {(crc.ipca_projecao * 100).toFixed(0)}%</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Aporte Anual</div>
          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>
            {fmtPrivacy(crc.aporte_anual, privacyMode)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>nominal fixo na projeção</div>
        </div>
      </div>

      <EChart option={optionAbsoluto} style={{ height: 320 }} />

      {/* Notes */}
      <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        Linha sólida = histórico real. Linha tracejada = projeção. Banda = cenários {(crc.taxa_nominal_stress * 100).toFixed(0)}%–{(crc.taxa_nominal_fav * 100).toFixed(0)}% nominal.
        Diamante amarelo = aporte inclui capital inicial não-DCA (2021: conversão XP R$252k; 2022: FIIs Jan R$72k).
        † 2026 = Jan–Abr realizado + Mai–Dez estimado @ R$25.000/mês e 9% nominal.
      </div>
    </div>
  );
}

export default function FirePage() {
  const { data, derived, isLoading, dataError, privacyMode } = usePageData();

  // Must be before early returns — Rules of Hooks require unconditional hook calls
  // Compute approximate retirement age for each fire_matrix patrimônio row
  // Uses fire_trilha P50 projection; extrapolates beyond its end with recent monthly growth
  const fireMatrixIdades = useMemo(() => {
    const ft = (data as any)?.fire_trilha;
    const pats: number[] = (data as any)?.fire_matrix?.patrimonios ?? [];
    if (!ft?.dates || !ft?.trilha_brl || !pats.length) return undefined;
    const idadeAtual: number = (data as any)?.premissas?.idade_atual ?? 39;
    const anoAtual: number = (data as any)?.premissas?.ano_atual ?? 2026;
    const horizonteVida: number = (data as any)?.premissas?.horizonte_vida ?? 90;
    const dates: string[] = ft.dates;
    const values: (number | null)[] = ft.trilha_brl;
    const nonNull = dates.map((dt: string, i: number) => ({ dt, v: values[i] })).filter(x => x.v != null) as { dt: string; v: number }[];
    if (!nonNull.length) return undefined;
    // Monthly growth rate from last 12 available months for extrapolation
    const last = nonNull[nonNull.length - 1];
    const prev12 = nonNull[Math.max(0, nonNull.length - 12)];
    const monthlyGrowth = nonNull.length >= 12 ? (last.v / prev12.v) ** (1 / 11) - 1 : 0.006;
    const toIdade = (year: number, month: number) => idadeAtual + (year - anoAtual) + (month - 4) / 12;
    // Area E fix: Extend extrapolation window and cap idade at horizonteVida
    const maxExtrapolationMonths = 240; // 20 years instead of 10
    return pats.map((pat: number) => {
      for (const { dt, v } of nonNull) {
        if (v >= pat) {
          return Math.round(toIdade(parseInt(dt.slice(0, 4)), parseInt(dt.slice(5, 7))));
        }
      }
      // Extrapolate beyond trajectory end
      let v = last.v;
      let year = parseInt(last.dt.slice(0, 4));
      let month = parseInt(last.dt.slice(5, 7));
      for (let i = 0; i < maxExtrapolationMonths; i++) {
        v *= (1 + monthlyGrowth);
        month++;
        if (month > 12) { month = 1; year++; }
        if (v >= pat) {
          const idade = Math.round(toIdade(year, month));
          return Math.min(idade, horizonteVida); // Cap at life expectancy
        }
      }
      // Fallback: if still not reached, return life expectancy (conservative)
      return horizonteVida;
    });
  }, [data]);

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data,
    loadingText: 'Carregando dados FIRE...',
    errorPrefix: 'Erro ao carregar FIRE:',
    warningText: 'Dados carregados mas seção FIRE não disponível',
  });
  if (stateEl) return stateEl;
  // TypeScript narrowing: stateEl being null guarantees data is non-null (pageStateElement returns JSX when data is null)
  const safeData = data!;

  // ── P(quality) helper — verde >=70, amarelo 55-70, vermelho <55
  const pqualityColor = (v: number | null | undefined): string => {
    if (v == null) return 'var(--muted)';
    if (v >= 70) return 'var(--green)';
    if (v >= 55) return 'var(--yellow)';
    return 'var(--red)';
  };

  // ── Hero banner values ──────────────────────────────────────────────────────
  const pfireHero: number | null = derived?.pfireBase ?? null; // pfireBase is 0-100 scale
  const pfireHeroColor = pfireColorFn(pfireHero);
  const pqualityHero: number | null = (data as any)?.fire?.p_quality ?? null;
  const modelUncertainty = (data as any)?.pfire_base?.model_uncertainty as { low: number; high: number } | null ?? null;
  const prem = (data as any)?.premissas ?? {};
  const fireYearHero: number | null = (() => {
    const p0 = (data as any)?.fire_matrix?.by_profile?.[0];
    const y = p0?.fire_age_53 ?? prem.ano_cenario_base;
    if (y) return parseInt(String(y), 10);
    const idadeAtual = prem.idade_atual;
    const idadeCenario = prem.idade_cenario_base ?? 53;
    const anoAtual = prem.ano_atual ?? new Date().getFullYear();
    if (idadeAtual != null) return anoAtual + (idadeCenario - idadeAtual);
    return null;
  })();
  const anoAtualHero: number = prem.ano_atual ?? new Date().getFullYear();
  const anosRestantesHero: number | null = fireYearHero != null ? fireYearHero - anoAtualHero : (
    derived?.fireMonthsAway != null ? Math.round(derived.fireMonthsAway / 12) : null
  );
  const patrimonioAlvoHero: number | null = (() => {
    const t = prem.patrimonio_fire_target;
    if (t != null) return t;
    const custo = prem.custo_vida ?? prem.custo_vida_base;
    const swr = prem.swr_gatilho;
    return custo != null && swr != null ? custo / swr : null;
  })();

  return (
    <div>
      {/* 0. P(FIRE) Hero Banner */}
      <div style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${pfireHeroColor} 8%, transparent), color-mix(in srgb, var(--accent) 4%, transparent))`,
        border: `1px solid color-mix(in srgb, ${pfireHeroColor} 30%, transparent)`,
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        marginBottom: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
        {/* P(FIRE) */}
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>P(FIRE 2040)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: pfireHeroColor, lineHeight: 1 }} data-testid="pfire-hero">
            {pfireHero != null ? `${pfireHero.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: pfireHeroColor, fontWeight: 600, marginTop: 4 }}>
            {pfireHero != null ? (pfireHero >= 90 ? <><CheckCircle size={14} className="inline mr-1" />ON TRACK</> : pfireHero >= 85 ? <><AlertCircle size={14} className="inline mr-1" />ADEQUADO</> : <><XCircle size={14} className="inline mr-1" />ATENÇÃO</>) : ''}
          </div>
          {modelUncertainty && (
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 3, opacity: 0.75 }}>
              modelo: ~{modelUncertainty.low}–{modelUncertainty.high}%
            </div>
          )}
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} className="hidden sm:block" />
        {/* P(quality) */}
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>P(quality)</div>
          <div data-testid="pquality-hero" style={{ fontSize: '2.5rem', fontWeight: 900, color: pqualityColor(pqualityHero), lineHeight: 1 }}>
            {pqualityHero != null ? `${pqualityHero.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>vida como planejada</div>
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} className="hidden sm:block" />
        {/* Data FIRE */}
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Data FIRE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }} data-testid="fire-year">
            {fireYearHero ?? '—'}
          </div>
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} className="hidden sm:block" />
        {/* Anos restantes */}
        <div style={{ textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Anos Restantes</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {anosRestantesHero != null ? `${anosRestantesHero}a` : '—'}
          </div>
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} className="hidden sm:block" />
        {/* Patrimônio alvo */}
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Patrimônio Alvo</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            {patrimonioAlvoHero != null
              ? fmtPrivacy(patrimonioAlvoHero, privacyMode)
              : '—'}
          </div>
        </div>
      </div>

      {/* Gap G: FIRE Number explícito — Meta / Atual / Gap / Progresso */}
      {(() => {
        const patrimonioAtual: number = prem.patrimonio_atual ?? 0;
        const fireNumberMeta: number | null = patrimonioAlvoHero;
        if (fireNumberMeta == null || patrimonioAtual === 0) return null;
        const gap = fireNumberMeta - patrimonioAtual;
        const progressoPct = Math.min(100, (patrimonioAtual / fireNumberMeta) * 100);
        const progressoColor = progressoPct >= 80 ? 'var(--green)' : progressoPct >= 50 ? 'var(--yellow)' : 'var(--accent)';
        const custoVida: number = prem.custo_vida_base ?? 250000;
        const swrGatilho: number = prem.swr_gatilho ?? 0.03;
        return (
          <div
            data-testid="fire-number-meta"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
              FIRE Number — Progresso Patrimonial
            </div>
            {/* Row: Meta | Atual | Gap */}
            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Meta (FIRE Number)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{fmtPrivacy(fireNumberMeta, privacyMode)}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{(custoVida / 1000).toFixed(0)}k ÷ {(swrGatilho * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Patrimônio Atual</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: progressoColor }}>{fmtPrivacy(patrimonioAtual, privacyMode)}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: progressoColor }}>{progressoPct.toFixed(1)}% da meta</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gap Restante</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red)' }}>{fmtPrivacy(gap, privacyMode)}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{(100 - progressoPct).toFixed(1)}% a acumular</div>
              </div>
            </div>
            {/* Barra de progresso */}
            <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressoPct}%`,
                  background: progressoColor,
                  borderRadius: 5,
                  transition: 'width 0.4s',
                }}
              />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 5 }}>
              FIRE Number = gastos anuais / SWR · Patrimônio gatilho = {fmtPrivacy(prem.patrimonio_gatilho ?? fireNumberMeta, privacyMode)}
            </div>
          </div>
        );
      })()}

      {/* P(FIRE) Distribution — Percentiles & Tail Risks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>P(FIRE) Distribuição Monte Carlo — Percentis</h2>
        <ScenarioBadge label="Solteiro" gasto={prem.custo_vida_base ?? 250000} privacyMode={privacyMode} />
      </div>
      <PFireDistribution
        base={pfireHero}
        percentiles={(data as any)?.pfire_base?.percentiles ?? null}
        label=""
      />

      {/* G1: Bond Pool Readiness + G3: IR Latente — compact status strip */}
      {(() => {
        const bp = (data as any)?.bond_pool_runway ?? {};
        const poolTotal = bp.pool_total_brl ?? [];
        const poolFireDay = Array.isArray(poolTotal) && poolTotal.length > 0 ? poolTotal[poolTotal.length - 1] : 0;
        const custoVida = prem.custo_vida_base ?? 250000;
        const metaAnos = prem.bond_tent_meta_anos ?? 7;
        const anosCobertosFireDay = custoVida > 0 ? poolFireDay / custoVida : 0;
        const readinessPct = metaAnos > 0 ? Math.min(anosCobertosFireDay / metaAnos, 1) : 0;

        // Current bond pool (RF total today)
        const rf = (data as any)?.rf ?? {};
        const rfTotal = (rf.ipca2029?.valor ?? 0) + (rf.ipca2040?.valor ?? 0) + (rf.ipca2050?.valor ?? 0) + (rf.renda2065?.valor ?? 0);
        const anosHoje = custoVida > 0 ? rfTotal / custoVida : 0;

        // IR latente
        const irDiferido = (data as any)?.tax?.ir_diferido_total_brl ?? 0;
        const patrimonioAtual = prem.patrimonio_atual ?? 0;
        const patrimonioLiquido = patrimonioAtual - irDiferido;

        const fmtBrl = (v: number) => fmtPrivacy(v, privacyMode);
        const fmtM = (v: number) => fmtPrivacy(v, privacyMode);

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ marginBottom: 12 }}>
            {/* Bond Pool Readiness */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Bond Pool — Proteção SoRR</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: readinessPct >= 0.8 ? 'var(--green)' : readinessPct >= 0.5 ? 'var(--yellow)' : 'var(--red)' }}>
                  {anosHoje.toFixed(1)}a
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>hoje / {metaAnos}a meta</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(readinessPct * 100, 100)}%`, background: readinessPct >= 0.8 ? 'var(--green)' : readinessPct >= 0.5 ? 'var(--yellow)' : 'var(--red)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                Projeção FIRE Day: {anosCobertosFireDay.toFixed(1)}a ({(readinessPct * 100).toFixed(0)}%) · RF hoje: {fmtBrl(rfTotal)}
              </div>
            </div>

            {/* IR Latente */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Patrimônio Líquido de IR</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>{fmtM(patrimonioLiquido)}</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                Bruto {fmtM(patrimonioAtual)} − IR latente {fmtBrl(irDiferido)} (transitórios)
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Group 1: Readiness ─────────────────────────────────────────────────── */}
      <SectionDivider label="Readiness" />

      {/* Floor vs Upside — Cobertura por Fase */}
      <CollapsibleSection
        id="section-floor-upside-fire"
        title={secTitle('fire', 'floor-upside-fire', 'Floor vs Upside — Cobertura por Fase')}
        defaultOpen={secOpen('fire', 'floor-upside-fire', true)}
        icon={<Building2 size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const prem = (data as any)?.premissas ?? {};
            const gastoPiso: number = (data as any)?.gasto_piso ?? 0;
            const custoVida: number = prem.custo_vida_base ?? 250000;
            const inssD: number = prem.inss_anual ?? 0;
            const inssK: number = prem.tem_conjuge ? (prem.inss_katia_anual ?? 0) : 0;
            const swrGatilho: number = prem.swr_gatilho ?? FIRE_RULES.SWR_DEFAULT;
            const patrimonio: number = prem.patrimonio_atual ?? 0;
            return (
              <>
                <div style={{ marginBottom: 8 }}>
                  <ScenarioBadge label="Solteiro" gasto={custoVida} privacyMode={privacyMode} />
                </div>
                <FloorUpsideFire
                  gastoPiso={gastoPiso}
                  custoVida={custoVida}
                  inssD={inssD}
                  inssK={inssK}
                  swrGatilho={swrGatilho}
                  patrimonio={patrimonio}
                  privacyMode={privacyMode}
                />
              </>
            );
          })()}
        </div>
      </CollapsibleSection>

      {/* Gap F: Renda Floor Katia — nota conservadora no modelo MC */}
      {(() => {
        const inssKatiaAnual: number = prem.inss_katia_anual ?? 0;
        const pfireCasal: number | null = (data as any)?.pfire_aspiracional?.base ?? null; // proxy: aspiracional inclui Katia
        if (!inssKatiaAnual) return null;
        return (
          <div
            data-testid="renda-floor-katia"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Renda Floor Katia</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                {fmtPrivacy(inssKatiaAnual, privacyMode)}/ano
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>INSS Katia · a partir de 2049</div>
            </div>
            {pfireCasal != null && (
              <>
                <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>P(FIRE) c/ Katia</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green)' }}>
                    {privacyMode ? '••%' : `~${pfireCasal.toFixed(1)}%`}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>cenário aspiracional</div>
                </div>
              </>
            )}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: '100%', marginTop: -4, fontStyle: 'italic' }}>
              Nota conservadora: renda de Katia NÃO incluída no modelo MC por default. Inclui PGBL Katia ~{fmtPrivacy(prem.pgbl_katia_saldo_fire ?? 490000, privacyMode)} no FIRE Day.
            </div>
          </div>
        );
      })()}

      {/* Tracking FIRE — Realizado vs Projeção */}
      <div data-testid="fire-trilha">
      <section className="section" id="trackingFireSection">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Tracking FIRE — Realizado vs Projeção</h2>
          <ScenarioBadge label="Solteiro" gasto={prem.custo_vida_base ?? 250000} privacyMode={privacyMode} />
        </div>
        <TrackingFireChart data={safeData} />
        <div className="src">
          Patrimônio realizado vs projeção FIRE · Meta FIRE
        </div>
      </section>
      </div>

      {/* Cenários FIRE — 3 cenários base + Aspiracional */}
      {(data as any)?.fire_matrix?.by_profile?.length > 0 && (() => {
        const prem = (data as any)?.premissas ?? {};
        const aporte     = prem.aporte_mensal ?? 0;
        const retorno    = prem.retorno_equity_base ?? 0.0485;
        const swrTarget  = prem.swr_gatilho ?? FIRE_RULES.SWR_DEFAULT;
        const currentAge = prem.idade_atual ?? 39;
        const patrimonio = prem.patrimonio_atual ?? 0;
        const favRetorno = (data as any)?.fire_matrix?.retornos_equity?.fav ?? retorno;

        type CardDef = { profile: string; emoji: string; label: string; cond: string; mkt: string; retorno: number; isAspir?: boolean };
        const CARDS: CardDef[] = [
          { profile: 'atual',  emoji: '👤', label: 'Solteiro',       cond: 'solteiro',  mkt: 'base', retorno },
          { profile: 'casado', emoji: '💍', label: 'Casamento',      cond: 'casamento', mkt: 'base', retorno },
          { profile: 'filho',  emoji: '👶', label: 'Casado + Filho', cond: 'filho',     mkt: 'base', retorno },
          { profile: 'atual',  emoji: '⚡', label: 'Aspiracional',   cond: 'solteiro',  mkt: 'fav',  retorno: favRetorno, isAspir: true },
        ];

        return (
          <section className="section" id="fireAspirationalSection">
            <h2>Cenários FIRE <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--muted)' }}>— MC · cenário por perfil</span></h2>
            <div data-testid="pfire-familia" className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '12px' }}>
              {CARDS.map(({ profile, emoji, label, cond, mkt, isAspir }) => {
                const p = (data as any)?.fire_matrix?.by_profile?.find((x: any) => x.profile === profile);
                if (!p) return null;

                // Use precomputed MC dates — consistent with P values (same MC run)
                let fireAno: number | null, fireIdade: number | null;
                let pfire: number, pfav: number, pstress: number;
                let pquality: number | null;
                if (isAspir) {
                  const ef = (data as any)?.earliest_fire;
                  fireAno = ef?.ano ?? null;
                  fireIdade = ef?.idade ?? null;
                  pfire  = (data as any)?.pfire_aspiracional?.base  ?? p.p_fire_50;
                  pfav   = (data as any)?.pfire_aspiracional?.fav   ?? p.p_fire_50_fav;
                  pstress = (data as any)?.pfire_aspiracional?.stress ?? p.p_fire_50_stress;
                  pquality = (data as any)?.fire?.p_quality_aspiracional ?? null;
                } else {
                  // Threshold scenario: earliest age where P(base) >= 85% with SWR=3% fixed
                  fireAno = p.fire_year_threshold ? parseInt(p.fire_year_threshold, 10) : null;
                  fireIdade = p.fire_age_threshold ?? null;
                  pfire  = p.p_at_threshold as number;
                  pfav   = p.p_at_threshold_fav as number;
                  pstress = p.p_at_threshold_stress as number;
                  pquality = p.p_quality ?? null;
                }

                const pfireColor = pfireColorFn(pfire);
                const accentColor = isAspir ? 'var(--yellow)' : 'var(--accent)';
                const href = isAspir
                  ? '/simulators?preset=aspiracional'
                  : `/simulators?cond=${cond}&mkt=${mkt}`;

                return (
                  <div key={label} data-testid={isAspir ? 'earliest-fire' : undefined} style={{
                    background: isAspir
                      ? 'linear-gradient(135deg, color-mix(in srgb, var(--yellow) 8%, transparent), color-mix(in srgb, var(--accent) 5%, transparent))'
                      : 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 6%, transparent), color-mix(in srgb, var(--green) 5%, transparent))',
                    border: `2px dashed ${accentColor}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: '18px 14px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <div style={{ fontSize: '1.4rem', lineHeight: 1 }}>{emoji}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      {fmtPrivacy(Math.round(p.gasto_anual / 1000) * 1000, privacyMode) + '/ano'}{isAspir ? ' · mercado fav.' : ''}
                      {!isAspir && p.swr_at_fire != null && (
                        <span style={{ marginLeft: 6, color: 'var(--accent)', fontWeight: 600 }}>
                          · SWR {(p.swr_at_fire * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {/* FIRE year — from MC precomputed data (consistent with P value) */}
                    {fireAno ? (
                      <>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: accentColor, lineHeight: 1, marginTop: '6px' }}>{fireAno}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>idade {fireIdade}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--muted)', lineHeight: 1, marginTop: '6px' }}>—</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>não atingido</div>
                      </>
                    )}
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: pfireColor, marginTop: '2px' }}>P = {pfire.toFixed(1)}%</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>fav <span style={{ color: 'var(--green)' }}>{pfav.toFixed(0)}%</span></span>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>stress <span style={{ color: 'var(--red)' }}>{pstress.toFixed(0)}%</span></span>
                    </div>
                    {pquality != null && (
                      <div data-testid={`pquality-profile-${profile}${isAspir ? '-aspir' : ''}`}
                           style={{ marginTop: '6px', padding: '3px 8px', borderRadius: 4,
                                    background: `color-mix(in srgb, ${pqualityColor(pquality)} 12%, transparent)`,
                                    border: `1px solid color-mix(in srgb, ${pqualityColor(pquality)} 30%, transparent)` }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>quality </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: pqualityColor(pquality) }}>{pquality.toFixed(1)}%</span>
                      </div>
                    )}
                    <div style={{ marginTop: '10px' }}>
                      <Link href={href} style={{
                        display: 'inline-block', padding: '6px 18px',
                        background: accentColor, color: isAspir ? '#000' : 'white',
                        borderRadius: 'var(--radius-md)', fontWeight: 700,
                        fontSize: 'var(--text-sm)', textDecoration: 'none',
                      }}>Simular</Link>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="src">Base: MC simulações · SWR {((prem.swr_gatilho ?? 0.03) * 100).toFixed(0)}% fixo · primeira idade onde P ≥ 85% (exceto aspiracional)</div>
            {/* Sub-seção: tabela detalhada — merge de FireScenariosTable aqui */}
            <div style={{ marginTop: 12 }}>
              <CollapsibleSection
                id="section-scenario-compare"
                title="Tabela detalhada — Base vs Aspiracional"
                defaultOpen={secOpen('fire', 'scenario-compare', false)}
              >
                <div style={{ padding: '0 16px 16px' }}>
                  <FireScenariosTable />
                  <div className="src">Base: Monte Carlo 10k simulações</div>
                </div>
              </CollapsibleSection>
            </div>
          </section>
        );
      })()}

      {/* P(quality) Matrix — 5 critérios × 3 perfis × 3 cenários */}
      {(() => {
        const matrix = (safeData as any)?.fire?.p_quality_matrix;
        if (!matrix) return null;
        return (
          <CollapsibleSection
            id="pquality-matrix"
            title={secTitle('fire', 'pquality-matrix', 'Critérios de Qualidade — Go-Go Window')}
            defaultOpen={secOpen('fire', 'pquality-matrix', true)}
          >
            <PQualityMatrix matrix={matrix} privacyMode={privacyMode} />
          </CollapsibleSection>
        );
      })()}

      {/* ── Group 2: Projeções ─────────────────────────────────────────────────── */}
      <SectionDivider label="Projeções" />

      {/* Projeção de Patrimônio — P10 / P50 / P90 */}
      <div data-testid="net-worth-projection">
      <section className="section" id="netWorthProjectionSection">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Projeção de Patrimônio — P10 / P50 / P90 (portfólio financeiro)</h2>
          <ScenarioBadge label="Solteiro" gasto={prem.custo_vida_base ?? 250000} privacyMode={privacyMode} />
        </div>
        <NetWorthProjectionChart data={safeData} />
        <div style={{ marginTop: 4, padding: '6px 10px', background: 'color-mix(in srgb, var(--yellow) 8%, transparent)', borderRadius: 6, borderLeft: '3px solid var(--yellow)', fontSize: 'var(--text-sm)' }}>
          <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: '-2px', flexShrink: 0 }} /> Portfólio financeiro apenas. Aportes futuros de R$25k/mês já estão modelados trajetória a trajetória (proxy de capital humano). O modelo não captura risco de interrupção de renda — doença, invalidez ou queda de receita PJ.{' '}
          Pré-FIRE: interpolação exponencial entre hoje e endpoints MC. Pós-FIRE: retorno blended (P10=2.5%, P50=3.5%, P90=4.5% real) com spending smile (Go-Go/Slow-Go/No-Go) + saúde VCMH em R$ reais (constante 2026).
        </div>
        <div className="src">
          Base: Monte Carlo 10k simulações · R$ reais constante 2026
        </div>
      </section>
      </div>

      {/* Contribution vs Returns Crossover */}
      {(safeData as any)?.contribuicao_retorno_crossover && (
        <CollapsibleSection
          id="section-contribuicao-retorno-crossover"
          title={secTitle('fire', 'contribuicao-retorno-crossover', 'Crossover Point — Rentabilidade vs Aportes')}
          defaultOpen={secOpen('fire', 'contribuicao-retorno-crossover', true)}
        >
          <ContributionReturnsCrossover
            data={(safeData as any).contribuicao_retorno_crossover}
            privacyMode={privacyMode}
          />
        </CollapsibleSection>
      )}

      {/* FIRE Matrix — P(Sucesso até 90a) */}
      {safeData.fire_matrix && (
        <CollapsibleSection id="section-fire-matrix" title={secTitle('fire', 'fire-matrix')} defaultOpen={secOpen('fire', 'fire-matrix')}>
          <div data-testid="fire-matrix" style={{ padding: '0 16px 16px' }}>
            {(() => {
              const profiles = (safeData as any)?.fire_matrix?.by_profile ?? [];
              const atual = profiles.find((p: any) => p.profile === 'atual');
              const label = 'Solteiro';
              const gasto = atual?.gasto_anual ?? (safeData as any)?.premissas?.custo_vida_base ?? 250000;
              return <ScenarioBadge label={label} gasto={gasto} privacyMode={privacyMode} />;
            })()}
            <FireMatrixTable
              data={safeData.fire_matrix}
              idades={fireMatrixIdades}
              currentPatrimonio={(safeData as any)?.premissas?.patrimonio_atual}
              currentSpending={(safeData as any)?.premissas?.custo_vida ?? (safeData as any)?.premissas?.custo_vida_base}
            />
            <div className="src">
              Verde &gt;95%, Amarelo 88–95%, Vermelho &lt;88%. Eixo: Patrimônio no FIRE Day (linha) × Gasto Anual BRL (coluna). ★ = gasto típico do perfil · → = patrimônio-alvo do perfil.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* ── Group 3: Contexto ──────────────────────────────────────────────────── */}
      <SectionDivider label="Contexto" />

      {/* Balanço Holístico — Patrimônio expandido */}
      <CollapsibleSection id="balanco-holistico-fire" title={secTitle('fire', 'balanco-holistico-fire', 'Balanço Holístico')} defaultOpen={secOpen('fire', 'balanco-holistico-fire', false)} icon={<Landmark size={18} />}>
        <BalancoHolistico data={data as any} showCapitalHumanoBadge />
      </CollapsibleSection>

      {/* Capital Humano vs. Financeiro — Crossover */}
      {(() => {
        const hc = (data as any)?.human_capital;
        if (!hc || !hc.pontos?.length) return null;
        return (
          <CollapsibleSection
            id="section-capital-humano"
            title={secTitle('fire', 'capital-humano', 'Capital Humano vs. Financeiro')}
            defaultOpen={secOpen('fire', 'capital-humano', false)}
          >
            <HumanCapitalCrossover
              pontos={hc.pontos}
              crossoverAno={hc.crossover_ano}
              crossoverIdade={hc.crossover_idade}
              fireDayAno={hc.fire_day_ano}
              fireDayIdade={hc.fire_day_idade}
              taxaDesconto={hc.taxa_desconto_real}
              rendaAnual={hc.renda_estimada_anual}
            />
          </CollapsibleSection>
        );
      })()}

      {/* ── Cenários & Risco ───────────────────────────────────────────────── */}
      <SectionDivider label="Cenários & Risco" />

      {/* Sequence of Returns Risk — SoRR Narrative + P(FIRE) ↔ Guardrails */}
      <CollapsibleSection
        id="sequence-returns"
        title={secTitle('fire', 'sequence-returns', 'Sequence of Returns — Risco e Guardrails')}
        defaultOpen={secOpen('fire', 'sequence-returns', false)}
      >
        <SequenceOfReturnsRisk
          pfire={(data as any)?.pfire_base ?? null}
          premissas={(data as any)?.premissas ?? {}}
          gastoPiso={(data as any)?.gasto_piso ?? 184000}
          privacyMode={privacyMode}
        />
      </CollapsibleSection>

      {/* ── R6: SoRR Indicator Table ──────────────────────────────────────────── */}
      {(() => {
        const risk = (data as any)?.risk;
        const sorrScenarios: Array<{
          crash_label: string;
          crash_pct: number;
          pfire_ajustado: number;
          is_static_estimate?: boolean;
        }> = risk?.sorr_scenarios ?? [];
        if (sorrScenarios.length === 0) return null;
        // Base P(FIRE) used for delta calculation — from MC pipeline, dynamic
        const sorrBasePfire: number = risk?.sorr_base_pfire ?? (data as any)?.pfire_base?.base ?? null;
        return (
          <CollapsibleSection
            id="section-sorr-indicator"
            title={secTitle('fire', 'sorr-indicator', 'SoRR Indicator — P(FIRE) em Cenários de Crash')}
            defaultOpen={secOpen('fire', 'sorr-indicator', false)}
          >
            <div style={{ padding: '0 16px 16px' }}>
              {sorrBasePfire != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
                  Base P(FIRE): <strong style={{ color: 'var(--text)' }}>{privacyMode ? '••%' : `${sorrBasePfire.toFixed(1)}%`}</strong>
                </div>
              )}
              <div data-testid="sorr-indicator" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600 }}>Cenário de Crash</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--muted)', fontWeight: 600 }}>P(FIRE) Ajustado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorrScenarios.map(s => {
                      const isAlert = s.pfire_ajustado < 0.75;
                      const pct = (s.pfire_ajustado * 100).toFixed(0);
                      return (
                        <tr key={s.crash_label} style={{ borderBottom: '1px solid var(--card2)', background: isAlert ? 'rgba(248,81,73,0.06)' : 'transparent' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                            {s.crash_label}
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginLeft: 8 }}>
                              ({(s.crash_pct * 100).toFixed(0)}%)
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: isAlert ? 'var(--red)' : 'var(--green)' }}>
                            {privacyMode ? '••%' : `${pct}%`}
                            {isAlert && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--red)' }}>⚠ &lt;75%</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="src">
                Estimativa estática — delta aplicado sobre P(FIRE) base. Para análise completa, ver simulações Monte Carlo.
                P(FIRE) ajustado = base + delta de impacto de queda imediata no portfolio. Alerta se &lt;75%.
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* Stress Macroeconômico — Stagflation + Hyperinflation */}
      {(() => {
        const ext = (data as any)?.pfire_cenarios_estendidos as Record<string, { p_sucesso_pct: number; label: string; descricao: string }> | null | undefined;
        if (!ext || Object.keys(ext).length === 0) return null;
        const base = (data as any)?.pfire_base?.base as number | null;
        const cenarios = [
          { id: 'base',          label: 'Base',          descricao: 'Premissas HD-006',   pct: base,    cor: 'var(--green)' },
          ...Object.entries(ext).map(([, v]) => ({
            id: v.label,
            label: v.label,
            descricao: v.descricao,
            pct: v.p_sucesso_pct,
            cor: v.p_sucesso_pct >= 70 ? 'var(--yellow)' : 'var(--red)',
          })),
        ];
        return (
          <CollapsibleSection
            id="section-stress-macro"
            title={secTitle('fire', 'section-stress-macro', 'Stress Macroeconômico — Stagflation & Hyperinflation')}
            defaultOpen={secOpen('fire', 'section-stress-macro', false)}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                Cenários permanentes de stress extremo. P(FIRE) com mesmo patrimônio e estratégia atual.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cenarios.map(c => (
                  <div key={c.id} className="kpi" style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: c.cor, lineHeight: 1.1, marginBottom: 4 }}>
                      {c.pct != null ? `${c.pct.toFixed(0)}%` : '—'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.4 }}>
                      {c.descricao}
                    </div>
                  </div>
                ))}
              </div>
              <div className="src" style={{ marginTop: 12 }}>
                Cenários são permanentes (não transitórios) — worst-case para toda a fase de desacumulação. MC 10k simulações cada.
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* Surviving Spouse / F6 — só exibir se tem_conjuge === true */}
      {(data as any)?.premissas?.tem_conjuge === true && (
        <>
          <CollapsibleSection id="section-surviving-spouse" title={secTitle('fire', 'section-surviving-spouse', 'Cenário: Cônjuge Sobrevivente')} defaultOpen={secOpen('fire', 'section-surviving-spouse')} icon={<Heart size={18} />}>
          <div style={{ padding: '0 16px 16px' }}>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: 12 }}>
              Estimativa de sustentabilidade do plano caso {(data as any)?.premissas?.nome_conjuge ?? 'cônjuge'} sobreviva a Diego.
              SWR conservador de 3% aplicado a patrimônio transferido.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="kpi" style={{ textAlign: 'center' }}>
                <div className="kpi-label">Gasto Katia (solo)</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {fmtPrivacy(((data as any)?.premissas?.gasto_katia_solo ?? 160000) / 1000 * 1000, privacyMode) + '/ano'}
                </div>
              </div>
              <div className="kpi" style={{ textAlign: 'center' }}>
                <div className="kpi-label">INSS Katia</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {fmtPrivacy(((data as any)?.premissas?.inss_katia_anual ?? 93600) / 1000 * 1000, privacyMode) + '/ano'}
                </div>
              </div>
              <div className="kpi" style={{ textAlign: 'center' }}>
                <div className="kpi-label">PGBL Katia (FIRE Day)</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {fmtPrivacy(((data as any)?.premissas?.pgbl_katia_saldo_fire ?? 490000) / 1000 * 1000, privacyMode)}
                </div>
              </div>
            </div>
            {(() => {
              const gastoKatia = (data as any)?.premissas?.gasto_katia_solo ?? 160_000;
              const inssKatia = (data as any)?.premissas?.inss_katia_anual ?? 93_600;
              const pgblKatia = (data as any)?.premissas?.pgbl_katia_saldo_fire ?? 490_000;
              // Area D fix: Use FIRE Day patrimônio (trilha_p50[-1]) instead of patrimonio_atual for spouse scenario
              // Spouse analysis assumes evaluation at FIRE Day when patrimônio will be larger from growth/aportes
              const trilha = (data as any)?.trilha?.p50 ?? [];
              const patrimonioFireDay = trilha.length > 0 ? trilha[trilha.length - 1] : 0;
              const patrimonioBase = patrimonioFireDay > 0 ? patrimonioFireDay : ((data as any)?.premissas?.patrimonio_atual ?? 0);
              const gastoLiquido = Math.max(0, gastoKatia - inssKatia);
              const swrKatia = (data as any)?.premissas?.swr_gatilho ?? 0.03;
              const patrimonioNecessario = gastoLiquido > 0 ? gastoLiquido / swrKatia : 0;
              const patrimonioTotal = patrimonioBase + pgblKatia;
              const cobertura = patrimonioNecessario > 0 ? (patrimonioTotal / patrimonioNecessario) * 100 : 100;
              const cor = cobertura >= 100 ? 'var(--green)' : cobertura >= 80 ? 'var(--yellow)' : 'var(--red)';
              return (
                <div style={{ marginTop: 14, padding: '12px', background: 'var(--card2)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${cor}` }}>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gasto líquido (− INSS)</div>
                      <div style={{ fontWeight: 700 }}>{fmtPrivacy(Math.round(gastoLiquido / 1000) * 1000, privacyMode) + '/ano'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Patrimônio necessário (3% SWR)</div>
                      <div style={{ fontWeight: 700 }}>{fmtPrivacy(patrimonioNecessario, privacyMode)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Cobertura estimada</div>
                      <div style={{ fontWeight: 700, color: cor }}>{`${cobertura.toFixed(0)}%`}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 8 }}>
                    SWR 3% (conservador solo). Patrimônio = portfólio atual + PGBL Katia. INSS Katia: {fmtPrivacy(inssKatia, privacyMode, { decimals: 0 })}/ano deduzido do gasto.
                  </div>
                </div>
              );
            })()}
          </div>
        </CollapsibleSection>
        </>
      )}

      <SectionDivider label="Eventos de Vida" />
      {/* Eventos de Vida — collapsed (detalhe de sensibilidade) */}
      <div data-testid="eventos-vida">
      <CollapsibleSection id="section-eventos-vida" title={secTitle('fire', 'eventos-vida')} defaultOpen={secOpen('fire', 'eventos-vida')}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
            (gatilhos de recalibração)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Cenário</span>
            <ScenarioBadge label="Solteiro" gasto={prem.custo_vida_base ?? 250000} privacyMode={privacyMode} />
          </div>
          <EventosVidaChart data={safeData} />
          <div className="src">
            Ao ativar qualquer evento: recalibrar custo de vida, FIRE date, seguro de vida e estrutura patrimonial imediatamente. Impacto de eventos permanentes no custo de vida.
          </div>
        </div>
      </CollapsibleSection>
      </div>

      {/* Glide Path — collapsed (mecanismo de execução) */}
      <div data-testid="glide-path">
      <CollapsibleSection id="section-glide-path" title={secTitle('fire', 'glide-path')} defaultOpen={secOpen('fire', 'glide-path')}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Cenário</span>
            <ScenarioBadge label="Solteiro" gasto={prem.custo_vida_base ?? 250000} privacyMode={privacyMode} />
          </div>
          <GlidePathChart data={safeData} />
          <div className="src">
            Crypto: 3% pré e pós-FIRE. Alocações somam 100% por idade.
          </div>
        </div>
      </CollapsibleSection>
      </div>

      <SectionDivider label="Bond Pool & Spending" />

      {/* ── Gap M: Bond Pool Status ────────────────────────────────────────────── */}
      {(() => {
        const bp = (data as any)?.bond_pool;
        if (!bp) return null;
        const atualBrl: number = bp.atual_brl ?? 0;
        const metaBrl: number = bp.meta_brl ?? 0;
        const coberturaAnos: number = bp.cobertura_anos ?? 0;
        const metaAnos: number = bp.meta_anos ?? 7;
        const pctMeta: number = bp.pct_meta ?? 0;
        const comp = bp.composicao ?? {};
        const progressColor = pctMeta >= 50 ? 'var(--green)' : pctMeta >= 25 ? 'var(--yellow)' : 'var(--red)';
        const fmtBRLfire = (v: number) => privacyMode ? fmtPrivacy(v, true) : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
        return (
          <div data-testid="bond-pool-status" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Bond Pool — IPCA+2040 + 2050</div>
              <span style={{ padding: '2px 10px', borderRadius: 20, background: `${progressColor}22`, border: `1px solid ${progressColor}66`, color: progressColor, fontWeight: 700, fontSize: 'var(--text-xs)' }}>
                {coberturaAnos.toFixed(1)}a de {metaAnos}a meta
              </span>
            </div>
            <div style={{ background: 'var(--card2)', borderRadius: 8, height: 10, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(pctMeta, 100)}%`, height: '100%', background: progressColor, borderRadius: 8, transition: 'width .3s' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Atual</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{fmtBRLfire(atualBrl)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Meta ({metaAnos} anos)</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--muted)' }}>{fmtBRLfire(metaBrl)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>IPCA+2040</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{fmtBRLfire(comp.ipca2040 ?? 0)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>IPCA+2050</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{fmtBRLfire(comp.ipca2050 ?? 0)}</div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              Meta: {metaAnos} anos × gastos anuais = {fmtBRLfire(metaBrl)}. Excl. IPCA+2029 (reserva emergência). {pctMeta.toFixed(1)}% atingido.
            </div>
          </div>
        );
      })()}

      {/* ── Gap L: Spending Ceiling ────────────────────────────────────────────── */}
      {(() => {
        const sc = (data as any)?.spending_ceiling;
        if (!sc) return null;
        const floorP90: number = sc.floor_p90 ?? 0;
        const centralP85: number = sc.central_p85 ?? 0;
        const ceilingP80: number = sc.ceiling_p80 ?? 0;
        const swrP90: number = sc.swr_p90 ?? 0;
        const swrP85: number = sc.swr_p85 ?? 0;
        const swrP80: number = sc.swr_p80 ?? 0;
        const patrimonioBase: number = sc.patrimonio_base ?? 0;
        const fmtBRLfire = (v: number) => privacyMode ? fmtPrivacy(v, true) : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
        const fmtK = (v: number) => privacyMode ? fmtPrivacy(v, true) : `R$ ${Math.round(v / 1000)}k`;
        return (
          <div data-testid="spending-ceiling">
          <CollapsibleSection
            id="section-spending-ceiling"
            title={secTitle('fire', 'spending-ceiling', 'Spending Ceiling — Máximo Sustentável')}
            defaultOpen={secOpen('fire', 'spending-ceiling', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 12 }}>
                {[
                  { label: 'Piso (P90)', val: floorP90, swr: swrP90, cor: 'var(--green)', note: '10% chance de superar' },
                  { label: 'Central (P85)', val: centralP85, swr: swrP85, cor: 'var(--accent)', note: '15% chance de superar' },
                  { label: 'Teto (P80)', val: ceilingP80, swr: swrP80, cor: 'var(--yellow)', note: '20% chance de superar' },
                ].map(({ label, val, swr, cor, note }) => (
                  <div key={label} style={{ background: 'var(--bg)', border: `1px solid ${cor}40`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cor, lineHeight: 1 }}>{fmtK(val)}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{fmtK(val / 12)}/mês</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>SWR {swr.toFixed(2)}%</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{note}</div>
                  </div>
                ))}
              </div>
              <div className="src">
                Aproximação analítica (anuidade ajustada por risco). Aportes=0 (conservador).
                Patrimônio base: {fmtBRLfire(patrimonioBase)}. Usar MC completo para valores definitivos.
                Nota: piso &lt; gasto atual (R$250k) pois aportes=0 nesta estimativa — com aportes projetados, ceiling é maior.
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* ── Gap N: Sensibilidade P(FIRE) ──────────────────────────────────────── */}
      {(() => {
        const sens = (data as any)?.pfire_sensitivity;
        if (!Array.isArray(sens) || sens.length === 0) return null;
        return (
          <div data-testid="pfire-sensitivity-table">
          <CollapsibleSection
            id="section-pfire-sensitivity"
            title={secTitle('fire', 'pfire-sensitivity', 'Sensibilidade P(FIRE) — Análise de Variáveis')}
            defaultOpen={secOpen('fire', 'pfire-sensitivity', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)', minWidth: 360 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '7px 8px', color: 'var(--muted)', fontWeight: 600 }}>Variável</th>
                      <th style={{ textAlign: 'right', padding: '7px 8px', color: 'var(--muted)', fontWeight: 600 }}>Base</th>
                      <th style={{ textAlign: 'right', padding: '7px 8px', color: 'var(--muted)', fontWeight: 600 }}>Stress</th>
                      <th style={{ textAlign: 'right', padding: '7px 8px', color: 'var(--muted)', fontWeight: 600 }}>P(FIRE) base</th>
                      <th style={{ textAlign: 'right', padding: '7px 8px', color: 'var(--muted)', fontWeight: 600 }}>ΔP(FIRE)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sens.map((row: any, i: number) => {
                      const delta: number = row.delta_pp ?? 0;
                      const cor = delta >= 0 ? 'var(--green)' : 'var(--red)';
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--card2)' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row.variable}</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)' }}>{row.base_value}</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.stressed_value}</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>
                            {privacyMode ? '••%' : `${row.pfire_base?.toFixed(1) ?? '—'}%`}
                          </td>
                          <td style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: cor }}>
                            {privacyMode ? '±••pp' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="src">
                Deltas heurísticos (Pfau 2012). Sensibilidade analítica — para valores exatos usar fire_montecarlo.py completo.
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

    </div>
  );
}
