'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/dashboardStore';
import { usePageData } from '@/hooks/usePageData';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { calcFireYear, getAnoAtual, getIdadeAtual, pfireColor as pfireColorFn } from '@/utils/fire';
import { fmtBrlM, fmtPct as fmtPctCanon } from '@/utils/formatters';
import { runMCYearly } from '@/utils/montecarlo';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { useUiStore } from '@/store/uiStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

/// Single derivation for patrimônio total financeiro — source: premissas.patrimonio_atual
function derivePatrimonio(data: unknown): number | undefined {
  return (data as any)?.premissas?.patrimonio_atual;
}

// B4: single fraction→percentage conversion — avoids scattered `* 100` throughout file
function fracToPct(v: number | undefined | null, dec = 2): number | undefined {
  if (v == null) return undefined;
  return +((v * 100).toFixed(dec));
}

// fmtBRL: local alias for compact BRL (M/k suffix) — delegates to canonical fmtBrlM
function fmtBRL(v: number) { return fmtBrlM(v); }

// fmtPct: local wrapper — v is already in % (e.g. 4.85), not fraction
function fmtPct(v: number) {
  return `${v.toFixed(1)}%`;
}

// fmtPctFrac: wrapper for canonical fmtPct (expects fraction, 0.05 → "5,00%")
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _fmtPctFrac = fmtPctCanon; // re-export available if needed

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

// calcFireYear is imported from @/utils/fire (canonical, retorno always as fraction)

function FireSimuladorSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useUiStore();

  // Derive presets from data.fire_matrix at runtime (not hardcoded)
  const fmRetornos = (data as any)?.fire_matrix?.retornos_equity ?? {};
  const fmPerfis   = (data as any)?.fire_matrix?.perfis ?? {};
  const premissas  = (data as any)?.premissas ?? {};

  const MKT_PRESETS: Record<FireMkt, { retorno: number; label: string }> = {
    stress: { retorno: fracToPct(fmRetornos.stress ?? premissas.retorno_equity_base ?? 0.0435) ?? 4.35, label: MKT_LABELS.stress },
    base:   { retorno: fracToPct(fmRetornos.base   ?? premissas.retorno_equity_base ?? 0.0485) ?? 4.85, label: MKT_LABELS.base },
    fav:    { retorno: fracToPct(fmRetornos.fav    ?? premissas.retorno_equity_base ?? 0.0585) ?? 5.85, label: MKT_LABELS.fav },
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
      if (premissas.retorno_equity_base != null) setRetorno(fracToPct(premissas.retorno_equity_base));
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
          if (retVal != null) setRetorno(fracToPct(retVal));
          setFireMkt(mkt);
        } else {
          if (premissas.retorno_equity_base != null) setRetorno(fracToPct(premissas.retorno_equity_base));
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
  const patrimonio: number | undefined = derivePatrimonio(data);

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

  // SWR líquida — computed after result is determined (below)

  const setCondPreset = (c: FireCond) => {
    setFireCond(c);
    const v = COND_PRESETS[c].custo;
    if (v != null) setCusto(v);
    if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
    setCustom(false);
  };

  const setMktPreset = (m: FireMkt) => {
    setFireMkt(m);
    const v = MKT_PRESETS[m].retorno;
    if (v != null) setRetorno(v);
    if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
    setCustom(false);
  };

  const setFire50Preset = () => {
    if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
    const favRetorno = fmRetornos.fav ?? premissas.retorno_equity_base;
    if (favRetorno != null) setRetorno(fracToPct(favRetorno));
    const ci = fmPerfis.atual?.gasto_anual ?? premissas.custo_vida_base;
    if (ci != null) setCusto(ci);
    setFireCond('solteiro');
    setFireMkt('fav');
    setCustom(false);
  };

  const onSliderChange = () => setCustom(true);

  // ── Result: precomputed MC (preset mode) or deterministic (custom/slider mode) ──
  // Precomputed MC data — consistent with FIRE page
  const byProfile: any[] = (data as any)?.fire_matrix?.by_profile ?? [];
  const profileKey: Record<FireCond, string> = { solteiro: 'atual', casamento: 'casado', filho: 'filho' };
  const earliestFire = (data as any)?.earliest_fire ?? null;
  const isAspirPreset = !custom && fireCond === 'solteiro' && fireMkt === 'fav';

  type FireResult = { ano: number; idade: number; pat: number; swrAtFire: number };
  let result: FireResult | null = null;
  let firePire: number | null = null;

  if (!custom) {
    if (isAspirPreset) {
      // Aspiracional: use earliest_fire from MC
      if (earliestFire) {
        result = { ano: earliestFire.ano, idade: earliestFire.idade, pat: 0, swrAtFire: 0 };
        firePire = (data as any)?.pfire_aspiracional?.base ?? earliestFire.pfire ?? null;
      }
    } else {
      // Condição/Mercado preset: use by_profile precomputed threshold
      const p = byProfile.find((x: any) => x.profile === profileKey[fireCond]);
      if (p?.fire_year_threshold) {
        result = {
          ano: parseInt(p.fire_year_threshold, 10),
          idade: p.fire_age_threshold,
          pat: p.pat_mediano_threshold ?? 0,
          swrAtFire: p.swr_at_fire ?? 0,
        };
        firePire = fireMkt === 'fav'    ? (p.p_at_threshold_fav ?? p.p_at_threshold)
                 : fireMkt === 'stress' ? (p.p_at_threshold_stress ?? p.p_at_threshold)
                 : p.p_at_threshold;
      }
    }
  } else {
    // Custom mode: deterministic calculator from slider values
    if (aporte !== undefined && retorno !== undefined && custo !== undefined &&
        currentAge !== undefined && patrimonio !== undefined && swrTarget !== undefined) {
      result = calcFireYear(aporte, retorno / 100, custo, currentAge, getAnoAtual(premissas), patrimonio, swrTarget);
    }
    // P(FIRE) interpolated from SWR percentiles
    const swrAtFire = result?.swrAtFire ?? null;
    const swrP10 = swrPercentis?.swr_p10;
    const swrP50 = swrPercentis?.swr_p50;
    const swrP90 = swrPercentis?.swr_p90;
    firePire = (swrAtFire != null && swrP10 != null && swrP50 != null && swrP90 != null) ? (() => {
      if (swrAtFire >= swrP10) return 10;
      if (swrAtFire <= swrP90) return 90;
      if (swrAtFire >= swrP50) {
        const t = (swrP10 - swrAtFire) / (swrP10 - swrP50);
        return Math.round(10 + t * 40);
      }
      const t = (swrP50 - swrAtFire) / (swrP50 - swrP90);
      return Math.round(50 + t * 40);
    })() : null;
  }

  // SWR líquida (only meaningful in custom mode when pat is known)
  const swrLiquidaSimple = (result && result.pat > 0 && custoLiquido != null) ? ((custoLiquido / result.pat) * 100).toFixed(2) : null;

  // Preset mode indicator (for UI label)
  const isPresetMode = !custom;

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
      {(() => {
        const pfireSemaforo = firePire;
        const pfireCardColor = pfireColorFn(pfireSemaforo);
        const semaforo = pfireSemaforo == null ? null
          : pfireSemaforo < 70  ? { label: '⚠ Risco Alto', color: 'var(--red)' }
          : pfireSemaforo < 85  ? { label: '⚠ Atenção',   color: 'var(--yellow)' }
          : { label: '✓ Seguro', color: 'var(--green)' };
        return (
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'center',
        marginBottom: '18px',
        background: pfireCardColor !== 'var(--muted)'
          ? `color-mix(in srgb, ${pfireCardColor} 8%, var(--card2))`
          : 'var(--card2)',
        borderRadius: '10px', padding: '16px',
        border: semaforo ? `1px solid color-mix(in srgb, ${pfireCardColor} 25%, transparent)` : undefined,
      }}>
        <div style={{ textAlign: 'center', minWidth: '140px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Com esses parâmetros</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted)', marginBottom: '2px' }}>você pode aposentar em</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }} className="pv">
            {result ? result.ano : '—'}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0' }} className="pv">
            {result ? `${result.idade} anos` : '—'}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: pfireCardColor }} className="pv">
            {firePire !== null ? `P = ${firePire}%` : 'P = —%'}
          </div>
          {/* Semáforo badge */}
          {semaforo && (
            <div style={{ marginTop: '6px' }}>
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: semaforo.color,
                background: `color-mix(in srgb, ${semaforo.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${semaforo.color} 30%, transparent)`,
              }}>
                {semaforo.label}
              </span>
            </div>
          )}
          {/* Hint when P < 85% */}
          {pfireSemaforo != null && pfireSemaforo < 85 && (
            <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
              Para P=90%, ajuste aporte ou spending
            </div>
          )}
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
                {result && result.pat > 0 ? (privacyMode ? '••••' : fmtBRL(result.pat)) : '—'}
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
        );
      })()}

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
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">{aporte != null ? (privacyMode ? '••••' : fmtBRL(aporte)) : '—'}</span>
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
            <span style={{ fontWeight: 700, color: 'var(--muted)' }} className="pv">{custo != null ? (privacyMode ? '••••' : fmtBRL(custo)) : '—'}</span>
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
        {isPresetMode
          ? 'Modo preset: dados MC pré-calculados (consistente com FIRE page). Mova um slider para modo interativo.'
          : `Modo interativo: simulação determinística · SWR ≤ ${swrTarget != null ? `${(swrTarget * 100).toFixed(1)}%` : '—'} · sem variância de mercado`}
      </div>
    </div>
  );
}

// ── What-If Scenarios ─────────────────────────────────────────────────────────

type WiPreset = 'stress' | 'base' | 'fav';

// Profile selector for Cenário A (matches fire_matrix.by_profile keys)
type WiProfileA = 'solteiro' | 'casado' | 'filho';

interface LifeEvent {
  id: string;
  nome: string;
  ano: number;
  custo: number;
  tipo: 'one-shot' | 'recorrente';
}

function WhatIfSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useUiStore();
  const router = useRouter();
  const [wiPreset, setWiPreset] = useState<WiPreset>('base');
  const [profileA, setProfileA] = useState<WiProfileA>('solteiro');
  const [custoBInit, setCustoBInit] = useState<boolean>(false);
  const [custoB, setCustoB] = useState<number>(250000);
  const [aporteB, setAporteB] = useState<number>(25000);
  const [inssToggle, setInssToggle] = useState({ diego: false, katia: false });
  const [horizon, setHorizon] = useState<number>(90);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(() => {
    try { return JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('wealth-life-events-v2') ?? '[]') : '[]'); }
    catch { return []; }
  });
  const [newEvtNome, setNewEvtNome] = useState('');
  const [newEvtAno, setNewEvtAno] = useState<number>(new Date().getFullYear() + 5);
  const [newEvtCusto, setNewEvtCusto] = useState<number>(50000);
  const [newEvtTipo, setNewEvtTipo] = useState<'one-shot' | 'recorrente'>('one-shot');
  const [evtError, setEvtError] = useState<string>('');

  const fmRetornos = (data as any)?.fire_matrix?.retornos_equity ?? {};
  const swrPerc = (data as any)?.fire_swr_percentis ?? {};
  const premissasWI = (data as any)?.premissas ?? {};
  const fmPerfisWI = (data as any)?.fire_matrix?.perfis ?? {};
  const byProfile: any[] = (data as any)?.fire_matrix?.by_profile ?? [];
  const lumpyEventos: any[] = (data as any)?.lumpy_events?.eventos ?? [];
  const gastoPiso: number = (data as any)?.gasto_piso ?? premissasWI?.custo_vida_base ?? 180000;

  // Derive presets from data — no hardcoded values
  const WI_PRESETS: Record<WiPreset, { label: string; retorno: number | undefined; swrFrac: number | undefined }> = {
    stress: { label: '⚠️ Stress',    retorno: fmRetornos.stress, swrFrac: swrPerc.swr_p10 },
    base:   { label: '✅ Base',      retorno: fmRetornos.base,   swrFrac: swrPerc.swr_p50 },
    fav:    { label: '🚀 Favorável', retorno: fmRetornos.fav,    swrFrac: swrPerc.swr_p90 },
  };

  const PROFILE_A_MAP: Record<WiProfileA, { label: string; byProfileKey: string; perfilKey: string }> = {
    solteiro: { label: '👤 Solteiro', byProfileKey: 'atual',  perfilKey: 'atual'  },
    casado:   { label: '💍 Casado',   byProfileKey: 'casado', perfilKey: 'casado' },
    filho:    { label: '👶 Filho+Escola', byProfileKey: 'filho', perfilKey: 'filho' },
  };

  // Cenário A values come from by_profile (MC precomputed) — consistent with FIRE simulator
  const byProfileA = byProfile.find((x: any) => x.profile === PROFILE_A_MAP[profileA].byProfileKey);
  const custoA: number = fmPerfisWI?.[PROFILE_A_MAP[profileA].perfilKey]?.gasto_anual
    ?? premissasWI?.custo_vida_base ?? 250000;
  const aporteA: number = premissasWI?.aporte_mensal ?? 25000;

  // Cenário A results from MC precomputed data
  const anoFireA = byProfileA?.fire_year_threshold ? parseInt(byProfileA.fire_year_threshold, 10) : null;
  const idadeFireA = byProfileA?.fire_age_threshold ?? null;
  const psucessoA: number | null = wiPreset === 'fav'
    ? (byProfileA?.p_at_threshold_fav ?? byProfileA?.p_at_threshold ?? null)
    : wiPreset === 'stress'
    ? (byProfileA?.p_at_threshold_stress ?? byProfileA?.p_at_threshold ?? null)
    : (byProfileA?.p_at_threshold ?? null);

  const patrimonio: number | undefined = derivePatrimonio(data);
  const swrTarget: number | undefined = premissasWI?.swr_gatilho;
  const currentAge: number = premissasWI?.idade_atual ?? 39;
  const anoAtual: number = getAnoAtual(premissasWI);
  const inssAnualDiego: number = premissasWI?.inss_anual ?? 0;
  const inssAnualKatia: number = premissasWI?.inss_katia_anual ?? 0;

  // INSS reduces custo líquido for Cenário B calc
  const inssOffset = (inssToggle.diego ? inssAnualDiego : 0) + (inssToggle.katia ? inssAnualKatia : 0);
  const custoLiquidoB = Math.max(0, custoB - inssOffset);

  // Init Cenário B from data + profileA once
  useEffect(() => {
    if (data && !custoBInit) {
      setCustoBInit(true);
      setCustoB(fmPerfisWI?.atual?.gasto_anual ?? premissasWI?.custo_vida_base ?? 250000);
      if (premissasWI?.aporte_mensal != null) setAporteB(premissasWI.aporte_mensal);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // When profileA changes, sync Cenário B starting values
  const prevProfileARef = useRef<WiProfileA | null>(null);
  useEffect(() => {
    if (prevProfileARef.current !== null && prevProfileARef.current !== profileA) {
      const custo = fmPerfisWI?.[PROFILE_A_MAP[profileA].perfilKey]?.gasto_anual
        ?? premissasWI?.custo_vida_base ?? 250000;
      setCustoB(custo);
      if (premissasWI?.aporte_mensal != null) setAporteB(premissasWI.aporte_mensal);
    }
    prevProfileARef.current = profileA;
  }, [profileA]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist life events (v2 key for new schema)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wealth-life-events-v2', JSON.stringify(lifeEvents));
    }
  }, [lifeEvents]);

  const preset = WI_PRESETS[wiPreset];

  // ── Local calcWithEvents (inline, not exported) ──────────────────────────────
  function calcWithEvents(
    aporte: number,
    retornoFrac: number,
    custo: number,
    age: number,
    ano: number,
    pat0: number,
    swr: number,
    events: LifeEvent[]
  ): { ano: number; idade: number; pat: number; swrAtFire: number } | null {
    const target = custo / swr;
    let pat = pat0;
    for (let yr = 0; yr <= 35; yr++) {
      // one-shot events: subtract at specific year
      for (const evt of events) {
        if (evt.tipo === 'one-shot' && evt.ano === ano + yr) {
          pat = Math.max(0, pat - evt.custo);
        }
      }
      // recorrente: accumulate delta_custo for years at or after start
      const recorrenteDelta = events
        .filter(e => e.tipo === 'recorrente' && e.ano <= ano + yr)
        .reduce((sum, e) => sum + e.custo, 0);
      const custoEfetivo = custo + recorrenteDelta;
      const targetEfetivo = custoEfetivo / swr;
      if (pat >= targetEfetivo) {
        return { ano: ano + yr, idade: age + yr, pat, swrAtFire: custoEfetivo / pat };
      }
      for (let m = 0; m < 12; m++) {
        pat = pat * (1 + retornoFrac / 12) + aporte;
      }
    }
    return null;
  }

  // ── Cenário B (editável + life events) ───────────────────────────────────────
  const resultB = useMemo(() => {
    if (patrimonio == null || swrTarget == null || !preset.retorno) return null;
    return calcWithEvents(aporteB, preset.retorno, custoLiquidoB, currentAge, anoAtual, patrimonio, swrTarget, lifeEvents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrimonio, swrTarget, preset.retorno, aporteB, custoLiquidoB, currentAge, anoAtual, lifeEvents]);

  // ── P(sucesso) Cenário B — MC desacumulação com horizonte configurável ────────
  const psucessoB: number | null = useMemo(() => {
    if (!resultB || resultB.pat <= 0) return null;
    const yearsDecum = horizon - resultB.idade;
    if (yearsDecum <= 0) return null;
    const retFrac = preset.retorno ?? 0.0485; // already a fraction (0.0485), NOT percentage
    const vol: number = premissasWI?.volatilidade_equity ?? 0.12;
    const withdrawal = custoLiquidoB;
    const numSims = 400;
    // Seeded LCG — reproducível dado os mesmos parâmetros
    const seedBase = (Math.round(resultB.pat / 10000) * 31 + yearsDecum * 17 + Math.round(withdrawal / 1000) * 7) >>> 0;
    let s = seedBase || 1;
    const rand = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const randn = () => {
      let u = 0, v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    let successes = 0;
    for (let sim = 0; sim < numSims; sim++) {
      let pat = resultB.pat;
      let alive = true;
      for (let yr = 0; yr < yearsDecum; yr++) {
        pat = pat * (1 + retFrac + vol * randn()) - withdrawal;
        if (pat <= 0) { alive = false; break; }
      }
      if (alive) successes++;
    }
    return (successes / numSims) * 100;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultB, horizon, custoLiquidoB, preset.retorno, premissasWI?.volatilidade_equity]);

  // ── Delta ─────────────────────────────────────────────────────────────────────
  const deltaAnos = (idadeFireA != null && resultB) ? (resultB.idade - idadeFireA) : null;
  const deltaP = (psucessoA != null && psucessoB != null) ? (psucessoB - psucessoA) : null;

  // ── Life event totals ──────────────────────────────────────────────────────────
  const totalOneShotEventos = lifeEvents.filter(e => e.tipo === 'one-shot').reduce((s, e) => s + e.custo, 0);

  // ── Nearest perfil detection for "Explorar no Simulador" link ────────────────
  const PERFIL_MAP: Array<{ key: string; cond: string; custo: number }> = [
    { key: 'atual',  cond: 'solteiro',  custo: fmPerfisWI?.atual?.gasto_anual ?? 0 },
    { key: 'casado', cond: 'casamento', custo: fmPerfisWI?.casado?.gasto_anual ?? 0 },
    { key: 'filho',  cond: 'filho',     custo: fmPerfisWI?.filho?.gasto_anual ?? 0 },
  ];
  const nearestPerfil = PERFIL_MAP.find(p => p.custo > 0 && Math.abs(p.custo - custoB) <= 15000);

  // ── Add event handler ─────────────────────────────────────────────────────────
  function handleAddEvent() {
    if (!newEvtNome.trim()) { setEvtError('Nome é obrigatório'); return; }
    if (newEvtAno < 2025 || newEvtAno > 2070) { setEvtError('Ano deve ser entre 2025 e 2070'); return; }
    if (newEvtCusto <= 0) { setEvtError('Custo deve ser maior que 0'); return; }
    setEvtError('');
    setLifeEvents(prev => [...prev, {
      id: `${Date.now()}`,
      nome: newEvtNome.trim(),
      ano: newEvtAno,
      custo: newEvtCusto,
      tipo: newEvtTipo,
    }]);
    setNewEvtNome('');
  }

  // ── Floor vs Upside calculations ──────────────────────────────────────────────
  const floorInss = (inssToggle.diego ? inssAnualDiego : 0) + (inssToggle.katia ? inssAnualKatia : 0);
  const floorTotal = floorInss + gastoPiso; // INSS + minimum RF floor
  const gapEquity = Math.max(0, custoB - floorTotal);
  const patrimonioNecessarioGap = swrTarget && swrTarget > 0 ? gapEquity / swrTarget : null;
  // Quando gap=0 (floor cobre tudo), cobertura é 100% — não "—"
  const coberturaAtual = gapEquity === 0
    ? 100
    : (patrimonioNecessarioGap && patrimonioNecessarioGap > 0 && patrimonio != null)
      ? Math.min(100, (patrimonio / patrimonioNecessarioGap) * 100)
      : null;


  return (
    <CollapsibleSection id="sim-whatif" title={secTitle('simuladores', 'what-if', 'What-If Scenarios — Impacto de Decisões de Vida')} defaultOpen={secOpen('simuladores', 'what-if', false)}>

      {/* ── Presets de mercado ── */}
      <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: '60px' }}>Mercado:</span>
        <div className="seg-group">
          {(Object.keys(WI_PRESETS) as WiPreset[]).map(k => (
            <button key={k} className={`seg-btn${wiPreset === k ? ' active' : ''}`} onClick={() => setWiPreset(k)}>
              {WI_PRESETS[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Perfil Cenário A ── */}
      <div style={{ marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: '60px' }}>Perfil A:</span>
        <div className="seg-group">
          {(Object.keys(PROFILE_A_MAP) as WiProfileA[]).map(k => (
            <button
              key={k}
              className={`seg-btn${profileA === k ? ' active' : ''}`}
              onClick={() => setProfileA(k)}
            >
              {PROFILE_A_MAP[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sliders Cenário B ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <div className="slider-row">
          <label>
            <span>✏️ Custo Cenário B /ano</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">
              {privacyMode ? '••••' : `R$${(custoB / 1000).toFixed(0)}k/ano`}
            </span>
          </label>
          <input
            type="range" min="150000" max="500000" step="10000" value={custoB}
            onChange={e => setCustoB(+e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>R$150k</span><span>R$500k</span>
          </div>
        </div>
        <div className="slider-row">
          <label>
            <span>✏️ Aporte Cenário B /mês</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">
              {privacyMode ? '••••' : `R$${(aporteB / 1000).toFixed(0)}k/mês`}
            </span>
          </label>
          <input
            type="range" min="5000" max="60000" step="1000" value={aporteB}
            onChange={e => setAporteB(+e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>R$5k</span><span>R$60k</span>
          </div>
        </div>
      </div>

      {/* ── INSS Toggles ── */}
      <div style={{ marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '10px 14px', background: 'var(--card2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', alignSelf: 'center', marginRight: '4px' }}>INSS (reduz custo líquido B):</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inssToggle.diego}
            onChange={e => setInssToggle(v => ({ ...v, diego: e.target.checked }))}
          />
          <span>Diego — <span className="pv">{privacyMode ? '••••' : `R$${(inssAnualDiego / 1000).toFixed(0)}k/ano`}</span></span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inssToggle.katia}
            onChange={e => setInssToggle(v => ({ ...v, katia: e.target.checked }))}
          />
          <span>Katia — <span className="pv">{privacyMode ? '••••' : `R$${(inssAnualKatia / 1000).toFixed(0)}k/ano`}</span></span>
        </label>
        {inssOffset > 0 && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)', fontWeight: 600, alignSelf: 'center' }} className="pv">
            {privacyMode ? '••••' : `→ Custo líquido B: R$${(custoLiquidoB / 1000).toFixed(0)}k/ano`}
          </span>
        )}
      </div>

      {/* ── Comparador A/B ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Card A — MC precomputed by_profile */}
        {(() => {
          const pColor = pfireColorFn(psucessoA);
          return (
            <div style={{
              background: 'var(--card2)', borderRadius: '10px', padding: '14px',
              border: `1px solid color-mix(in srgb, ${pColor} 25%, var(--border))`,
              borderTop: `3px solid ${pColor}`,
            }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
                📌 Plano A — {PROFILE_A_MAP[profileA].label}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }} className="pv">
                    {anoFireA ?? '—'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }} className="pv">
                    {idadeFireA != null ? `${idadeFireA} anos` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: pColor }} className="pv">
                    {psucessoA != null ? `P ${psucessoA.toFixed(0)}%` : 'P —%'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
                Custo: <span className="pv">{privacyMode ? '••••' : fmtBRL(custoA)}/ano</span>
                {' · '}Aporte: <span className="pv">{privacyMode ? '••••' : fmtBRL(aporteA)}/mês</span>
              </div>
              {byProfileA?.pat_mediano_threshold > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  Pat. mediano FIRE: <span className="pv">{privacyMode ? '••••' : fmtBRL(byProfileA.pat_mediano_threshold)}</span>
                </div>
              )}
              {byProfileA?.swr_at_fire != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  SWR bruta: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{(byProfileA.swr_at_fire * 100).toFixed(2)}%</span>
                  {byProfileA?.pat_mediano_threshold > 0 && (
                    <span> · SWR líquida: <span style={{ color: 'var(--green)', fontWeight: 600 }} className="pv">
                      {privacyMode ? '••••' : `${(Math.max(0, custoA - inssAnualDiego - inssAnualKatia) / byProfileA.pat_mediano_threshold * 100).toFixed(2)}%`}
                    </span></span>
                  )}
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--green)', marginTop: '6px', fontStyle: 'italic' }}>
                MC precomputed — consistente com FIRE page
              </div>
            </div>
          );
        })()}

        {/* Card B — What-If determinístico */}
        {(() => {
          const pColor = pfireColorFn(psucessoB);
          return (
            <div style={{
              background: 'var(--card2)', borderRadius: '10px', padding: '14px',
              border: `1px solid color-mix(in srgb, ${pColor} 25%, var(--border))`,
              borderTop: `3px solid ${pColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  ✏️ Cenário B — What-If
                </div>
                {lifeEvents.filter(e => e.tipo === 'one-shot').length > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600, color: 'var(--yellow)',
                    background: 'rgba(234,179,8,.12)', border: '1px solid rgba(234,179,8,.3)',
                    borderRadius: '4px', padding: '1px 5px',
                  }}>
                    {lifeEvents.filter(e => e.tipo === 'one-shot').length} evento{lifeEvents.filter(e => e.tipo === 'one-shot').length > 1 ? 's' : ''} (−{privacyMode ? '••••' : fmtBRL(totalOneShotEventos)})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }} className="pv">
                    {resultB ? resultB.ano : '> 35a'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }} className="pv">
                    {resultB ? `${resultB.idade} anos` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: pColor }} className="pv">
                    {psucessoB != null ? `P ${psucessoB.toFixed(0)}%` : 'P —%'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
                Custo: <span className="pv">{privacyMode ? '••••' : fmtBRL(custoB)}/ano</span>
                {inssOffset > 0 && <span style={{ color: 'var(--green)' }}> (líquido: <span className="pv">{privacyMode ? '••••' : fmtBRL(custoLiquidoB)}</span>)</span>}
                {' · '}Aporte: <span className="pv">{privacyMode ? '••••' : fmtBRL(aporteB)}/mês</span>
              </div>
              {resultB && resultB.pat > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  Pat. projetado: <span className="pv">{privacyMode ? '••••' : fmtBRL(resultB.pat)}</span>
                </div>
              )}
              {resultB && resultB.pat > 0 && resultB.swrAtFire != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  SWR bruta: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{(resultB.swrAtFire * 100).toFixed(2)}%</span>
                  {inssOffset > 0 && (
                    <span> · SWR líquida: <span style={{ color: 'var(--green)', fontWeight: 600 }} className="pv">
                      {privacyMode ? '••••' : `${(custoLiquidoB / resultB.pat * 100).toFixed(2)}%`}
                    </span></span>
                  )}
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic' }}>
                Ano: determinístico · P: MC 400 sims · Desacumulação: {horizon - (resultB?.idade ?? 50)}a (até {horizon}a)
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Card Delta ── */}
      {(deltaAnos !== null || deltaP !== null) && (
        <div style={{
          background: 'var(--card2)', borderRadius: '10px', padding: '14px',
          border: '1px solid var(--border)',
          textAlign: 'center', marginBottom: '12px',
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
            Δ Impacto — B vs A
          </div>
          <div style={{
            fontSize: '1.3rem', fontWeight: 800,
            color: deltaAnos != null
              ? (deltaAnos > 0 ? 'var(--red)' : deltaAnos < 0 ? 'var(--green)' : 'var(--muted)')
              : 'var(--muted)',
          }}>
            {deltaAnos != null
              ? `${deltaAnos > 0 ? '+' : ''}${deltaAnos} ano${Math.abs(deltaAnos) !== 1 ? 's' : ''}`
              : '—'
            }
            {deltaP != null && (
              <span style={{ marginLeft: '8px', color: deltaP >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {deltaP >= 0 ? '+' : ''}{deltaP.toFixed(0)}pp de P
              </span>
            )}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            {deltaAnos != null
              ? deltaAnos > 0
                ? `Cenário B atrasa FIRE em ${deltaAnos} anos vs perfil ${PROFILE_A_MAP[profileA].label}`
                : deltaAnos < 0
                  ? `Cenário B adianta FIRE em ${Math.abs(deltaAnos)} anos vs perfil ${PROFILE_A_MAP[profileA].label}`
                  : `Mesmo ano de FIRE que perfil ${PROFILE_A_MAP[profileA].label}`
              : ''}
          </div>
          {nearestPerfil && (
            <button
              onClick={() => router.push(`/simulators?cond=${nearestPerfil.cond}&mkt=${wiPreset}`)}
              style={{
                marginTop: '10px',
                padding: '5px 14px',
                borderRadius: '6px',
                border: '1px solid var(--accent)',
                background: 'rgba(88,166,255,.08)',
                color: 'var(--accent)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Explorar no Simulador →
            </button>
          )}
        </div>
      )}

      {/* ── Floor vs Upside — Boldin style ── */}
      <div style={{ background: 'var(--card2)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '10px' }}>
          🏦 Cobertura por Camadas — Floor vs Upside
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '10px' }}>
          Separação: renda garantida (floor) vs dependente de equity (gap). Equity cobre apenas o gap.
        </div>

        {/* Stacked bar — floor | gap */}
        {(() => {
          const total = custoB > 0 ? custoB : 1;
          const floorPct = Math.min(100, (floorTotal / total) * 100);
          const gapPct = Math.max(0, 100 - floorPct);
          const coveredPct = coberturaAtual ?? 0;
          return (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ position: 'relative', height: '24px', borderRadius: '6px', overflow: 'hidden', background: 'var(--card)', display: 'flex' }}>
                <div
                  style={{ width: `${floorPct}%`, background: 'var(--accent)', transition: 'width .3s' }}
                  title={`Floor garantido: R$${(floorTotal / 1000).toFixed(0)}k`}
                />
                <div
                  style={{ width: `${gapPct * (coveredPct / 100)}%`, background: 'var(--green)', transition: 'width .3s' }}
                  title={`Gap coberto: ${coveredPct.toFixed(0)}%`}
                />
                <div
                  style={{ flex: 1, background: 'rgba(248,81,73,.25)' }}
                  title="Gap descoberto"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap', fontSize: '10px' }}>
                <span style={{ color: 'var(--accent)' }}>■ Floor garantido</span>
                <span style={{ color: 'var(--green)' }}>■ Gap coberto por patrimônio</span>
                <span style={{ color: 'var(--red)' }}>■ Gap descoberto</span>
              </div>
            </div>
          );
        })()}

        {/* 3 cards below bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Floor garantido</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }} className="pv">
              {privacyMode ? '••••' : `R$${(floorTotal / 1000).toFixed(0)}k/ano`}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
              INSS + piso RF
              {floorInss > 0 && <span style={{ color: 'var(--green)' }}> (INSS ativo)</span>}
            </div>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gap (equity)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: gapEquity > 0 ? 'var(--red)' : 'var(--green)' }} className="pv">
              {privacyMode ? '••••' : `R$${(gapEquity / 1000).toFixed(0)}k/ano`}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
              {patrimonioNecessarioGap != null
                ? <span className="pv">{privacyMode ? '••••' : `Pat. necessário: R$${(patrimonioNecessarioGap / 1000).toFixed(0)}k`}</span>
                : '—'}
            </div>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Cobertura atual</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: coberturaAtual != null && coberturaAtual >= 80 ? 'var(--green)' : coberturaAtual != null && coberturaAtual >= 50 ? 'var(--yellow)' : 'var(--red)' }} className="pv">
              {coberturaAtual != null ? `${coberturaAtual.toFixed(0)}%` : '—'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>do gap por equity</div>
          </div>
        </div>
      </div>


      {/* ── Life Events (colapsável) ── */}
      <div style={{ background: 'var(--card2)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '10px' }}>
        <button
          onClick={() => setEventsExpanded(v => !v)}
          style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', background: 'transparent', border: 'none',
            fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', cursor: 'pointer',
          }}
        >
          <span>🗓 Eventos de Vida</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            {lifeEvents.length > 0
              ? `${lifeEvents.length} evento${lifeEvents.length > 1 ? 's' : ''} · ${privacyMode ? '••••' : `−R$${(totalOneShotEventos / 1000).toFixed(0)}k one-shot`}`
              : 'Nenhum'}
            {' '}{eventsExpanded ? '▲' : '▼'}
          </span>
        </button>

        {eventsExpanded && (
          <div style={{ padding: '0 14px 14px' }}>
            {/* Eventos de referência (lumpy_events — read-only) */}
            {lumpyEventos.length > 0 && (
              <div style={{ marginBottom: '14px', padding: '10px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px' }}>
                  📋 Eventos de referência (calculados pelo modelo):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {lumpyEventos.map((evt: any) => (
                    <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text)' }}>{evt.label}</span>
                      <span>({evt.ano_inicio})</span>
                      <span style={{ color: evt.delta_pp < 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                        {evt.delta_pp > 0 ? '+' : ''}{evt.delta_pp?.toFixed(1)}pp de P
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form — adicionar evento customizado */}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px' }}>Adicionar evento customizado:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Nome</label>
                <Input
                  type="text"
                  placeholder="Ex: Trocar carro"
                  value={newEvtNome}
                  onChange={e => setNewEvtNome(e.target.value)}
                  style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>Ano</label>
                  <Input
                    type="number"
                    min={anoAtual + 1} max="2070" step="1"
                    value={newEvtAno}
                    onChange={e => setNewEvtAno(+e.target.value)}
                    style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
                    {newEvtTipo === 'recorrente' ? 'Delta anual (R$)' : 'Custo (R$)'}
                  </label>
                  <Input
                    type="number"
                    min="1" step="1000"
                    value={newEvtCusto}
                    onChange={e => setNewEvtCusto(+e.target.value)}
                    style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>
            </div>
            {/* Tipo selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Tipo:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input type="radio" name="evt-tipo" value="one-shot" checked={newEvtTipo === 'one-shot'} onChange={() => setNewEvtTipo('one-shot')} />
                One-shot (custo único)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input type="radio" name="evt-tipo" value="recorrente" checked={newEvtTipo === 'recorrente'} onChange={() => setNewEvtTipo('recorrente')} />
                Recorrente (delta custo anual)
              </label>
            </div>
            {evtError && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)', marginBottom: '6px' }}>{evtError}</div>
            )}
            <button
              onClick={handleAddEvent}
              style={{
                padding: '5px 14px', borderRadius: '6px',
                border: '1px solid var(--accent)', background: 'rgba(88,166,255,.08)',
                color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                marginBottom: lifeEvents.length > 0 ? '10px' : '0',
              }}
            >
              + Adicionar Evento
            </button>

            {/* Lista de eventos customizados */}
            {lifeEvents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                {lifeEvents.map(evt => (
                  <div key={evt.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 10px', background: 'var(--card)', borderRadius: '6px',
                    border: '1px solid var(--border)', fontSize: 'var(--text-xs)',
                  }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{evt.nome}</span>
                    <span style={{ color: 'var(--muted)' }}>{evt.ano}</span>
                    <span style={{ fontSize: '10px', color: evt.tipo === 'recorrente' ? 'var(--yellow)' : 'var(--muted)', fontStyle: 'italic' }}>
                      {evt.tipo === 'recorrente' ? '∞ rec.' : '1x'}
                    </span>
                    <span className="pv" style={{ color: 'var(--red)', fontWeight: 600 }}>
                      {privacyMode ? '••••' : `${evt.tipo === 'recorrente' ? '+' : '−'}R$${(evt.custo / 1000).toFixed(0)}k${evt.tipo === 'recorrente' ? '/ano' : ''}`}
                    </span>
                    <button
                      onClick={() => setLifeEvents(prev => prev.filter(e => e.id !== evt.id))}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 2px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {totalOneShotEventos > 0 && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' }}>
                    One-shot total: <span className="pv" style={{ color: 'var(--red)', fontWeight: 600 }}>
                      {privacyMode ? '••••' : `−R$${(totalOneShotEventos / 1000).toFixed(0)}k`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Horizonte de Desacumulação ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Horizonte desacumulação:</span>
        {[85, 90, 95, 100].map(h => (
          <button
            key={h}
            className={`seg-btn${horizon === h ? ' active' : ''}`}
            onClick={() => setHorizon(h)}
          >
            {h} anos
          </button>
        ))}
        {(() => {
          const anoFire = resultB?.ano ?? anoFireA;
          const idadeFire = resultB?.idade ?? idadeFireA;
          if (!anoFire || !idadeFire) return null;
          const anoFim = anoFire + (horizon - idadeFire);
          return (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              → até {anoFim} ({horizon - idadeFire} anos de desacumulação)
            </span>
          );
        })()}
      </div>

      <div className="src">
        Cenário A: MC precomputed — consistente com FIRE page · Cenário B: acumulação determinística + desacumulação MC 400 sims (horizonte configurável) · Life events: localStorage
      </div>
    </CollapsibleSection>
  );
}

// ── Stress Test MC ────────────────────────────────────────────────────────────

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

function StressTestSection() {
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
            Patrimônio pós-shock: <strong className="pv" style={{ color: 'var(--red)' }}>{postShock != null ? (privacyMode ? '••••' : fmtBRL(postShock)) : '—'}</strong>
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
            { label: 'Patrimônio', value: privacyMode ? '••••' : fmtBRL(patrimonio) },
            { label: 'Aporte mensal', value: aporteMensal > 0 ? (privacyMode ? '••••' : `R$${(aporteMensal / 1000).toFixed(0)}k`) : '—' },
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
              Solteiro · {privacyMode ? '••••' : `R$${(premissasST.custo_vida_base / 1000).toFixed(0)}k/ano`}
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
  );
}

// ── Calculadora de Aporte — Cascade ──────────────────────────────────────────

function CascadeSection() {
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const { privacyMode } = useUiStore();
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
  const totalBrl: number | undefined = derivePatrimonio(data);

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
            {privacyMode ? '••••' : fmtBRL(ipcaAlloc)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Tesouro IPCA+2040 via XP
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{ipcaGapBrl != null ? (privacyMode ? '••••' : fmtBRL(ipcaGapBrl)) : '—'}</span>
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
            {privacyMode ? '••••' : fmtBRL(rendaAlloc)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Renda+ 2065 via Tesouro Direto
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{rendaGapBrl != null ? (privacyMode ? '••••' : fmtBRL(rendaGapBrl)) : '—'}</span>
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
            {privacyMode ? '••••' : fmtBRL(equityAlloc)}
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
  const { data, isLoading, dataError } = usePageData();
  const runMC = useDashboardStore(s => s.runMC);

  useEffect(() => {
    if (data && !isLoading && !dataError) {
      runMC();
    }
  }, [data, isLoading, dataError, runMC]);

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data: isLoading || dataError ? null : true, // only block on loading/error, not data absence
    loadingText: 'Carregando simuladores...',
    errorPrefix: '❌ Erro ao carregar dados:',
    warningText: 'Dados não disponíveis',
  });
  if (stateEl) return stateEl;

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
