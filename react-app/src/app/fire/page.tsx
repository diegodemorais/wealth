'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { EC } from '@/utils/echarts-theme';

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

  // ── Hero banner values ──────────────────────────────────────────────────────
  const pfireHero: number | null = derived?.pfireBase ?? null; // pfireBase is 0-100 scale
  const pfireHeroColor = pfireColorFn(pfireHero);
  const prem = (data as any)?.premissas ?? {};
  const fireYearHero: number | null = (() => {
    const p0 = (data as any)?.fire_matrix?.by_profile?.[0];
    const y = p0?.fire_age_53 ?? prem.ano_cenario_base;
    return y ? parseInt(String(y), 10) : null;
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
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: pfireHeroColor, lineHeight: 1 }}>
            {pfireHero != null ? `${pfireHero.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: pfireHeroColor, fontWeight: 600, marginTop: 4 }}>
            {pfireHero != null ? (pfireHero >= 90 ? <><CheckCircle size={14} className="inline mr-1" />ON TRACK</> : pfireHero >= 85 ? <><AlertCircle size={14} className="inline mr-1" />ADEQUADO</> : <><XCircle size={14} className="inline mr-1" />ATENÇÃO</>) : ''}
          </div>
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} className="hidden sm:block" />
        {/* Data FIRE */}
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>Data FIRE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
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

      {/* P(FIRE) Distribution — Percentiles & Tail Risks */}
      <PFireDistribution
        base={pfireHero}
        percentiles={(data as any)?.pfire_base?.percentiles ?? null}
        label="P(FIRE) Distribuição Monte Carlo — Percentis"
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

      {/* Tracking FIRE — Realizado vs Projeção */}
      <section className="section" id="trackingFireSection">
        <h2>Tracking FIRE — Realizado vs Projeção</h2>
        <TrackingFireChart data={safeData} />
        <div className="src">
          Patrimônio realizado vs projeção FIRE · Meta FIRE
        </div>
      </section>

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
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '12px' }}>
              {CARDS.map(({ profile, emoji, label, cond, mkt, isAspir }) => {
                const p = (data as any)?.fire_matrix?.by_profile?.find((x: any) => x.profile === profile);
                if (!p) return null;

                // Use precomputed MC dates — consistent with P values (same MC run)
                let fireAno: number | null, fireIdade: number | null;
                let pfire: number, pfav: number, pstress: number;
                if (isAspir) {
                  const ef = (data as any)?.earliest_fire;
                  fireAno = ef?.ano ?? null;
                  fireIdade = ef?.idade ?? null;
                  pfire  = (data as any)?.pfire_aspiracional?.base  ?? p.p_fire_50;
                  pfav   = (data as any)?.pfire_aspiracional?.fav   ?? p.p_fire_50_fav;
                  pstress = (data as any)?.pfire_aspiracional?.stress ?? p.p_fire_50_stress;
                } else {
                  // Threshold scenario: earliest age where P(base) >= 85% with SWR=3% fixed
                  fireAno = p.fire_year_threshold ? parseInt(p.fire_year_threshold, 10) : null;
                  fireIdade = p.fire_age_threshold ?? null;
                  pfire  = p.p_at_threshold as number;
                  pfav   = p.p_at_threshold_fav as number;
                  pstress = p.p_at_threshold_stress as number;
                }

                const pfireColor = pfireColorFn(pfire);
                const accentColor = isAspir ? 'var(--yellow)' : 'var(--accent)';
                const href = isAspir
                  ? '/simulators?preset=aspiracional'
                  : `/simulators?cond=${cond}&mkt=${mkt}`;

                return (
                  <div key={label} style={{
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

      {/* ── Group 2: Projeções ─────────────────────────────────────────────────── */}
      <SectionDivider label="Projeções" />

      {/* Projeção de Patrimônio — P10 / P50 / P90 */}
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

      {/* FIRE Matrix — P(Sucesso até 90a) */}
      {safeData.fire_matrix && (
        <CollapsibleSection id="section-fire-matrix" title={secTitle('fire', 'fire-matrix')} defaultOpen={secOpen('fire', 'fire-matrix')}>
          <div style={{ padding: '0 16px 16px' }}>
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
      <CollapsibleSection id="section-eventos-vida" title={secTitle('fire', 'eventos-vida')} defaultOpen={secOpen('fire', 'eventos-vida')}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
            (gatilhos de recalibração)
          </div>
          <EventosVidaChart data={safeData} />
          <div className="src">
            Ao ativar qualquer evento: recalibrar custo de vida, FIRE date, seguro de vida e estrutura patrimonial imediatamente. Impacto de eventos permanentes no custo de vida.
          </div>
        </div>
      </CollapsibleSection>

      {/* Glide Path — collapsed (mecanismo de execução) */}
      <CollapsibleSection id="section-glide-path" title={secTitle('fire', 'glide-path')} defaultOpen={secOpen('fire', 'glide-path')}>
        <div style={{ padding: '0 16px 16px' }}>
          <GlidePathChart data={safeData} />
          <div className="src">
            Crypto: 3% pré e pós-FIRE. Alocações somam 100% por idade.
          </div>
        </div>
      </CollapsibleSection>

    </div>
  );
}
