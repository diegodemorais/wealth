'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { HORIZONTE_VIDA, pfireColor as pfireColorFn, getAnoAtual } from '@/utils/fire';
import { Input } from '@/components/ui/input';
import { useUiStore } from '@/store/uiStore';
import { ScenarioBadge } from '@/components/primitives/ScenarioBadge';
import { fmtPrivacy } from '@/utils/privacyTransform';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _useCallback = useCallback; // referenced to satisfy lint

/// Single derivation for patrimônio total financeiro — source: premissas.patrimonio_atual
function derivePatrimonio(data: unknown): number | undefined {
  return (data as any)?.premissas?.patrimonio_atual;
}

type WiPreset = 'stress' | 'base' | 'fav';
type WiProfileA = 'solteiro' | 'casado' | 'filho';

interface LifeEvent {
  id: string;
  nome: string;
  ano: number;
  custo: number;
  tipo: 'one-shot' | 'recorrente';
  categoria: 'despesa' | 'receita';
}

export function WhatIfSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useUiStore();
  const router = useRouter();
  const [wiPreset, setWiPreset] = useState<WiPreset>('base');
  const [profileA, setProfileA] = useState<WiProfileA>('solteiro');
  const [custoBInit, setCustoBInit] = useState<boolean>(false);
  const [custoB, setCustoB] = useState<number>(250000);
  const [aporteB, setAporteB] = useState<number>(25000);
  const [inssToggle, setInssToggle] = useState({ diego: false, katia: false });
  const [horizon, setHorizon] = useState<number>(HORIZONTE_VIDA);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  useEffect(() => {
    try { setLifeEvents(JSON.parse(window.localStorage.getItem('wealth-life-events-v2') ?? '[]')); }
    catch { /* ignore */ }
  }, []);
  const [newEvtNome, setNewEvtNome] = useState('');
  const [newEvtAno, setNewEvtAno] = useState<number>(new Date().getFullYear() + 5);
  const [newEvtCusto, setNewEvtCusto] = useState<number>(50000);
  const [newEvtTipo, setNewEvtTipo] = useState<'one-shot' | 'recorrente'>('one-shot');
  const [newEvtCategoria, setNewEvtCategoria] = useState<'despesa' | 'receita'>('despesa');
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
    stress: { label: 'Stress',    retorno: fmRetornos.stress, swrFrac: swrPerc.swr_p10 },
    base:   { label: 'Base',      retorno: fmRetornos.base,   swrFrac: swrPerc.swr_p50 },
    fav:    { label: 'Favorável', retorno: fmRetornos.fav,    swrFrac: swrPerc.swr_p90 },
  };

  const PROFILE_A_MAP: Record<WiProfileA, { label: string; byProfileKey: string; perfilKey: string }> = {
    solteiro: { label: 'Solteiro', byProfileKey: 'atual',  perfilKey: 'atual'  },
    casado:   { label: 'Casado',   byProfileKey: 'casado', perfilKey: 'casado' },
    filho:    { label: 'Filho+Escola', byProfileKey: 'filho', perfilKey: 'filho' },
  };

  // Cenário A — mesma metodologia que B: acumulação determinística + MC inline desacumulação
  // Inputs fixos do perfil selecionado; sem life events (é a referência, não o what-if)
  const byProfileA = byProfile.find((x: any) => x.profile === PROFILE_A_MAP[profileA].byProfileKey);
  const custoA: number = fmPerfisWI?.[PROFILE_A_MAP[profileA].perfilKey]?.gasto_anual
    ?? byProfileA?.gasto_anual
    ?? premissasWI?.custo_vida_base ?? 250000;
  const aporteA: number = premissasWI?.aporte_mensal ?? 25000;

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

  // ── MC desacumulação inline — compartilhado por A e B ───────────────────────
  // Recebe patrimônio no FIRE, custo anual, retorno (fração), vol, horizonte
  // Retorna P(sucesso) em %; seed determinístico (mesmo params = mesmo resultado)
  // DEV-mc-canonico: lognormal GBM anual com Ito correction; N=1000; sigma fallback=0.168
  function runMCDecum(pat0: number, withdrawal: number, retFrac: number, sigmaAnual: number, yearsDecum: number): number {
    const sigma = sigmaAnual ?? 0.168;
    // Lognormal annual params with Ito correction
    const sigma_log = Math.sqrt(Math.log(1 + sigma ** 2 / (1 + retFrac) ** 2));
    const mu_anual = Math.log(1 + retFrac) - 0.5 * sigma_log * sigma_log;

    const seedBase = (Math.round(pat0 / 10000) * 31 + yearsDecum * 17 + Math.round(withdrawal / 1000) * 7) >>> 0;
    let s = seedBase || 1;
    // LCG rand for deterministic seed (no external dep in inline function)
    const rand = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const randn = () => {
      let u = 0, v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    let successes = 0;
    const numSims = 1000;  // N=400→1000 (DEV-mc-canonico: IC ±6pp → ±3pp)
    for (let sim = 0; sim < numSims; sim++) {
      let pat = pat0;
      let alive = true;
      for (let yr = 0; yr < yearsDecum; yr++) {
        const z = randn();
        // Lognormal annual return with Ito correction
        const ret = Math.exp(mu_anual + sigma_log * z) - 1;
        pat = pat * (1 + ret) - withdrawal;
        if (pat <= 0) { alive = false; break; }
      }
      if (alive) successes++;
    }
    return (successes / numSims) * 100;
  }

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
    // Correct monthly rate: geometric compounding (not linear r/12)
    const r_m = Math.pow(1 + retornoFrac, 1 / 12) - 1;
    for (let yr = 0; yr <= HORIZONTE_VIDA - age; yr++) {
      // one-shot events: subtract (despesa) or add (receita) at specific year
      for (const evt of events) {
        if (evt.tipo === 'one-shot' && evt.ano === ano + yr) {
          const sign = (evt.categoria ?? 'despesa') === 'receita' ? -1 : 1;
          pat = Math.max(0, pat - sign * evt.custo);
        }
      }
      // recorrente: despesa adds to spending, receita reduces it
      const recorrenteDelta = events
        .filter(e => e.tipo === 'recorrente' && e.ano <= ano + yr)
        .reduce((sum, e) => sum + ((e.categoria ?? 'despesa') === 'receita' ? -e.custo : e.custo), 0);
      const custoEfetivo = custo + recorrenteDelta;
      const targetEfetivo = custoEfetivo / swr;
      if (pat >= targetEfetivo) {
        return { ano: ano + yr, idade: age + yr, pat, swrAtFire: custoEfetivo / pat };
      }
      for (let m = 0; m < 12; m++) {
        pat = pat * (1 + r_m) + aporte;
      }
    }
    return null;
  }

  // ── Cenário A (perfil fixo, sem life events) — mesma engine que B ────────────
  const resultA = useMemo(() => {
    if (patrimonio == null || swrTarget == null || !preset.retorno) return null;
    return calcWithEvents(aporteA, preset.retorno, custoA, currentAge, anoAtual, patrimonio, swrTarget, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrimonio, swrTarget, preset.retorno, aporteA, custoA, currentAge, anoAtual]);

  const psucessoA: number | null = useMemo(() => {
    if (!resultA || resultA.pat <= 0) return null;
    const yearsDecum = horizon - resultA.idade;
    if (yearsDecum <= 0) return null;
    return runMCDecum(resultA.pat, custoA, preset.retorno ?? 0.0485, premissasWI?.volatilidade_equity ?? 0.168, yearsDecum);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultA, horizon, custoA, preset.retorno, premissasWI?.volatilidade_equity]);

  // ── Cenário B (editável + life events) ───────────────────────────────────────
  const resultB = useMemo(() => {
    if (patrimonio == null || swrTarget == null || !preset.retorno) return null;
    return calcWithEvents(aporteB, preset.retorno, custoLiquidoB, currentAge, anoAtual, patrimonio, swrTarget, lifeEvents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrimonio, swrTarget, preset.retorno, aporteB, custoLiquidoB, currentAge, anoAtual, lifeEvents]);

  const psucessoB: number | null = useMemo(() => {
    if (!resultB || resultB.pat <= 0) return null;
    const yearsDecum = horizon - resultB.idade;
    if (yearsDecum <= 0) return null;
    return runMCDecum(resultB.pat, custoLiquidoB, preset.retorno ?? 0.0485, premissasWI?.volatilidade_equity ?? 0.168, yearsDecum);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultB, horizon, custoLiquidoB, preset.retorno, premissasWI?.volatilidade_equity]);

  // ── Delta ─────────────────────────────────────────────────────────────────────
  // Ambos A e B usam a mesma metodologia: acumulação determinística + MC inline desacumulação
  // A = perfil fixo (custo+aporte do perfil selecionado, sem life events)
  // B = what-if editável (sliders livres + life events)
  const deltaAnos = (resultA && resultB) ? (resultB.idade - resultA.idade) : null;
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
    if (newEvtCusto <= 0) { setEvtError('Valor deve ser maior que 0'); return; }
    setEvtError('');
    setLifeEvents(prev => [...prev, {
      id: `${Date.now()}`,
      nome: newEvtNome.trim(),
      ano: newEvtAno,
      custo: newEvtCusto,
      tipo: newEvtTipo,
      categoria: newEvtCategoria,
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
    <CollapsibleSection id="sim-whatif" title={secTitle('assumptions', 'what-if', 'What-If Scenarios — Impacto de Decisões de Vida')} defaultOpen={secOpen('assumptions', 'what-if', false)}>

      {/* Scenario badge — shows active profile A + custo B */}
      <div style={{ paddingLeft: 16, paddingTop: 8 }}>
        <ScenarioBadge label={PROFILE_A_MAP[profileA].label} gasto={custoB} privacyMode={privacyMode} />
      </div>

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
              {fmtPrivacy(custoB / 1000, privacyMode) + '/ano'}
            </span>
          </label>
          <input
            type="range" min="150000" max="500000" step="10000" value={custoB}
            onChange={e => setCustoB(+e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>{privacyMode ? 'R$ ••••' : 'R$150k'}</span><span>{privacyMode ? 'R$ ••••' : 'R$500k'}</span>
          </div>
        </div>
        <div className="slider-row">
          <label>
            <span>✏️ Aporte Cenário B /mês</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }} className="pv">
              {fmtPrivacy(aporteB / 1000, privacyMode) + '/mês'}
            </span>
          </label>
          <input
            type="range" min="5000" max="60000" step="1000" value={aporteB}
            onChange={e => setAporteB(+e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>{privacyMode ? 'R$ ••••' : 'R$5k'}</span><span>{privacyMode ? 'R$ ••••' : 'R$60k'}</span>
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
          <span>Diego — <span className="pv">{fmtPrivacy(inssAnualDiego / 1000, privacyMode) + '/ano'}</span></span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inssToggle.katia}
            onChange={e => setInssToggle(v => ({ ...v, katia: e.target.checked }))}
          />
          <span>Katia — <span className="pv">{fmtPrivacy(inssAnualKatia / 1000, privacyMode) + '/ano'}</span></span>
        </label>
        {inssOffset > 0 && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)', fontWeight: 600, alignSelf: 'center' }} className="pv">
            {`→ Custo líquido B: ${fmtPrivacy(custoLiquidoB, privacyMode)}/ano`}
          </span>
        )}
      </div>

      {/* ── Nota de metodologia ── */}
      <div style={{ fontSize: '10px', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '8px', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        ⓘ A e B: mesma engine — acumulação determinística ({((preset.retorno ?? 0.0485) * 100).toFixed(2)}% fixo) + MC desacumulação 400 sims. <strong style={{ color: 'var(--text)' }}>O que importa é o Δ entre eles</strong>. Aba FIRE usa MC completo (acumulação estocástica + bond pool + spending smile) → P tende a diferir. Card A mostra também P do MC completo para referência.
      </div>

      {/* ── Comparador A/B ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Card A — perfil fixo, mesma engine que B */}
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
                    {resultA ? resultA.ano : '—'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }} className="pv">
                    {resultA ? `${resultA.idade} anos` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: pColor }} className="pv">
                    {psucessoA != null ? `P(FIRE) ${psucessoA.toFixed(0)}%` : 'P —%'}
                  </div>
                  {byProfileA?.p_at_threshold != null && (
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                      MC completo: {(byProfileA.p_at_threshold * 100).toFixed(0)}%
                    </div>
                  )}
                  {/* P(quality) precomputado por perfil — FR-pquality-recalibration */}
                  {byProfileA?.p_quality != null && (
                    <div data-testid="whatif-pquality-a" style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px', color: (() => { const v = byProfileA.p_quality as number; return v >= 70 ? 'var(--green)' : v >= 55 ? 'var(--yellow)' : 'var(--red)'; })() }}>
                      P(qualidade): {privacyMode ? '••%' : `${(byProfileA.p_quality as number).toFixed(1)}%`}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
                Custo: <span className="pv">{fmtPrivacy(custoA, privacyMode)}/ano</span>
                {' · '}Aporte: <span className="pv">{fmtPrivacy(aporteA, privacyMode)}/mês</span>
              </div>
              {resultA && resultA.pat > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  Pat. projetado: <span className="pv">{fmtPrivacy(resultA.pat, privacyMode)}</span>
                </div>
              )}
              {resultA && resultA.swrAtFire != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  SWR bruta: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{(resultA.swrAtFire * 100).toFixed(2)}%</span>
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '6px', fontStyle: 'italic' }}>
                Perfil fixo · sem eventos · {horizon - (resultA?.idade ?? 50)}a desacumulação (até {horizon}a)
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
                    {lifeEvents.filter(e => e.tipo === 'one-shot').length} evento{lifeEvents.filter(e => e.tipo === 'one-shot').length > 1 ? 's' : ''} (−{fmtPrivacy(totalOneShotEventos, privacyMode)})
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
                    {psucessoB != null ? `P(FIRE) ${psucessoB.toFixed(0)}%` : 'P —%'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
                Custo: <span className="pv">{fmtPrivacy(custoB, privacyMode)}/ano</span>
                {inssOffset > 0 && <span style={{ color: 'var(--green)' }}> (líquido: <span className="pv">{fmtPrivacy(custoLiquidoB, privacyMode)}</span>)</span>}
                {' · '}Aporte: <span className="pv">{fmtPrivacy(aporteB, privacyMode)}/mês</span>
              </div>
              {resultB && resultB.pat > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  Pat. projetado: <span className="pv">{fmtPrivacy(resultB.pat, privacyMode)}</span>
                </div>
              )}
              {resultB && resultB.pat > 0 && resultB.swrAtFire != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  SWR bruta: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{(resultB.swrAtFire * 100).toFixed(2)}%</span>
                  {inssOffset > 0 && (
                    <span> · SWR líquida: <span style={{ color: 'var(--green)', fontWeight: 600 }} className="pv">
                      {`${(custoLiquidoB / resultB.pat * 100).toFixed(2)}%`}
                    </span></span>
                  )}
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic' }}>
                Editável via sliders · {lifeEvents.length > 0 ? `${lifeEvents.length} evento(s) · ` : ''}desacumulação {horizon - (resultB?.idade ?? 50)}a (até {horizon}a)
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Card Delta ── */}
      {(deltaAnos !== null || deltaP !== null) && (
        <div style={{
          background: 'var(--card2)', borderRadius: '10px', padding: '14px',
          border: `2px solid ${deltaAnos != null ? (deltaAnos > 0 ? 'var(--red)' : deltaAnos < 0 ? 'var(--green)' : 'var(--border)') : 'var(--border)'}`,
          textAlign: 'center', marginBottom: '12px',
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
            Δ Impacto — B vs A
          </div>
          <div style={{
            fontSize: '1.6rem', fontWeight: 800,
            color: deltaAnos != null
              ? (deltaAnos > 0 ? 'var(--red)' : deltaAnos < 0 ? 'var(--green)' : 'var(--muted)')
              : 'var(--muted)',
          }}>
            {deltaAnos != null
              ? `${deltaAnos > 0 ? '+' : ''}${deltaAnos} ano${Math.abs(deltaAnos) !== 1 ? 's' : ''}`
              : '—'
            }
            {deltaP != null && (
              <span style={{ marginLeft: '10px', fontSize: '1.1rem', color: deltaP >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {deltaP >= 0 ? '+' : ''}{deltaP.toFixed(0)}pp P(FIRE)
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
              onClick={() => router.push(`/assumptions?cond=${nearestPerfil.cond}&mkt=${wiPreset}`)}
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
                  title={privacyMode ? 'Floor garantido: R$ ••••' : `Floor garantido: R$${(floorTotal / 1000).toFixed(0)}k`}
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
              {fmtPrivacy(floorTotal / 1000, privacyMode) + '/ano'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
              INSS + piso RF
              {floorInss > 0 && <span style={{ color: 'var(--green)' }}> (INSS ativo)</span>}
            </div>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gap (equity)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: gapEquity > 0 ? 'var(--red)' : 'var(--green)' }} className="pv">
              {fmtPrivacy(gapEquity / 1000, privacyMode) + '/ano'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
              {patrimonioNecessarioGap != null
                ? <span className="pv">{`Pat. necessário: ${fmtPrivacy(patrimonioNecessarioGap, privacyMode)}`}</span>
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
              ? `${lifeEvents.length} evento${lifeEvents.length > 1 ? 's' : ''} · ${fmtPrivacy(totalOneShotEventos, privacyMode) + ' one-shot'}`
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
            {/* Categoria selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Categoria:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input type="radio" name="evt-categoria" value="despesa" checked={newEvtCategoria === 'despesa'} onChange={() => setNewEvtCategoria('despesa')} />
                <span style={{ color: '#dc2626' }}>Despesa</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input type="radio" name="evt-categoria" value="receita" checked={newEvtCategoria === 'receita'} onChange={() => setNewEvtCategoria('receita')} />
                <span style={{ color: '#16a34a' }}>Receita</span>
              </label>
            </div>
            {/* Tipo selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Tipo:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input type="radio" name="evt-tipo" value="one-shot" checked={newEvtTipo === 'one-shot'} onChange={() => setNewEvtTipo('one-shot')} />
                {newEvtCategoria === 'receita' ? 'One-shot (entrada única)' : 'One-shot (custo único)'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <input type="radio" name="evt-tipo" value="recorrente" checked={newEvtTipo === 'recorrente'} onChange={() => setNewEvtTipo('recorrente')} />
                {newEvtCategoria === 'receita' ? 'Recorrente (renda anual)' : 'Recorrente (delta custo anual)'}
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
                    <span className="pv" style={{ color: (evt.categoria ?? 'despesa') === 'receita' ? '#16a34a' : 'var(--red)', fontWeight: 600 }}>
                      {`${(evt.categoria ?? 'despesa') === 'receita' ? '+' : '−'}${fmtPrivacy(evt.custo, privacyMode)}${evt.tipo === 'recorrente' ? '/ano' : ''}`}
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
                      {fmtPrivacy(totalOneShotEventos, privacyMode)}
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
          const anoFire = resultB?.ano ?? resultA?.ano;
          const idadeFire = resultB?.idade ?? resultA?.idade;
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
        Cenário A: perfil fixo sem eventos · Cenário B: acumulação determinística + desacumulação MC 400 sims · Life events: persistência local
      </div>
    </CollapsibleSection>
  );
}
