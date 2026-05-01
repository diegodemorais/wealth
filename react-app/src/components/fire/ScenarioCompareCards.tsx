'use client';

/**
 * ScenarioCompareCards — tabela comparativa 4 colunas: SOLTEIRO | CASADO | FILHO | ASPIRAC.
 *
 * P(FIRE) para casado/filho é pipeline TODO (null → mostra —).
 * P(Quality) vem de fire.p_quality_matrix.values.B (critério B = padrão).
 * Gasto casado=270k/filho=300k são valores canônicos do pipeline.
 */

import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

function pfireBadgeStyle(pfire: number): React.CSSProperties {
  const bg =
    pfire >= 70 ? 'rgba(62,211,129,0.15)' :
    pfire >= 50 ? 'rgba(217,119,6,0.15)'  :
                  'rgba(248,81,73,0.15)';
  const color =
    pfire >= 70 ? 'var(--green)'  :
    pfire >= 50 ? 'var(--yellow)' :
                  'var(--red)';
  return { background: bg, color, border: `1px solid ${color}40`, borderRadius: 12, padding: '2px 6px', fontWeight: 700, fontSize: 'var(--text-sm)', display: 'inline-block' };
}

function pqualityBadgeStyle(pq: number): React.CSSProperties {
  const color =
    pq >= 70 ? 'var(--green)'  :
    pq >= 50 ? 'var(--yellow)' :
               'var(--red)';
  return { color, fontWeight: 700, fontSize: 'var(--text-xs)', display: 'inline-block' };
}

interface ScenarioCardData {
  title: string;
  subtitle: string;
  pfire: number | null;
  pquality: number | null;
  pat_mediano: number | null;
  gasto_anual: number | null;
  swr: number | null;
  idade: number;
  highlightColor: string;
}

interface SpendingSensItem {
  label: string;
  custo?: number;
  base: number;
  fav?: number;
  stress?: number;
}

interface ScenarioCompareCardsProps {
  scenarioComparison?: {
    base?: { idade?: number; base?: number; fav?: number; pat_mediano?: number; swr?: number; gasto_anual?: number };
    aspiracional?: { idade?: number; base?: number; pat_mediano?: number; swr?: number; gasto_anual?: number };
  } | null;
  pfireBase?: { base?: number; fav?: number; stress?: number } | null;
  pQualityBase?: number | null;
  pQualityAsp?: number | null;
  privacyMode?: boolean;
}

export function ScenarioCompareCards({ scenarioComparison, pfireBase, pQualityBase: pqBaseProp, pQualityAsp: pqAspProp, privacyMode: privacyModeProp }: ScenarioCompareCardsProps = {}) {
  const storeData = useDashboardStore(s => s.data);
  const { privacyMode: storePm } = useUiStore();
  const privacyMode = privacyModeProp ?? storePm;

  const sc = scenarioComparison ?? (storeData as any)?.scenario_comparison;
  const pb = pfireBase ?? (storeData as any)?.pfire_base;

  const pQualityBase = pqBaseProp !== undefined ? pqBaseProp : ((storeData as any)?.fire?.p_quality ?? null);
  const pQualityAsp  = pqAspProp  !== undefined ? pqAspProp  : ((storeData as any)?.fire?.p_quality_aspiracional ?? null);

  // P(Quality) matrix — criterion B (default: ≤1 ano ruim total)
  const pqMatrix = (storeData as any)?.fire?.p_quality_matrix?.values ?? null;
  const pqB = pqMatrix?.B ?? null;

  const spendingSensibilidade: SpendingSensItem[] = (storeData as any)?.spendingSensibilidade ?? [];

  if (!sc) {
    return (
      <div data-testid="scenario-compare-cards-empty" style={{ padding: '12px 0', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
        Dados de cenário não disponíveis.
      </div>
    );
  }

  const fmtBrl = (v: number | null | undefined) => {
    if (v == null) return '—';
    return fmtPrivacy(v, privacyMode);
  };

  const fmtPct = (v: number | null | undefined) => {
    if (v == null) return '—';
    return privacyMode ? '••%' : `${v.toFixed(1)}%`;
  };

  const cards: ScenarioCardData[] = [
    {
      title: 'Solteiro',
      subtitle: `${sc.base?.idade ?? 53} anos`,
      pfire: pb?.base ?? sc.base?.base ?? null,
      pquality: pqB?.atual?.base ?? pQualityBase,
      pat_mediano: sc.base?.pat_mediano ?? null,
      gasto_anual: sc.base?.gasto_anual ?? null,
      swr: sc.base?.swr ?? null,
      idade: sc.base?.idade ?? 53,
      highlightColor: 'var(--accent)',
    },
    {
      title: 'Casado',
      subtitle: `${sc.base?.idade ?? 53} anos`,
      pfire: null, // pipeline TODO: MC com tem_conjuge=True
      pquality: pqB?.casado?.base ?? null,
      pat_mediano: null,
      gasto_anual: 270_000,
      swr: null,
      idade: sc.base?.idade ?? 53,
      highlightColor: 'var(--yellow)',
    },
    {
      title: 'Filho',
      subtitle: `${sc.base?.idade ?? 53} anos`,
      pfire: null, // pipeline TODO: MC com custo_vida_filho
      pquality: pqB?.filho?.base ?? null,
      pat_mediano: null,
      gasto_anual: 300_000,
      swr: null,
      idade: sc.base?.idade ?? 53,
      highlightColor: 'var(--red)',
    },
    {
      title: 'Aspir',
      subtitle: `${sc.aspiracional?.idade ?? 49} anos`,
      pfire: sc.aspiracional?.base ?? null,
      pquality: pqB?.atual?.base != null ? (pQualityAsp) : pQualityAsp,
      pat_mediano: sc.aspiracional?.pat_mediano ?? null,
      gasto_anual: sc.aspiracional?.gasto_anual ?? null,
      swr: sc.aspiracional?.swr ?? null,
      idade: sc.aspiracional?.idade ?? 49,
      highlightColor: 'var(--purple)',
    },
  ];

  const thStyle = (color: string): React.CSSProperties => ({
    borderTop: `3px solid ${color}`,
    padding: '10px 4px 8px',
    textAlign: 'center' as const,
    width: '19%',
    background: 'var(--card)',
    minWidth: 78,
  });

  const tdLabelStyle: React.CSSProperties = {
    fontSize: 9,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '.4px',
    padding: '7px 8px',
    width: '24%',
    whiteSpace: 'nowrap' as const,
  };

  const tdValStyle = (isEven: boolean): React.CSSProperties => ({
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--text)',
    padding: '7px 4px',
    textAlign: 'center' as const,
    background: isEven ? 'var(--card-alt, rgba(255,255,255,0.02))' : 'transparent',
    width: '19%',
  });

  const trStyle = (isEven: boolean): React.CSSProperties => ({
    borderTop: '1px solid var(--border)',
    background: isEven ? 'var(--card-alt, rgba(255,255,255,0.02))' : 'transparent',
  });

  return (
    <div data-testid="scenario-compare-cards">
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
          <thead>
            <tr>
              <th style={{ width: '24%', padding: '10px 8px 8px', textAlign: 'left', background: 'var(--card)' }} />
              {cards.map((card) => (
                <th
                  key={card.title}
                  data-testid={`scenario-card-${card.title.toLowerCase()}`}
                  style={thStyle(card.highlightColor)}
                >
                  <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 2 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: card.highlightColor }}>
                    {card.subtitle}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* P(FIRE) */}
            <tr style={trStyle(false)}>
              <td style={tdLabelStyle}>P(FIRE)</td>
              {cards.map((card) => (
                <td key={card.title} style={{ ...tdValStyle(false), textAlign: 'center' }}>
                  {card.pfire != null ? (
                    <span data-testid={`pfire-badge-${card.title.toLowerCase()}`} style={pfireBadgeStyle(card.pfire)}>
                      {privacyMode ? '••%' : `${card.pfire.toFixed(1)}%`}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* P(Quality) */}
            <tr style={trStyle(true)}>
              <td style={{ ...tdLabelStyle, background: 'var(--card-alt, rgba(255,255,255,0.02))' }}>P(Quality)</td>
              {cards.map((card) => (
                <td key={card.title} style={tdValStyle(true)}>
                  {card.pquality != null ? (
                    <span
                      data-testid={`pquality-badge-${card.title.toLowerCase()}`}
                      style={pqualityBadgeStyle(card.pquality)}
                    >
                      {privacyMode ? '••%' : `${card.pquality.toFixed(1)}%`}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Patrimônio */}
            <tr style={trStyle(false)}>
              <td style={tdLabelStyle}>Patrimônio</td>
              {cards.map((card) => (
                <td key={card.title} style={tdValStyle(false)}>
                  <span data-testid={`pat-mediano-${card.title.toLowerCase()}`}>
                    {fmtBrl(card.pat_mediano)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Gasto anual */}
            {cards.some((c) => c.gasto_anual != null && c.gasto_anual > 0) && (
              <tr style={trStyle(true)}>
                <td style={{ ...tdLabelStyle, background: 'var(--card-alt, rgba(255,255,255,0.02))' }}>Gasto anual</td>
                {cards.map((card) => (
                  <td key={card.title} style={tdValStyle(true)}>
                    {card.gasto_anual != null && card.gasto_anual > 0 ? fmtBrl(card.gasto_anual) : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                ))}
              </tr>
            )}

            {/* SWR */}
            {cards.some((c) => c.swr != null && c.swr > 0) && (
              <tr style={trStyle(false)}>
                <td style={tdLabelStyle}>SWR</td>
                {cards.map((card) => (
                  <td key={card.title} style={{ ...tdValStyle(false), color: card.swr != null && card.swr > 0 ? 'var(--accent)' : 'var(--text)' }}>
                    {card.swr != null && card.swr > 0 ? fmtPct(card.swr) : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                ))}
              </tr>
            )}

            {/* Ano FIRE */}
            <tr style={trStyle(true)}>
              <td style={{ ...tdLabelStyle, background: 'var(--card-alt, rgba(255,255,255,0.02))' }}>Ano FIRE</td>
              {cards.map((card) => (
                <td key={card.title} style={tdValStyle(true)}>
                  {privacyMode ? '••••' : (2026 + (card.idade - 39))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {spendingSensibilidade.length > 0 && (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>
            Sensibilidade ao Gasto
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {spendingSensibilidade.map((item) => (
              <div
                key={item.label}
                style={{
                  flex: '1 1 160px',
                  minWidth: 140,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
                  {item.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: 9 }}>Base </span>
                    <span style={{ fontWeight: 700, color: item.base >= 70 ? 'var(--green)' : item.base >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                      {privacyMode ? '••%' : `${item.base.toFixed(1)}%`}
                    </span>
                  </div>
                  {item.fav != null && (
                    <div style={{ fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--muted)', fontSize: 9 }}>Fav </span>
                      <span style={{ fontWeight: 700, color: item.fav >= 70 ? 'var(--green)' : item.fav >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                        {privacyMode ? '••%' : `${item.fav.toFixed(1)}%`}
                      </span>
                    </div>
                  )}
                  {item.stress != null && (
                    <div style={{ fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--muted)', fontSize: 9 }}>Stress </span>
                      <span style={{ fontWeight: 700, color: item.stress >= 70 ? 'var(--green)' : item.stress >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                        {privacyMode ? '••%' : `${item.stress.toFixed(1)}%`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
