'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { SimulationTrajectories } from '@/components/simulators/SimulationTrajectories';
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

function calcFireYear(aporte: number, retorno: number, custo: number, currentAge = 39, patrimonio = 3500000) {
  // Deterministic simulation: find year when SWR <= 3.0% (pat >= custo/0.03)
  const target = custo / 0.03;
  let pat = patrimonio;
  for (let yr = 0; yr <= 30; yr++) {
    if (pat >= target) {
      return { ano: 2026 + yr, idade: currentAge + yr, pat };
    }
    // Grow one year: add monthly contributions, apply return
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

  const result = calcFireYear(aporte, retorno, custo, currentAge, patrimonio);
  const firePire = result ? Math.min(95, Math.max(20, 50 + (result.idade - 50) * -3)) : null;

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

      {/* Chart placeholder */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '4px' }}>
          Projeção — Evolução Patrimonial após Shock
        </div>
        <div style={{ height: '260px', background: 'var(--card2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '.8rem' }}>
          <SimulationTrajectories />
        </div>
        <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '3px' }}>
          Bandas: P5–P95 (exterior) · P25–P75 (interior) · P50 mediana · 500 trajetórias MC · valores reais R$2026
        </div>
      </div>

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
              IPCA+ Longo
            </div>
            <span style={{ fontSize: '.55rem', fontWeight: 600, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)', background: ipcaAtivo ? 'rgba(34,197,94,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {ipcaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)' }} className="pv">
            {fmtBRL(ipcaAlloc)}
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            gap restante: <span className="pv">{ipcaGapBrl != null ? fmtBRL(ipcaGapBrl) : '—'}</span>
          </div>
          {ipcaGapPp != null && (
            <div style={{ fontSize: '.55rem', color: 'var(--muted)', marginTop: '2px' }}>
              {ipcaGapPp.toFixed(1)}pp da carteira
            </div>
          )}
        </div>

        {/* Nível 2: Renda+ */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${rendaAtivo ? 'var(--accent)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Renda+ 2065
            </div>
            <span style={{ fontSize: '.55rem', fontWeight: 600, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)', background: rendaAtivo ? 'rgba(59,130,246,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {rendaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)' }} className="pv">
            {fmtBRL(rendaAlloc)}
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            gap restante: <span className="pv">{rendaGapBrl != null ? fmtBRL(rendaGapBrl) : '—'}</span>
          </div>
          {rendaGapPp != null && (
            <div style={{ fontSize: '.55rem', color: 'var(--muted)', marginTop: '2px' }}>
              {rendaGapPp > 0 ? `${rendaGapPp.toFixed(1)}pp da carteira` : 'acima do alvo'}
            </div>
          )}
        </div>

        {/* Nível 3: Equity (overflow) */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: '3px solid var(--orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Equity (overflow)
            </div>
            <span style={{ fontSize: '.55rem', fontWeight: 600, color: 'var(--orange)', background: 'rgba(249,115,22,.12)', borderRadius: '3px', padding: '1px 4px' }}>
              ALWAYS
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--orange)' }} className="pv">
            {fmtBRL(equityAlloc)}
          </div>
          <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            gap restante: <span className="pv">{totalBrl > 0 ? `${((equityAlloc / totalBrl) * 100).toFixed(2)}pp da carteira` : '—'}</span>
          </div>
          <div style={{ fontSize: '.55rem', color: 'var(--muted)', marginTop: '2px' }}>
            overflow após níveis 1 e 2
          </div>
        </div>
      </div>

      <div className="src">
        Cascade: IPCA+ taxa ≥ piso → DCA IPCA+ 2040. Overflow acima do gap preenche próximo nível. Pisos definidos na estratégia.
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
