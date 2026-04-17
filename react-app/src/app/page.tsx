'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { KpiHero } from '@/components/primitives/KpiHero';
import SemaforoGatilhos from '@/components/dashboard/SemaforoGatilhos';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { useWellnessScore } from '@/hooks/useWellnessScore';

export default function HomePage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const privacyMode = useUiStore(s => s.privacyMode);

  const wellnessScore = useWellnessScore(data, derived);
  const [activeProfile, setActiveProfile] = useState(0);

  useEffect(() => {
    loadDataOnce().catch(e => {
      console.error('NOW page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  if (isLoading || (!data && !dataError)) {
    return <div className="loading-state">⏳ Carregando dados...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Erro ao carregar dashboard:</strong> {dataError}
      </div>
    );
  }

  if (!data || !derived) {
    return <div className="loading-state">⏳ Carregando...</div>;
  }

  // --- Derived values for new sections ---
  const byProfile: any[] = (data as any)?.fire_matrix?.by_profile ?? [];
  const activeProf = byProfile[activeProfile] ?? byProfile[0];
  const sensitivity = (data as any)?.fire_aporte_sensitivity;

  // KPI strip: P(FIRE|53) from current profile (Atual)
  const pfireAtual = byProfile[0]?.p_fire_53 ?? null;
  const pfireAtualStress = byProfile[0]?.p_fire_53_stress ?? null;
  const pfireAtualFav = byProfile[0]?.p_fire_53_fav ?? null;
  const pfireColor = pfireAtual != null
    ? pfireAtual >= 88 ? 'var(--green)' : pfireAtual >= 80 ? 'var(--yellow)' : 'var(--red)'
    : 'var(--muted)';

  // KPI strip: Drift máximo
  const driftItems = derived.driftItems.filter(i => i.id !== 'Custo');
  const driftMax = driftItems.length > 0
    ? driftItems.reduce((a, b) => b.absGap > a.absGap ? b : a, driftItems[0])
    : null;
  const driftMaxColor = driftMax
    ? driftMax.status === 'verde' ? 'var(--green)' : driftMax.status === 'amarelo' ? 'var(--yellow)' : 'var(--red)'
    : 'var(--muted)';

  // Contexto de Mercado compact
  const ipcaTaxa = (data as any)?.rf?.ipca2040?.taxa;
  const rendaTaxa = (data as any)?.rf?.renda2065?.taxa;
  const STATUS_DOT: Record<string, string> = { verde: 'var(--green)', amarelo: 'var(--yellow)', vermelho: 'var(--red)' };
  const ipcaDotColor = STATUS_DOT[derived.dcaItems.find(i => i.id === 'ipca2040')?.status ?? ''] ?? 'var(--muted)';
  const rendaDotColor = STATUS_DOT[derived.dcaItems.find(i => i.id === 'renda2065')?.status ?? ''] ?? 'var(--muted)';

  return (
    <div>
      {/* 1. HERO STRIP */}
      <KpiHero
        networth={derived.networth}
        networthUsd={derived.networthUsd}
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
        pfire={derived.pfire}
        cambio={derived.CAMBIO}
        fireYearBase={(data as any)?.fire_matrix?.by_profile?.[0]?.fire_age_53 ? parseInt((data as any).fire_matrix.by_profile[0].fire_age_53) : undefined}
        fireAgeBase={(data as any)?.premissas?.idade_cenario_base}
        fireYearAspir={(data as any)?.earliest_fire?.ano}
        fireAgeAspir={(data as any)?.earliest_fire?.idade}
        firePatrimonioGatilho={derived.firePatrimonioGatilho}
      />

      {/* 2. KPI STRIP — P(FIRE|53) · Drift Máximo · Aporte Meta · Equity YTD (USD) · Portfolio YTD (BRL) · Passivos */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 mb-3.5">
        {/* P(FIRE|53) */}
        <div className="kpi text-center border-l-4" style={{ borderLeftColor: pfireColor }}>
          <div className="kpi-label">P(FIRE|53)</div>
          <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '1.8rem', color: pfireColor }}>
            {pfireAtual != null ? `${pfireAtual.toFixed(1)}%` : '—'}
          </div>
          <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>
            {pfireAtualStress != null && pfireAtualFav != null
              ? `${pfireAtualStress.toFixed(1)}–${pfireAtualFav.toFixed(1)}% [stress–fav]`
              : 'Monte Carlo 10k sims'}
          </div>
        </div>
        {/* Drift Máximo */}
        <div className="kpi text-center border-l-4" style={{ borderLeftColor: driftMaxColor }}>
          <div className="kpi-label">Drift Máximo</div>
          <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '1.8rem', color: driftMaxColor }}>
            {driftMax != null ? `${driftMax.absGap.toFixed(1)}pp` : '—'}
          </div>
          <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>
            {driftMax != null ? `${driftMax.nome} (${driftMax.gap > 0 ? 'underweight' : 'overweight'})` : '—'}
          </div>
        </div>
        {/* Aporte Meta */}
        <div className="kpi text-center border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="kpi-label">Aporte Meta</div>
          <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '1.8rem' }}>
            {privacyMode ? '••••' : `R$${((derived.aporteMensal ?? 0) / 1000).toFixed(0)}k`}
          </div>
          <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>mensal</div>
        </div>
        {/* Equity YTD USD — SWRD + AVGS weighted by target pesos */}
        {(() => {
          const ytdUsd = derived.retornoYtdEquityUsd as number | null;
          const ytdColor = ytdUsd == null ? 'var(--muted)' : ytdUsd >= 0 ? 'var(--green)' : 'var(--red)';
          const pesosT = (data as any)?.pesosTarget ?? {};
          const covPct = Math.round(((pesosT.SWRD ?? 0) + (pesosT.AVGS ?? 0)) * 100);
          return (
            <div className="kpi text-center border-l-4" style={{ borderLeftColor: ytdColor }}>
              <div className="kpi-label">Equity YTD</div>
              <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '1.8rem', color: ytdColor }}>
                {ytdUsd == null ? '—' : `${ytdUsd >= 0 ? '+' : ''}${ytdUsd.toFixed(1)}%`}
              </div>
              <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>USD · SWRD+AVGS ({covPct}%)</div>
            </div>
          );
        })()}
        {/* Portfólio YTD BRL — full portfolio TWR in BRL */}
        {(() => {
          const ytd = derived.retornoYtd as number | null;
          const ytdColor = ytd == null ? 'var(--muted)' : ytd >= 0 ? 'var(--green)' : 'var(--red)';
          return (
            <div className="kpi text-center border-l-4" style={{ borderLeftColor: ytdColor }}>
              <div className="kpi-label">Portfólio YTD</div>
              <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '1.8rem', color: ytdColor }}>
                {ytd == null ? '—' : `${ytd >= 0 ? '+' : ''}${ytd.toFixed(1)}%`}
              </div>
              <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>BRL · TWR {new Date().getFullYear()}</div>
            </div>
          );
        })()}
        {/* Passivos — compact 6th KPI card */}
        {(() => {
          const passivos = (data as any)?.passivos;
          const irDiferido = (data as any)?.tax?.ir_diferido_total_brl ?? null;
          const items: { label: string; value: number }[] = passivos
            ? [
                passivos.hipoteca_brl      ? { label: 'Hipoteca', value: passivos.hipoteca_brl } : null,
                passivos.emprestimo_xp_brl ? { label: 'XP', value: passivos.emprestimo_xp_brl } : null,
                passivos.ir_diferido_brl   ? { label: 'IR Dif.', value: passivos.ir_diferido_brl } : null,
              ].filter(Boolean) as { label: string; value: number }[]
            : irDiferido
            ? [{ label: 'IR Dif.', value: irDiferido }]
            : [];
          if (items.length === 0) return null;
          const total = passivos?.total_brl ?? items.reduce((s, i) => s + i.value, 0);
          return (
            <div className="kpi text-center border-l-4" style={{ borderLeftColor: 'var(--red)' }}>
              <div className="kpi-label">Passivos</div>
              <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '1.8rem', color: 'var(--red)' }}>
                {privacyMode ? '••••' : `-R$${(total / 1000).toFixed(0)}k`}
              </div>
              <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>
                {privacyMode ? '••' : items.map(i => `${i.label} ${(i.value / 1000).toFixed(0)}k`).join(' · ')}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3. SEMÁFOROS DE GATILHOS — moved earlier: ações imediatas do dia */}
      {derived && Array.isArray(derived.dcaItems) && derived.dcaItems.length > 0 && (
        <SemaforoGatilhos items={derived.dcaItems} />
      )}

      {/* 4. APORTE DO MÊS — próxima ação concreta */}
      {derived && (
        <AporteDoMes
          aporteMensal={derived.aporteMensal}
          ultimoAporte={derived.ultimoAporte}
          ultimoAporteData={derived.ultimoAporteData}
          acumuladoMes={derived.acumuladoMes}
          acumuladoAno={derived.acumuladoAno}
        />
      )}

      {/* 5. DRIFT DA CARTEIRA — contexto de rebalanceamento */}
      {derived && driftItems.length > 0 && (
        <div className="mb-3.5">
          <div className="kpi-label mb-2" style={{ textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>
            Drift da Carteira
          </div>
          <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            {driftItems.map(item => {
              const statusColor =
                item.status === 'verde' ? 'var(--green)' :
                item.status === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
              const barPct = Math.min(100, item.atual > 0 ? (item.atual / Math.max(item.atual, item.alvo)) * 100 : 0);
              const isUnder = item.gap > 0;
              return (
                <div key={item.id} className="bg-card2/40 rounded p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold">{item.nome}</span>
                    <span className="text-xs" style={{ color: statusColor }}>
                      {item.gap >= 0 ? '-' : '+'}{item.absGap.toFixed(1)}pp
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-card rounded-sm overflow-hidden mb-1.5">
                    <div
                      className="absolute left-0 top-0 h-full rounded-sm"
                      style={{ width: `${barPct}%`, background: statusColor, opacity: 0.8 }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5"
                      style={{
                        left: `${Math.min(100, (item.alvo / Math.max(item.atual, item.alvo)) * 100)}%`,
                        background: 'var(--muted)',
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>{item.atual.toFixed(1)}%</span>
                    <span>→ {item.alvo.toFixed(0)}%</span>
                  </div>
                  {item.impactoBrl != null && item.impactoBrl > 5000 && (
                    <div className="text-xs mt-1" style={{ color: isUnder ? 'var(--yellow)' : 'var(--muted)' }}>
                      ~R${(item.impactoBrl / 1000).toFixed(0)}k para fechar gap
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5b. TORNADO DE SENSIBILIDADE [COLLAPSIBLE] */}
      {derived && (
        <CollapsibleSection id="section-pfire-tornado" title={secTitle('now', 'tornado')} defaultOpen={secOpen('now', 'tornado')} icon="🌪">
          <div className="px-4 pb-4">
            <PFireMonteCarloTornado
              pfireBase={derived.pfireBase}
              pfireFav={derived.pfireFav}
              pfireStress={derived.pfireStress}
              tornadoData={derived.tornadoData}
              tornadoOnly
            />
          </div>
        </CollapsibleSection>
      )}

      {/* 6. TIME TO FIRE — Redesign com tabs de perfil */}
      {byProfile.length > 0 && (
        <div className="bg-card border border-border/50 rounded mb-3.5">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted m-0">TIME TO FIRE</h2>
              {/* Aspiracional badge */}
              {byProfile[0]?.p_fire_50 != null && (
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                  FIRE 50: {(byProfile[0].fire_age_50 ?? '2037')} · P={byProfile[0].p_fire_50.toFixed(1)}% aspiracional
                </span>
              )}
            </div>
            {/* Profile Tabs */}
            <div className="flex gap-1">
              {byProfile.map((prof: any, i: number) => (
                <button
                  key={prof.profile}
                  onClick={() => setActiveProfile(i)}
                  className="text-xs px-3 py-1.5 rounded transition-colors"
                  style={{
                    background: activeProfile === i ? 'var(--accent)' : 'var(--card2)',
                    color: activeProfile === i ? 'white' : 'var(--muted)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: activeProfile === i ? 700 : 400,
                  }}
                >
                  {prof.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active profile content */}
          {activeProf && (
            <div className="px-4 py-4">
              <div className="flex items-start gap-4">
                {/* Left: primary metric */}
                <div className="flex-shrink-0 text-center min-w-24">
                  <div className="text-xs text-muted uppercase tracking-wide mb-1">FIRE 53</div>
                  <div
                    className="text-4xl font-black leading-none"
                    style={{ color: activeProf.p_fire_53 >= 88 ? 'var(--green)' : activeProf.p_fire_53 >= 80 ? 'var(--yellow)' : 'var(--red)' }}
                  >
                    {activeProf.p_fire_53?.toFixed(1) ?? '—'}%
                  </div>
                  <div className="text-xs text-muted mt-1">P(sucesso)</div>
                  <div
                    className="text-xs font-semibold mt-1.5 px-2 py-0.5 rounded"
                    style={{
                      background: activeProf.p_fire_53 >= 88 ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                      color: activeProf.p_fire_53 >= 88 ? 'var(--green)' : 'var(--yellow)',
                    }}
                  >
                    {activeProf.p_fire_53 >= 88 ? '✓ ON TRACK' : '⚠ ATENÇÃO'}
                  </div>
                </div>

                {/* Middle: details */}
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-text mb-0.5">
                    {activeProf.fire_age_53 ?? '2040'}
                    <span className="text-sm font-normal text-muted ml-2">
                      ({(parseInt(activeProf.fire_age_53 ?? '2040') - ((data as any)?.premissas?.ano_atual ?? 2026) + ((data as any)?.premissas?.idade_atual ?? 39))} anos)
                    </span>
                  </div>
                  <div className="text-xs text-muted mb-3">
                    {activeProf.label} · R${((activeProf.gasto_anual ?? 250000) / 1000).toFixed(0)}k/ano
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Stress</span>
                      <span className="font-mono" style={{ color: 'var(--red)' }}>{activeProf.p_fire_53_stress?.toFixed(1) ?? '—'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Favorável</span>
                      <span className="font-mono" style={{ color: 'var(--green)' }}>{activeProf.p_fire_53_fav?.toFixed(1) ?? '—'}%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted">Pat. mediano</span>
                      <span className="font-mono">{privacyMode ? '••••' : `R$${((activeProf.pat_mediano_53 ?? 0) / 1e6).toFixed(1)}M`}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted">Gatilho</span>
                      <span className="font-mono">{privacyMode ? '••••' : `R$${(derived.firePatrimonioGatilho / 1e6).toFixed(1)}M`}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensitivity mini-table — scaled to active profile */}
              {sensitivity?.aportes_brl && sensitivity?.pfire_2040 && (
                <div className="mt-4 pt-3 border-t border-border/30">
                  <div className="text-xs text-muted uppercase tracking-wide mb-2">
                    Sensibilidade ao Aporte Mensal (FIRE 53 · {activeProf?.label ?? 'Atual'})
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(() => {
                      // Delta between active profile and base profile (Atual) at the base aporte
                      const basePfire = (byProfile[0]?.p_fire_53 ?? 0) / 100;
                      const activePfire = (activeProf?.p_fire_53 ?? byProfile[0]?.p_fire_53 ?? 0) / 100;
                      const delta = activePfire - basePfire;
                      return sensitivity.aportes_brl.map((val: number, i: number) => {
                        const rawPfire = sensitivity.pfire_2040[i];
                        const adjustedPfire = Math.max(0, Math.min(1, rawPfire + delta));
                        const pct = adjustedPfire * 100;
                        const isBase = val === sensitivity.aporte_base;
                        const color = pct >= 88 ? 'var(--green)' : pct >= 80 ? 'var(--yellow)' : 'var(--red)';
                        return (
                          <div
                            key={val}
                            className="text-center px-2 py-1.5 rounded flex-shrink-0"
                            style={{
                              background: isBase ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--card2)',
                              border: isBase ? '1px solid color-mix(in srgb, var(--accent) 40%, transparent)' : '1px solid transparent',
                            }}
                          >
                            <div className="text-xs font-mono" style={{ color }}>
                              {pct.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted mt-0.5">
                              {privacyMode ? '••' : `R$${val / 1000}k`}
                              {isBase && <span style={{ color: 'var(--accent)' }}> ★</span>}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MERCADO & MACRO — card fixo (substitui inline mercado + Contexto Macro collapsible) */}
      {(() => {
        const macro = (data as any)?.macro ?? {};
        const mercado = (data as any)?.mercado ?? {};
        const btcUsd = mercado.btc_usd ?? macro.bitcoin_usd;
        const dot = (color: string) => (
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, marginLeft: 4, verticalAlign: 'middle' }} />
        );
        return (
          <div className="bg-card border border-border/50 rounded mb-3.5">
            <div className="px-4 pt-3 pb-1 border-b border-border/20">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Mercado & Macro</span>
            </div>
            {/* Row 1: Preços */}
            <div className="grid grid-cols-2 sm:grid-cols-4 px-4 pt-2.5 pb-1 gap-y-2">
              <div>
                <div className="text-xs text-muted">USD/BRL</div>
                <div className="text-sm font-bold font-mono mt-0.5">
                  {derived.CAMBIO ? `R$${derived.CAMBIO.toFixed(2)}` : '—'}
                </div>
                {mercado.cambio_mtd_pct != null && (
                  <div className="text-xs text-muted">{mercado.cambio_mtd_pct > 0 ? '+' : ''}{mercado.cambio_mtd_pct.toFixed(1)}% MtD</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted">BTC/USD</div>
                <div className="text-sm font-bold font-mono mt-0.5">
                  {btcUsd ? `$${Number(btcUsd).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
                </div>
                {mercado.btc_mtd_pct != null && (
                  <div className="text-xs text-muted">{mercado.btc_mtd_pct > 0 ? '+' : ''}{mercado.btc_mtd_pct.toFixed(1)}% MtD</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted flex items-center">IPCA+ 2040{dot(ipcaDotColor)}</div>
                <div className="text-sm font-bold font-mono mt-0.5">{ipcaTaxa ? `${ipcaTaxa.toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted">IPCA+</div>
              </div>
              <div>
                <div className="text-xs text-muted flex items-center">Renda+ 2065{dot(rendaDotColor)}</div>
                <div className="text-sm font-bold font-mono mt-0.5">{rendaTaxa ? `${rendaTaxa.toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted">IPCA+</div>
              </div>
            </div>
            {/* Divider */}
            <div className="border-t border-border/20 mx-4" />
            {/* Row 2: Juros */}
            <div className="grid grid-cols-2 sm:grid-cols-4 px-4 pt-2 pb-3 gap-y-2">
              <div>
                <div className="text-xs text-muted">Selic Meta</div>
                <div className="text-sm font-bold font-mono mt-0.5">{macro.selic_meta != null ? `${(macro.selic_meta as number).toFixed(2)}%` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Fed Funds</div>
                <div className="text-sm font-bold font-mono mt-0.5">{macro.fed_funds != null ? `${(macro.fed_funds as number).toFixed(2)}%` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Spread Selic-FF</div>
                <div className="text-sm font-bold font-mono mt-0.5">{macro.spread_selic_ff != null ? `${(macro.spread_selic_ff as number).toFixed(2)}pp` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Exp. Cambial</div>
                <div className="text-sm font-bold font-mono mt-0.5">{macro.exposicao_cambial_pct != null ? `${(macro.exposicao_cambial_pct as number).toFixed(1)}%` : '—'}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* (SEMÁFOROS, DRIFT, TORNADO, APORTE moved earlier — see below TIME TO FIRE) */}

      {/* 10. FINANCIAL WELLNESS SCORE [COLLAPSIBLE] */}
      {wellnessScore && (
        <CollapsibleSection id="section-wellness" title={secTitle('now', 'wellness')} defaultOpen={secOpen('now', 'wellness')} icon="🏆">
          {(() => {
            const { totalScore, allMetrics, badMetrics, goodMetrics, topAcoes, actionDescriptions } = wellnessScore;

            const renderBar = (pts: number, max: number) => {
              const ratio = pts / max;
              const bg = ratio >= 0.85 ? 'var(--green)' : ratio >= 0.5 ? 'var(--yellow)' : 'var(--red)';
              return (
                <div className="flex-1 bg-card2/40 rounded-sm h-1.5 relative overflow-hidden min-w-16">
                  <div className="h-full rounded-sm" style={{ width: `${(pts / max) * 100}%`, background: bg }} />
                </div>
              );
            };

            const renderMetricRow = (m: typeof allMetrics[0]) => (
              <div key={m.id} className="flex items-center gap-2 mb-1.5">
                <div className="text-xs w-4 flex-shrink-0">{m.isOk ? '✅' : '⚠️'}</div>
                <div className="text-xs text-muted w-36 flex-shrink-0 truncate">{m.label}</div>
                {renderBar(m.pts, m.max)}
                <div className="text-xs text-muted w-14 flex-shrink-0 text-right">{m.detail}</div>
                <div className="text-xs text-muted w-10 flex-shrink-0 text-right">{m.pts}/{m.max}</div>
              </div>
            );

            return (
              <div className="px-4 pb-4">
                <div className="flex gap-5 items-start">
                  <div className="min-w-28 text-center flex-shrink-0">
                    <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">Score</div>
                    <div className="text-5xl font-black text-green leading-none">{totalScore}</div>
                    <div className="text-xs text-muted mt-1">/100 · Progressivo</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {badMetrics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--yellow)' }}>⚠ OPORTUNIDADE DE MELHORIA</div>
                        {badMetrics.map(renderMetricRow)}
                      </div>
                    )}
                    {goodMetrics.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-green mb-1.5">✓ SEM AÇÃO NECESSÁRIA</div>
                        {goodMetrics.map(renderMetricRow)}
                      </div>
                    )}
                  </div>
                </div>
                {topAcoes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">Top Ações para Subir o Score</div>
                    <div className="flex flex-col gap-2">
                      {topAcoes.map((m, i) => {
                        const gap = m.max - m.pts;
                        return (
                          <div key={m.id} className="bg-card2/20 rounded px-3 py-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-muted">{i + 1}.</span>
                              <span className="text-xs font-semibold text-text">{m.label}</span>
                              <span className="text-xs" style={{ color: 'var(--accent)' }}>(+{gap}pts potencial)</span>
                            </div>
                            <div className="text-xs text-muted mt-0.5">{actionDescriptions[m.id] ?? m.description.slice(0, 80)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </CollapsibleSection>
      )}

    </div>
  );
}
