'use client';

/**
 * ScenarioCompareCards — 3 cards side-by-side para comparação visual de cenários FIRE.
 *
 * Complementa FireScenariosTable com visualização rápida das métricas chave.
 * Cards: Base (53a) · Favorável (53a) · Aspiracional (49a)
 *
 * Incorpora P(Quality) e Gasto Anual da FireScenariosTable (tabela removida).
 * Spending sensitivity row abaixo quando spendingSensibilidade não vazia.
 */

import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

// Badge color by P(FIRE) threshold
function pfireBadgeStyle(pfire: number): React.CSSProperties {
  const bg =
    pfire >= 70 ? 'rgba(62,211,129,0.15)' :
    pfire >= 50 ? 'rgba(217,119,6,0.15)'  :
                  'rgba(248,81,73,0.15)';
  const color =
    pfire >= 70 ? 'var(--green)'  :
    pfire >= 50 ? 'var(--yellow)' :
                  'var(--red)';
  return { background: bg, color, border: `1px solid ${color}40`, borderRadius: 12, padding: '2px 8px', fontWeight: 700, fontSize: 'var(--text-sm)', display: 'inline-block' };
}

// Badge color by P(Quality) threshold — same semaphore as P(FIRE)
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
  pfire: number;
  pquality?: number | null;
  pat_mediano: number | null;
  gasto_anual?: number | null;
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
  // Allow overriding data for tests
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

  // P(Quality) from props or store
  const pQualityBase = pqBaseProp !== undefined ? pqBaseProp : ((storeData as any)?.fire?.p_quality ?? null);
  const pQualityAsp  = pqAspProp !== undefined  ? pqAspProp  : ((storeData as any)?.fire?.p_quality_aspiracional ?? null);

  // Spending sensitivity rows (future feature — empty array if not present)
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

  // 3 cards: base, favorável (base cenário com pfire fav), aspiracional
  const cards: ScenarioCardData[] = [
    {
      title: 'Base',
      subtitle: `${sc.base?.idade ?? 53} anos`,
      pfire: pb?.base ?? sc.base?.base ?? 0,
      pquality: pQualityBase,
      pat_mediano: sc.base?.pat_mediano ?? null,
      gasto_anual: sc.base?.gasto_anual ?? null,
      swr: sc.base?.swr ?? null,
      idade: sc.base?.idade ?? 53,
      highlightColor: 'var(--accent)',
    },
    {
      title: 'Favorável',
      subtitle: `${sc.base?.idade ?? 53} anos`,
      pfire: pb?.fav ?? sc.base?.fav ?? 0,
      pquality: null, // P(Quality) not computed for favorável
      pat_mediano: sc.base?.pat_mediano ?? null,
      gasto_anual: sc.base?.gasto_anual ?? null,
      swr: sc.base?.swr ?? null,
      idade: sc.base?.idade ?? 53,
      highlightColor: 'var(--green)',
    },
    {
      title: 'Aspiracional',
      subtitle: `${sc.aspiracional?.idade ?? 49} anos`,
      pfire: sc.aspiracional?.base ?? 0,
      pquality: pQualityAsp,
      pat_mediano: sc.aspiracional?.pat_mediano ?? null,
      gasto_anual: sc.aspiracional?.gasto_anual ?? null,
      swr: sc.aspiracional?.swr ?? null,
      idade: sc.aspiracional?.idade ?? 49,
      highlightColor: 'var(--purple)',
    },
  ];

  return (
    <div data-testid="scenario-compare-cards">
      {/* Main scenario cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {cards.map((card) => (
          <div
            key={card.title}
            data-testid={`scenario-card-${card.title.toLowerCase()}`}
            style={{
              flex: '1 1 180px',
              minWidth: 160,
              background: 'var(--card)',
              border: `1px solid ${card.highlightColor}40`,
              borderTop: `3px solid ${card.highlightColor}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            {/* Card header */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: card.highlightColor }}>
                {card.subtitle}
              </div>
            </div>

            {/* P(FIRE) badge */}
            <div style={{ marginBottom: card.pquality != null ? 6 : 12 }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>P(FIRE)</div>
              <span data-testid={`pfire-badge-${card.title.toLowerCase()}`} style={pfireBadgeStyle(card.pfire)}>
                {privacyMode ? '••%' : `${card.pfire.toFixed(1)}%`}
              </span>
            </div>

            {/* P(Quality) badge — only for base and aspiracional */}
            {card.pquality != null && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>P(Quality)</div>
                <span data-testid={`pquality-badge-${card.title.toLowerCase()}`} style={pqualityBadgeStyle(card.pquality)}>
                  {privacyMode ? '••%' : `${card.pquality.toFixed(1)}%`}
                </span>
              </div>
            )}

            {/* Metrics grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Patrimônio</div>
                <div
                  data-testid={`pat-mediano-${card.title.toLowerCase()}`}
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}
                >
                  {fmtBrl(card.pat_mediano)}
                </div>
              </div>

              {card.gasto_anual != null && card.gasto_anual > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Gasto anual</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                    {fmtBrl(card.gasto_anual)}
                  </div>
                </div>
              )}

              {card.swr != null && card.swr > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>SWR</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent)' }}>
                    {fmtPct(card.swr)}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Ano FIRE</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                  {privacyMode ? '••••' : (2026 + (card.idade - 39))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spending sensitivity cards — only shown when data is non-empty */}
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
