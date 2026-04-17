'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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

// Labels only — values are derived from data.fire_matrix.retornos_equity / perfis at runtime
const MKT_LABELS: Record<FireMkt, string> = {
  stress: '⚠️ Stress',
  base:   '✅ Base',
  fav:    '🚀 Favorável',
};

const COND_LABELS: Record<FireCond, string> = {
  solteiro:  '👤 Solteiro',
  casamento: '💍 Casamento',
  filho:     '👶 Filho',
};

// Target: find earliest age where custo/pat <= swrTarget
function calcFireYear(
  aporte: number,
  retorno: number,
  custo: number,
  currentAge: number,
  patrimonio: number,
  swrTarget: number,
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

  // Derive presets from data.fire_matrix at runtime (not hardcoded)
  const fmRetornos = (data as any)?.fire_matrix?.retornos_equity ?? {};
  const fmPerfis   = (data as any)?.fire_matrix?.perfis ?? {};
  const premissas  = (data as any)?.premissas ?? {};

  const MKT_PRESETS: Record<FireMkt, { retorno: number; label: string }> = {
    stress: { retorno: +(((fmRetornos.stress ?? premissas.retorno_equity_base ?? 0.0435) * 100).toFixed(2)), label: MKT_LABELS.stress },
    base:   { retorno: +(((fmRetornos.base   ?? premissas.retorno_equity_base ?? 0.0485) * 100).toFixed(2)), label: MKT_LABELS.base },
    fav:    { retorno: +(((fmRetornos.fav    ?? premissas.retorno_equity_base ?? 0.0585) * 100).toFixed(2)), label: MKT_LABELS.fav },
  };

  const COND_PRESETS: Record<FireCond, { custo: number; label: string }> = {
    solteiro:  { custo: fmPerfis.atual?.gasto_anual   ?? premissas.custo_vida_base, label: COND_LABELS.solteiro },
    casamento: { custo: fmPerfis.casado?.gasto_anual  ?? premissas.custo_vida_base, label: COND_LABELS.casamento },
    filho:     { custo: fmPerfis.filho?.gasto_anual   ?? premissas.custo_vida_base, label: COND_LABELS.filho },
  };

  const [fireCond, setFireCond] = useState<FireCond>('solteiro');
  const [fireMkt, setFireMkt] = useState<FireMkt>('base');
  // aporte/retorno/custo start undefined; set from data once loaded
  const [aporte, setAporte] = useState<number | undefined>(undefined);
  const [retorno, setRetorno] = useState<number | undefined>(undefined);
  const [custo, setCusto] = useState<number | undefined>(undefined);
  const [custom, setCustom] = useState(false);
  const dataInitialized = useRef(false);

  // Derive values from data once loaded (only if user hasn't interacted)
  useEffect(() => {
    if (data && !dataInitialized.current && !custom) {
      dataInitialized.current = true;
      if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
      if (premissas.retorno_equity_base != null) setRetorno(+((premissas.retorno_equity_base * 100).toFixed(2)));
      const custoInicial = fmPerfis.atual?.gasto_anual ?? premissas.custo_vida_base;
      if (custoInicial != null) setCusto(custoInicial);
    }
  }, [data, custom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-apply preset when navigated from fire page
  const presetApplied = useRef(false);
  useEffect(() => {
    if (data && !presetApplied.current && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const preset = params.get('preset');
      const cond = params.get('cond') as FireCond | null;
      const mkt = params.get('mkt') as FireMkt | null;

      if (preset === 'aspiracional') {
        presetApplied.current = true;
        if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
        const favRetorno = fmRetornos.fav ?? premissas.retorno_equity_base;
        if (favRetorno != null) setRetorno(+((favRetorno * 100).toFixed(2)));
        const ci = fmPerfis.atual?.gasto_anual ?? premissas.custo_vida_base;
        if (ci != null) setCusto(ci);
        setFireCond('solteiro');
        setFireMkt('fav');
        setCustom(false);
      } else if (cond && ['solteiro', 'casamento', 'filho'].includes(cond)) {
        presetApplied.current = true;
        if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
        if (mkt && ['stress', 'base', 'fav'].includes(mkt)) {
          const retVal = fmRetornos[mkt] ?? premissas.retorno_equity_base;
          if (retVal != null) setRetorno(+((retVal * 100).toFixed(2)));
          setFireMkt(mkt);
        } else {
          if (premissas.retorno_equity_base != null) setRetorno(+((premissas.retorno_equity_base * 100).toFixed(2)));
          setFireMkt('base');
        }
        setFireCond(cond);
        const v = COND_PRESETS[cond]?.custo;
        if (v != null) setCusto(v);
        setCustom(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const currentAge: number | undefined = premissas.idade_atual;
  const patrimonio: number | undefined = (data?.patrimonio as any)?.total_financeiro ?? premissas.patrimonio_atual;

  // P(sucesso) — fixed base market reference (matches FIRE page values)
  // pfire_aspiracional.base = 86.5%, pfire_base.base = 90.4%
  const pfire50 = (data as any)?.pfire_aspiracional?.base ?? null;
  const pfire53 = (data as any)?.pfire_base?.base ?? null;

  // SWR from data
  const swrPercentis = (data as any)?.fire_swr_percentis;
  const swrBruta = swrPercentis?.swr_p50;
  const swrBrutaPct = swrBruta ? (swrBruta * 100).toFixed(2) : null;
  const inssAnual: number | undefined = premissas.inss_anual;
  const custoLiquido = (custo != null && inssAnual != null) ? Math.max(0, custo - inssAnual) : undefined;

  // SWR target: from premissas.swr_gatilho (official source of truth — no hardcoded fallback)
  const swrTarget: number | undefined = premissas.swr_gatilho;

  // Only run calc when all inputs are available from data
  const result = (aporte !== undefined && retorno !== undefined && custo !== undefined &&
    currentAge !== undefined && patrimonio !== undefined && swrTarget !== undefined)
    ? calcFireYear(aporte, retorno, custo, currentAge, patrimonio, swrTarget)
    : null;

  // P(FIRE) from MC percentiles — no fallback: show — if data not present
  const swrAtFire = result?.swrAtFire ?? null;
  const swrP10: number | undefined = swrPercentis?.swr_p10;
  const swrP50: number | undefined = swrPercentis?.swr_p50;
  const swrP90: number | undefined = swrPercentis?.swr_p90;
  const firePire: number | null = (swrAtFire != null && swrP10 != null && swrP50 != null && swrP90 != null) ? (() => {
    if (swrAtFire >= swrP10) return 10;
    if (swrAtFire <= swrP90) return 90;
    if (swrAtFire >= swrP50) {
      const t = (swrP10 - swrAtFire) / (swrP10 - swrP50);
      return Math.round(10 + t * 40);
    }
    const t = (swrP50 - swrAtFire) / (swrP50 - swrP90);
    return Math.round(50 + t * 40);
  })() : null;

  // SWR líquida
  const swrLiquidaSimple = (result && result.pat > 0 && custoLiquido != null) ? ((custoLiquido / result.pat) * 100).toFixed(2) : null;

  const setCondPreset = (c: FireCond) => {
    setFireCond(c);
    const v = COND_PRESETS[c].custo;
    if (v != null) setCusto(v);
    setCustom(false);
  };

  const setMktPreset = (m: FireMkt) => {
    setFireMkt(m);
    const v = MKT_PRESETS[m].retorno;
    if (v != null) setRetorno(v);
    setCustom(false);
  };

  const setFire50Preset = () => {
    if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
    // Aspiracional: mercado favorável + gasto mínimo (solteiro)
    const favRetorno = fmRetornos.fav ?? premissas.retorno_equity_base;
    if (favRetorno != null) setRetorno(+((favRetorno * 100).toFixed(2)));
    const ci = fmPerfis.atual?.gasto_anual ?? premissas.custo_vida_base;
    if (ci != null) setCusto(ci);
    setFireCond('solteiro');
    setFireMkt('fav');
    setCustom(false);
  };

  const onSliderChange = () => setCustom(true);

  // Timeline: age range hoje..70
  const timelineMin = currentAge ?? 0;
  const timelineMax = 70;
  const fireAge = result?.idade ?? timelineMax;
  const timelinePct = timelineMin < timelineMax
    ? Math.min(100, Math.max(0, ((fireAge - timelineMin) / (timelineMax - timelineMin)) * 100))
    : 0;

  return (
    <div className="section section-critical" style={{ marginBottom: '16px' }}>
      <h2>Simulador FIRE — Aposentadoria Antecipada</h2>

      {/* Resultado principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '18px', background: 'var(--card2)', borderRadius: '10px', padding: '16px' }}>
        <div style={{ textAlign: 'center', minWidth: '140px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Com esses parâmetros</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted)', marginBottom: '2px' }}>você pode aposentar em</div>
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
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--green)', fontWeight: 600, marginTop: '4px' }} className="pv">
              {swrBrutaPct ? `✓ SWR bruta ${swrBrutaPct}%` : ''}{swrLiquidaSimple ? ` · líquida c/INSS ${swrLiquidaSimple}%` : ''}
            </div>
          )}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }} className="pv">
            {result ? (result.idade < 50 ? `${50 - result.idade} anos antes da meta` : result.idade === 50 ? 'na meta' : `${result.idade - 50} anos após meta`) : '—'}
          </div>
        </div>
        <div>
          {/* 3 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '10px' }}>
            <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>P(sucesso) Aspiracional</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }} className="pv">
                {pfire50 !== null ? `${pfire50.toFixed(0)}%` : '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>FIRE antecipado · MC base</div>
            </div>
            <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--accent)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>P(sucesso) Base</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }} className="pv">
                {pfire53 !== null ? `${pfire53.toFixed(0)}%` : '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Plano conservador · MC base</div>
            </div>
            <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Patrimônio projetado</div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }} className="pv">
                {result ? fmtBRL(result.pat) : '—'}
              </div>
            </div>
          </div>
          {/* Mini timeline bar */}
          <div style={{ position: 'relative', height: '8px', background: 'var(--card)', borderRadius: '4px', overflow: 'visible', marginBottom: '18px' }}>
            <div style={{ position: 'absolute', left: 0, height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--accent), var(--green))', width: `${timelinePct}%`, transition: 'width .4s' }} />
            <div style={{ position: 'absolute', top: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--green)', border: '2px solid white', transform: 'translateX(-50%)', left: `${timelinePct}%`, transition: 'left .4s', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: '-18px', left: 0, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Hoje</div>
            <div style={{ position: 'absolute', bottom: '-18px', right: 0, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>70 anos</div>
            {result && (
              <div style={{ position: 'absolute', bottom: '-18px', left: `${timelinePct}%`, fontSize: 'var(--text-xs)', color: 'var(--green)', fontWeight: 700, transform: 'translateX(-50%)', whiteSpace: 'nowrap', transition: 'left .4s' }}>
                {result.idade}a
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Presets — 2 eixos */}
      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: '58px' }}>Condição:</span>
          <div className="seg-group">
            {(['solteiro', 'casamento', 'filho'] as FireCond[]).map(c => (
              <button
                key={c}
                className={`seg-btn${!custom && fireCond === c ? ' active' : ''}`}
                onClick={() => setCondPreset(c)}
              >
                {COND_PRESETS[c].label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: '58px' }}>Mercado:</span>
          <div className="seg-group">
            {(['stress', 'base', 'fav'] as FireMkt[]).map(m => (
              <button
                key={m}
                className={`seg-btn${!custom && fireMkt === m ? ' active' : ''}`}
                onClick={() => setMktPreset(m)}
              >
                {MKT_PRESETS[m].label}
              </button>
            ))}
          </div>
          <button
            className="seg-btn"
            style={{ borderRadius: '6px', border: '1px dashed var(--border)', background: 'transparent' }}
            onClick={setFire50Preset}
          >
            🎯 Aspiracional
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
        <div className="slider-row">
          <label>
            <span>Aporte Mensal</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">{aporte != null ? fmtBRL(aporte) : '—'}</span>
          </label>
          <input
            type="range" min="5000" max="100000" step="1000" value={aporte ?? 25000}
            onChange={e => { setAporte(+e.target.value); onSliderChange(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>R$5k</span><span>R$100k</span>
          </div>
        </div>
        <div className="slider-row">
          <label>
            <span>Retorno Real Equity</span>
            <span style={{ fontWeight: 700, color: 'var(--muted)' }} className="pv">{retorno != null ? fmtPct(retorno) : '—'}</span>
          </label>
          <input
            type="range" min="0" max="10" step="0.25" value={retorno ?? 4.85}
            onChange={e => { setRetorno(+e.target.value); onSliderChange(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>0%</span><span>10%</span>
          </div>
        </div>
        <div className="slider-row">
          <label>
            <span>Custo de Vida /ano</span>
            <span style={{ fontWeight: 700, color: 'var(--muted)' }} className="pv">{custo != null ? fmtBRL(custo) : '—'}</span>
          </label>
          <input
            type="range" min="150000" max="500000" step="10000" value={custo ?? 250000}
            onChange={e => { setCusto(+e.target.value); onSliderChange(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>R$150k</span><span>R$500k</span>
          </div>
        </div>
      </div>

      <div className="src">
        Simulação determinística (sem MC). Critério: SWR ≤ {swrTarget != null ? `${(swrTarget * 100).toFixed(1)}%` : '—'} (premissas.swr_gatilho). Retornos via fire_matrix.retornos_equity. Perfis via fire_matrix.perfis.
      </div>
    </div>
  );
}

// ── What-If Scenarios ─────────────────────────────────────────────────────────

type WiPreset = 'stress' | 'base' | 'fav';

function WhatIfSection() {
  const data = useDashboardStore(s => s.data);
  const [wiPreset, setWiPreset] = useState<WiPreset>('base');
  const [custo, setCusto] = useState<number | undefined>(undefined);
  const dataInitWI = useRef(false);

  const fmRetornos = (data as any)?.fire_matrix?.retornos_equity ?? {};
  const swrPerc = (data as any)?.fire_swr_percentis ?? {};
  const premissasWI = (data as any)?.premissas ?? {};

  // Derive presets from data — no hardcoded values
  const WI_PRESETS: Record<WiPreset, { label: string; retorno: number | undefined; swr: number | undefined }> = {
    stress: { label: '⚠️ Stress',   retorno: fmRetornos.stress != null ? +(fmRetornos.stress * 100).toFixed(2) : undefined, swr: swrPerc.swr_p10 != null ? +(swrPerc.swr_p10 * 100).toFixed(1) : undefined },
    base:   { label: '✅ Base',     retorno: fmRetornos.base   != null ? +(fmRetornos.base   * 100).toFixed(2) : undefined, swr: swrPerc.swr_p50 != null ? +(swrPerc.swr_p50 * 100).toFixed(1) : undefined },
    fav:    { label: '🚀 Favorável', retorno: fmRetornos.fav   != null ? +(fmRetornos.fav    * 100).toFixed(2) : undefined, swr: swrPerc.swr_p90 != null ? +(swrPerc.swr_p90 * 100).toFixed(1) : undefined },
  };

  useEffect(() => {
    if (data && !dataInitWI.current) {
      dataInitWI.current = true;
      const ci = (data as any)?.fire_matrix?.perfis?.atual?.gasto_anual ?? premissasWI.custo_vida_base;
      if (ci != null) setCusto(ci);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const preset = WI_PRESETS[wiPreset];
  const patrimonio: number | undefined = (data?.patrimonio as any)?.total_financeiro ?? premissasWI.patrimonio_atual;
  const patNecessario = (custo != null && preset.swr != null) ? custo / (preset.swr / 100) : undefined;
  const pctLimite = (patrimonio != null && patNecessario != null) ? (patrimonio / patNecessario) * 100 : null;

  // P(Sucesso) — from data only, no estimate
  const fireMatrix = (data as any)?.fire_matrix;
  let psucesso: number | null = null;
  if (fireMatrix && preset.retorno != null && custo != null) {
    const key = `${(preset.retorno / 100).toFixed(4)}_${custo}`;
    psucesso = fireMatrix.cenarios?.base?.[`${premissasWI.patrimonio_atual}_${custo}`] ?? null;
  }

  // ETA
  const monthly: number | undefined = premissasWI.aporte_mensal;
  const retornoMensal = preset.retorno != null ? preset.retorno / 100 / 12 : undefined;
  let etaYears: number | null = null;
  if (patrimonio != null && patNecessario != null && monthly != null && retornoMensal != null && patrimonio < patNecessario) {
    let pat = patrimonio;
    let etaMonths = 0;
    for (let m = 0; m < 360; m++) {
      pat = pat * (1 + retornoMensal) + monthly;
      etaMonths = m + 1;
      if (pat >= patNecessario) break;
    }
    etaYears = Math.round(etaMonths / 12);
  }

  return (
    <CollapsibleSection id="sim-whatif" title={secTitle('simuladores', 'what-if', 'What-If Scenarios — Cenário / Gasto')} defaultOpen={secOpen('simuladores', 'what-if', false)}>
      {/* Preset buttons */}
      <div style={{ marginBottom: '10px' }}>
        <div className="seg-group">
          {(Object.keys(WI_PRESETS) as WiPreset[]).map(k => (
            <button
              key={k}
              className={`seg-btn${wiPreset === k ? ' active' : ''}`}
              onClick={() => setWiPreset(k)}
            >
              {WI_PRESETS[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider custo de vida */}
      <div className="slider-row">
        <label>
          <span>Custo de Vida /ano</span>
          <span className="pv">{custo != null ? `R$ ${(custo / 1000).toFixed(0)}k/ano` : '—'}</span>
        </label>
        <input
          type="range" min="150000" max="400000" step="10000" value={custo ?? 250000}
          onChange={e => setCusto(+e.target.value)}
        />
      </div>

      {/* Output 2-col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>P(Sucesso 30 anos)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }} className="pv">{psucesso != null ? `${(psucesso * 100).toFixed(0)}%` : '—'}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>Via FIRE Matrix</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>Patrimônio necessário</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }} className="pv">{patNecessario != null ? fmtBRL(patNecessario) : '—'}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }} className="pv">SWR {preset.swr != null ? `${preset.swr.toFixed(2)}%` : '—'}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }} className="pv">{pctLimite != null ? `${pctLimite.toFixed(1)}% do limite` : '—'}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--yellow)', fontWeight: 600, marginTop: '2px' }} className="pv">
            {(patrimonio != null && patNecessario != null) ? (patrimonio >= patNecessario ? 'FIRE atingido ✅' : `ETA: ~${etaYears} anos`) : '—'}
          </div>
        </div>
      </div>

      <div className="src" style={{ marginTop: '6px' }}>
        Retornos: fire_matrix.retornos_equity · SWR: fire_swr_percentis · Patrimônio: premissas.patrimonio_atual
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
function StressChart({ shock, ageOnset, patrimonio, annualReturn, annualVol, currentAge: startAge, aporteMensal, fireAge }: {
  shock: number; ageOnset: number; patrimonio: number;
  annualReturn: number; annualVol: number; currentAge: number;
  aporteMensal: number; fireAge: number;
}) {
  const option = useMemo(() => {
    const currentAge = startAge;
    const years = 100 - currentAge; // always project to age 100
    const ANNUAL_RETURN = annualReturn;
    const ANNUAL_VOL = annualVol;
    const N_SIMS = 300;
    const shockYr = Math.max(0, ageOnset - currentAge);
    const yearsToFire = Math.max(0, fireAge - currentAge);

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
        // Add monthly contributions during accumulation phase (pre-FIRE)
        if (yr <= yearsToFire) next += aporteMensal * 12;
        if (yr === shockYr) next = next * (1 + shock / 100);
        traj.push(next); // No floor — negative values show real ruin risk
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
      grid: { left: '12%', right: '4%', top: 20, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLabel: { color: '#8b949e', fontSize: 10, interval: 4, hideOverlap: true },
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
  }, [shock, ageOnset, patrimonio, annualReturn, annualVol, startAge, aporteMensal, fireAge]);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>
        Projeção — Evolução Patrimonial após Shock · {300} trajetórias MC · valores nominais BRL
      </div>
      <ReactECharts option={option} style={{ height: 300 }} opts={{ renderer: 'canvas', devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }} />
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '3px' }}>
        Verde = P50 mediana · Azul = P75–P90 · Vermelho = P10–P25 · Retorno: {(annualReturn * 100).toFixed(2)}%/ano · Vol: {(annualVol * 100).toFixed(0)}%/ano · Negativos visíveis (sem floor)
      </div>
    </div>
  );
}

function StressTestSection() {
  const data = useDashboardStore(s => s.data);
  const [shock, setShock] = useState(-40);
  const [ageOnset, setAgeOnset] = useState<number | undefined>(undefined);
  const dataInitST = useRef(false);

  const premissasST = (data as any)?.premissas ?? {};
  const patrimonio: number | undefined = (data?.patrimonio as any)?.total_financeiro ?? premissasST.patrimonio_atual;
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
            Patrimônio pós-shock: <strong className="pv" style={{ color: 'var(--red)' }}>{postShock != null ? fmtBRL(postShock) : '—'}</strong>
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
            { label: 'Patrimônio', value: fmtBRL(patrimonio) },
            { label: 'Aporte mensal', value: aporteMensal > 0 ? `R$${(aporteMensal / 1000).toFixed(0)}k` : '—' },
            { label: 'Custo de vida', value: premissasST.custo_vida_base != null ? `R$${(premissasST.custo_vida_base / 1000).toFixed(0)}k/ano` : '—' },
            { label: 'Retorno (real)', value: `${(annualReturn * 100).toFixed(2)}%/ano` },
            { label: 'Volatilidade', value: `${(annualVol * 100).toFixed(0)}%/ano` },
            { label: 'Distribuição', value: 'Normal (Box-Muller)' },
            { label: 'Trajetórias', value: '300 MC' },
            { label: 'Horizonte', value: `até 100a (${100 - startAge} anos)` },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 10px', flexShrink: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>{c.label}</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text)', marginTop: '1px' }}>{c.value}</div>
            </div>
          ))}
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
  );
}

// ── Calculadora de Aporte — Cascade ──────────────────────────────────────────

function CascadeSection() {
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const [aporte, setAporte] = useState<number | undefined>(undefined);
  const dataInitCasc = useRef(false);

  useEffect(() => {
    if (data && !dataInitCasc.current) {
      dataInitCasc.current = true;
      const ap = (data as any)?.premissas?.aporte_mensal;
      if (ap != null) setAporte(ap);
    }
  }, [data]);

  const cambio: number = data?.cambio ?? 0;

  // Derive total portfolio value (BRL) — from data only, no hardcoded fallback
  const totalBrl: number | undefined =
    (data?.patrimonio as any)?.total_financeiro ??
    (data as any)?.premissas?.patrimonio_atual;

  // IPCA+ Longo gap — from unified derived.dcaItems (single source of truth)
  const ipcaItem = derived?.dcaItems?.find(i => i.id === 'ipca2040') ?? null;
  const ipcaGapPp: number | null = ipcaItem?.gapAlvoPp ?? null;
  const ipcaGapBrl: number | null = ipcaGapPp != null && ipcaGapPp > 0 && totalBrl != null
    ? Math.round((ipcaGapPp / 100) * totalBrl)
    : 0;

  // Renda+ gap — from unified derived.dcaItems
  const rendaItem = derived?.dcaItems?.find(i => i.id === 'renda2065') ?? null;
  const rendaGapPp: number | null = rendaItem?.gapAlvoPp ?? null;
  const rendaGapBrl: number | null = rendaGapPp != null && rendaGapPp > 0 && totalBrl != null
    ? Math.round((rendaGapPp / 100) * totalBrl)
    : 0;

  // Cascade allocation: IPCA+ Longo → Renda+ → Equity (overflow)
  let remaining = aporte ?? 0;
  const ipcaAlloc = ipcaGapBrl !== null ? Math.min(remaining, ipcaGapBrl) : 0;
  remaining -= ipcaAlloc;
  const rendaAlloc = rendaGapBrl !== null ? Math.min(remaining, rendaGapBrl) : 0;
  remaining -= rendaAlloc;
  const equityAlloc = remaining;

  // DCA active status from unified dcaItems
  const ipcaAtivo: boolean = ipcaItem?.dcaAtivo ?? false;
  const rendaAtivo: boolean = rendaItem?.dcaAtivo ?? false;

  return (
    <div className="section" style={{ marginTop: '16px' }}>
      <h2>Calculadora de Aporte — Cascade</h2>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div className="slider-row" style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Aporte Mensal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>R$</span>
              <Input
                type="number"
                min="1000"
                max="1000000"
                step="1000"
                value={aporte}
                onChange={e => setAporte(+e.target.value)}
                style={{ width: '90px', fontSize: 'var(--text-base)', textAlign: 'right' }}
              />
            </span>
          </label>
          <input
            type="range" min="1" max="1000" step="1" value={aporte != null ? Math.round(aporte / 1000) : 25}
            onChange={e => setAporte(+e.target.value * 1000)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>R$ 1k</span><span>R$ 1M</span>
          </div>
        </div>
        {cambio > 0 && (
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            Câmbio: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cambio.toFixed(2)}</span>{' '}
            <span style={{ fontSize: 'var(--text-xs)' }}>(PTAX BCB)</span>
          </div>
        )}
      </div>

      {/* Cascade result — always show all 3 levels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
        {/* Nível 1: IPCA+ Longo */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${ipcaAtivo ? 'var(--green)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              1 · IPCA+ Longo
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)', background: ipcaAtivo ? 'rgba(34,197,94,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {ipcaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)' }} className="pv">
            {fmtBRL(ipcaAlloc)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Tesouro IPCA+2040 via XP
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{ipcaGapBrl != null ? fmtBRL(ipcaGapBrl) : '—'}</span>
            {ipcaGapPp != null && ` (${ipcaGapPp.toFixed(1)}pp)`}
          </div>
        </div>

        {/* Nível 2: Renda+ */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${rendaAtivo ? 'var(--accent)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              2 · Renda+ 2065
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)', background: rendaAtivo ? 'rgba(59,130,246,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {rendaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)' }} className="pv">
            {fmtBRL(rendaAlloc)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Renda+ 2065 via Tesouro Direto
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{rendaGapBrl != null ? fmtBRL(rendaGapBrl) : '—'}</span>
            {rendaGapPp != null && (rendaGapPp > 0 ? ` (${rendaGapPp.toFixed(1)}pp)` : ' (acima do alvo)')}
          </div>
        </div>

        {/* Nível 3: Equity (overflow) */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: '3px solid var(--orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              3 · Equity (overflow)
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--orange)', background: 'rgba(249,115,22,.12)', borderRadius: '3px', padding: '1px 4px' }}>
              SEMPRE
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--orange)' }} className="pv">
            {fmtBRL(equityAlloc)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--orange)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(249,115,22,.08)', borderRadius: '4px' }}>
            → SWRD + AVGS + AVEM via IBKR
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
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
      {/* 1. Cascade — decisão de aporte (ação imediata) */}
      <CascadeSection />

      <hr className="section-sep" />

      {/* 2. Simulador FIRE — projeção central */}
      <FireSimuladorSection />

      <hr className="section-sep" />

      {/* 3. What-If Scenarios — collapsed (análise secundária) */}
      <WhatIfSection />

      <hr className="section-sep" />

      {/* 4. Stress Test MC — collapsed (ferramenta avançada) */}
      <StressTestSection />
    </div>
  );
}
