'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { pfireColor as pfireColorFn } from '@/utils/fire';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TrackingFireChart } from '@/components/charts/TrackingFireChart';
import { NetWorthProjectionChart } from '@/components/charts/NetWorthProjectionChart';
import { GlidePathChart } from '@/components/charts/GlidePathChart';
import { FireScenariosTable } from '@/components/fire/FireScenariosTable';
import { FireMatrixTable } from '@/components/dashboard/FireMatrixTable';
import { EventosVidaChart } from '@/components/charts/EventosVidaChart';
import { BalancoHolistico } from '@/components/holistic/BalancoHolistico';
import { usePageData } from '@/hooks/usePageData';

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
    const dates: string[] = ft.dates;
    const values: (number | null)[] = ft.trilha_brl;
    const nonNull = dates.map((dt: string, i: number) => ({ dt, v: values[i] })).filter(x => x.v != null) as { dt: string; v: number }[];
    if (!nonNull.length) return undefined;
    // Monthly growth rate from last 12 available months for extrapolation
    const last = nonNull[nonNull.length - 1];
    const prev12 = nonNull[Math.max(0, nonNull.length - 12)];
    const monthlyGrowth = nonNull.length >= 12 ? (last.v / prev12.v) ** (1 / 11) - 1 : 0.006;
    const toIdade = (year: number, month: number) => idadeAtual + (year - anoAtual) + (month - 4) / 12;
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
      for (let i = 0; i < 120; i++) {
        v *= (1 + monthlyGrowth);
        month++;
        if (month > 12) { month = 1; year++; }
        if (v >= pat) return Math.round(toIdade(year, month));
      }
      return null;
    });
  }, [data]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados FIRE...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>Erro ao carregar FIRE:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">Dados carregados mas seção FIRE não disponível</div>;
  }

  // ── Hero banner values ──────────────────────────────────────────────────────
  const pfireHero: number | null = derived?.pfire ?? null;
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
            {pfireHero != null ? (pfireHero >= 90 ? '✓ ON TRACK' : pfireHero >= 85 ? '⚠ ADEQUADO' : '✗ ATENÇÃO') : ''}
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
              ? `R$${(patrimonioAlvoHero / 1e6).toFixed(1)}M`
              : '—'}
          </div>
        </div>
      </div>

      {/* 1. Tracking FIRE — Realizado vs Projeção */}
      <section className="section" id="trackingFireSection">
        <h2>Tracking FIRE — Realizado vs Projeção</h2>
        <TrackingFireChart data={data} />
        <div className="src">
          Patrimônio realizado vs projeção FIRE · Meta FIRE
        </div>
      </section>

      {/* 2. FIRE Aspiracional — 3 cenários base + Aspiracional */}
      {(data as any)?.fire_matrix?.by_profile?.length > 0 && (() => {
        const prem = (data as any)?.premissas ?? {};
        const aporte     = prem.aporte_mensal ?? 0;
        const retorno    = prem.retorno_equity_base ?? 0.0485;
        const swrTarget  = prem.swr_gatilho ?? 0.03;
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
                      R${(p.gasto_anual / 1000).toFixed(0)}k/ano{isAspir ? ' · mercado fav.' : ''}
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
          </section>
        );
      })()}

      {/* 3. Projeção de Patrimônio — P10 / P50 / P90 (moved up: trajetória após horizonte) */}
      <section className="section" id="netWorthProjectionSection">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Projeção de Patrimônio — P10 / P50 / P90 (portfólio financeiro)</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 999, background: 'rgba(99,179,237,.10)', border: '1px solid rgba(99,179,237,.3)', fontSize: 11, color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            Solteiro · R$250k/ano
          </div>
        </div>
        <NetWorthProjectionChart data={data} />
        <div style={{ marginTop: 4, padding: '6px 10px', background: 'color-mix(in srgb, var(--yellow) 8%, transparent)', borderRadius: 6, borderLeft: '3px solid var(--yellow)', fontSize: 'var(--text-sm)' }}>
          ⚠️ Portfólio financeiro apenas. Aportes futuros de R$25k/mês já estão modelados trajetória a trajetória (proxy de capital humano). O modelo não captura risco de interrupção de renda — doença, invalidez ou queda de receita PJ.{' '}
          Pré-FIRE: interpolação exponencial entre hoje e endpoints MC. Pós-FIRE: r=4.85% real com spending smile (Go-Go/Slow-Go/No-Go) em R$ reais (constante 2026). INSS R$18k/ano real a partir de age 65.
        </div>
        <div className="src">
          Base: Monte Carlo 10k simulações · R$ reais constante 2026
        </div>
      </section>

      {/* 4. FIRE Matrix — P(Sucesso 30 anos) */}
      {data.fire_matrix && (
        <CollapsibleSection id="section-fire-matrix" title={secTitle('fire', 'fire-matrix')} defaultOpen={secOpen('fire', 'fire-matrix')}>
          <div style={{ padding: '0 16px 16px' }}>
            <FireMatrixTable
              data={data.fire_matrix}
              idades={fireMatrixIdades}
              currentPatrimonio={(data as any)?.premissas?.patrimonio_atual}
              currentSpending={(data as any)?.premissas?.custo_vida ?? (data as any)?.premissas?.custo_vida_base}
            />
            <div className="src">
              Verde &gt;95%, Amarelo 88–95%, Vermelho &lt;88%. Eixo: Patrimônio no FIRE Day (linha) × Gasto Anual BRL (coluna). ★ = gasto típico do perfil · → = patrimônio-alvo do perfil.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 4b. Balanço Holístico — Patrimônio expandido (collapsed por default) */}
      <CollapsibleSection id="balanco-holistico-fire" title={secTitle('fire', 'balanco-holistico-fire', 'Balanço Holístico')} defaultOpen={secOpen('fire', 'balanco-holistico-fire')} icon="🏛️">
        <BalancoHolistico data={data as any} showCapitalHumanoBadge />
      </CollapsibleSection>

      {/* 4c. Surviving Spouse / F6 — só exibir se tem_conjuge === true */}
      {(data as any)?.premissas?.tem_conjuge === true && (
        <CollapsibleSection id="section-surviving-spouse" title={secTitle('fire', 'section-surviving-spouse', 'Cenário: Cônjuge Sobrevivente')} defaultOpen={secOpen('fire', 'section-surviving-spouse')} icon="💑">
          <div style={{ padding: '0 16px 16px' }}>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: 12 }}>
              Estimativa de sustentabilidade do plano caso {(data as any)?.premissas?.nome_conjuge ?? 'cônjuge'} sobreviva a Diego.
              SWR conservador de 3% aplicado a patrimônio transferido.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="kpi" style={{ textAlign: 'center' }}>
                <div className="kpi-label">Gasto Katia (solo)</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {privacyMode ? '••••' : `R$${((data as any)?.premissas?.gasto_katia_solo ?? 160000) / 1000}k/ano`}
                </div>
              </div>
              <div className="kpi" style={{ textAlign: 'center' }}>
                <div className="kpi-label">INSS Katia</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {privacyMode ? '••••' : `R$${((data as any)?.premissas?.inss_katia_anual ?? 93600) / 1000}k/ano`}
                </div>
              </div>
              <div className="kpi" style={{ textAlign: 'center' }}>
                <div className="kpi-label">PGBL Katia (FIRE Day)</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {privacyMode ? '••••' : `R$${((data as any)?.premissas?.pgbl_katia_saldo_fire ?? 490000) / 1000}k`}
                </div>
              </div>
            </div>
            {(() => {
              const gastoKatia = (data as any)?.premissas?.gasto_katia_solo ?? 160_000;
              const inssKatia = (data as any)?.premissas?.inss_katia_anual ?? 93_600;
              const pgblKatia = (data as any)?.premissas?.pgbl_katia_saldo_fire ?? 490_000;
              const patrimonioBase = (data as any)?.premissas?.patrimonio_atual ?? 0;
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
                      <div style={{ fontWeight: 700 }}>{privacyMode ? '••••' : `R$${(gastoLiquido / 1000).toFixed(0)}k/ano`}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Patrimônio necessário (3% SWR)</div>
                      <div style={{ fontWeight: 700 }}>{privacyMode ? '••••' : `R$${(patrimonioNecessario / 1e6).toFixed(1)}M`}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Cobertura estimada</div>
                      <div style={{ fontWeight: 700, color: cor }}>{privacyMode ? '••••' : `${cobertura.toFixed(0)}%`}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 8 }}>
                    SWR 3% (conservador solo). Patrimônio = portfólio atual + PGBL Katia. INSS Katia: R${(inssKatia/1000).toFixed(0)}k/ano deduzido do gasto.
                  </div>
                </div>
              );
            })()}
          </div>
        </CollapsibleSection>
      )}

      {/* 5. P(FIRE) — Cenários de Família (moved up: sensibilidade ao custo de vida) */}
      {derived && (
        <section className="section" id="familyScenariosFireSection">
          <h2>P(FIRE) — Cenários de Família <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--muted)' }}>(impacto no custo de vida)</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const profiles = (data as any)?.fire_matrix?.by_profile ?? [];
              const casado = profiles.find((p: any) => p.profile === 'casado');
              const filho = profiles.find((p: any) => p.profile === 'filho');
              const pfireSolteiro = derived.pfireBase;
              const pfireCasado = casado?.p_fire_53 ?? null;
              const pfireFilho = filho?.p_fire_53 ?? null;
              const gastoCasado = casado?.gasto_anual ?? 270000;
              const gastoFilho = filho?.gasto_anual ?? 300000;
              const deltaCasado = pfireSolteiro != null && pfireCasado != null ? (pfireCasado - pfireSolteiro).toFixed(1) : null;
              const deltaFilho = pfireSolteiro != null && pfireFilho != null ? (pfireFilho - pfireSolteiro).toFixed(1) : null;
              return [
                { label: '👤 Solteiro / FIRE Day', pfire: pfireSolteiro, gastoAnual: 250000, gastoLabel: 'R$250k/ano', delta: null },
                { label: '💍 Pós-casamento', pfire: pfireCasado, gastoAnual: gastoCasado, gastoLabel: `R$${(gastoCasado/1000).toFixed(0)}k/ano`, delta: deltaCasado ? `${parseFloat(deltaCasado) > 0 ? '+' : ''}${deltaCasado}pp` : null },
                { label: '👶 Casamento + filho', pfire: pfireFilho, gastoAnual: gastoFilho, gastoLabel: `R$${(gastoFilho/1000).toFixed(0)}k/ano`, delta: deltaFilho ? `${parseFloat(deltaFilho) > 0 ? '+' : ''}${deltaFilho}pp` : null },
              ];
            })().map((scenario, i) => (
              <div key={i} style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{scenario.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{scenario.gastoLabel}</div>
                  {scenario.delta && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{scenario.delta}</div>}
                </div>
                <div style={{ flex: 1, background: 'var(--card)', borderRadius: 'var(--radius-xs)', height: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    width: `${scenario.pfire != null ? Math.min(100, scenario.pfire) : 0}%`,
                    height: '100%',
                    background: pfireColorFn(scenario.pfire),
                    borderRadius: 'var(--radius-xs)',
                  }} />
                </div>
                <div style={{ minWidth: '80px', textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: pfireColorFn(scenario.pfire) }}>
                    {scenario.pfire != null ? `${scenario.pfire.toFixed(1)}%` : '—'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>P(FIRE)</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
                    {privacyMode ? '••••' : `R$${(scenario.gastoAnual / 1000).toFixed(0)}k/ano`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="src">Base: Monte Carlo 10k simulações · custo de vida base R$250k/ano · Sensibilidade ao custo de vida</div>
        </section>
      )}

      {/* 6. Eventos de Vida — collapsed (detalhe de sensibilidade) */}
      <CollapsibleSection id="section-eventos-vida" title={secTitle('fire', 'eventos-vida')} defaultOpen={secOpen('fire', 'eventos-vida')}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
            (gatilhos de recalibração)
          </div>
          <EventosVidaChart data={data} />
          <div className="src">
            Ao ativar qualquer evento: recalibrar custo de vida, FIRE date, seguro de vida e estrutura patrimonial imediatamente. Impacto de eventos permanentes no custo de vida.
          </div>
        </div>
      </CollapsibleSection>

      {/* 7. Cenário Base vs Aspiracional — collapsed (referência técnica) */}
      <CollapsibleSection id="section-scenario-compare" title={secTitle('fire', 'scenario-compare')} defaultOpen={secOpen('fire', 'scenario-compare')}>
        <div style={{ padding: '0 16px 16px' }}>
          <FireScenariosTable />
          <div className="src">
            Base: Monte Carlo 10k simulações
          </div>
        </div>
      </CollapsibleSection>

      {/* 8. Glide Path — collapsed (mecanismo de execução) */}
      <CollapsibleSection id="section-glide-path" title={secTitle('fire', 'glide-path')} defaultOpen={secOpen('fire', 'glide-path')}>
        <div style={{ padding: '0 16px 16px' }}>
          <GlidePathChart data={data} />
          <div className="src">
            Crypto: 3% pré e pós-FIRE. Alocações somam 100% por idade.
          </div>
        </div>
      </CollapsibleSection>

    </div>
  );
}
