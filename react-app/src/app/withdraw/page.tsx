'use client';

import { useUiStore } from '@/store/uiStore';
import { usePageData } from '@/hooks/usePageData';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { GuardrailsChart } from '@/components/charts/GuardrailsChart';
import { IncomeProjectionChart } from '@/components/charts/IncomeProjectionChart';
import { GuardrailsRetirada } from '@/components/dashboard/GuardrailsRetirada';
import { BondPoolReadiness } from '@/components/dashboard/BondPoolReadiness';
import { BondPoolRunwayChart } from '@/components/charts/BondPoolRunwayChart';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import { SurplusGapChart } from '@/components/charts/SurplusGapChart';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { ScenarioBadge } from '@/components/primitives/ScenarioBadge';
import { FIRE_RULES } from '@/config/business-rules';
import { InfoCard } from '@/components/primitives/InfoCard';

export default function WithdrawPage() {
  const { data, isLoading, dataError, privacyMode } = usePageData();
  // Extra withdraw-specific state (not in usePageData)
  const withdrawScenario = useUiStore(s => s.withdrawScenario);
  const setWithdrawScenario = useUiStore(s => s.setWithdrawScenario);

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data,
    loadingText: 'Carregando dados de retirada...',
    errorPrefix: 'Erro ao carregar dados de retirada:',
    warningText: 'Dados carregados mas seção de retirada não disponível',
  });
  if (stateEl) return stateEl;

  // Scenario configs from data.json (or safe fallback)
  type ScenarioKey = 'atual' | 'casado' | 'filho';
  const safeData = data!;
  const withdrawCenarios: Record<ScenarioKey, { label: string; custo_vida_base: number; tem_conjuge: boolean; inss_katia_anual: number }> = safeData.withdraw_cenarios ?? {
    atual:  { label: 'Solteiro',         custo_vida_base: 250_000, tem_conjuge: false, inss_katia_anual: 0 },
    casado: { label: 'Casado',           custo_vida_base: 270_000, tem_conjuge: true,  inss_katia_anual: 93_600 },
    filho:  { label: 'Casado + Filho',   custo_vida_base: 300_000, tem_conjuge: true,  inss_katia_anual: 93_600 },
  };

  const activeScenarioCfg = withdrawCenarios[withdrawScenario as ScenarioKey] ?? withdrawCenarios.atual;

  // Source: data.fire_swr_percentis (canonical path gerado pelo pipeline Python)
  const swrPercentisRaw = (safeData as any).fire_swr_percentis;
  const swrPercentis = swrPercentisRaw
    ? {
        p10: swrPercentisRaw.swr_p10 as number | undefined,
        p50: swrPercentisRaw.swr_p50 as number | undefined,
        p90: swrPercentisRaw.swr_p90 as number | undefined,
        p10_patrimonio: swrPercentisRaw.patrimonio_p10_2040 as number | undefined,
        p50_patrimonio: swrPercentisRaw.patrimonio_p50_2040 as number | undefined,
        p90_patrimonio: swrPercentisRaw.patrimonio_p90_2040 as number | undefined,
      }
    : undefined;
  const bondPoolReadiness = safeData.fire?.bond_pool_readiness ?? safeData.bond_pool_readiness;
  const bondPoolRunway = safeData.bond_pool_runway ?? safeData.fire?.bond_pool_runway;
  const bondPoolRunwayByProfile = (safeData as any).bond_pool_runway_by_profile;
  const activeRunway = bondPoolRunwayByProfile?.[withdrawScenario as ScenarioKey] ?? bondPoolRunwayByProfile?.atual;
  const incomeTable = safeData.fire?.income_phases ?? safeData.income_phases;

  // SWR efetivo por perfil — recomputado no frontend (patrimônio MC é fixo, gasto muda)
  // Guard: se p10/p50/p90_patrimonio ausente, usar null — nunca fazer fallback para swrPercentis.p10/p50/p90
  // (swrPercentis.p10 é uma taxa, não um patrimônio — denominador incorreto produziria resultado errado)
  const swrEfetivo = swrPercentis ? {
    p10: swrPercentis.p10_patrimonio != null ? activeScenarioCfg.custo_vida_base / swrPercentis.p10_patrimonio : null,
    p50: swrPercentis.p50_patrimonio != null ? activeScenarioCfg.custo_vida_base / swrPercentis.p50_patrimonio : null,
    p90: swrPercentis.p90_patrimonio != null ? activeScenarioCfg.custo_vida_base / swrPercentis.p90_patrimonio : null,
  } : undefined;

  // P(FIRE) por perfil — de fire_matrix.by_profile (mesmo MC run, sem precisar reprocessar)
  const byProfile = (data as any)?.fire_matrix?.by_profile ?? [];
  const pfireByProfile: Record<ScenarioKey, number | null> = {
    atual:  byProfile.find((p: any) => p.profile === 'atual')?.p_fire_53  ?? (data as any)?.spending_guardrails?.pfire_atual ?? null,
    casado: byProfile.find((p: any) => p.profile === 'casado')?.p_fire_53 ?? null,
    filho:  byProfile.find((p: any) => p.profile === 'filho')?.p_fire_53  ?? null,
  };
  const pfireAtual: number | null = pfireByProfile[withdrawScenario as ScenarioKey] ?? pfireByProfile.atual;

  return (
    <div>
      {/* Seletor de cenário familiar — afeta SurplusGapChart, SWR e LTC */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        marginBottom: 12,
        background: 'var(--card2)',
        borderRadius: 6,
        border: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginRight: 4 }}>Perfil familiar:</span>
        {(Object.entries(withdrawCenarios) as [ScenarioKey, typeof withdrawCenarios[ScenarioKey]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setWithdrawScenario(key)}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all .15s',
              borderColor: withdrawScenario === key ? 'var(--accent)' : 'var(--border)',
              background: withdrawScenario === key ? 'rgba(99,179,237,.15)' : 'transparent',
              color: withdrawScenario === key ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {cfg.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--muted)', opacity: .7 }}>
          Gasto base: {privacyMode ? '••••' : `R$${(activeScenarioCfg.custo_vida_base / 1000).toFixed(0)}k/ano`}
        </span>
      </div>

      {/* 0. SWR Dual Cards — Atual vs FIRE Day */}
      {(() => {
        const prem = safeData.premissas ?? {};
        const patrimonioAtual: number = (prem as any).patrimonio_atual ?? 0;
        const custoVidaBase: number = activeScenarioCfg.custo_vida_base;
        const swrAtual = patrimonioAtual > 0 ? custoVidaBase / patrimonioAtual : null;
        const swrFireP50 = swrPercentis?.p50 != null ? swrPercentis.p50 : null;
        const swrFireP10 = swrPercentis?.p10 != null ? swrPercentis.p10 : null;
        const swrFireP90 = swrPercentis?.p90 != null ? swrPercentis.p90 : null;
        const swrTarget = (prem as any).swr_gatilho ?? FIRE_RULES.SWR_DEFAULT;
        // Semáforo para SWR FIRE
        const swrFireColor = swrFireP50 == null ? 'var(--muted)'
          : swrFireP50 <= swrTarget ? 'var(--green)'
          : swrFireP50 <= swrTarget * 1.33 ? 'var(--yellow)'
          : 'var(--red)';
        const swrFireStatus = swrFireP50 == null ? null
          : swrFireP50 <= swrTarget ? '✓ dentro do target'
          : swrFireP50 <= swrTarget * 1.33 ? '⚠ atenção'
          : '✗ acima do target';
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
            {/* Card: SWR Atual */}
            <InfoCard
              label="SWR Atual"
              value={swrAtual != null ? (privacyMode ? '••%' : `${(swrAtual * 100).toFixed(2)}%`) : '—'}
              description={<>Patrimônio hoje / custo de vida · <em>Em fase de acumulação — este SWR não é sustentável no FIRE.</em><br />Meta: ≤{(swrTarget * 100).toFixed(0)}% no FIRE day.</>}
              accentColor="var(--muted)"
              size="lg"
            />
            {/* Card: SWR Projetado FIRE Day */}
            <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '16px 18px', border: '1px solid var(--border)', borderLeft: `4px solid ${swrFireColor}` }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6, fontWeight: 600 }}>
                SWR Projetado — FIRE {(data as any)?.premissas?.ano_cenario_base ?? '2040'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: swrFireColor, lineHeight: 1 }}>
                  {swrFireP50 != null ? (privacyMode ? '••%' : `${(swrFireP50 * 100).toFixed(2)}%`) : '—'}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>P50</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                {swrFireP10 != null && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>
                    P10: {privacyMode ? '••%' : `${(swrFireP10 * 100).toFixed(2)}%`}
                  </span>
                )}
                {swrFireP90 != null && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>
                    P90: {privacyMode ? '••%' : `${(swrFireP90 * 100).toFixed(2)}%`}
                  </span>
                )}
              </div>
              {swrFireStatus && (
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: swrFireColor }}>
                  {swrFireStatus} · alvo ≤{(swrTarget * 100).toFixed(0)}%
                </div>
              )}
              {!swrPercentis && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>—</div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 1. SWR no FIRE Day — Percentis P10 / P50 / P90 (moved first: número central da aposentadoria) */}
      {swrPercentis && (
        <CollapsibleSection id="section-swr-percentiles" title={secTitle('withdraw', 'swr', 'SWR no FIRE Day — Percentis P10 / P50 / P90')} defaultOpen={secOpen('withdraw', 'swr')}>
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
              {/* P10 */}
              <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--red)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P10 — Pessimista</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--red)' }}>
                  {swrEfetivo?.p10 != null ? `${(swrEfetivo.p10 * 100).toFixed(2)}%` : '—'}
                </div>
                {swrPercentis.p10_patrimonio != null && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                    Pat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(swrPercentis.p10_patrimonio)}
                  </div>
                )}
              </div>
              {/* P50 */}
              <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--yellow)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P50 — Mediano</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--yellow)' }}>
                  {swrEfetivo?.p50 != null ? `${(swrEfetivo.p50 * 100).toFixed(2)}%` : '—'}
                </div>
                {swrPercentis.p50_patrimonio != null && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                    Pat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(swrPercentis.p50_patrimonio)}
                  </div>
                )}
              </div>
              {/* P90 */}
              <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--green)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P90 — Otimista</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>
                  {swrEfetivo?.p90 != null ? `${(swrEfetivo.p90 * 100).toFixed(2)}%` : '—'}
                </div>
                {swrPercentis.p90_patrimonio != null && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                    Pat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(swrPercentis.p90_patrimonio)}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
            </div>
            <div className="src">
              P10 = cenário pessimista (menor patrimônio → SWR mais alta); P90 = cenário otimista (maior patrimônio → SWR baixa).
              Patrimônio MC não muda por perfil; SWR efetiva = gasto/{`{`}perfil{`}`} ÷ patrimônio.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 3. Guardrails de Retirada — FIRE Day (collapsible) */}
      {safeData.guardrails_retirada && (
        <CollapsibleSection id="section-guardrails-table" title={secTitle('withdraw', 'guardrails', 'Guardrails de Retirada — FIRE Day')} defaultOpen={secOpen('withdraw', 'guardrails')}>
          <div style={{ padding: '0 16px 16px' }}>
            <GuardrailsRetirada guardrails={safeData.guardrails_retirada} />
            <div style={{ marginTop: 10, fontSize: 'var(--text-sm)', background: 'rgba(34,197,94,.07)', borderRadius: 6, padding: 8, borderLeft: '3px solid var(--green)' }}>
              <strong>Upside:</strong> se portfolio sobe 25%+ acima do pico real → aumentar retirada 10% permanente (teto R$350k)
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 4. Spending Guardrails — P(FIRE) × Custo de Vida (collapsible) */}
      <CollapsibleSection id="section-spending-guardrails" title={secTitle('withdraw', 'spending-guardrails', 'Spending Guardrails — P(FIRE) × Custo de Vida')} defaultOpen={secOpen('withdraw', 'spending-guardrails')}>
        <div style={{ padding: '0 16px 16px' }}>
          {/* P(FIRE) Status bar */}
          {(() => {
            const sg = safeData.spending_guardrails ?? (safeData as any).fire?.spending_guardrails;
            if (!sg) return null;
            const pfire = pfireAtual ?? sg.pfire_atual ?? 0;
            const zona = sg.zona ?? 'verde';
            const zonaColor = zona === 'verde' ? 'var(--green)' : zona === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
            const statusLabel = zona === 'verde' ? 'No caminho certo' : zona === 'amarelo' ? 'Atenção' : 'Zona de risco';
            return (
              <div style={{ marginBottom: 16, background: 'var(--card2)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                    P(FIRE) Atual
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: zonaColor }}>
                    {pfire.toFixed(1)}% — {statusLabel}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ position: 'relative', height: 10, background: 'rgba(148,163,184,.15)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 5, background: zonaColor, width: `${Math.min(100, pfire)}%`, transition: 'width .4s' }} />
                </div>
                {/* Threshold markers */}
                <div style={{ position: 'relative', height: 16, marginTop: 2 }}>
                  <div style={{ position: 'absolute', left: '70%', top: 0, fontSize: 'var(--text-xs)', color: 'var(--red)', transform: 'translateX(-50%)' }}>70%↑</div>
                  <div style={{ position: 'absolute', left: '80%', top: 0, fontSize: 'var(--text-xs)', color: 'var(--yellow)', transform: 'translateX(-50%)' }}>80%↑</div>
                  <div style={{ position: 'absolute', left: '95%', top: 0, fontSize: 'var(--text-xs)', color: 'var(--green)', transform: 'translateX(-50%)' }}>95%</div>
                </div>
                {sg.nota && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>{sg.nota}</div>
                )}
              </div>
            );
          })()}
          <div style={{ marginBottom: 8 }}>
            <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
          </div>
          <GuardrailsChart data={safeData} gastoOverride={activeScenarioCfg.custo_vida_base} />
          <div className="src">
            Base: Monte Carlo 10k · Interpolação linear entre pontos simulados
          </div>
        </div>
      </CollapsibleSection>

      {/* 3b. Surplus-Gap Chart — F2 DEV-boldin-dashboard */}
      <CollapsibleSection id="section-surplus-gap" title={secTitle('withdraw', 'section-surplus-gap', 'Superávit / Déficit Anual — P10/P50/P90')} defaultOpen={secOpen('withdraw', 'section-surplus-gap')} icon="📊">
        <div style={{ padding: '0 16px 16px' }}>
          <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
          <SurplusGapChart data={data} premissasOverride={activeScenarioCfg} />
        </div>
      </CollapsibleSection>

      {/* 4. Bond Pool Readiness — Proteção SoRR */}
      {bondPoolReadiness && (
        <CollapsibleSection id="bondPoolSection" title={secTitle('withdraw', 'bond-pool', 'Bond Pool Readiness — Proteção SoRR')} defaultOpen={secOpen('withdraw', 'bond-pool')} icon="🏦">
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ marginBottom: 8 }}>
              <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
            </div>
            <BondPoolReadiness data={bondPoolReadiness} custo_vida_base={activeScenarioCfg.custo_vida_base} />
            {/* Runway por perfil — comparação e trajetória */}
            {bondPoolRunwayByProfile && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                  Runway do Bond Pool pós-FIRE — por perfil
                </div>
                {/* Comparison strip */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {(Object.entries(withdrawCenarios) as [ScenarioKey, typeof withdrawCenarios[ScenarioKey]][]).map(([key, cfg]) => {
                    const runway = bondPoolRunwayByProfile[key]?.runway_anos;
                    const isActive = key === withdrawScenario;
                    return (
                      <div key={key} style={{
                        flex: '1 1 100px',
                        background: isActive ? 'rgba(99,179,237,.12)' : 'var(--card2)',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: isActive ? 'var(--accent)' : 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
                          {cfg.label}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: runway != null && runway >= 7 ? 'var(--green)' : runway != null && runway >= 5 ? 'var(--yellow)' : 'var(--red)' }}>
                          {runway != null ? (privacyMode ? '••••' : `${runway.toFixed(1)}a`) : '—'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
                          {runway != null ? (runway >= 7 ? '✓ meta' : runway >= 5 ? '⚠ ok' : '✗ curto') : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Active profile depletion chart */}
                {activeRunway && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6 }}>
                      Trajetória — <strong>{activeScenarioCfg.label}</strong> · pool inicial: {privacyMode ? '••••' : `R$${((activeRunway.pool_inicial ?? 0) / 1000).toFixed(0)}k`}
                    </div>
                    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', height: 60, borderBottom: '1px solid var(--border)' }}>
                      {(activeRunway.pool_disponivel as number[]).map((v: number, i: number) => {
                        const maxVal = (activeRunway.pool_disponivel as number[])[0] || 1;
                        const heightPct = Math.max(0, Math.min(100, (v / maxVal) * 100));
                        const isZero = v <= 0;
                        return (
                          <div key={i} title={`Ano ${(activeRunway.anos_pos_fire as number[])[i]}: ${privacyMode ? '••••' : `R$${(v/1000).toFixed(0)}k`}`}
                            style={{
                              flex: 1,
                              height: `${heightPct}%`,
                              background: isZero ? 'var(--red)' : 'var(--accent)',
                              opacity: isZero ? .4 : .75,
                              borderRadius: '2px 2px 0 0',
                              minHeight: isZero ? 3 : 2,
                            }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
                      <span>Ano 1</span>
                      <span>Ano {(activeRunway.anos_pos_fire as number[]).length}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Acumulação pré-FIRE: barras = dados reais (fixos), meta muda por perfil */}
            {bondPoolRunway && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                  Trajetória de Acumulação — pré-FIRE (2026→2040)
                </div>
                <BondPoolRunwayChart
                  data={bondPoolRunway}
                  alvoOverride={bondPoolReadiness ? activeScenarioCfg.custo_vida_base * (bondPoolReadiness.meta_anos ?? 7) : undefined}
                />
              </div>
            )}
            <div className="src">
              Bond pool = ativos RF que provêm liquidez nos primeiros anos FIRE sem vender equity em drawdown. Meta: 7 anos × gasto do perfil selecionado.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 5. Fluxo de Caixa Atual — Receitas vs Gastos Hoje */}
      <CollapsibleSection id="section-sankey" title={secTitle('withdraw', 'sankey', 'Fluxo de Caixa Atual — Receitas vs Gastos (hoje)')} defaultOpen={secOpen('withdraw', 'sankey')} icon="💸">
        <div style={{ padding: '0 16px 16px' }}>
          <CashFlowSankey />
        </div>
      </CollapsibleSection>

      {/* 5b. Spending — Essenciais vs Discricionários (logo após o cashflow de hoje) */}
      {(safeData.spending ?? safeData.fire?.spending ?? safeData.spending_breakdown) && (
        <CollapsibleSection id="section-spending-breakdown" title={secTitle('withdraw', 'spending-breakdown', 'Spending — Essenciais vs Discricionários')} defaultOpen={secOpen('withdraw', 'spending-breakdown', false)}>
          <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const spending = safeData.spending ?? safeData.fire?.spending ?? safeData.spending_breakdown ?? {};
            const essenciais = spending.essenciais_mes ?? spending.must_spend_mensal ?? spending.essenciais ?? 15074;
            const discric = spending.discric_mes ?? spending.like_spend_mensal ?? spending.discricionarios ?? 4284;
            const imprevistos = spending.imprevistos_mes ?? spending.imprevistos_mensal ?? spending.imprevistos ?? 363;
            const total = essenciais + discric + imprevistos;
            const rendaAnual = spending.renda_anual ?? 250000;
            const orcamentoAnual = spending.orcamento_anual ?? 13000;
            const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', borderLeft: '3px solid var(--red)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Essenciais</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>{fmt(essenciais)}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>mês · {total > 0 ? Math.round(essenciais / total * 100) : 79}% do total</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>Valor principal: hipoteca (~R$1.317/mês e equity)</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', borderLeft: '3px solid var(--yellow)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Discricionários</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--yellow)' }}>{fmt(discric)}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>mês · {total > 0 ? Math.round(discric / total * 100) : 21}% do total</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>Discricionários contínuos</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', borderLeft: '3px solid var(--muted)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Imprevistos</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fmt(imprevistos)}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>mês · {total > 0 ? Math.round(imprevistos / total * 100) : 2}% do total</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>buffer pontual</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fmt(total)}/mês</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Total financeiro</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fmt(rendaAnual)}/ano</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Renda FII</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center', borderLeft: '3px solid var(--green)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>✓ {fmt(orcamentoAnual)}/ano</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Orçamento conservador</div>
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="src">
            Período: Ago/2026 a Mar/2026 (8 meses) · Essenciais: linha principal de despesa (R$1.317/mês e equity e hipoteca)
          </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 6. Renda na Aposentadoria — Fases Temporais (collapsible) */}
      <CollapsibleSection id="section-income-phases" title={secTitle('withdraw', 'fases', 'Renda na Aposentadoria — Fases Temporais')} defaultOpen={secOpen('withdraw', 'fases')}>
        <div style={{ padding: '0 16px 16px' }}>
          {incomeTable && Array.isArray(incomeTable) ? (
            <div style={{ overflowX: 'auto', marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Fase</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Idade</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Fonte de Renda</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Gasto ex-saúde</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Saúde</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeTable.map((row: { fase: string; idade: string; fonte: string; gasto_ex_saude: string; saude: string; obs: string }, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 500 }}>{row.fase}</td>
                      <td style={{ padding: '6px 8px' }}>{row.idade}</td>
                      <td style={{ padding: '6px 8px' }}>{row.fonte}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.gasto_ex_saude}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.saude}</td>
                      <td style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <IncomeProjectionChart data={safeData} />
          )}
          <div className="src">
            Fases: Go-Go (50–65, alta mobilidade), Slow-Go (65–75, moderado), No-Go (75+, baixa mobilidade). Spending smile aplicado às projeções MC.
          </div>
        </div>
      </CollapsibleSection>

      {/* F7 — LTC Sensitivity Test (DEV-boldin-dashboard) */}
      <CollapsibleSection id="section-ltc-sensitivity" title={secTitle('withdraw', 'section-ltc-sensitivity', 'LTC — Sensibilidade Cuidados de Longo Prazo')} defaultOpen={secOpen('withdraw', 'section-ltc-sensitivity')} icon="🏥">
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const premissas = data?.premissas ?? {};
            const custo_vida_base: number = activeScenarioCfg.custo_vida_base;
            const swr_target: number = premissas.swr_gatilho ?? FIRE_RULES.SWR_DEFAULT;
            const fire_data = (data as any)?.fire ?? {};
            const pat_mediano = fire_data.pat_mediano_fire ?? fire_data.pat_p50_fire ?? premissas.patrimonio_atual ?? 3_500_000;
            const fmtBrl = (v: number) => privacyMode ? '••••' : `R$${(v / 1000).toFixed(0)}k`;
            const fmtPct = (v: number) => privacyMode ? '••%' : `${(v * 100).toFixed(1)}%`;

            const ltcCenarios = [
              { label: 'Sem LTC', saude_extra: 0 },
              { label: 'LTC moderado', saude_extra: 72_000, nota: '~R$6k/mês × 12 meses' },
              { label: 'LTC intensivo', saude_extra: 216_000, nota: '~R$18k/mês × 12 meses (asilo)' },
            ];

            return (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 10 }}>
                  Impacto de custos LTC (Long-Term Care) no SWR efetivo. Patrimônio mediano projetado no FIRE Day: {fmtBrl(pat_mediano)}.
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)' }}>Cenário LTC</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)' }}>Custo extra/ano</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)' }}>Custo total/ano</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)' }}>SWR implícito</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ltcCenarios.map((c, i) => {
                        const custoTotal = custo_vida_base + c.saude_extra;
                        const swrImplicito = pat_mediano > 0 ? custoTotal / pat_mediano : 0;
                        const ok = swrImplicito <= swr_target;
                        const warn = swrImplicito <= swr_target * 1.3;
                        const statusColor = ok ? 'var(--green)' : warn ? 'var(--yellow)' : 'var(--red)';
                        const statusLabel = ok ? '✓ Dentro do SWR target' : warn ? '⚠ Atenção' : '✗ Acima do SWR target';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 8px' }}>
                              <div style={{ fontWeight: 500 }}>{c.label}</div>
                              {c.nota && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{c.nota}</div>}
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtBrl(c.saude_extra)}</td>
                            <td style={{ textAlign: 'right', padding: '8px 8px' }}>{fmtBrl(custoTotal)}</td>
                            <td style={{ textAlign: 'right', padding: '8px 8px', fontWeight: 700, color: statusColor }}>{fmtPct(swrImplicito)}</td>
                            <td style={{ padding: '8px 8px', color: statusColor, fontWeight: 500 }}>{statusLabel}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 8 }}>
                  SWR target: {fmtPct(swr_target)}. Patrimônio mediano estimado no FIRE Day: {fmtBrl(pat_mediano)}.
                  LTC = custos de saúde intensiva nos anos finais (No-Go phase). Spending smile já inclui decaimento base de saúde.
                </div>
              </div>
            );
          })()}
        </div>
      </CollapsibleSection>
    </div>
  );
}
