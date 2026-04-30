'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

/**
 * StressTestSection + StressChart — Stress Test Monte Carlo (bear market interactive)
 *
 * Extracted from simulators/page.tsx (ARCH P2: sub-component extraction).
 * Renders interactive shock slider + age selector + MC projection chart.
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { EChart } from '@/components/primitives/EChart';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { Select, SelectItem } from '@/components/ui/select';
import { runMCYearly } from '@/utils/montecarlo';
import { fmtPrivacy } from '@/utils/privacyTransform';

/** Single derivation for patrimônio total financeiro — source: premissas.patrimonio_atual */
function derivePatrimonio(data: unknown): number | undefined {
  return (data as any)?.premissas?.patrimonio_atual;
}

const STRESS_AGES = [
  // Pré-FIRE — acumulação
  { value: 39, label: '39 anos (hoje)' },
  { value: 42, label: '42 anos' },
  { value: 45, label: '45 anos' },
  { value: 50, label: '50 anos (FIRE aspiracional)' },
  { value: 53, label: '53 anos (FIRE base)' },
  // Pós-FIRE — desacumulação
  { value: 54, label: '54 anos (ano 1 pós-FIRE — sequence risk)' },
  { value: 58, label: '58 anos (bond pool esgotado, 100% equity)' },
  { value: 65, label: '65 anos (INSS disponível)' },
  { value: 70, label: '70 anos (início Slow-Go)' },
  { value: 75, label: '75 anos (No-Go — spending smile mínimo)' },
  { value: 80, label: '80 anos (longevidade crítica — 30a pós-FIRE)' },
];

// Inline MC stress chart — lognormal projection with shock applied at ageOnset
function StressChart({ shock, ageOnset, patrimonio, annualReturn, annualVol, currentAge: startAge, aporteMensal, fireAge }: {
  shock: number; ageOnset: number; patrimonio: number;
  annualReturn: number; annualVol: number; currentAge: number;
  aporteMensal: number; fireAge: number;
}) {
  const option = useMemo(() => {
    const currentAge = startAge;
    const years = 100 - currentAge; // always project to age 100

    const shockYr = Math.max(0, ageOnset - currentAge);
    const yearsToFire = Math.max(0, fireAge - currentAge);

    // C3: use canonical runMCYearly from montecarlo.ts (year-based, shock support)
    const { pcts } = runMCYearly({
      initialCapital: patrimonio,
      annualReturn,
      annualVol,
      numSims: 500,
      years,
      annualContribution: aporteMensal * 12,
      yearsToFire,
      shockYear: shockYr,
      shockFrac: shock / 100,
      // Seed derived from inputs: same params → same chart across re-renders
      seed: Math.round(patrimonio / 1000) ^ Math.round(annualReturn * 1e6) ^ Math.round(shock * 100) ^ ageOnset,
    });

    const labels = Array.from({ length: years + 1 }, (_, i) => `${currentAge + i}a`);
    const fmtM = (v: number) => `R$${(v / 1e6).toFixed(1)}M`;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: EC.card,
        borderColor: EC.border2,
        textStyle: { color: EC.text, fontSize: 11 },
        formatter: (params: CallbackDataParams[]) => {
          const yr = params[0].dataIndex;
          const p = pcts[yr];
          return `${labels[yr]}<br/>P90: ${fmtM(p.p90)}<br/>P50: ${fmtM(p.p50)}<br/>P10: ${fmtM(p.p10)}`;
        },
      },
      grid: { left: '12%', right: '4%', top: 20, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLabel: { color: EC.muted, fontSize: 10, interval: 4, hideOverlap: true },
        axisLine: EC_AXIS_LINE,
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: { color: EC.muted, fontSize: 10, formatter: (v: number) => `R$${(v/1e6).toFixed(1)}M` },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        // P10–P90 band
        {
          name: 'P90',
          type: 'line' as const,
          data: pcts.map(p => p.p90),
          lineStyle: { color: EC.accent, width: 1, type: 'dashed' as const },
          itemStyle: { color: EC.accent },
          symbolSize: 0,
          areaStyle: { color: 'rgba(88,166,255,0.08)', origin: 'start' as const },
        },
        // P25–P75 band
        {
          name: 'P75',
          type: 'line' as const,
          data: pcts.map(p => p.p75),
          lineStyle: { color: EC.accent, width: 1, opacity: 0.4 },
          itemStyle: { color: EC.accent },
          symbolSize: 0,
          areaStyle: { color: 'rgba(88,166,255,0.12)', origin: 'start' as const },
        },
        {
          name: 'P50 (Mediana)',
          type: 'line' as const,
          data: pcts.map(p => p.p50),
          lineStyle: { color: EC.green, width: 2.5 },
          itemStyle: { color: EC.green },
          symbolSize: 0,
        },
        {
          name: 'P25',
          type: 'line' as const,
          data: pcts.map(p => p.p25),
          lineStyle: { color: EC.red, width: 1, opacity: 0.4 },
          itemStyle: { color: EC.red },
          symbolSize: 0,
          areaStyle: { color: 'rgba(248,81,73,0.08)', origin: 'start' as const },
        },
        {
          name: 'P10',
          type: 'line' as const,
          data: pcts.map(p => p.p10),
          lineStyle: { color: EC.red, width: 1, type: 'dashed' as const },
          itemStyle: { color: EC.red },
          symbolSize: 0,
        },
        // Shock vertical marker
        ...(shockYr > 0 && shockYr <= years ? [{
          name: 'Shock',
          type: 'line' as const,
          data: Array.from({ length: years + 1 }, (_, i) => i === shockYr ? pcts[shockYr].p90 * 1.1 : null),
          lineStyle: { color: EC.red, width: 2, type: 'dashed' as const },
          itemStyle: { color: EC.red },
          symbolSize: 0,
          markLine: {
            silent: true,
            data: [{ xAxis: shockYr }],
            lineStyle: { color: EC.red, type: 'dashed' as const, width: 1.5 },
            label: { formatter: `Shock ${shock}%`, color: EC.red, fontSize: 10 },
          },
        }] : []),
      ],
    };
  }, [shock, ageOnset, patrimonio, annualReturn, annualVol, startAge, aporteMensal, fireAge]);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>
        Projeção — Evolução Patrimonial após Shock · {500} trajetórias MC · valores nominais BRL
      </div>
      <EChart option={option} style={{ height: 300 }} />
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '3px' }}>
        Verde = P50 mediana · Azul = P75–P90 · Vermelho = P10–P25 · Retorno: {(annualReturn * 100).toFixed(2)}%/ano · Vol: {(annualVol * 100).toFixed(0)}%/ano · Negativos visíveis (sem floor)
      </div>
    </div>
  );
}

export function StressTestSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useUiStore();
  const [shock, setShock] = useState(-40);
  const [ageOnset, setAgeOnset] = useState<number | undefined>(undefined);
  const dataInitST = useRef(false);

  const premissasST = (data as any)?.premissas ?? {};
  const patrimonio: number | undefined = derivePatrimonio(data);
  const annualReturn: number = premissasST.retorno_equity_base ?? 0;
  const annualVol: number = premissasST.volatilidade_equity ?? 0;
  const startAge: number = premissasST.idade_atual ?? 0;
  const aporteMensal: number = premissasST.aporte_mensal ?? 0;
  const fireAge: number = premissasST.fire_age ?? (startAge + 14);

  useEffect(() => {
    if (data && !dataInitST.current) {
      dataInitST.current = true;
      if (premissasST.idade_atual != null) setAgeOnset(premissasST.idade_atual);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const postShock = patrimonio != null ? patrimonio * (1 + shock / 100) : undefined;

  return (
    <div data-testid="stress-test-mc">
    <CollapsibleSection id="sim-stress" title={secTitle('simuladores', 'stress', 'Stress Test Monte Carlo — Bear Market Interativo')} defaultOpen={secOpen('simuladores', 'stress', false)}>
      {/* Slider + Age selector */}
      <div style={{ background: 'var(--card2)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)', marginBottom: '14px' }}>
        <div className="slider-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--muted)' }}>Shock:</span>
            <span className="pv" style={{ color: 'var(--red)', fontWeight: 700, fontSize: '1rem' }}>{shock}%</span>
          </label>
          <input
            type="range" min="-70" max="0" step="1" value={shock}
            onChange={e => setShock(+e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
            <span>−70%</span><span>0%</span>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: 'var(--text-base)', color: 'var(--muted)' }}>
            Patrimônio pós-shock: <strong className="pv" style={{ color: 'var(--red)' }}>{postShock != null ? (fmtPrivacy(postShock, privacyMode)) : '—'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-base)', color: 'var(--muted)' }}>Idade do shock:</label>
            <Select
              value={(ageOnset ?? startAge).toString()}
              onChange={e => setAgeOnset(+e.target.value)}
              style={{ width: '200px', fontSize: 'var(--text-base)' }}
            >
              {STRESS_AGES.map(a => (
                <SelectItem key={a.value} value={a.value.toString()}>
                  {a.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Premissas da simulação */}
      {patrimonio != null && annualReturn > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {[
            { label: 'Patrimônio', value: fmtPrivacy(patrimonio, privacyMode) },
            { label: 'Aporte mensal', value: aporteMensal > 0 ? (fmtPrivacy(aporteMensal / 1000, privacyMode)) : '—' },
            { label: 'Retorno (real)', value: `${(annualReturn * 100).toFixed(2)}%/ano` },
            { label: 'Volatilidade', value: `${(annualVol * 100).toFixed(0)}%/ano` },
            { label: 'Distribuição', value: 'Normal (Box-Muller)' },
            { label: 'Trajetórias', value: '500 MC' },
            { label: 'Horizonte', value: `até 100a (${100 - startAge} anos)` },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 10px', flexShrink: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>{c.label}</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text)', marginTop: '1px' }}>{c.value}</div>
            </div>
          ))}
          {/* Perfil familiar badge */}
          {premissasST.custo_vida_base != null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 999, background: 'rgba(99,179,237,.10)', border: '1px solid rgba(99,179,237,.3)', fontSize: 11, color: 'var(--accent)', fontWeight: 600, flexShrink: 0, alignSelf: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              Solteiro · {fmtPrivacy(premissasST.custo_vida_base / 1000, privacyMode) + '/ano'}
            </div>
          )}
        </div>
      )}

      {/* Chart — computed from shock/ageOnset sliders */}
      {patrimonio != null && annualReturn > 0 && annualVol > 0 && startAge > 0 && (
        <StressChart
          shock={shock}
          ageOnset={ageOnset ?? startAge}
          patrimonio={patrimonio}
          annualReturn={annualReturn}
          annualVol={annualVol}
          currentAge={startAge}
          aporteMensal={aporteMensal}
          fireAge={fireAge}
        />
      )}

      <div className="src" style={{ marginTop: '10px' }}>
        ⚡ = pré-calculado · ✅ = simulado ao vivo
      </div>
    </CollapsibleSection>
    </div>
  );
}
