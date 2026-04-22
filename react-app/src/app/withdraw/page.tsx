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
import { Shield } from 'lucide-react';
import { FIRE_RULES } from '@/config/business-rules';
import { EChart } from '@/components/primitives/EChart';
import { EC } from '@/utils/echarts-theme';
import BondStrategyPanel from '@/components/dashboard/BondStrategyPanel';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import SequenceOfReturnsHeatmap from '@/components/dashboard/SequenceOfReturnsHeatmap';
import SWRDashboard from '@/components/dashboard/SWRDashboard';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { BarChart3, Building2, Thermometer, ArrowRightLeft, Hospital, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

// ── FloorUpsideWithdraw — Cobertura por Camadas ─────────────────────────────
interface FloorUpsideWithdrawProps {
  gastoPiso: number;
  custoVida: number;
  swrGatilho: number;
  patrimonio: number;
  bondRunwayAnos: number | null;
  privacyMode: boolean;
}

function FloorUpsideWithdraw({
  gastoPiso,
  custoVida,
  swrGatilho,
  patrimonio,
  bondRunwayAnos,
  privacyMode,
}: FloorUpsideWithdrawProps) {
  const gapEquity = Math.max(0, custoVida - gastoPiso);
  const patNecessarioGap = swrGatilho > 0 ? gapEquity / swrGatilho : null;
  const coberturaAtual =
    gapEquity === 0
      ? 100
      : patNecessarioGap != null && patNecessarioGap > 0 && patrimonio > 0
        ? Math.min(100, (patrimonio / patNecessarioGap) * 100)
        : null;

  const floorPct = custoVida > 0 ? (gastoPiso / custoVida) * 100 : 0;
  const gapCobertoPct =
    coberturaAtual != null
      ? Math.min(100 - floorPct, (coberturaAtual / 100) * (100 - floorPct))
      : 0;
  const gapDescobertoPct = Math.max(0, 100 - floorPct - gapCobertoPct);

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 8, bottom: 8 },
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: { type: 'category', data: [''], show: false },
    series: [
      {
        name: 'Floor garantido',
        type: 'bar',
        stack: 'total',
        data: [floorPct],
        itemStyle: { color: EC.accent },
        barMaxWidth: 40,
      },
      {
        name: 'Gap coberto (equity)',
        type: 'bar',
        stack: 'total',
        data: [gapCobertoPct],
        itemStyle: { color: '#22c55e' },
        barMaxWidth: 40,
      },
      {
        name: 'Gap descoberto',
        type: 'bar',
        stack: 'total',
        data: [gapDescobertoPct],
        itemStyle: { color: '#ef4444' },
        barMaxWidth: 40,
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.seriesName}: ${(p.value as number).toFixed(1)}%`,
    },
  };

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
        🏦 Cobertura por Camadas — Floor vs Upside
      </h3>

      <EChart option={option} style={{ height: 56 }} />

      {/* Legenda */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        {[
          { color: EC.accent, label: 'Floor garantido' },
          { color: '#22c55e', label: 'Gap coberto (equity)' },
          { color: '#ef4444', label: 'Gap descoberto' },
        ].map(l => (
          <div
            key={l.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: l.color,
                flexShrink: 0,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>

      {/* 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div
          style={{
            background: 'var(--card2)',
            borderRadius: '8px',
            padding: '10px',
            border: '1px solid rgba(59,130,246,.3)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '2px',
            }}
          >
            Floor garantido
          </div>
          <div
            style={{ fontSize: '1.1rem', fontWeight: 700, color: EC.accent }}
            className="pv"
          >
            {privacyMode ? '••••' : `R$${(gastoPiso / 1000).toFixed(0)}k/ano`}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>RF + INSS</div>
        </div>
        <div
          style={{
            background: 'var(--card2)',
            borderRadius: '8px',
            padding: '10px',
            border: '1px solid rgba(239,68,68,.3)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '2px',
            }}
          >
            Gap (equity)
          </div>
          <div
            style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}
            className="pv"
          >
            {privacyMode ? '••••' : `R$${(gapEquity / 1000).toFixed(0)}k/ano`}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }} className="pv">
            {patNecessarioGap != null
              ? privacyMode
                ? '••••'
                : `Pat. necessário: R$${(patNecessarioGap / 1e6).toFixed(1)}M`
              : '—'}
          </div>
        </div>
        <div
          style={{
            background: 'var(--card2)',
            borderRadius: '8px',
            padding: '10px',
            border: `1px solid ${coberturaAtual != null && coberturaAtual >= 100 ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '2px',
            }}
          >
            Cobertura atual
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color:
                coberturaAtual != null && coberturaAtual >= 100
                  ? '#22c55e'
                  : '#ef4444',
            }}
          >
            {coberturaAtual != null ? `${coberturaAtual.toFixed(0)}%` : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
            do gap equity coberto
          </div>
        </div>
      </div>

      {/* Bond pool badge */}
      {bondRunwayAnos != null && bondRunwayAnos >= 5 && (
        <div
          style={{
            marginTop: '10px',
            padding: '6px 10px',
            background: 'rgba(59,130,246,.08)',
            border: '1px solid rgba(59,130,246,.2)',
            borderRadius: '6px',
            fontSize: 'var(--text-xs)',
            color: 'var(--accent)',
          }}
        >
          <Shield size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Bond pool cobre os primeiros{' '}
          <strong>{bondRunwayAnos} anos</strong> do gap sem vender equity —
          buffer SoRR ativo
        </div>
      )}

      <div className="src" style={{ marginTop: '8px' }}>
        Floor: gasto_piso (RF garantido) · Gap: custo_vida − floor · Cobertura: patrimônio / (gap / SWR)
      </div>
    </div>
  );
}

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
      <SectionDivider label="Estratégia de Retirada" />
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

      {/* 0. SWR Dashboard — tabs: Acumulação vs FIRE Day (P10/P50/P90) */}
      <CollapsibleSection id="section-swr-dashboard" title={secTitle('withdraw', 'swr-dashboard', 'SWR Dashboard — Acumulação & FIRE Day')} defaultOpen={secOpen('withdraw', 'swr-dashboard', true)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const prem = safeData.premissas ?? {};
            const patrimonioAtual: number = (prem as any).patrimonio_atual ?? 0;
            const swrTarget = (prem as any).swr_gatilho ?? FIRE_RULES.SWR_DEFAULT;
            return (
              <SWRDashboard
                patrimonioAtual={patrimonioAtual}
                custoVidaBase={activeScenarioCfg.custo_vida_base}
                swrTarget={swrTarget}
                swrP10={swrEfetivo?.p10 ?? null}
                swrP50={swrEfetivo?.p50 ?? null}
                swrP90={swrEfetivo?.p90 ?? null}
                patrimonioP10={swrPercentis?.p10_patrimonio ?? null}
                patrimonioP50={swrPercentis?.p50_patrimonio ?? null}
                patrimonioP90={swrPercentis?.p90_patrimonio ?? null}
                scenarioLabel={activeScenarioCfg.label}
                anoCenarioBase={(data as any)?.premissas?.ano_cenario_base ?? '2040'}
              />
            );
          })()}
        </div>
      </CollapsibleSection>

      {/* Floor vs Upside — Cobertura por Camadas */}
      <CollapsibleSection id="section-floor-upside" title={secTitle('withdraw', 'floor-upside', 'Cobertura por Camadas — Floor vs Upside')} defaultOpen={secOpen('withdraw', 'floor-upside', true)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const prem = safeData.premissas ?? {};
            const gastoPiso: number = (safeData as any).gasto_piso ?? 0;
            const custoVida: number = activeScenarioCfg.custo_vida_base;
            const swrGatilho: number = (prem as any).swr_gatilho ?? FIRE_RULES.SWR_DEFAULT;
            const patrimonio: number = (prem as any).patrimonio_atual ?? 0;
            const bpr = (safeData as any).bond_pool_runway ?? null;
            const bondRunwayAnos: number | null =
              bpr != null && Array.isArray(bpr.anos_cobertura_pos_fire)
                ? (bpr.anos_cobertura_pos_fire as number[]).length
                : null;
            return (
              <>
                <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
                <FloorUpsideWithdraw
                  gastoPiso={gastoPiso}
                  custoVida={custoVida}
                  swrGatilho={swrGatilho}
                  patrimonio={patrimonio}
                  bondRunwayAnos={bondRunwayAnos}
                  privacyMode={privacyMode}
                />
              </>
            );
          })()}
        </div>
      </CollapsibleSection>

      <SectionDivider label="Guardrails" />
      {/* 3. Guardrails de Retirada — FIRE Day (collapsible) */}
      {safeData.guardrails_retirada && (
        <CollapsibleSection id="section-guardrails-table" title={secTitle('withdraw', 'guardrails', 'Regras de Ajuste de Retirada — FIRE Day')} defaultOpen={secOpen('withdraw', 'guardrails')}>
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
      <CollapsibleSection id="section-surplus-gap" title={secTitle('withdraw', 'section-surplus-gap', 'Superávit / Déficit Anual — P10/P50/P90')} defaultOpen={secOpen('withdraw', 'section-surplus-gap')} icon={<BarChart3 size={18} />}>
        <div style={{ padding: '0 16px 16px' }}>
          <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
          <SurplusGapChart data={data} premissasOverride={activeScenarioCfg} />
        </div>
      </CollapsibleSection>

      <SectionDivider label="Bond Strategy" />
      {/* 4. Bond Strategy — SoRR + Pool Readiness */}
      {bondPoolReadiness && (
        <CollapsibleSection id="bondPoolSection" title={secTitle('withdraw', 'bond-pool', 'Bond Strategy — SoRR + Pool Readiness')} defaultOpen={secOpen('withdraw', 'bond-pool')} icon={<Building2 size={18} />}>
          <div style={{ padding: '0 16px 16px' }}>
            <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
            <BondStrategyPanel
              idadeAtual={(safeData.premissas as any)?.idade_atual ?? 39}
              idadeFire={(safeData.premissas as any)?.idade_cenario_base ?? 53}
              rfPctAtual={(safeData.drift as any)?.IPCA?.atual ?? undefined}
              bondPoolReadiness={bondPoolReadiness}
              bondPoolRunway={bondPoolRunway}
              bondPoolRunwayByProfile={bondPoolRunwayByProfile}
              withdrawScenario={withdrawScenario}
              withdrawCenarios={withdrawCenarios}
              custo_vida_base={activeScenarioCfg.custo_vida_base}
              rf={(safeData as any).rf ?? {}}
              privacyMode={privacyMode}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* 5a. Sequence of Returns Heatmap — movido de FIRE */}
      <CollapsibleSection
        id="section-sequence-returns"
        title={secTitle('withdraw', 'sequence-returns', 'Sequence of Returns — Heatmap de Risco')}
        defaultOpen={secOpen('withdraw', 'sequence-returns', false)}
        icon={<Thermometer size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
          {(() => {
            const fireTrilha = (data as any)?.fire_trilha ?? {};
            const spending = activeScenarioCfg.custo_vida_base;
            return (
              <SequenceOfReturnsHeatmap
                dates={fireTrilha.dates ?? []}
                trilhaBrl={fireTrilha.trilha_brl ?? []}
                spending={spending}
              />
            );
          })()}
          <div className="src">
            Heatmap de risco de sequência de retornos. SWR implícito a cada data — verde = sustentável, vermelho = risco.
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Fluxo de Caixa Atual — Receitas vs Gastos Hoje */}
      <CollapsibleSection id="section-sankey" title={secTitle('withdraw', 'sankey', 'Fluxo de Caixa Atual — Receitas vs Gastos (hoje)')} defaultOpen={secOpen('withdraw', 'sankey')} icon={<ArrowRightLeft size={18} />}>
        <div style={{ padding: '0 16px 16px' }}>
          <CashFlowSankey />
        </div>
      </CollapsibleSection>


      <SectionDivider label="Renda na Aposentadoria" />
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
      <CollapsibleSection id="section-ltc-sensitivity" title={secTitle('withdraw', 'section-ltc-sensitivity', 'LTC — Sensibilidade Cuidados de Longo Prazo')} defaultOpen={secOpen('withdraw', 'section-ltc-sensitivity')} icon={<Hospital size={18} />}>
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
                        const statusLabel = ok ? <><CheckCircle size={14} className="inline mr-1" />Dentro do SWR target</> : warn ? <><AlertCircle size={14} className="inline mr-1" />Atenção</> : <><XCircle size={14} className="inline mr-1" />Acima do SWR target</>;
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

      {/* Bond Ladder — seção unificada: cronograma + estrutura por prazo */}
      <CollapsibleSection id="section-bond-ladder" title={secTitle('withdraw', 'bond-ladder', 'Bond Ladder — Cronograma & Estrutura de Vencimentos')} defaultOpen={secOpen('withdraw', 'bond-ladder', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const rf = (data as any)?.rf ?? {};
            const v = (pos: any) => pos?.valor ?? pos?.valor_brl ?? 0;
            const i29 = v(rf.ipca2029);
            const i40 = v(rf.ipca2040);
            const i50 = v(rf.ipca2050);
            const r65 = v(rf.renda2065);
            const total = i29 + i40 + i50 + r65;
            const custoMensal = activeScenarioCfg.custo_vida_base / 12;
            const fmtK = (n: number) => privacyMode ? '••••' : `R$${(n / 1000).toFixed(0)}k`;
            const fmtMeses = (n: number) => custoMensal > 0 ? `${(n / custoMensal).toFixed(1)}m` : '—';
            const pct = (n: number) => total > 0 ? (n / total) * 100 : 0;

            const bonds = [
              { key: 'ipca2029', label: 'IPCA+2029', year: 2029, val: i29, pool: 'sorr' as const },
              { key: 'ipca2040', label: 'IPCA+2040', year: 2040, val: i40, pool: 'sorr' as const },
              { key: 'ipca2050', label: 'IPCA+2050', year: 2050, val: i50, pool: 'hold' as const },
              { key: 'renda2065', label: 'Renda+2065', year: 2065, val: r65, pool: 'hold' as const },
            ];
            const maxVal = Math.max(...bonds.map(b => b.val), 1);

            const spendingPool = i29 + i40;
            const holdPool = i50 + r65;

            // Maturity buckets (anos a partir de hoje, 2026)
            const buckets = [
              { label: '≤ 3a', range: 'IPCA+2029', val: i29, color: '#2563eb' },
              { label: '5–15a', range: 'IPCA+2040', val: i40, color: '#0ea5e9' },
              { label: '20–30a', range: 'IPCA+2050', val: i50, color: '#7c3aed' },
              { label: '35+ a', range: 'Renda+2065', val: r65, color: '#9333ea' },
            ];

            return (
              <>
                <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />

                {/* ── 1. Timeline de vencimentos ── */}
                <div style={{ marginTop: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
                    Cronograma de Vencimentos
                  </div>
                  {/* Pool legend */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb', flexShrink: 0 }} />
                      <Shield size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> SoRR Buffer
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: '#7c3aed', flexShrink: 0 }} />
                      📦 Hold-to-maturity
                    </div>
                  </div>
                  {/* Bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
                    {bonds.map(b => {
                      const heightPct = maxVal > 0 ? Math.max((b.val / maxVal) * 100, b.val > 0 ? 8 : 0) : 0;
                      const col = b.pool === 'sorr' ? '#2563eb' : '#7c3aed';
                      return (
                        <div key={b.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{fmtMeses(b.val)}</div>
                          <div style={{ width: '100%', height: `${heightPct}%`, background: col, borderRadius: '4px 4px 0 0', minHeight: b.val > 0 ? 8 : 0 }} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Labels */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    {bonds.map(b => (
                      <div key={b.key} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>{b.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{b.year}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, marginTop: 1 }} className="pv">{fmtK(b.val)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── 2. Pool distinction ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
                  <div style={{ background: 'rgba(37,99,235,.06)', border: '1px solid rgba(37,99,235,.25)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={13} /> SoRR Buffer — pool ativo</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 4 }}>IPCA+2029 + IPCA+2040</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }} className="pv">{fmtK(spendingPool)}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                      {fmtMeses(spendingPool)} de custo de vida cobertos · vence antes do FIRE Day
                    </div>
                  </div>
                  <div style={{ background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, marginBottom: 6 }}>📦 Hold-to-maturity — estrutural</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 4 }}>IPCA+2050 + Renda+2065</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }} className="pv">{fmtK(holdPool)}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                      Atravessa todo o horizonte de aposentadoria · não gastar antes do vencimento
                    </div>
                  </div>
                </div>

                {/* ── 3. Distribuição por prazo (stacked bar) ── */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>
                    Distribuição por Prazo
                  </div>
                  {total > 0 && (
                    <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                      {buckets.filter(b => b.val > 0).map(b => (
                        <div
                          key={b.range}
                          style={{ flex: pct(b.val), background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 20 }}
                          title={`${b.range}: ${pct(b.val).toFixed(1)}%`}
                        >
                          {pct(b.val) > 10 && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{pct(b.val).toFixed(0)}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {buckets.filter(b => b.val > 0).map(b => (
                      <div key={b.range} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0 }} />
                        {b.label} ({pct(b.val).toFixed(0)}%)
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
          <div className="src" style={{ marginTop: 12 }}>
            SoRR Buffer: spend-down antes de vender equity em drawdown. Hold-to-maturity: não resgatar antes do vencimento — marcação a mercado pode mostrar ganho/perda mas não é relevante para estratégia. Valores BRL posição atual.
          </div>
        </div>
      </CollapsibleSection>

      {/* Bond Pool Composition — moved to BondStrategyPanel (Bloco C) */}

      {/* Spending Breakdown — componente dedicado */}
      <CollapsibleSection id="section-spending-breakdown-v2" title={secTitle('withdraw', 'spending-breakdown-v2', 'Spending Breakdown — Detalhamento por Categoria')} defaultOpen={secOpen('withdraw', 'spending-breakdown-v2', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ marginBottom: 8 }}>
            <ScenarioBadge label={activeScenarioCfg.label} gasto={activeScenarioCfg.custo_vida_base} privacyMode={privacyMode} />
          </div>
          {(() => {
            // Fonte: spending_summary.json → data.spending_breakdown (via generate_data.py)
            const sb = (data as any)?.spending_breakdown ?? {};
            const musthave = sb.must_spend_anual ?? 0;
            const likes    = sb.like_spend_anual ?? 0;
            const imprevistos = sb.imprevistos_anual ?? 0;
            const totalAnual  = sb.total_anual ?? ((musthave + likes + imprevistos) || activeScenarioCfg.custo_vida_base);
            const monthly = sb.monthly_breakdown ?? undefined;
            return (
              <SpendingBreakdown
                musthave={musthave}
                likes={likes}
                imprevistos={imprevistos}
                totalAnual={totalAnual}
                monthlyBreakdown={monthly}
              />
            );
          })()}
          <div className="src">
            Fonte: CSV All-Accounts → spending_analysis.py → spending_summary.json. Executar script para atualizar.
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
