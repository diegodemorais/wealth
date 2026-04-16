'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)}k`;
  return `R$ ${v.toLocaleString('pt-BR')}`;
}

function fmtPct(v: number) {
  return `${v.toFixed(1)}%`;
}

// ── Simulador FIRE — seção section-critical ───────────────────────────────────

type FireCond = 'solteiro' | 'casamento' | 'filho';
type FireMkt = 'stress' | 'base' | 'fav';

const MKT_PRESETS: Record<FireMkt, { retorno: number; label: string }> = {
  stress:  { retorno: 3.85, label: '⚠️ Stress' },
  base:    { retorno: 4.85, label: '✅ Base' },
  fav:     { retorno: 5.85, label: '🚀 Favorável' },
};

const COND_PRESETS: Record<FireCond, { custo: number; label: string }> = {
  solteiro:  { custo: 250000, label: '👤 Solteiro' },
  casamento: { custo: 300000, label: '💍 Casamento' },
  filho:     { custo: 360000, label: '👶 Filho' },
};

// Safe SWR for 40+ year retirement — use 3.5% (optimistic) or user-chosen percentile
// Target: find earliest age where custo/pat <= swrTarget
function calcFireYear(
  aporte: number,
  retorno: number,
  custo: number,
  currentAge = 39,
  patrimonio = 3500000,
  swrTarget = 0.035, // 3.5% default — INSS reduces effective SWR
) {
  // Earliest retirement: pat >= custo / swrTarget
  const target = custo / swrTarget;
  let pat = patrimonio;
  for (let yr = 0; yr <= 30; yr++) {
    if (pat >= target) {
      return { ano: 2026 + yr, idade: currentAge + yr, pat, swrAtFire: custo / pat };
    }
    for (let m = 0; m < 12; m++) {
      pat = pat * (1 + retorno / 100 / 12) + aporte;
    }
  }
  return null;
}

function FireSimuladorSection() {
  const data = useDashboardStore(s => s.data);

  const [fireCond, setFireCond] = useState<FireCond>('solteiro');
  const [fireMkt, setFireMkt] = useState<FireMkt>('base');
  const [aporte, setAporte] = useState(25000);
  const [retorno, setRetorno] = useState(4.85);
  const [custo, setCusto] = useState(250000);
  const [custom, setCustom] = useState(false);

  const currentAge: number = data?.fire?.idade_atual ?? 39;
  const patrimonio: number = data?.patrimonio?.total_financeiro ?? data?.fire?.patrimonio_atual ?? 3500000;

  // fire50 aspiracional preset: use MC data if available
  const pfire50 = data?.fire?.cenario_aspiracional?.probabilidade_sucesso ?? data?.fire?.probabilidade_sucesso ?? null;
  const pfire53 = data?.fire?.cenario_base?.probabilidade_sucesso ?? null;

  // SWR bruta/líquida from MC data
  const swrPercentis = data?.fire?.swr_percentis ?? data?.swr_percentis ?? data?.fire_swr_percentis;
  const swrBruta = swrPercentis?.p50 ?? swrPercentis?.swr_p50;
  const swrBrutaPct = swrBruta ? (swrBruta * 100).toFixed(2) : null;
  // Líquida c/INSS: subtract INSS income from base spending to get net SWR
  const inssAnual = data?.premissas?.inss_anual ?? 18000;
  const custoVidaBase = data?.premissas?.custo_vida_base ?? 250000;
  const custoLiquido = Math.max(0, custoVidaBase - inssAnual);

  // SWR target: 3.5% (INSS covers R$18k/ano → effective spending ~R$232k → real SWR ~3.25%)
  const swrTarget = 0.035;
  const result = calcFireYear(aporte, retorno, custo, currentAge, patrimonio, swrTarget);

  // P(FIRE) from MC percentiles: interpolate based on SWR at fire date vs MC percentiles
  // swr_p10=3.66% (worst 10%), swr_p50=2.17% (median), swr_p90=1.32% (best 10%)
  const swrAtFire = result?.swrAtFire ?? null;
  const swrP10 = (data?.fire_swr_percentis as any)?.swr_p10 ?? 0.0366;
  const swrP50 = (data?.fire_swr_percentis as any)?.swr_p50 ?? 0.0217;
  const swrP90 = (data?.fire_swr_percentis as any)?.swr_p90 ?? 0.0132;
  const firePire: number | null = swrAtFire != null ? (() => {
    // Higher SWR = less patrimônio = lower success probability
    if (swrAtFire >= swrP10) return 10;
    if (swrAtFire <= swrP90) return 90;
    if (swrAtFire >= swrP50) {
      // interpolate between P10 (10%) and P50 (50%)
      const t = (swrP10 - swrAtFire) / (swrP10 - swrP50);
      return Math.round(10 + t * 40);
    }
    // interpolate between P50 (50%) and P90 (90%)
    const t = (swrP50 - swrAtFire) / (swrP50 - swrP90);
    return Math.round(50 + t * 40);
  })() : null;

  // SWR líquida: custoLíquido / patrimônio no FIRE
  const swrLiquidaSimple = result && result.pat > 0 ? ((custoLiquido / result.pat) * 100).toFixed(2) : null;

  const setCondPreset = (c: FireCond) => {
    setFireCond(c);
    setCusto(COND_PRESETS[c].custo);
    setCustom(false);
  };

  const setMktPreset = (m: FireMkt) => {
    setFireMkt(m);
    setRetorno(MKT_PRESETS[m].retorno);
    setCustom(false);
  };

  const setFire50Preset = () => {
    setAporte(25000);
    setRetorno(4.85);
    setCusto(250000);
    setFireCond('solteiro');
    setFireMkt('base');
    setCustom(false);
  };

  const onSliderChange = () => setCustom(true);

  // Timeline: age range hoje..70
  const timelineMin = currentAge;
  const timelineMax = 70;
  const fireAge = result?.idade ?? timelineMax;
  const timelinePct = Math.min(100, Math.max(0, ((fireAge - timelineMin) / (timelineMax - timelineMin)) * 100));

  return (
    <div className="section section-critical" style={{ marginBottom: '16px' }}>
      <h2>Simulador FIRE — Aposentadoria Antecipada</h2>

      {/* Resultado principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '18px', background: 'var(--card2)', borderRadius: '10px', padding: '16px' }}>
        <div style={{ textAlign: 'center', minWidth: '140px' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Com esses parâmetros</div>
          <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '2px' }}>você pode aposentar em</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }} className="pv">
            {result ? result.ano : '—'}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0' }} className="pv">
            {result ? `${result.idade} anos` : '—'}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }} className="pv">
            {firePire !== null ? `P = ${firePire}%` : 'P = —%'}
          </div>
          {(swrBrutaPct || swrLiquidaSimple) && (
            <div style={{ fontSize: '.62rem', color: 'var(--green)', fontWeight: 600, marginTop: '4px' }} className="pv">
              {swrBrutaPct ? `✓ SWR bruta ${swrBrutaPct}%` : ''}{swrLiquidaSimple ? ` · líquida c/INSS ${swrLiquidaSimple}%` : ''}
            </div>
          )}
          <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '2px' }} className="pv">
            {result ? (result.idade < 50 ? `${50 - result.idade} anos antes da meta` : result.idade === 50 ? 'na meta' : `${result.idade - 50} anos após meta`) : '—'}
          </div>
        </div>
        <div>
          {/* 3 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '10px' }}>
            <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>Cenário Aspiracional</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }} className="pv">
                {pfire50 !== null ? `${(pfire50 * 100).toFixed(0)}%` : '—'}
              </div>
            </div>
            <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--accent)' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>Cenário Base (plano)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }} className="pv">
                {pfire53 !== null ? `${(pfire53 * 100).toFixed(0)}%` : (data?.fire?.probabilidade_sucesso ? `${(data.fire.probabilidade_sucesso * 100).toFixed(0)}%` : '—')}
              </div>
            </div>
            <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>Patrimônio projetado</div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }} className="pv">
                {result ? fmtBRL(result.pat) : '—'}
              </div>
            </div>
          </div>
          {/* Mini timeline bar */}
          <div style={{ position: 'relative', height: '8px', background: 'var(--card)', borderRadius: '4px', overflow: 'visible', marginBottom: '18px' }}>
            <div style={{ position: 'absolute', left: 0, height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--accent), var(--green))', width: `${timelinePct}%`, transition: 'width .4s' }} />
            <div style={{ position: 'absolute', top: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--green)', border: '2px solid white', transform: 'translateX(-50%)', left: `${timelinePct}%`, transition: 'left .4s', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: '-18px', left: 0, fontSize: '.55rem', color: 'var(--muted)' }}>Hoje</div>
            <div style={{ position: 'absolute', bottom: '-18px', right: 0, fontSize: '.55rem', color: 'var(--muted)' }}>70 anos</div>
            {result && (
              <div style={{ position: 'absolute', bottom: '-18px', left: `${timelinePct}%`, fontSize: '.6rem', color: 'var(--green)', fontWeight: 700, transform: 'translateX(-50%)', whiteSpace: 'nowrap', transition: 'left .4s' }}>
                {result.idade}a
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Presets — 2 eixos */}
      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '.6rem', color: 'var(--muted)', minWidth: '58px' }}>Condição:</span>
          {(['solteiro', 'casamento', 'filho'] as FireCond[]).map(c => (
            <Button
              key={c}
              variant={!custom && fireCond === c ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCondPreset(c)}
            >
              {COND_PRESETS[c].label}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '.6rem', color: 'var(--muted)', minWidth: '58px' }}>Mercado:</span>
          {(['stress', 'base', 'fav'] as FireMkt[]).map(m => (
            <Button
              key={m}
              variant={!custom && fireMkt === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMktPreset(m)}
            >
              {MKT_PRESETS[m].label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            style={{ borderStyle: 'dashed', marginLeft: '8px' }}
            onClick={setFire50Preset}
          >
            🎯 Cenário Aspiracional
          </Button>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '12px' }}>
        <div className="slider-row">
          <label>
            <span>Aporte Mensal</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">{fmtBRL(aporte)}</span>
          </label>
          <input
            type="range" min="5000" max="100000" step="1000" value={aporte}
            onChange={e => { setAporte(+e.target.value); onSliderChange(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', color: 'var(--muted)' }}>
            <span>R$5k</span><span>R$100k</span>
          </div>
        </div>
        <div className="slider-row">
          <label>
            <span>Retorno Real Equity</span>
            <span style={{ fontWeight: 700, color: 'var(--muted)' }} className="pv">{fmtPct(retorno)}</span>
          </label>
          <input
            type="range" min="0" max="10" step="0.25" value={retorno}
            onChange={e => { setRetorno(+e.target.value); onSliderChange(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', color: 'var(--muted)' }}>
            <span>0%</span><span>10%</span>
          </div>
        </div>
        <div className="slider-row">
          <label>
            <span>Custo de Vida /ano</span>
            <span style={{ fontWeight: 700, color: 'var(--muted)' }} className="pv">{fmtBRL(custo)}</span>
          </label>
          <input
            type="range" min="150000" max="500000" step="10000" value={custo}
            onChange={e => { setCusto(+e.target.value); onSliderChange(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', color: 'var(--muted)' }}>
            <span>R$150k</span><span>R$500k</span>
          </div>
        </div>
      </div>

      <div className="src">
        Simulação determinística (sem MC). Critério: SWR ≤ 3.0% (= R$250k/R$8.33M). Cenário Aspiracional e Cenário Base são outputs do MC 10k (fixos).
      </div>
    </div>
  );
}

// ── What-If Scenarios ─────────────────────────────────────────────────────────

type WiPreset = 'stress' | 'base' | 'fav';

const WI_PRESETS: Record<WiPreset, { label: string; retorno: number; swr: number }> = {
  stress: { label: '⚠️ Stress (4.35% · SWR 2.0%)',  retorno: 4.35, swr: 2.0 },
  base:   { label: '✅ Base (4.85% · SWR 2.4%)',     retorno: 4.85, swr: 2.4 },
  fav:    { label: '🚀 Favorável (5.85% · SWR 3.0%)', retorno: 5.85, swr: 3.0 },
};

function WhatIfSection() {
  const data = useDashboardStore(s => s.data);
  const [wiPreset, setWiPreset] = useState<WiPreset>('base');
  const [custo, setCusto] = useState(250000);

  const preset = WI_PRESETS[wiPreset];
  const patrimonio = data?.patrimonio?.total_financeiro ?? data?.fire?.patrimonio_atual ?? 3500000;
  const patNecessario = custo / (preset.swr / 100);
  const pctLimite = (patrimonio / patNecessario) * 100;

  // P(Sucesso) — interpolate from FIRE Matrix if available
  const fireMatrix = data?.fire_matrix ?? data?.fire?.matrix;
  let psucesso: number | null = null;
  if (fireMatrix) {
    const key = `${preset.retorno.toFixed(2)}_${custo}`;
    psucesso = fireMatrix[key] ?? null;
  }
  if (psucesso === null) {
    // Estimate: higher retorno + lower custo = higher success
    psucesso = Math.min(99, Math.max(10, 40 + preset.retorno * 8 - custo / 30000));
  }

  // ETA: months until patrimonio >= patNecessario at current savings
  const monthly = data?.fire?.aporte_mensal ?? 25000;
  const retornoMensal = preset.retorno / 100 / 12;
  let pat = patrimonio;
  let etaMonths = 0;
  if (pat < patNecessario) {
    for (let m = 0; m < 360; m++) {
      pat = pat * (1 + retornoMensal) + monthly;
      etaMonths = m + 1;
      if (pat >= patNecessario) break;
    }
  }
  const etaYears = Math.round(etaMonths / 12);

  return (
    <CollapsibleSection id="sim-whatif" title="What-If Scenarios — Cenário / Gasto" defaultOpen={true}>
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {(Object.keys(WI_PRESETS) as WiPreset[]).map(k => (
          <Button
            key={k}
            variant={wiPreset === k ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWiPreset(k)}
          >
            {WI_PRESETS[k].label}
          </Button>
        ))}
      </div>

      {/* Slider custo de vida */}
      <div className="slider-row">
        <label>
          <span>Custo de Vida /ano</span>
          <span className="pv">R$ {(custo / 1000).toFixed(0)}k/ano</span>
        </label>
        <input
          type="range" min="150000" max="400000" step="10000" value={custo}
          onChange={e => setCusto(+e.target.value)}
        />
      </div>

      {/* Output 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px' }}>P(Sucesso 30 anos)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }} className="pv">{psucesso.toFixed(0)}%</div>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '4px' }}>MC interpolado</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px' }}>Patrimônio necessário</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }} className="pv">{fmtBRL(patNecessario)}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '4px' }} className="pv">SWR {preset.swr.toFixed(1)}%</div>
          <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '4px' }} className="pv">{pctLimite.toFixed(1)}% do limite</div>
          <div style={{ fontSize: '.65rem', color: 'var(--yellow)', fontWeight: 600, marginTop: '2px' }} className="pv">
            {patrimonio >= patNecessario ? 'FIRE atingido ✅' : `ETA: ~${etaYears} anos`}
          </div>
        </div>
      </div>

      <div className="src" style={{ marginTop: '6px' }}>
        Interpolado da FIRE Matrix · MC 5.000 simulações · horizonte 30 anos
      </div>
    </CollapsibleSection>
  );
}

// ── Stress Test MC ────────────────────────────────────────────────────────────

const STRESS_AGES = [
  { value: 39, label: '39 anos (hoje)' },
  { value: 40, label: '40 anos' },
  { value: 42, label: '42 anos' },
  { value: 45, label: '45 anos' },
  { value: 47, label: '47 anos' },
  { value: 50, label: '50 anos (FIRE aspiracional)' },
];

// Inline MC stress chart — lognormal projection with shock applied at ageOnset
function StressChart({ shock, ageOnset, patrimonio }: { shock: number; ageOnset: number; patrimonio: number }) {
  const option = useMemo(() => {
    const currentAge = 39;
    const years = 30;
    const ANNUAL_RETURN = 0.0485;
    const ANNUAL_VOL = 0.18;
    const N_SIMS = 300;
    const shockYr = Math.max(0, ageOnset - currentAge);

    // Generate trajectories
    const sims: number[][] = [];
    for (let s = 0; s < N_SIMS; s++) {
      const traj: number[] = [patrimonio];
      for (let yr = 1; yr <= years; yr++) {
        const prev = traj[yr - 1];
        // Box-Muller
        const u1 = Math.random(), u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const ret = ANNUAL_RETURN + ANNUAL_VOL * z;
        let next = prev * (1 + ret);
        if (yr === shockYr) next = next * (1 + shock / 100);
        traj.push(Math.max(0, next));
      }
      sims.push(traj);
    }

    // Compute percentiles per year
    const pcts = Array.from({ length: years + 1 }, (_, yr) => {
      const vals = sims.map(t => t[yr]).sort((a, b) => a - b);
      const at = (p: number) => vals[Math.floor(p * (vals.length - 1))];
      return { p10: at(0.1), p25: at(0.25), p50: at(0.5), p75: at(0.75), p90: at(0.9) };
    });

    const labels = Array.from({ length: years + 1 }, (_, i) => `${currentAge + i}a`);
    const fmtM = (v: number) => `R$${(v / 1e6).toFixed(1)}M`;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        textStyle: { color: '#e6edf3', fontSize: 11 },
        formatter: (params: any[]) => {
          const yr = params[0].dataIndex;
          const p = pcts[yr];
          return `${labels[yr]}<br/>P90: ${fmtM(p.p90)}<br/>P50: ${fmtM(p.p50)}<br/>P10: ${fmtM(p.p10)}`;
        },
      },
      grid: { left: 55, right: 15, top: 20, bottom: 30, containLabel: false },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLabel: { color: '#8b949e', fontSize: 10, interval: 4 },
        axisLine: { lineStyle: { color: '#30363d' } },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: { color: '#8b949e', fontSize: 10, formatter: (v: number) => `R$${(v/1e6).toFixed(1)}M` },
        splitLine: { lineStyle: { color: '#21262d' } },
      },
      series: [
        // P10–P90 band
        {
          name: 'P90',
          type: 'line' as const,
          data: pcts.map(p => p.p90),
          lineStyle: { color: '#58a6ff', width: 1, type: 'dashed' as const },
          itemStyle: { color: '#58a6ff' },
          symbolSize: 0,
          areaStyle: { color: 'rgba(88,166,255,0.08)', origin: 'start' as const },
        },
        // P25–P75 band
        {
          name: 'P75',
          type: 'line' as const,
          data: pcts.map(p => p.p75),
          lineStyle: { color: '#58a6ff', width: 1, opacity: 0.4 },
          itemStyle: { color: '#58a6ff' },
          symbolSize: 0,
          areaStyle: { color: 'rgba(88,166,255,0.12)', origin: 'start' as const },
        },
        {
          name: 'P50 (Mediana)',
          type: 'line' as const,
          data: pcts.map(p => p.p50),
          lineStyle: { color: '#3ed381', width: 2.5 },
          itemStyle: { color: '#3ed381' },
          symbolSize: 0,
        },
        {
          name: 'P25',
          type: 'line' as const,
          data: pcts.map(p => p.p25),
          lineStyle: { color: '#f85149', width: 1, opacity: 0.4 },
          itemStyle: { color: '#f85149' },
          symbolSize: 0,
          areaStyle: { color: 'rgba(248,81,73,0.08)', origin: 'start' as const },
        },
        {
          name: 'P10',
          type: 'line' as const,
          data: pcts.map(p => p.p10),
          lineStyle: { color: '#f85149', width: 1, type: 'dashed' as const },
          itemStyle: { color: '#f85149' },
          symbolSize: 0,
        },
        // Shock vertical marker
        ...(shockYr > 0 && shockYr <= years ? [{
          name: 'Shock',
          type: 'line' as const,
          data: Array.from({ length: years + 1 }, (_, i) => i === shockYr ? pcts[shockYr].p90 * 1.1 : null),
          lineStyle: { color: '#f85149', width: 2, type: 'dashed' as const },
          itemStyle: { color: '#f85149' },
          symbolSize: 0,
          markLine: {
            silent: true,
            data: [{ xAxis: shockYr }],
            lineStyle: { color: '#f85149', type: 'dashed' as const, width: 1.5 },
            label: { formatter: `Shock ${shock}%`, color: '#f85149', fontSize: 10 },
          },
        }] : []),
      ],
    };
  }, [shock, ageOnset, patrimonio]);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '4px' }}>
        Projeção — Evolução Patrimonial após Shock · {300} trajetórias MC · valores nominais BRL
      </div>
      <ReactECharts option={option} style={{ height: 260 }} />
      <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '3px' }}>
        Verde = P50 mediana · Azul = P75–P90 · Vermelho = P10–P25 · Retorno: 4.85%/ano · Vol: 18%/ano
      </div>
    </div>
  );
}

function StressTestSection() {
  const data = useDashboardStore(s => s.data);
  const [shock, setShock] = useState(-40);
  const [ageOnset, setAgeOnset] = useState(39);

  const patrimonio = data?.patrimonio?.total_financeiro ?? data?.fire?.patrimonio_atual ?? 3500000;
  const postShock = patrimonio * (1 + shock / 100);

  return (
    <CollapsibleSection id="sim-stress" title="Stress Test Monte Carlo — Bear Market Interativo" defaultOpen={true}>
      {/* Slider + Age selector */}
      <div style={{ background: 'var(--card2)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)', marginBottom: '14px' }}>
        <div className="slider-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Shock:</span>
            <span className="pv" style={{ color: 'var(--red)', fontWeight: 700, fontSize: '1rem' }}>{shock}%</span>
          </label>
          <input
            type="range" min="-70" max="0" step="1" value={shock}
            onChange={e => setShock(+e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', color: 'var(--muted)', marginTop: '2px' }}>
            <span>−70%</span><span>0%</span>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
            Patrimônio pós-shock: <strong className="pv" style={{ color: 'var(--red)' }}>{fmtBRL(postShock)}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Idade do shock:</label>
            <Select
              value={ageOnset.toString()}
              onChange={e => setAgeOnset(+e.target.value)}
              style={{ width: '200px', fontSize: '.8rem' }}
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

      {/* Chart — computed from shock/ageOnset sliders */}
      <StressChart shock={shock} ageOnset={ageOnset} patrimonio={patrimonio} />

      <div className="src" style={{ marginTop: '10px' }}>
        ⚡ = pré-calculado · ✅ = simulado ao vivo
      </div>
    </CollapsibleSection>
  );
}

// ── Calculadora de Aporte — Cascade ──────────────────────────────────────────

function CascadeSection() {
  const data = useDashboardStore(s => s.data);
  const [aporte, setAporte] = useState(25000);

  const cambio: number = data?.cambio ?? 0;

  // Derive total portfolio value (BRL) to compute BRL gaps from dca_status percentage gaps
  const totalBrl: number =
    data?.patrimonio?.total_financeiro ??
    data?.fire?.patrimonio_atual ??
    3500000;

  // IPCA+ Longo gap (pp of portfolio → BRL)
  const ipcaGapPp: number | null = data?.cascade?.ipca_gap != null
    ? data.cascade.ipca_gap
    : (data?.dca_status?.ipca_longo?.gap_alvo_pp ?? null);
  const ipcaGapBrl: number | null = ipcaGapPp != null && ipcaGapPp > 0
    ? Math.round((ipcaGapPp / 100) * totalBrl)
    : 0;

  // Renda+ gap (pp of portfolio → BRL). Negative gap_alvo_pp means already over target → no gap
  const rendaGapPp: number | null = data?.cascade?.renda_gap != null
    ? data.cascade.renda_gap
    : (data?.dca_status?.renda_plus?.gap_alvo_pp ?? null);
  const rendaGapBrl: number | null = rendaGapPp != null && rendaGapPp > 0
    ? Math.round((rendaGapPp / 100) * totalBrl)
    : 0;

  // Cascade allocation: IPCA+ Longo → Renda+ → Equity (overflow)
  let remaining = aporte;
  const ipcaAlloc = ipcaGapBrl !== null ? Math.min(remaining, ipcaGapBrl) : 0;
  remaining -= ipcaAlloc;
  const rendaAlloc = rendaGapBrl !== null ? Math.min(remaining, rendaGapBrl) : 0;
  remaining -= rendaAlloc;
  const equityAlloc = remaining;

  // DCA active status from dca_status
  const ipcaAtivo: boolean = data?.dca_status?.ipca_longo?.ativo ?? false;
  const rendaAtivo: boolean = data?.dca_status?.renda_plus?.ativo ?? false;

  return (
    <div className="section" style={{ marginTop: '16px' }}>
      <h2>Calculadora de Aporte — Cascade</h2>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div className="slider-row" style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Aporte Mensal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>R$</span>
              <Input
                type="number"
                min="1000"
                max="1000000"
                step="1000"
                value={aporte}
                onChange={e => setAporte(+e.target.value)}
                style={{ width: '90px', fontSize: '.8rem', textAlign: 'right' }}
              />
            </span>
          </label>
          <input
            type="range" min="1" max="1000" step="1" value={Math.round(aporte / 1000)}
            onChange={e => setAporte(+e.target.value * 1000)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', color: 'var(--muted)' }}>
            <span>R$ 1k</span><span>R$ 1M</span>
          </div>
        </div>
        {cambio > 0 && (
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            Câmbio: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cambio.toFixed(2)}</span>{' '}
            <span style={{ fontSize: '.6rem' }}>(PTAX BCB)</span>
          </div>
        )}
      </div>

      {/* Cascade result — always show all 3 levels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '10px' }}>
        {/* Nível 1: IPCA+ Longo */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${ipcaAtivo ? 'var(--green)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              1 · IPCA+ Longo
            </div>
            <span style={{ fontSize: '.55rem', fontWeight: 600, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)', background: ipcaAtivo ? 'rgba(34,197,94,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {ipcaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)' }} className="pv">
            {fmtBRL(ipcaAlloc)}
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Tesouro IPCA+2040 via XP
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{ipcaGapBrl != null ? fmtBRL(ipcaGapBrl) : '—'}</span>
            {ipcaGapPp != null && ` (${ipcaGapPp.toFixed(1)}pp)`}
          </div>
        </div>

        {/* Nível 2: Renda+ */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${rendaAtivo ? 'var(--accent)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              2 · Renda+ 2065
            </div>
            <span style={{ fontSize: '.55rem', fontWeight: 600, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)', background: rendaAtivo ? 'rgba(59,130,246,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {rendaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)' }} className="pv">
            {fmtBRL(rendaAlloc)}
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Renda+ 2065 via Tesouro Direto
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{rendaGapBrl != null ? fmtBRL(rendaGapBrl) : '—'}</span>
            {rendaGapPp != null && (rendaGapPp > 0 ? ` (${rendaGapPp.toFixed(1)}pp)` : ' (acima do alvo)')}
          </div>
        </div>

        {/* Nível 3: Equity (overflow) */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: '3px solid var(--orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              3 · Equity (overflow)
            </div>
            <span style={{ fontSize: '.55rem', fontWeight: 600, color: 'var(--orange)', background: 'rgba(249,115,22,.12)', borderRadius: '3px', padding: '1px 4px' }}>
              SEMPRE
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--orange)' }} className="pv">
            {fmtBRL(equityAlloc)}
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--orange)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(249,115,22,.08)', borderRadius: '4px' }}>
            → SWRD + AVGS + AVEM via IBKR
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            pesos: 50% SWRD · 30% AVGS · 20% AVEM
          </div>
        </div>
      </div>

      <div className="src">
        Cascade: nível 1 preenche até gap IPCA+ · nível 2 preenche até gap Renda+ · overflow sempre para equity IBKR.
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SimulatorsPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const runMC = useDashboardStore(s => s.runMC);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  useEffect(() => {
    if (data && !isLoading && !dataError) {
      runMC();
    }
  }, [data, isLoading, dataError, runMC]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando simuladores...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Erro ao carregar dados:</strong> {dataError}
      </div>
    );
  }

  return (
    <div>
      {/* 1. Simulador FIRE — section-critical */}
      <FireSimuladorSection />

      {/* 2. What-If Scenarios */}
      <WhatIfSection />

      {/* 3. Stress Test MC */}
      <StressTestSection />

      {/* 4. Calculadora Cascade */}
      <CascadeSection />
    </div>
  );
}
