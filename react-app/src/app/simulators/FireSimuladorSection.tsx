'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { calcFireYear, getAnoAtual, pfireColor as pfireColorFn } from '@/utils/fire';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { runCanonicalMC } from '@/utils/montecarlo';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

// B4: single fraction→percentage conversion — avoids scattered `* 100` throughout file
function fracToPct(v: number | undefined | null, dec = 2): number | undefined {
  if (v == null) return undefined;
  return +((v * 100).toFixed(dec));
}

// fmtPct: local wrapper — v is already in % (e.g. 4.85), not fraction
function fmtPct(v: number) {
  return `${v.toFixed(1)}%`;
}

/// Single derivation for patrimônio total financeiro — source: premissas.patrimonio_atual
function derivePatrimonio(data: unknown): number | undefined {
  return (data as any)?.premissas?.patrimonio_atual;
}

type FireCond = 'solteiro' | 'casamento' | 'filho';
type FireMkt = 'stress' | 'base' | 'fav' | 'aspiracional' | 'cambio_dinamico';

// Labels only — values are derived from data.fire_matrix.retornos_equity / perfis at runtime
const MKT_LABELS: Record<FireMkt, string> = {
  stress:          'Stress',
  base:            'Base',
  fav:             'Favorável',
  aspiracional:    '🎯 Aspiracional',
  cambio_dinamico: '★ Câmbio',
};

const COND_LABELS: Record<FireCond, string> = {
  solteiro:  'Solteiro',
  casamento: 'Casamento',
  filho:     'Filho',
};

// calcFireYear is imported from @/utils/fire (canonical, retorno always as fraction)

export function FireSimuladorSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useUiStore();

  // Derive presets from data.fire_matrix at runtime (not hardcoded)
  const fmRetornos = (data as any)?.fire_matrix?.retornos_equity ?? {};
  const fmPerfis   = (data as any)?.fire_matrix?.perfis ?? {};
  const premissas  = (data as any)?.premissas ?? {};

  const favRetorno = fracToPct(fmRetornos.fav ?? premissas.retorno_equity_base ?? 0.0585) ?? 5.85;
  const MKT_PRESETS: Record<FireMkt, { retorno: number; label: string }> = {
    stress:          { retorno: fracToPct(fmRetornos.stress ?? premissas.retorno_equity_base ?? 0.0435) ?? 4.35, label: MKT_LABELS.stress },
    base:            { retorno: fracToPct(fmRetornos.base   ?? premissas.retorno_equity_base ?? 0.0485) ?? 4.85, label: MKT_LABELS.base },
    fav:             { retorno: favRetorno, label: MKT_LABELS.fav },
    // Aspiracional: mesmo retorno que Favorável + aporte elevado (handler dedicado)
    aspiracional:    { retorno: favRetorno, label: MKT_LABELS.aspiracional },
    // Câmbio Dinâmico: r_USD base (sem dep_BRL embutida) — dep vem do fxRegime=true
    cambio_dinamico: { retorno: fracToPct(fmRetornos.base   ?? premissas.retorno_equity_base ?? 0.0485) ?? 4.85, label: MKT_LABELS.cambio_dinamico },
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
  // G12: IPCA+ rate slider — default from dca_status.ipca_longo (current) or 6.5%
  const [ipcaTaxa, setIpcaTaxa] = useState<number>(6.5);
  const dataInitialized = useRef(false);

  // Derive values from data once loaded (only if user hasn't interacted)
  useEffect(() => {
    if (data && !dataInitialized.current && !custom) {
      dataInitialized.current = true;
      if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
      if (premissas.retorno_equity_base != null) setRetorno(fracToPct(premissas.retorno_equity_base));
      const custoInicial = fmPerfis.atual?.gasto_anual ?? premissas.custo_vida_base;
      if (custoInicial != null) setCusto(custoInicial);
      // G12: init IPCA+ slider from current rate or dca_status
      const taxaAtual: number | null = (data as any)?.rf?.ipca2040?.taxa ?? (data as any)?.dca_status?.ipca_longo?.taxa_atual ?? null;
      if (taxaAtual != null) setIpcaTaxa(Math.round(taxaAtual * 10) / 10);
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
        const aspiracionalAporte = premissas.aporte_mensal_aspiracional ?? premissas.aporte_mensal;
        if (aspiracionalAporte != null) setAporte(aspiracionalAporte);
        setRetorno(favRetorno);
        setFireMkt('aspiracional');
        setCustom(false);
        // fireCond preservado: aspiracional é independente do perfil familiar
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

  // P(quality) color helper (verde >=70, amarelo 55-70, vermelho <55)
  const pqualityColor = (v: number | null | undefined): string => {
    if (v == null) return 'var(--muted)';
    if (v >= 70) return 'var(--green)';
    if (v >= 55) return 'var(--yellow)';
    return 'var(--red)';
  };
  const byProfileForQuality: any[] = (data as any)?.fire_matrix?.by_profile ?? [];
  // P(quality) by profile key — maps fireCond → profile key
  const profileKeyForCond: Record<string, string> = { solteiro: 'atual', casamento: 'casado', filho: 'filho' };

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
    // Sair do modo aspiracional ao trocar perfil — condição afeta spending, não mkt
    if (fireMkt === 'aspiracional') {
      setFireMkt('base');
      setRetorno(MKT_PRESETS.base.retorno);
    }
    setCustom(false);
  };

  // Exclui 'aspiracional' — tem handler dedicado (setFire50Preset)
  const setMktPreset = (m: Exclude<FireMkt, 'aspiracional'>) => {
    setFireMkt(m);
    const v = MKT_PRESETS[m].retorno;
    if (v != null) setRetorno(v);
    if (premissas.aporte_mensal != null) setAporte(premissas.aporte_mensal);
    setCustom(false);
  };

  // Aspiracional: apenas mkt + aporte; perfil familiar preservado
  const setFire50Preset = () => {
    setFireMkt('aspiracional');
    const aspiracionalAporte = premissas.aporte_mensal_aspiracional ?? premissas.aporte_mensal;
    if (aspiracionalAporte != null) setAporte(aspiracionalAporte);
    setRetorno(MKT_PRESETS.aspiracional.retorno);
    setCustom(false);
  };

  const onSliderChange = () => setCustom(true);

  // ── Result: precomputed MC (preset mode) or deterministic (custom/slider mode) ──
  // Precomputed MC data — consistent with FIRE page
  const byProfile: any[] = (data as any)?.fire_matrix?.by_profile ?? [];
  const profileKey: Record<FireCond, string> = { solteiro: 'atual', casamento: 'casado', filho: 'filho' };
  const earliestFire = (data as any)?.earliest_fire ?? null;
  const isCambioDinamico = fireMkt === 'cambio_dinamico';
  const isAspirPreset = !custom && fireMkt === 'aspiracional';

  // Preset mode indicator: any slider movement (custom=true) exits preset mode.
  // Bug 2026-05-01: previously `!custom || retornoMatchesPreset` — when retorno
  // happened to match a preset value (e.g. after clicking Aspiracional), aporte
  // and custo sliders silently kept preset MC results, ignoring user input.
  // Diego report: "sliders param de funcionar". Root cause: aporte/custo changes
  // set custom=true but retorno still matched preset → isPresetMode stayed true →
  // result branched into precomputed by_profile threshold, ignoring slider deltas.
  // Fix: any user interaction (custom=true) → deterministic calc with current sliders.
  const isPresetMode = !custom;

  // P(FIRE) com Câmbio Dinâmico — computa ao vivo quando botão ativo (DEV-mc-regime-switching-fx)
  const pfireCambio = useMemo(() => {
    const isCambio = fireMkt === 'cambio_dinamico';
    if (!isCambio || !patrimonio || !currentAge) return null;
    const swrGatilhoFrac = swrTarget ?? 0.03;
    const custoAtual = custo ?? premissas.custo_vida_base ?? 250000;
    const metaFireVal = custoAtual / swrGatilhoFrac;
    const idadeFire = premissas.idade_cenario_base ?? 53;
    const mesesFire = (idadeFire - currentAge) * 12;
    if (mesesFire <= 0) return null;
    const r_USD = (fmRetornos.base ?? premissas.retorno_equity_base ?? 0.0485) as number;
    const result = runCanonicalMC({
      P0: patrimonio, r_anual: r_USD, sigma_anual: 0.168,
      aporte_mensal: aporte ?? premissas.aporte_mensal ?? 25000,
      meses: mesesFire, N: 1_000, seed: 42,
      metaFire: metaFireVal, fxRegime: true,
    });
    return result.pFire;  // Return 0-1, canonicalize at display time
  }, [isCambioDinamico, patrimonio, currentAge, custo, aporte]); // eslint-disable-line react-hooks/exhaustive-deps

  type FireResult = { ano: number; idade: number; pat: number; swrAtFire: number };
  let result: FireResult | null = null;
  let firePire: number | null = null;

  if (isPresetMode) {
    // Preset mode: use pré-computed data
    if (isAspirPreset) {
      // Aspiracional: use earliest_fire + scenario_comparison.aspiracional para pat/swr
      if (earliestFire) {
        const aspirScenario = (data as any)?.scenario_comparison?.aspiracional;
        result = {
          ano: earliestFire.ano,
          idade: earliestFire.idade,
          pat: aspirScenario?.pat_mediano ?? 0,
          swrAtFire: aspirScenario?.swr ?? 0,
        };
        firePire = (data as any)?.pfire_aspiracional?.base ?? earliestFire.pfire ?? null;
      }
    } else if (isCambioDinamico) {
      // Câmbio Dinâmico: FIRE year from base preset, P(FIRE) from fxRegime MC
      const p = byProfile.find((x: any) => x.profile === profileKey[fireCond]);
      if (p?.fire_year_threshold) {
        result = {
          ano: parseInt(p.fire_year_threshold, 10),
          idade: p.fire_age_threshold,
          pat: p.pat_mediano_threshold ?? 0,
          swrAtFire: p.swr_at_fire ?? 0,
        };
        firePire = pfireCambio;  // computed by fxRegime MC above
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
      } else if (aporte !== undefined && retorno !== undefined && custo !== undefined &&
                 currentAge !== undefined && patrimonio !== undefined && swrTarget !== undefined) {
        result = calcFireYear(aporte, retorno / 100, custo, currentAge, getAnoAtual(premissas), patrimonio, swrTarget);
        firePire = fireMkt === 'fav'    ? ((data as any)?.pfire_aspiracional?.base ?? null)
                 : fireMkt === 'stress' ? ((data as any)?.pfire_base?.stress ?? null)
                 : ((data as any)?.pfire_base?.base ?? null);
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

  // P(quality) — lookup pré-computado de by_profile (FR-pquality-recalibration 2026-04-29)
  let pqualitySim: number | null = null;
  if (isPresetMode && !isCambioDinamico) {
    if (isAspirPreset) {
      pqualitySim = (data as any)?.fire?.p_quality_aspiracional ?? null;
    } else {
      const pqProf = byProfileForQuality.find((x: any) => x.profile === profileKeyForCond[fireCond]);
      pqualitySim = pqProf?.p_quality ?? null;
    }
  } else {
    pqualitySim = (data as any)?.fire?.p_quality ?? null;
  }

  // SWR líquida (only meaningful in custom mode when pat is known)
  const swrLiquidaSimple = (result && result.pat > 0 && custoLiquido != null) ? ((custoLiquido / result.pat) * 100).toFixed(2) : null;

  // Timeline: age range hoje..70
  const timelineMin = currentAge ?? 0;
  const timelineMax = 70;
  const fireAge = result?.idade ?? timelineMax;
  const timelinePct = timelineMin < timelineMax
    ? Math.min(100, Math.max(0, ((fireAge - timelineMin) / (timelineMax - timelineMin)) * 100))
    : 0;

  return (
    <div data-testid="calc-aporte" className="section section-critical" style={{ marginBottom: '16px' }}>
      <h2>Simulador FIRE — Aposentadoria Antecipada</h2>

      {/* Resultado principal */}
      {(() => {
        const pfireSemaforo = firePire;
        const pfireCardColor = pfireColorFn(pfireSemaforo);
        const semaforo = pfireSemaforo == null ? null
          : pfireSemaforo < 70  ? { label: <><AlertTriangle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Risco Alto</>, color: 'var(--red)' }
          : pfireSemaforo < 85  ? { label: <><AlertTriangle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Atenção</>,   color: 'var(--yellow)' }
          : { label: <><CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Seguro</>, color: 'var(--green)' };
        return (
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-center" style={{
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
          <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }} className="pv" data-testid="sim-fire-year">
            {result ? result.ano : '—'}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0' }} className="pv">
            {result ? `${result.idade} anos` : '—'}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: pfireCardColor }} className="pv" data-testid="sim-pfire">
            {firePire !== null ? `P = ${firePire}%` : 'P = —%'}
          </div>
          {pqualitySim != null && (
            <div data-testid="sim-pquality" style={{ marginTop: '4px', fontSize: '0.85rem', fontWeight: 600, color: pqualityColor(pqualitySim) }}>
              quality {pqualitySim.toFixed(1)}%
            </div>
          )}
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
              {swrBrutaPct ? <><CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> SWR bruta {swrBrutaPct}%</> : ''}{swrLiquidaSimple ? ` · líquida c/INSS ${swrLiquidaSimple}%` : ''}
            </div>
          )}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }} className="pv">
            {result ? (result.idade < 50 ? `${50 - result.idade} anos antes da meta` : result.idade === 50 ? 'na meta' : `${result.idade - 50} anos após meta`) : '—'}
          </div>
        </div>
        <div>
          {/* 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ marginBottom: '10px' }}>
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
              <div style={{ fontSize: '1rem', fontWeight: 700 }} className="pv" data-testid="sim-patrimonio">
                {result && result.pat > 0 ? (fmtPrivacy(result.pat, privacyMode)) : '—'}
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
            {(['stress', 'base', 'fav'] as Exclude<FireMkt, 'aspiracional' | 'cambio_dinamico'>[]).map(m => (
              <button
                key={m}
                className={`seg-btn${isPresetMode && fireMkt === m ? ' active' : ''}`}
                onClick={() => setMktPreset(m)}
              >
                {MKT_PRESETS[m].label}
              </button>
            ))}
          </div>
          <button
            className={`seg-btn${isAspirPreset ? ' active' : ''}`}
            style={{ borderRadius: '6px', border: `1px dashed ${isAspirPreset ? 'var(--accent)' : 'var(--border)'}`, background: isAspirPreset ? 'rgba(99,179,237,.08)' : 'transparent' }}
            onClick={setFire50Preset}
          >
            🎯 Aspiracional
          </button>
          <button
            className="seg-btn"
            style={{ borderRadius: '6px', border: `1px dashed var(--accent)`, background: isCambioDinamico ? 'rgba(99,179,237,.12)' : 'transparent', color: isCambioDinamico ? 'var(--accent)' : undefined }}
            onClick={() => setMktPreset('cambio_dinamico')}
            title="Markov Regime Switching FX: crises cambiais episódicas (17% freq, 35%/a)"
          >
            ★ Câmbio
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
        <div className="slider-row">
          <label>
            <span>Aporte Mensal</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">{aporte != null ? (fmtPrivacy(aporte, privacyMode)) : '—'}</span>
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
            <span style={{ fontWeight: 700, color: 'var(--muted)' }} className="pv">{custo != null ? (fmtPrivacy(custo, privacyMode)) : '—'}</span>
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

      {/* G12: IPCA+ Taxa slider — sensibilidade estimada via pfire_sensitivity */}
      {(() => {
        const sens: Array<Record<string, unknown>> = (data as any)?.pfire_sensitivity ?? [];
        const rfRow = sens.find(r => String(r.variable ?? '').toLowerCase().includes('taxa rf') || String(r.variable ?? '').toLowerCase().includes('ipca'));
        // Linear interpolation: use sensitivity delta if available, else ~2pp per 0.5pp change
        const baseRfTaxa: number = (data as any)?.rf?.ipca2040?.taxa ?? 6.5;
        const pfireBaseVal: number = (data as any)?.pfire_base?.base ?? 0;
        // Delta per pp from sensitivity row — stress = base - stressado (negative); fallback 2pp/0.5pp
        const deltaPerPp: number = rfRow?.delta_pp != null
          ? -(rfRow.delta_pp as number) / ((parseFloat(String(rfRow.base_value)) - parseFloat(String(rfRow.stressed_value))) || 1)
          : -4;  // conservative: -4pp P(FIRE) per -1pp taxa RF
        const taxaDelta = ipcaTaxa - baseRfTaxa;
        const pfireEstimado = pfireBaseVal > 0 ? pfireBaseVal + taxaDelta * deltaPerPp : null;
        const pfireColor = pfireEstimado == null ? 'var(--muted)'
          : pfireEstimado >= 85 ? 'var(--green)'
          : pfireEstimado >= 75 ? 'var(--yellow)'
          : 'var(--red)';
        const gatilho: number = (data as any)?.pisos?.pisoTaxaIpcaLongo ?? 6.0;
        return (
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                IPCA+ Taxa Atual (RF)
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: ipcaTaxa >= gatilho ? 'var(--green)' : 'var(--yellow)' }}>
                {ipcaTaxa.toFixed(1)}%
                {ipcaTaxa >= gatilho
                  ? <span style={{ fontWeight: 400, color: 'var(--green)', marginLeft: 6, fontSize: 'var(--text-xs)' }}>✓ acima do gatilho DCA ({gatilho}%)</span>
                  : <span style={{ fontWeight: 400, color: 'var(--yellow)', marginLeft: 6, fontSize: 'var(--text-xs)' }}>⚠ abaixo do gatilho DCA ({gatilho}%)</span>
                }
              </span>
            </div>
            <input
              type="range" min="4.0" max="8.0" step="0.1"
              value={ipcaTaxa}
              style={{ width: '100%' }}
              onChange={e => setIpcaTaxa(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
              <span>4.0%</span><span>8.0%</span>
            </div>
            {pfireEstimado != null && !privacyMode && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', gap: 12 }}>
                <span>P(FIRE) estimado: <strong style={{ color: pfireColor }}>{pfireEstimado.toFixed(1)}%</strong></span>
                {taxaDelta !== 0 && (
                  <span>Δ taxa: <strong style={{ color: taxaDelta > 0 ? 'var(--green)' : 'var(--yellow)' }}>{taxaDelta >= 0 ? '+' : ''}{taxaDelta.toFixed(1)}pp</strong></span>
                )}
                <span style={{ opacity: 0.7 }}>* heurístico (Pfau 2012)</span>
              </div>
            )}
          </div>
        );
      })()}

      <div className="src">
        {isPresetMode
          ? isAspirPreset
            ? 'Cenário aspiracional pré-computado (pipeline): FIRE 49 anos · aporte elevado · mercado favorável · resultado independe do perfil selecionado.'
            : 'Modo preset: dados MC pré-calculados (consistente com FIRE page). Mova um slider para modo interativo.'
          : `Modo interativo: simulação determinística · SWR ≤ ${swrTarget != null ? `${(swrTarget * 100).toFixed(1)}%` : '—'} · retorno ${retorno != null ? `${retorno.toFixed(2)}%` : '—'} diferente do preset`}
      </div>
    </div>
  );
}
