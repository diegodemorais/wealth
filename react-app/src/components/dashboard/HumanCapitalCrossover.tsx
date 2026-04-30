'use client';

import React, { useState, useMemo } from 'react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { EChart } from '@/components/primitives/EChart';
import { useChartResize } from '@/hooks/useChartResize';
import { EC } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface Ponto {
  ano: number;
  idade: number;
  vp_capital_humano: number;
  pat_financeiro: number;
  crossover: boolean;
  delta: number;
}

interface HumanCapitalCrossoverProps {
  pontos: Ponto[];
  crossoverAno: number | null;
  crossoverIdade: number | null;
  fireDayAno: number;
  fireDayIdade: number;
  taxaDesconto: number;
  rendaAnual: number;
}

function fmtBrl(val: number, privacyMode: boolean): string {
  return fmtPrivacy(val, privacyMode);
}

function fmtBrlMillions(val: number): string {
  return `R$${(val / 1_000_000).toFixed(1)}M`;
}

export function HumanCapitalCrossover({
  pontos,
  crossoverAno,
  crossoverIdade,
  fireDayAno,
  fireDayIdade,
  taxaDesconto,
  rendaAnual,
}: HumanCapitalCrossoverProps) {
  const { privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();
  const [tableOpen, setTableOpen] = useState(false);

  const anoAtual = pontos[0]?.ano ?? new Date().getFullYear();

  // Filter out zero-valued points after FIRE Day (don't render retirement phase)
  const pontosValidos = useMemo(() => {
    return pontos.filter((p) => {
      // Keep all points up to and including crossover year (if exists)
      if (crossoverAno && p.ano <= crossoverAno) return true;
      // After crossover, only keep if values are still non-zero (pre-retirement)
      return p.vp_capital_humano > 0 || p.pat_financeiro > 0;
    });
  }, [pontos, crossoverAno]);

  // KPI colors
  const crossoverColor = (() => {
    if (!crossoverAno) return 'var(--muted)';
    const falta = crossoverAno - anoAtual;
    if (falta <= 0) return '#22c55e';
    if (falta <= 3) return '#f59e0b';
    return 'var(--accent, #3b82f6)';
  })();

  // VP capital humano hoje (primeiro ponto)
  const vpHoje = pontos[0]?.vp_capital_humano ?? 0;
  const patHoje = pontos[0]?.pat_financeiro ?? 0;

  // ECharts option — use filtered points
  const anos = pontosValidos.map((p) => p.ano);
  const hcValues = pontosValidos.map((p) => p.vp_capital_humano);
  const patValues = pontosValidos.map((p) => p.pat_financeiro);

  const markLines: object[] = [];
  if (crossoverAno) {
    markLines.push({
      name: 'Crossover',
      xAxis: crossoverAno,
      lineStyle: { type: 'dashed', color: '#22c55e', width: 1.5 },
      label: { show: true, formatter: `Crossover ${crossoverAno}`, color: '#22c55e', fontSize: 10 },
    });
  }
  markLines.push({
    name: 'FIRE Day',
    xAxis: fireDayAno,
    lineStyle: { type: 'dashed', color: '#f59e0b', width: 1.5 },
    label: { show: true, formatter: `FIRE Day ${fireDayAno}`, color: '#f59e0b', fontSize: 10 },
  });

  const chartOption = {
    backgroundColor: 'transparent',
    grid: { left: 48, right: 16, top: 20, bottom: 24 },
    xAxis: {
      type: 'category',
      data: anos,
      axisLabel: { color: EC.muted, fontSize: 10 },
      axisLine: { lineStyle: { color: EC.border2 } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: privacyMode
        ? { show: false }
        : {
          color: EC.muted,
          fontSize: 10,
          formatter: (v: number) => `R$${(v / 1_000_000).toFixed(1)}M`,
        },
      splitLine: { lineStyle: { color: EC.border3 } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#f1f5f9', fontSize: 11 },
      formatter: (params: unknown) => {
        const arr = params as Array<{ dataIndex: number; seriesName: string; value: number }>;
        if (!arr || !arr[0]) return '';
        const idx = arr[0].dataIndex;
        const p = pontosValidos[idx];
        if (!p) return '';
        return `<div style="font-size:11px">
          <div style="margin-bottom:4px;font-weight:600">${p.ano} · ${p.idade} anos</div>
          <div>Capital Humano: ${fmtPrivacy(p.vp_capital_humano, privacyMode)}</div>
          <div>Financeiro: ${fmtPrivacy(p.pat_financeiro, privacyMode)}</div>
          <div>Delta: ${p.delta >= 0 ? '+' : ''}${fmtPrivacy(Math.abs(p.delta), privacyMode)}</div>
        </div>`;
      },
    },
    series: [
      {
        name: 'Capital Humano',
        type: 'line',
        data: hcValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: 'rgba(59,130,246,0.15)', origin: 'start' },
        markLine: { silent: true, data: markLines },
      },
      {
        name: 'Financeiro',
        type: 'line',
        data: patValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#22c55e', width: 2 },
        areaStyle: { color: 'rgba(34,197,94,0.15)', origin: 'start' },
      },
    ],
    legend: {
      show: !privacyMode,
      top: 2,
      right: 0,
      textStyle: { color: EC.muted, fontSize: 10 },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 6,
    },
  };

  // Anchor rows for mini-table (use validated points)
  const anchors = pontosValidos.filter((p) =>
    p.ano === anoAtual ||
    (crossoverAno && p.ano === crossoverAno) ||
    (p.ano === fireDayAno && p.vp_capital_humano > 0) // Only show FIRE Day if still has value
  );

  // Dynamic text
  const crossoverFalta = crossoverAno ? crossoverAno - anoAtual : null;
  const crossoverText =
    crossoverFalta === null
      ? 'Sem crossover projetado no horizonte FIRE.'
      : crossoverFalta <= 0
      ? 'Cruzamento ocorrido. Portfólio já supera VP da renda futura.'
      : `Faltam ${crossoverFalta} ano${crossoverFalta !== 1 ? 's' : ''} para o financeiro superar o capital humano.`;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Zone 1 — 3 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: 12 }}>
        <div className="kpi" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Crossover em</div>
          {crossoverAno ? (
            <div style={{ fontSize: 18, fontWeight: 700, color: crossoverColor }}>
              {crossoverAno} · {crossoverIdade} anos
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Não projetado</div>
          )}
        </div>
        <div className="kpi" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Capital Humano Hoje</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {fmtBrl(vpHoje, privacyMode)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            Financeiro: {fmtBrl(patHoje, privacyMode)}
          </div>
        </div>
        <div className="kpi" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>FIRE Day</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
            {fireDayAno} · {fireDayIdade} anos
          </div>
        </div>
      </div>

      {/* Zone 2 — ECharts área */}
      <EChart ref={chartRef} option={chartOption} style={{ height: 200, marginBottom: 8 }} />

      {/* Zone 3 — Texto dinâmico */}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        <div>{crossoverText}</div>
        <div style={{ marginTop: 3, fontStyle: 'italic' }}>
          Premissa: taxa desconto {(taxaDesconto * 100).toFixed(1)}% real · renda {fmtPrivacy(rendaAnual, privacyMode, { decimals: 0 })}/ano
        </div>
      </div>

      {/* Zone 4 — Mini-tabela colapsável */}
      <div>
        <button
          onClick={() => setTableOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            fontSize: 11,
            padding: '2px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{tableOpen ? '▾' : '▸'}</span>
          <span>Anos âncora</span>
        </button>
        {tableOpen && (
          <div style={{ overflowX: 'auto', marginTop: 6 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['Ano', 'Idade', 'Cap. Humano', 'Financeiro', 'Delta'].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left', paddingBottom: 4, paddingRight: 12,
                      color: 'var(--muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anchors.map((p) => (
                  <tr key={p.ano}>
                    <td style={{ paddingTop: 4, paddingRight: 12, color: 'var(--text)', fontWeight: p.ano === fireDayAno ? 600 : 400 }}>{p.ano}</td>
                    <td style={{ paddingTop: 4, paddingRight: 12, color: 'var(--muted)' }}>{p.idade}</td>
                    <td style={{ paddingTop: 4, paddingRight: 12, color: '#3b82f6' }}>{fmtBrl(p.vp_capital_humano, privacyMode)}</td>
                    <td style={{ paddingTop: 4, paddingRight: 12, color: '#22c55e' }}>{fmtBrl(p.pat_financeiro, privacyMode)}</td>
                    <td style={{ paddingTop: 4, color: p.delta >= 0 ? '#22c55e' : '#ef4444' }}>
                      {`${p.delta >= 0 ? '+' : ''}${fmtBrl(Math.abs(p.delta), privacyMode)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HumanCapitalCrossover;
