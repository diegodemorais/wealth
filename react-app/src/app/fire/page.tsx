'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { pfireColor as pfireColorFn } from '@/utils/fire';
import { FIRE_RULES } from '@/config/business-rules';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { ScenarioBadge } from '@/components/primitives/ScenarioBadge';
import { AlertTriangle } from 'lucide-react';
import { TrackingFireChart } from '@/components/charts/TrackingFireChart';
import { NetWorthProjectionChart } from '@/components/charts/NetWorthProjectionChart';
import { GlidePathChart } from '@/components/charts/GlidePathChart';
import { SequenceOfReturnsRisk } from '@/components/fire/SequenceOfReturnsRisk';
import { FireMatrixTable } from '@/components/dashboard/FireMatrixTable';
import { EventosVidaChart } from '@/components/charts/EventosVidaChart';
import { BalancoHolistico } from '@/components/holistic/BalancoHolistico';
import { HumanCapitalCrossover } from '@/components/dashboard/HumanCapitalCrossover';
import { PFireDistribution } from '@/components/fire/PFireDistribution';
import { PQualityMatrix } from '@/components/fire/PQualityMatrix';
import { ScenarioCompareCards } from '@/components/fire/ScenarioCompareCards';
import { useUiStore } from '@/store/uiStore';
import { usePageData } from '@/hooks/usePageData';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { Landmark, Building2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { fmtPrivacy, pvText, maskMoneyValues } from '@/utils/privacyTransform';
import { FloorUpsideFire } from './FloorUpsideFire';
import { ContributionReturnsCrossover } from './ContributionReturnsCrossover';
import { CoastFireCard } from './CoastFireCard';
import { FireSpectrumWidget } from './FireSpectrumWidget';
import { CoastFireData, FireSpectrumData } from '@/types/dashboard';
import { EChart } from '@/components/primitives/EChart';
import { EC } from '@/utils/echarts-theme';
import { BondPoolDepletionChart } from '@/components/charts/BondPoolDepletionChart';
import { SpendingTimelineChart } from '@/components/charts/SpendingTimelineChart';
import { WithdrawalRateChart } from '@/components/charts/WithdrawalRateChart';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import { DiagnosticBanner } from '@/components/banners/DiagnosticBanner';


export default function FirePage() {
  const { data, derived, isLoading, dataError, privacyMode } = usePageData();
  const fireScenario = useUiStore(s => s.fireScenario);

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

  // Hook DEVE vir antes do early-return abaixo (Rules of Hooks).
  // Bug histórico: useState estava após `if (stateEl) return stateEl;` —
  // primeira render (loading) retornava sem chamar useState; segunda render
  // (dados carregados) chamava useState → React: "Rendered more hooks than
  // during the previous render". Quebrava 28 testes de semantic-smoke.
  const [pqSelector, setPqSelector] = useState<'proxy' | 'partial' | 'full'>('partial');

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
  const pqualityProxy: number | null = (data as any)?.fire?.p_quality_proxy ?? null;
  const pqualityFull: number | null = (data as any)?.fire?.p_quality_full ?? null;
  const pqualityDisplay: number | null =
    pqSelector === 'proxy'  ? pqualityProxy :
    pqSelector === 'full'   ? pqualityFull :
    pqualityHero;  // 'partial' = canônico atual
  const bondPoolStatus = (data as any)?.fire?.bond_pool_status ?? null;
  const bondPoolIsolationEnabled: boolean = (data as any)?.fire?.bond_pool_isolation_enabled ?? false;
  const bondPoolFullyEnabled: boolean = (data as any)?.fire?.bond_pool_fully_enabled ?? false;
  const bondPoolCompletionPct: number = (data as any)?.fire?.bond_pool_completion_pct ?? 0;
  const modelUncertainty = (data as any)?.pfire_base?.model_uncertainty as { low: number; high: number } | null ?? null;
  const prem = (data as any)?.premissas ?? {};

  // Scenario configs from data.json (compartilhado com withdraw page).
  // activeScenarioCfg.label e .custo_vida_base alimentam os ScenarioBadges
  // dos blocos abaixo — substituem os valores hardcoded "Solteiro" / 250000
  // que apareciam mesmo quando Diego selecionava Casado/Filho.
  type ScenarioKey = 'atual' | 'casado' | 'filho';
  const fireCenarios: Record<ScenarioKey, { label: string; custo_vida_base: number; tem_conjuge: boolean; inss_katia_anual: number }> = (safeData as any).withdraw_cenarios ?? {
    atual:  { label: 'Solteiro',         custo_vida_base: 250_000, tem_conjuge: false, inss_katia_anual: 0 },
    casado: { label: 'Casado',           custo_vida_base: 270_000, tem_conjuge: true,  inss_katia_anual: 93_600 },
    filho:  { label: 'Casado + Filho',   custo_vida_base: 300_000, tem_conjuge: true,  inss_katia_anual: 93_600 },
  };
  const activeScenarioCfg = fireCenarios[fireScenario as ScenarioKey] ?? fireCenarios.atual;

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
      <DiagnosticBanner
        variant="info"
        title="P(FIRE) reportado é conservador por design"
        testId="banner-fire-pfire-conservador"
      >
        {maskMoneyValues('Exclui INSS Katia (~R$113k/ano) e capital humano. Real ~82-84%.', privacyMode)}
      </DiagnosticBanner>

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
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>{`P(FIRE ${(data as any)?.premissas?.fire_year_base ?? 2040})`}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: pfireHeroColor, lineHeight: 1 }} data-testid="pfire-hero">
            {pfireHero != null ? (privacyMode ? '••%' : `${pfireHero.toFixed(1)}%`) : '—'}
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
        <div style={{ textAlign: 'center', minWidth: 140 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>P(quality)</div>
          <div data-testid="pquality-hero" style={{ fontSize: '2.5rem', fontWeight: 900, color: pqualityColor(pqualityDisplay), lineHeight: 1 }}>
            {pqualityDisplay != null ? (privacyMode ? '••%' : `${pqualityDisplay.toFixed(1)}%`) : '—'}
          </div>
          {/* Seletores proxy / partial / full */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6 }}>
            {(['proxy', 'partial', 'full'] as const).map(mode => {
              const val = mode === 'proxy' ? pqualityProxy : mode === 'full' ? pqualityFull : pqualityHero;
              const label = mode === 'proxy' ? 'Sem bucket' : mode === 'partial' ? `Atual ${bondPoolCompletionPct.toFixed(0)}%` : 'Full 100%';
              const active = pqSelector === mode;
              if (val == null) return null;
              return (
                <button
                  key={mode}
                  data-testid={`pquality-selector-${mode}`}
                  onClick={() => setPqSelector(mode)}
                  style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: `1px solid ${active ? pqualityColor(val) : 'var(--border)'}`,
                    background: active ? `color-mix(in srgb, ${pqualityColor(val)} 12%, transparent)` : 'transparent',
                    color: active ? pqualityColor(val) : 'var(--muted)',
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 400,
                    lineHeight: 1.4,
                  }}
                >
                  <div>{label}</div>
                  <div style={{ fontWeight: 700 }}>{privacyMode ? '••%' : `${val.toFixed(1)}%`}</div>
                </button>
              );
            })}
          </div>
          {/* C7: threshold tooltip for P(quality) */}
          <div
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4, cursor: 'help' }}
            title="P(quality) > 70% = boa distribuição de retornos (go-go window planejada). 50–70% = atenção (sequência pode comprometer estilo). < 50% = sequência preocupante — revisar bond pool e guardrails."
          >
            vida como planejada ⓘ
          </div>
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
          {/* A8: patrimônio atual como contexto no hero */}
          {prem.patrimonio_atual != null && (
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 3 }}>
              hoje: {fmtPrivacy(prem.patrimonio_atual, privacyMode)}
            </div>
          )}
        </div>
      </div>

      {/* Bond Pool Isolation Status Badge (FR-mc-bond-pool-partial-isolation 2026-04-29) */}
      {bondPoolStatus != null && (
        <div
          data-testid="bond-pool-isolation-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 'var(--radius-lg)',
            background: bondPoolFullyEnabled
              ? 'color-mix(in srgb, var(--green) 10%, transparent)'
              : bondPoolIsolationEnabled
                ? 'color-mix(in srgb, var(--yellow) 10%, transparent)'
                : 'color-mix(in srgb, var(--muted) 10%, transparent)',
            border: `1px solid color-mix(in srgb, ${bondPoolFullyEnabled ? 'var(--green)' : bondPoolIsolationEnabled ? 'var(--yellow)' : 'var(--muted)'} 35%, transparent)`,
            marginBottom: 12,
            fontSize: 'var(--text-xs)',
          }}
        >
          <span style={{ color: bondPoolFullyEnabled ? 'var(--green)' : bondPoolIsolationEnabled ? 'var(--yellow)' : 'var(--muted)', fontWeight: 600 }}>
            {bondPoolFullyEnabled
              ? 'Bond pool completo — P(quality) real'
              : bondPoolIsolationEnabled
                ? `Bond pool ${bondPoolCompletionPct.toFixed(1)}% — partial isolation ativo`
                : `Bond pool 0% — P(quality) proxy`}
          </span>
          <span style={{ color: 'var(--muted)' }}>
            {bondPoolFullyEnabled
              ? '— vol=0 + guardrails suspensos nos anos 0-7'
              : bondPoolIsolationEnabled
                ? `— vol e guardrails proporcionais à cobertura do bucket`
                : '— vol 13.3%, guardrails ativos'}
          </span>
          {!bondPoolFullyEnabled && pqualityProxy != null && pqualityHero != null && Math.abs(pqualityProxy - pqualityHero) >= 0.1 && (
            <span style={{ color: 'var(--muted)', marginLeft: 4 }}>
              | proxy: {pqualityProxy.toFixed(1)}%
            </span>
          )}
        </div>
      )}

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
                <div style={{ fontSize: 'var(--text-xs)', color: progressoColor }}>{privacyMode ? '••%' : `${progressoPct.toFixed(1)}%`} da meta</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gap Restante</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red)' }}>{fmtPrivacy(gap, privacyMode)}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{privacyMode ? '••%' : `${(100 - progressoPct).toFixed(1)}%`} a acumular</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* C13: Histograma P(FIRE date) — distribuição de probabilidade por ano alvo */}
      {(() => {
        // Build (year, cumulativeP) points from fire_matrix by_profile 'atual' and earliest_fire
        // These are: P(FIRE sucesso se aposentar naquele ano) — usamos como proxy de distribuição
        const bp0 = (data as any)?.fire_matrix?.by_profile?.find((p: any) => p.profile === 'atual');
        const ef = (data as any)?.earliest_fire;
        const idadeAtual: number = prem.idade_atual ?? 39;
        const anoAtual: number = prem.ano_atual ?? 2026;
        const toAno = (idade: number) => anoAtual + (idade - idadeAtual);

        // Collect (ano, P) data points sorted by year
        type DataPoint = { ano: number; label: string; pCumulativa: number };
        const rawPoints: DataPoint[] = [];

        // Aspiracional / earliest_fire — menor data de aposentadoria possível
        if (ef?.ano != null && ef?.pfire != null) {
          rawPoints.push({ ano: ef.ano, label: `${ef.ano} (${ef.idade ?? idadeAtual + (ef.ano - anoAtual)})`, pCumulativa: ef.pfire as number });
        }

        // fire_age_50 — primeira meta de idade (ex.: 2037 → age 50)
        if (bp0?.fire_age_50 != null && bp0?.p_fire_50 != null) {
          const ano = parseInt(String(bp0.fire_age_50), 10);
          const idade = toAno(50); // approximate
          rawPoints.push({ ano, label: `${ano} (${idade})`, pCumulativa: bp0.p_fire_50 as number });
        }

        // fire_age_53 — cenário base (ex.: 2040 → age 53)
        if (bp0?.fire_age_53 != null && bp0?.p_fire_53 != null) {
          const ano = parseInt(String(bp0.fire_age_53), 10);
          rawPoints.push({ ano, label: `${ano} (${idadeAtual + (ano - anoAtual)})`, pCumulativa: bp0.p_fire_53 as number });
        }

        // fire_year_threshold — primeiro ano onde P ≥ 85%
        if (bp0?.fire_year_threshold != null && bp0?.p_at_threshold != null) {
          const ano = parseInt(String(bp0.fire_year_threshold), 10);
          rawPoints.push({ ano, label: `${ano} (${idadeAtual + (ano - anoAtual)})`, pCumulativa: bp0.p_at_threshold as number });
        }

        // Remover duplicatas de ano e ordenar por P cumulativa crescente (para marginal fizer sentido)
        const seen = new Set<number>();
        const points = rawPoints
          .filter(p => { if (seen.has(p.ano)) return false; seen.add(p.ano); return true; })
          .sort((a, b) => a.pCumulativa - b.pCumulativa); // sort ascending P for marginal

        if (points.length < 2) return null;

        // Compute marginals: P(FIRE neste ano) = P_cumul - P_anterior
        // Inserir ponto 0 no início (P = 0 antes do primeiro ano)
        const marginals = points.map((pt, i) => {
          const prev = i === 0 ? 0 : points[i - 1].pCumulativa;
          return { ...pt, marginal: Math.max(0, pt.pCumulativa - prev) };
        });

        const labels = marginals.map(m => m.label);
        const values = marginals.map(m => parseFloat(m.marginal.toFixed(1)));
        const colors = marginals.map(m =>
          m.pCumulativa >= 85 ? 'var(--green)' : m.pCumulativa >= 70 ? 'var(--yellow)' : 'var(--accent)'
        );

        const option = {
          backgroundColor: 'transparent',
          grid: { left: 48, right: 16, top: 36, bottom: 48 },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15,23,42,.95)',
            borderColor: '#334155',
            textStyle: { color: '#94a3b8', fontSize: 12 },
            formatter: (params: { name: string; value: number; dataIndex: number }[]) => {
              const p = params[0];
              const pt = marginals[p.dataIndex];
              const pctStr = privacyMode ? '••%' : `${p.value.toFixed(1)}pp`;
              const cumStr = privacyMode ? '••%' : `${pt.pCumulativa.toFixed(1)}%`;
              return `${p.name}<br/>Marginal: <b>${pctStr}</b><br/>Acumulado: <b>${cumStr}</b>`;
            },
          },
          xAxis: {
            type: 'category',
            data: labels,
            axisLabel: { color: EC.muted, fontSize: 10, rotate: 0 },
            axisLine: { lineStyle: { color: EC.border } },
          },
          yAxis: {
            type: 'value',
            name: 'pp',
            nameTextStyle: { color: EC.muted, fontSize: 10 },
            axisLabel: { color: EC.muted, fontSize: 10, formatter: (v: number) => privacyMode ? '••' : `${v}pp` },
            splitLine: { lineStyle: { color: EC.border, type: 'dashed' } },
          },
          series: [{
            type: 'bar',
            data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
            label: {
              show: true,
              position: 'top',
              color: EC.muted,
              fontSize: 10,
              formatter: (p: { value: number }) => privacyMode ? '••' : `${p.value.toFixed(1)}pp`,
            },
          }],
        };

        return (
          <CollapsibleSection
            id="section-pfire-histogram"
            title={secTitle('fire', 'pfire-histogram', 'Distribuição P(FIRE) por Ano — Probabilidade Marginal')}
            defaultOpen={secOpen('fire', 'pfire-histogram', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
                Probabilidade marginal de FIRE por ano alvo — calculada como diferença entre P acumuladas dos cenários base. Cada barra = probabilidade adicional de sucesso naquele ano.
              </div>
              <EChart option={option} style={{ height: 220 }} />
              <div className="src" style={{ marginTop: 8 }}>
                Fonte: fire_matrix.by_profile[atual] · Monte Carlo {((data as any)?.fire_matrix?._by_profile_n_sim as number | null)?.toLocaleString('pt-BR') ?? '10k'} simulações · P ordenadas por probabilidade crescente
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* P(FIRE) Distribution — Percentiles & Tail Risks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>P(FIRE) Distribuição Monte Carlo — Percentis</h2>
        <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
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

      {/* Bond Pool Depletion Tracker (FR-bond-pool-tracker) */}
      <CollapsibleSection
        id="section-bond-pool-depletion"
        title={secTitle('fire', 'bond-pool-depletion', 'Bond Pool — Projeção de Esgotamento (2040–2055)')}
        defaultOpen={secOpen('fire', 'bond-pool-depletion', false)}
        icon={<Landmark size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <BondPoolDepletionChart data={data as any} />
          <div className="src">Projeção determinística · Retorno real = pisoTaxaIpcaLongo · INSS reduz saque a partir de 2049 (Katia) e 2052 (Diego)</div>
        </div>
      </CollapsibleSection>

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
                  <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
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

      {/* C10a: Cards de cenário — leitura rápida Base vs Favorável vs Aspiracional */}
      <CollapsibleSection
        id="section-scenario-compare-cards"
        title={secTitle('fire', 'scenario-compare-cards', 'Cenários FIRE — Visão Rápida')}
        defaultOpen={secOpen('fire', 'scenario-compare-cards', true)}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <ScenarioCompareCards />
        </div>
      </CollapsibleSection>

      {/* Coast FIRE Calculator — HD-gaps-aposenteaos40-spec Feature 1 */}
      {(() => {
        const coastFire = (safeData as any)?.fire?.coast_fire as CoastFireData | undefined;
        const patrimonioAtual: number = prem.patrimonio_atual ?? 0;
        if (!coastFire) return null;
        return (
          <CollapsibleSection
            id="section-coast-fire"
            title={secTitle('fire', 'coast-fire', 'Coast FIRE Calculator — 3 Cenários')}
            defaultOpen={secOpen('fire', 'coast-fire', true)}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <CoastFireCard
                coast={coastFire}
                patrimonioAtual={patrimonioAtual}
                privacyMode={privacyMode}
                aporteAnual={((data as any)?.premissas?.aporte_mensal ?? 25_000) * 12}
              />
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* FIRE Spectrum Widget — HD-gaps-aposenteaos40-spec Feature 2 */}
      {(() => {
        const spectrum = (safeData as any)?.fire?.fire_spectrum as FireSpectrumData | undefined;
        if (!spectrum) return null;
        return (
          <CollapsibleSection
            id="section-fire-spectrum"
            title={secTitle('fire', 'fire-spectrum', 'FIRE Spectrum — Fat / FIRE / Lean / Barista')}
            defaultOpen={secOpen('fire', 'fire-spectrum', true)}
          >
            {/* A5: diegoTarget from pipeline — never hardcode */}
            <FireSpectrumWidget
              spectrum={spectrum}
              diegoTarget={(safeData as any)?.premissas?.patrimonio_gatilho ?? (safeData as any)?.premissas?.meta_fire_brl ?? 10_000_000}
              privacyMode={privacyMode}
            />
          </CollapsibleSection>
        );
      })()}

      {/* Gap F: Renda Floor Katia — nota conservadora no modelo MC */}
      {(() => {
        const inssKatiaAnual: number = prem.inss_katia_anual ?? 0;
        const pfireCasal: number | null = (data as any)?.pfire_by_profile?.casado?.base ?? null;
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
          <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
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
                  ? '/assumptions?preset=aspiracional'
                  : `/assumptions?cond=${cond}&mkt=${mkt}`;

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
            {/* C12: SWR-variable FIRE date projection */}
            {(() => {
              const custoVida: number = prem.custo_vida_base ?? 250000;
              const patrimonioAtual: number = prem.patrimonio_atual ?? 0;
              const anoAtual: number = prem.ano_atual ?? 2026;
              const idadeAtual: number = prem.idade_atual ?? 39;
              const retornoReal: number = prem.retorno_equity_base ?? 0.0485;
              const aporteAnual: number = (prem.aporte_mensal ?? 25000) * 12;
              // For each SWR, compute FIRE number and years to reach (simplified: future value of current + aportes)
              const swrVariants: { swr: number; label: string }[] = [
                { swr: 0.025, label: '2.5% (ultra-conservador)' },
                { swr: 0.03,  label: '3.0% (base)' },
                { swr: 0.035, label: '3.5% (moderado)' },
                { swr: 0.04,  label: '4.0% (agressivo)' },
              ];
              const rows = swrVariants.map(({ swr, label }) => {
                const fireNumber = custoVida / swr;
                if (patrimonioAtual >= fireNumber) {
                  return { label, fireNumber, anoFire: anoAtual, idadeFire: idadeAtual };
                }
                // Solve: P*(1+r)^n + A*((1+r)^n - 1)/r = FN
                // Binary search for n
                let lo = 0, hi = 40;
                for (let iter = 0; iter < 60; iter++) {
                  const mid = (lo + hi) / 2;
                  const growth = Math.pow(1 + retornoReal, mid);
                  const projected = patrimonioAtual * growth + (retornoReal > 0 ? aporteAnual * (growth - 1) / retornoReal : aporteAnual * mid);
                  if (projected >= fireNumber) hi = mid; else lo = mid;
                }
                const years = (lo + hi) / 2;
                const anoFire = Math.round(anoAtual + years);
                const idadeFire = Math.round(idadeAtual + years);
                return { label, fireNumber, anoFire, idadeFire };
              });
              const baseRow = rows.find(r => r.label.includes('3.0')) ?? rows[1];
              return (
                <div data-testid="swr-fire-date-projection" style={{
                  marginTop: 12, marginBottom: 8,
                  background: 'var(--card2)', borderRadius: 8,
                  padding: '12px 14px', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
                    Projeção FIRE por SWR <span style={{ fontWeight: 400 }}>— quando atinjo o patrimônio para cada taxa</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>SWR</th>
                          <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>FIRE Number</th>
                          <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ano FIRE</th>
                          <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Idade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r => {
                          const isBase = r.label === baseRow.label;
                          return (
                            <tr
                              key={r.label}
                              style={{
                                borderBottom: '1px solid var(--card2)',
                                background: isBase ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
                              }}
                            >
                              <td style={{ padding: '5px 8px', fontWeight: isBase ? 700 : 400, color: isBase ? 'var(--accent)' : 'var(--text)' }}>
                                {r.label}{isBase ? ' ★' : ''}
                              </td>
                              <td style={{ textAlign: 'right', padding: '5px 8px' }}>{fmtPrivacy(Math.round(r.fireNumber / 100000) * 100000, privacyMode)}</td>
                              <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 700, color: isBase ? 'var(--accent)' : 'var(--text)' }}>{r.anoFire}</td>
                              <td style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)' }}>{r.idadeFire}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
                    Estimativa analítica simples (retorno real {(retornoReal * 100).toFixed(1)}%, aportes {fmtPrivacy(aporteAnual, privacyMode)}/ano, sem MC). ★ = SWR base atual.
                  </div>
                </div>
              );
            })()}
          </section>
        );
      })()}

      {/* P(quality) Matrix — 5 critérios × 3 perfis × 3 cenários */}
      {(() => {
        const matrix = (safeData as any)?.fire?.p_quality_matrix;
        if (!matrix) return null;
        const matrixProxy = (safeData as any)?.fire?.p_quality_matrix_proxy ?? null;
        const matrixFull  = (safeData as any)?.fire?.p_quality_matrix_full  ?? null;
        return (
          <CollapsibleSection
            id="pquality-matrix"
            title={secTitle('fire', 'pquality-matrix', 'Critérios de Qualidade — Go-Go Window')}
            defaultOpen={secOpen('fire', 'pquality-matrix', true)}
          >
            <PQualityMatrix
              matrix={matrix}
              matrixProxy={matrixProxy}
              matrixFull={matrixFull}
              privacyMode={privacyMode}
              bondPoolCompletionPct={bondPoolCompletionPct}
            />
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
          <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
        </div>
        <NetWorthProjectionChart data={safeData} />
        <div style={{ marginTop: 4, padding: '6px 10px', background: 'color-mix(in srgb, var(--yellow) 8%, transparent)', borderRadius: 6, borderLeft: '3px solid var(--yellow)', fontSize: 'var(--text-sm)' }}>
          <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: '-2px', flexShrink: 0 }} /> Portfólio financeiro apenas. Aportes futuros de {pvText('R$25k', privacyMode)}/mês já estão modelados trajetória a trajetória (proxy de capital humano). O modelo não captura risco de interrupção de renda — doença, invalidez ou queda de receita PJ.{' '}
          Pré-FIRE: dados reais de fire_trilha (realizado + projeção mensal). Pós-FIRE: percentis P10/P50/P90 das 10k trajetórias MC — inclui spending smile (Go-Go/Slow-Go/No-Go), VCMH, guardrails, bond pool isolation e INSS.
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
            <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
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

      {/* Balanço Holístico — Patrimônio expandido (movido de NOW na HD-dashboard-review-completa Onda 2.7) */}
      <div data-testid="balanco-holistico">
      <CollapsibleSection id="balanco-holistico-fire" title={secTitle('fire', 'balanco-holistico-fire', 'Balanço Holístico')} defaultOpen={secOpen('fire', 'balanco-holistico-fire', false)} icon={<Landmark size={18} />}>
        <BalancoHolistico data={data as any} showCapitalHumanoBadge />
      </CollapsibleSection>
      </div>

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

      {/* Tornado de Sensibilidade — movido de DASHBOARD */}
      {derived && (
        <CollapsibleSection
          id="tornado"
          title={secTitle('fire', 'tornado', 'Tornado de Sensibilidade (P(FIRE) ±10%)')}
          defaultOpen={secOpen('fire', 'tornado', false)}
        >
          <PFireMonteCarloTornado
            pfireBase={derived.pfireBase}
            pfireFav={derived.pfireFav}
            pfireStress={derived.pfireStress}
            tornadoData={derived.tornadoData}
            firePatrimonioAtual={derived.firePatrimonioAtual}
            firePatrimonioGatilho={derived.firePatrimonioGatilho}
            pQualityBase={(safeData as any)?.fire?.p_quality ?? null}
            pQualityFav={(safeData as any)?.fire?.p_quality_fav ?? null}
            pQualityStress={(safeData as any)?.fire?.p_quality_stress ?? null}
          />
        </CollapsibleSection>
      )}

      {/* Sequence of Returns Risk — SoRR Narrative + P(FIRE) ↔ Guardrails */}
      <CollapsibleSection
        id="sequence-returns"
        title={secTitle('fire', 'sequence-returns', 'Sequence of Returns — Risco e Guardrails')}
        defaultOpen={secOpen('fire', 'sequence-returns', false)}
      >
        {/* A6: gastoPiso from data.json — never hardcode 184000 */}
        <SequenceOfReturnsRisk
          pfire={(data as any)?.pfire_base ?? null}
          premissas={(data as any)?.premissas ?? {}}
          gastoPiso={(data as any)?.gasto_piso ?? (() => {
            // fallback: last guardrail retirada or gasto_piso
            const g: Array<{ retirada: number }> = (data as any)?.guardrails ?? [];
            return Array.isArray(g) && g.length > 0 ? g[g.length - 1].retirada : 184000;
          })()}
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
            <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
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
            <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
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
                Nota: piso &lt; gasto atual ({pvText('R$250k', privacyMode)}) pois aportes=0 nesta estimativa — com aportes projetados, ceiling é maior.
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

      {/* ── G4: Spending Smile — Gastos por Fase Pós-FIRE ────────────────────── */}
      {(() => {
        type SmileFase = { gasto_lifestyle: number; gasto_saude_mid: number; gasto_total_mid: number; idade_inicio: number; idade_fim: number };
        const sm = (data as any)?.spending_smile as Record<string, SmileFase> | null;
        if (!sm || Object.keys(sm).length === 0) return null;
        const faseLabels: Record<string, string> = { go_go: 'Go-Go', slow_go: 'Slow-Go', no_go: 'No-Go' };
        const fases = ['go_go', 'slow_go', 'no_go'].filter(f => sm[f]);
        const labels = fases.map(f => {
          const v = sm[f];
          const fim = v.idade_fim > 120 ? '∞' : String(v.idade_fim);
          return `${faseLabels[f] ?? f}\n${v.idade_inicio}–${fim}`;
        });
        const lifestyle = fases.map(f => sm[f].gasto_lifestyle);
        const saude    = fases.map(f => sm[f].gasto_saude_mid);
        const fmt = (v: number) => privacyMode ? 'R$ ••••' : `R$${(v / 1000).toFixed(0)}k`;
        const option = {
          backgroundColor: 'transparent',
          grid: { left: 60, right: 16, top: 16, bottom: 60 },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15,23,42,.95)',
            borderColor: '#334155',
            textStyle: { color: '#94a3b8', fontSize: 12 },
            formatter: (params: { seriesName: string; value: number }[]) => {
              const lines = params.map(p => `${p.seriesName}: <b style="color:#e2e8f0">${fmt(p.value)}</b>`);
              const total = params.reduce((s, p) => s + p.value, 0);
              return `${lines.join('<br/>')}<br/><b style="color:#e2e8f0">Total: ${fmt(total)}</b>`;
            },
          },
          legend: { top: 0, right: 0, textStyle: { color: EC.muted, fontSize: 11 } },
          xAxis: { type: 'category', data: labels, axisLabel: { color: EC.muted, fontSize: 11 }, axisLine: { lineStyle: { color: EC.border } } },
          yAxis: {
            type: 'value', min: 0, max: 350000,
            axisLabel: { color: EC.muted, fontSize: 10, formatter: (v: number) => privacyMode ? 'R$ ••••' : `R$${v / 1000}k` },
            axisLine: { show: false }, splitLine: { lineStyle: { color: EC.border, type: 'dashed' } },
          },
          series: [
            { name: 'Lifestyle', type: 'bar', stack: 'total', data: lifestyle, itemStyle: { color: EC.accent, borderRadius: [0, 0, 0, 0] }, label: { show: true, position: 'inside', color: '#fff', fontSize: 10, formatter: (p: { value: number }) => fmt(p.value) } },
            { name: 'Saúde', type: 'bar', stack: 'total', data: saude, itemStyle: { color: EC.orange ?? '#f97316', borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'inside', color: '#fff', fontSize: 10, formatter: (p: { value: number }) => fmt(p.value) } },
          ],
        };
        return (
          <CollapsibleSection
            id="section-spending-smile"
            title={secTitle('fire', 'spending-smile', 'Spending Smile — Gastos por Fase Pós-FIRE')}
            defaultOpen={secOpen('fire', 'spending-smile', false)}
          >
            <div style={{ padding: '14px 16px' }}>
              <EChart option={option} style={{ height: 260 }} />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                Lifestyle = gastos ex-saúde (FR-spending-smile 2026-03-27) ·
                Saúde = estimativa ponto médio da fase (base {privacyMode ? 'R$ ••••' : `R$${(sm.go_go?.gasto_saude_mid ?? 0) / 1000 | 0}k`}, +3.5%/a) ·
                Componente saúde sobe com a idade mesmo quando lifestyle cai — padrão &ldquo;smile&rdquo;
              </div>
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* Withdrawal Rate + INSS Floor (FR-withdrawal-rate-chart) */}
      {(data as any)?.trilha_p50 && (
        <CollapsibleSection
          id="section-withdrawal-rate"
          title={secTitle('fire', 'withdrawal-rate', 'Withdrawal Rate — SWR pós-FIRE com piso INSS')}
          defaultOpen={secOpen('fire', 'withdrawal-rate', false)}
        >
          <div style={{ padding: '0 16px 16px' }}>
            <WithdrawalRateChart data={data as any} />
            <div className="src">SWR bruta vs líquida pós-INSS · INSS Katia 2049 ({pvText('R$93.6k', privacyMode)}) + Diego 2052 ({pvText('R$18k', privacyMode)}) · Linha pontilhada = gatilho SWR {((data as any)?.premissas?.swr_gatilho ?? 0.03) * 100}%</div>
          </div>
        </CollapsibleSection>
      )}

      {/* Spending Timeline — Gastos por ano 2040–2077 (FR-spending-timeline) */}
      {(data as any)?.spending_smile && (
        <CollapsibleSection
          id="section-spending-timeline"
          title={secTitle('fire', 'spending-timeline', 'Spending Timeline — Gastos anuais por componente (2040–2077)')}
          defaultOpen={secOpen('fire', 'spending-timeline', false)}
        >
          <div style={{ padding: '0 16px 16px' }}>
            <SpendingTimelineChart data={data as any} />
            <div className="src">Spending smile por fase · Lifestyle + Saúde (VCMH) · Linhas marcam transição Go-Go → Slow-Go → No-Go</div>
          </div>
        </CollapsibleSection>
      )}

      {/* ── Gap N: Sensibilidade P(FIRE) ──────────────────────────────────────── */}
      {(() => {
        const sens = (data as any)?.pfire_sensitivity;
        if (!Array.isArray(sens) || sens.length === 0) return null;
        return (
          <div data-testid="pfire-sensitivity-table">
          <CollapsibleSection
            id="section-pfire-sensitivity"
            title={secTitle('fire', 'pfire-sensitivity', 'Sensibilidade P(FIRE) — Análise de Variáveis')}
            defaultOpen={secOpen('fire', 'pfire-sensitivity', true)}
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
                          <td style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)' }}>{maskMoneyValues(String(row.base_value ?? ''), privacyMode)}</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>{maskMoneyValues(String(row.stressed_value ?? ''), privacyMode)}</td>
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
