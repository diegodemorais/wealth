'use client';

/**
 * IifptPanel (exported as IifptRadar) — Modelo IIFPT completo
 *
 * 4 sub-seções:
 *  1. Score hero — score integrado ponderado
 *  2. Radar ECharts + tabela de domínios com acionáveis
 *  3. Coupling table — acoplamentos Tax↔Inv, Tax↔Ret, etc.
 *  4. RM callout — aviso crítico se coverage < 0.3
 *
 * Localização no NOW tab: após wellness block, antes do DCA status.
 * Issue: DEV-iifpt-dashboard (CC1+DC1)
 */

import { useMemo } from 'react';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { EChart } from '@/components/primitives/EChart';
import { EC, EC_TOOLTIP } from '@/utils/echarts-theme';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { useChartResize } from '@/hooks/useChartResize';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';

// ── Domain config ─────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  inv: 'Investment',
  ret: 'Retirement',
  tax: 'Tax',
  cf:  'Cash Flow',
  rm:  'Risk Mgmt',
  est: 'Estate',
};

const DOMAIN_ORDER = ['inv', 'ret', 'tax', 'cf', 'rm', 'est'];

// Hardcoded coupling data from IIFPT paper Appendix C
const COUPLINGS = [
  { pair: 'Tax ↔ Investment',         intensity: 0.60, pctQ: 46.8, level: 'Forte'    },
  { pair: 'Tax ↔ Retirement',         intensity: 0.55, pctQ: 30.7, level: 'Forte'    },
  { pair: 'Cash Flow ↔ Retirement',   intensity: 0.35, pctQ: 10.9, level: 'Moderado' },
  { pair: 'Risk Mgmt ↔ Cash Flow',    intensity: 0.30, pctQ:  6.7, level: 'Moderado' },
  { pair: 'Risk Mgmt ↔ Retirement',   intensity: 0.30, pctQ:  6.7, level: 'Moderado' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface IifptRadarProps {
  domainCoverage: Record<string, number>;
  priorityWeights: Record<string, number>;
  bondPoolCoverageAnos?: number | null;
  bondPoolMetaAnos?: number | null;
  yearsToFire?: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const maxW = Math.max(...Object.values(weights));
  if (maxW <= 0) return weights;
  return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / maxW]));
}

// Axis label color: red if coverage < 0.3, yellow if < 0.5
function axisColor(coverage: number): string {
  if (coverage < 0.3) return EC.red;
  if (coverage < 0.5) return EC.yellow;
  return EC.muted;
}

function computeScore(
  weights: Record<string, number>,
  coverage: Record<string, number>,
): number {
  return Math.round(
    DOMAIN_ORDER.reduce((sum, k) => sum + (weights[k] ?? 0) * (coverage[k] ?? 0), 0) * 100,
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--green)';
  if (score >= 60) return 'var(--yellow)';
  return 'var(--red)';
}

function scoreInterpretation(score: number): string {
  if (score >= 80) {
    return 'Plano forte no core (Investment · Retirement · Tax). Risk Management e Estate são gaps explícitos — não incluídos no cálculo de P(FIRE).';
  }
  if (score >= 60) {
    return 'Plano bom no agregado, com gaps em RM e Estate a resolver.';
  }
  return 'Desequilíbrios importantes. Priorizar robustez antes de mais retorno.';
}

function domainLeitura(key: string, coverage: number): { label: string; color: string } {
  // Estate is always deferred regardless of coverage
  if (key === 'est') return { label: 'Diferido', color: 'var(--yellow)' };
  if (coverage >= 0.80) return { label: 'Coberto',  color: 'var(--green)' };
  if (coverage >= 0.50) return { label: 'Bom',      color: 'var(--green)' };
  if (coverage >= 0.30) return { label: 'Atenção',  color: 'var(--yellow)' };
  return { label: 'Gap ⚠', color: 'var(--red)' };
}

// ── Main component ────────────────────────────────────────────────────────────

export function IifptRadar({
  domainCoverage,
  priorityWeights,
  bondPoolCoverageAnos,
  bondPoolMetaAnos,
  yearsToFire,
}: IifptRadarProps) {
  const { privacyMode } = useUiStore();
  const chartRef = useChartResize();
  // useEChartsPrivacy imported for completeness (radar uses coverage % — not monetary)
  useEChartsPrivacy();

  const normalizedWeights = useMemo(() => normalizeWeights(priorityWeights), [priorityWeights]);
  const score = useMemo(() => computeScore(priorityWeights, domainCoverage), [priorityWeights, domainCoverage]);
  const gapCount = DOMAIN_ORDER.filter(k => (domainCoverage[k] ?? 0) < 0.3 && k !== 'est').length;

  // ── Radar ECharts option ──────────────────────────────────────────────────

  const coverageValues = DOMAIN_ORDER.map(key => domainCoverage[key] ?? 0);
  const weightValues = DOMAIN_ORDER.map(key => normalizedWeights[key] ?? 0);

  const indicatorsWithColor = DOMAIN_ORDER.map(key => ({
    name: DOMAIN_LABELS[key] ?? key,
    max: 1,
    nameTextStyle: { color: axisColor(domainCoverage[key] ?? 0) },
  }));

  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      ...EC_TOOLTIP,
      trigger: 'item',
      formatter: (params: { seriesName: string; value: number[] }) => {
        if (privacyMode) return params.seriesName;
        return DOMAIN_ORDER.map((key, i) => {
          const cov = (coverageValues[i] * 100).toFixed(0);
          const wgt = ((priorityWeights[key] ?? 0) * 100).toFixed(0);
          return `${DOMAIN_LABELS[key]}: cobertura ${cov}% | peso ${wgt}%`;
        }).join('<br/>');
      },
    },
    radar: {
      indicator: indicatorsWithColor,
      axisNameGap: 8,
      splitNumber: 4,
      shape: 'polygon',
      axisLine: { lineStyle: { color: EC.border2 } },
      splitLine: { lineStyle: { color: EC.border3, type: 'dashed' } },
      splitArea: { show: false },
    },
    series: [
      {
        name: 'Cobertura',
        type: 'radar',
        data: [{ value: coverageValues, name: 'Cobertura' }],
        areaStyle: { color: EC.accent, opacity: 0.25 },
        lineStyle: { color: EC.accent, width: 2 },
        itemStyle: { color: EC.accent },
        symbol: 'circle',
        symbolSize: 5,
      },
      {
        name: 'Peso IPS',
        type: 'radar',
        data: [{ value: weightValues, name: 'Peso IPS' }],
        areaStyle: { opacity: 0 },
        lineStyle: { color: EC.muted, width: 1, type: 'dashed' },
        itemStyle: { color: EC.muted },
        symbol: 'none',
      },
    ],
    legend: {
      bottom: 0,
      data: ['Cobertura', 'Peso IPS'],
      textStyle: { color: EC.muted, fontSize: 10 },
      icon: 'roundRect',
    },
  };

  // ── Acionável per domain ──────────────────────────────────────────────────

  function getDomainAcionavel(key: string): { text: string; color?: string } {
    switch (key) {
      case 'inv':
        return { text: 'Próximo aporte pelo maior gap na cascata' };
      case 'ret':
        return { text: 'Monitorar trigger r3 (R$9M ou P(FIRE)≥90% por 2 anos)' };
      case 'tax':
        return { text: 'TLH em próximo drawdown equity' };
      case 'cf': {
        const covAnos = bondPoolCoverageAnos != null ? bondPoolCoverageAnos.toFixed(1) : '—';
        const metaAnos = bondPoolMetaAnos ?? 7;
        const fireSuffix = yearsToFire != null ? ` · em ~${Math.round(yearsToFire)}a (FIRE)` : '';
        const text = `Construir bond tent (${covAnos}a / ${metaAnos}a)${fireSuffix}`;
        const color = (domainCoverage['cf'] ?? 0) < 0.5 ? 'var(--yellow)' : undefined;
        return { text, color };
      }
      case 'rm':
        return { text: 'Issue HD-holding-e-seguro · disability — cobertura: zero', color: 'var(--red)' };
      case 'est':
        return { text: 'Issue PT-planejamento-patrimonial · trigger: casamento', color: 'var(--muted)' };
      default:
        return { text: '—' };
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const rmCoverage = domainCoverage['rm'] ?? 0;
  const showRmCallout = rmCoverage < 0.3;

  const summaryEl = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1,
        color: scoreColor(score),
      }}>
        {privacyMode ? '••' : score}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>/100</span>
      {gapCount > 0 && (
        <span style={{
          fontSize: '0.65rem', fontWeight: 600,
          background: 'rgba(248,81,73,0.10)', color: 'var(--red)',
          border: '1px solid rgba(248,81,73,0.25)', borderRadius: 4, padding: '1px 6px',
        }}>
          {gapCount} {gapCount === 1 ? 'gap' : 'gaps'}
        </span>
      )}
    </div>
  );

  return (
    <CollapsibleSection
      id="section-iifpt-radar"
      title="Modelo IIFPT"
      defaultOpen={false}
      summary={summaryEl}
    >
      <div style={{ padding: '0 16px 16px' }}>

        {/* ── Sub-section 1: Score Hero ─────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16,
          marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)',
        }}>
          {/* Left: big score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              fontSize: '3.5rem', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1,
              color: scoreColor(score),
            }}>
              {privacyMode ? '••' : score}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
              ──/100
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>
              score de planejamento
            </div>
          </div>
          {/* Right: interpretation */}
          <div style={{
            fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5,
            display: 'flex', alignItems: 'center',
          }}>
            {scoreInterpretation(score)}
          </div>
        </div>

        {/* ── Sub-section 2: Radar + Domain Table ──────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16,
          marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)',
          alignItems: 'start',
        }}>
          {/* Left: Radar */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6 }}>
              Azul = cobertura · Cinza = peso IPS
            </div>
            <EChart
              ref={chartRef}
              option={radarOption}
              style={{ height: 260 }}
              data-testid="iifpt-radar-chart"
            />
          </div>

          {/* Right: Domain table */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>
              Domínios
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>Domínio</th>
                  <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>Cobertura</th>
                  <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>Peso</th>
                  <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>Leitura</th>
                  <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4 }}>Acionável</th>
                </tr>
              </thead>
              <tbody>
                {DOMAIN_ORDER.map(key => {
                  const cov = domainCoverage[key] ?? 0;
                  const wgt = priorityWeights[key] ?? 0;
                  const leitura = domainLeitura(key, cov);
                  const rowColor = axisColor(cov);
                  const acionavel = getDomainAcionavel(key);
                  const isRm = key === 'rm';
                  return (
                    <tr
                      key={key}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isRm ? 'color-mix(in srgb, var(--red) 6%, transparent)' : 'transparent',
                      }}
                    >
                      {/* Domínio */}
                      <td style={{ padding: '6px 8px 6px 0', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {DOMAIN_LABELS[key]}
                      </td>
                      {/* Cobertura: inline bar + % */}
                      <td style={{ padding: '6px 8px 6px 0', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 48, height: 6, background: 'var(--border)', borderRadius: 3, flexShrink: 0, overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${cov * 100}%`, height: '100%',
                              background: rowColor, borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ color: rowColor, fontFamily: 'monospace' }}>
                            {(cov * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      {/* Peso */}
                      <td style={{ padding: '6px 8px 6px 0', color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {(wgt * 100).toFixed(0)}%
                      </td>
                      {/* Leitura */}
                      <td style={{ padding: '6px 8px 6px 0', color: leitura.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {leitura.label}
                      </td>
                      {/* Acionável */}
                      <td style={{ padding: '6px 0', color: privacyMode ? 'var(--muted)' : (acionavel.color ?? 'var(--muted)') }}>
                        {privacyMode ? '••••' : acionavel.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Sub-section 3: Coupling Table ────────────────────────────── */}
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600, marginBottom: 2 }}>
            Acoplamentos principais
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10 }}>
            Q = qualidade de integração do plano. Maior % = mais ganho potencial de coordenar os dois domínios.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>Interação</th>
                <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>Intensidade</th>
                <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4, paddingRight: 8 }}>% do Q</th>
                <th style={{ textAlign: 'left', color: 'var(--muted)', fontWeight: 600, paddingBottom: 4 }}>Nível</th>
              </tr>
            </thead>
            <tbody>
              {COUPLINGS.map(c => {
                const levelColor = c.level === 'Forte' ? 'var(--accent)' : 'var(--yellow)';
                return (
                  <tr key={c.pair} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px 5px 0', color: 'var(--text)', fontWeight: 500 }}>{c.pair}</td>
                    <td style={{ padding: '5px 8px 5px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 60, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${c.intensity * 100}%`, height: '100%',
                            background: levelColor, borderRadius: 3,
                          }} />
                        </div>
                        <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>
                          {(c.intensity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '5px 8px 5px 0', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {c.pctQ.toFixed(1)}%
                    </td>
                    <td style={{ padding: '5px 0', color: levelColor, fontWeight: 600 }}>
                      {c.level}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Sub-section 4: RM Callout (conditional) ─────────────────── */}
        {showRmCallout && !privacyMode && (
          <div style={{
            background: 'color-mix(in srgb, var(--red) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--red) 40%, transparent)',
            borderRadius: 6, padding: '10px 14px',
            fontSize: 'var(--text-xs)', lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>
              ⚠ Gap crítico — Risk Management
            </div>
            <div style={{ color: 'var(--muted)' }}>
              INSS cobre ~R$1.5–2k/mês · Renda ~R$55k/mês · Disability coverage: zero
            </div>
          </div>
        )}

        <div className="src" style={{ marginTop: 12 }}>
          Fonte: agentes/contexto/priority_matrix.json + IIFPT_COVERAGE (config.py)
        </div>
      </div>
    </CollapsibleSection>
  );
}
