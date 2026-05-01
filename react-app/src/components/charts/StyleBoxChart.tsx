'use client';

/**
 * StyleBoxChart — grade 3×3 mercap × estilo (equivalente Morningstar Style Box).
 *
 * Opção A: classificação via factor loadings (HML → Value/Blend/Growth, SMB → Size).
 * Dados: data.factor_loadings (SWRD, AVUV, AVDV, EIMI já em data.json).
 * AVGS_composite computado on-the-fly (58% AVUV + 42% AVDV — Avantis AVGS factsheet).
 *
 * DEV-style-box
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FactorRow {
  hml?: number;
  smb?: number;
  n_months?: number;
}

export interface StyleBoxData {
  SWRD?:           FactorRow;
  AVUV?:           FactorRow;
  AVDV?:           FactorRow;
  EIMI?:           FactorRow;
  AVGS_composite?: FactorRow;
  portfolio_equity?: FactorRow;
  [key: string]: FactorRow | undefined;
}

interface StyleBoxChartProps {
  data: StyleBoxData | null | undefined;
}

// ── Classificação ─────────────────────────────────────────────────────────────

type ValueStyle = 'Value' | 'Blend' | 'Growth';
type SizeStyle  = 'Large' | 'Mid'   | 'Small';

function classifyValue(hml: number): ValueStyle {
  if (hml >  0.25) return 'Value';
  if (hml < -0.10) return 'Growth';
  return 'Blend';
}

function classifySize(smb: number): SizeStyle {
  if (smb >  0.20) return 'Small';
  if (smb < -0.05) return 'Large';
  return 'Mid';
}

// Posição contínua [0..2] para dots dentro da grade
function stylePos(hml: number): number {
  // 0=Growth, 1=Blend, 2=Value — mapeado de [-0.5, +1.0] para [0, 2]
  return Math.max(0, Math.min(2, (hml + 0.5) / 0.75));
}

function sizePos(smb: number): number {
  // 0=Large, 1=Mid, 2=Small — mapeado de [-0.3, +1.0] para [0, 2]
  return Math.max(0, Math.min(2, (smb + 0.3) / 0.65));
}

// ── Layout ────────────────────────────────────────────────────────────────────

const SIZES  = ['Small', 'Mid', 'Large'] as const;
const STYLES = ['Value', 'Blend', 'Growth'] as const;

const ETF_COLORS: Record<string, string> = {
  SWRD:           'var(--accent)',
  AVGS_composite: 'var(--blue-600, #2563eb)',
  EIMI:           'var(--cyan, #06b6d4)',
  Portfolio:      'var(--pink, #ec4899)',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function StyleBoxChart({ data }: StyleBoxChartProps) {
  if (!data) return null;

  const avuv = data.AVUV;
  const avdv = data.AVDV;

  // Compute AVGS_composite on-the-fly if not in data (generate_data may not have run yet)
  const avgsComp: FactorRow | null = data.AVGS_composite
    ?? (avuv && avdv ? {
        hml: 0.58 * (avuv.hml ?? 0) + 0.42 * (avdv.hml ?? 0),
        smb: 0.58 * (avuv.smb ?? 0) + 0.42 * (avdv.smb ?? 0),
      }
    : null);

  const swrd = data.SWRD;
  const eimi = data.EIMI;

  // Portfolio equity = SWRD 50% + AVGS 30% + EIMI 20% (as % of equity bucket)
  const portEq: FactorRow | null = data.portfolio_equity
    ?? (swrd && avgsComp && eimi ? {
        hml: 0.50 * (swrd.hml ?? 0) + 0.30 * (avgsComp.hml ?? 0) + 0.20 * (eimi.hml ?? 0),
        smb: 0.50 * (swrd.smb ?? 0) + 0.30 * (avgsComp.smb ?? 0) + 0.20 * (eimi.smb ?? 0),
      }
    : null);

  const dots: Array<{ key: string; hml: number; smb: number; color: string; radius: number }> = [];

  if (swrd?.hml != null) dots.push({ key: 'SWRD', hml: swrd.hml, smb: swrd.smb ?? 0, color: ETF_COLORS.SWRD, radius: 7 });
  if (avgsComp?.hml != null) dots.push({ key: 'AVGS', hml: avgsComp.hml, smb: avgsComp.smb ?? 0, color: ETF_COLORS.AVGS_composite, radius: 7 });
  if (eimi?.hml != null) dots.push({ key: 'AVEM', hml: eimi.hml, smb: eimi.smb ?? 0, color: ETF_COLORS.EIMI, radius: 7 });
  if (portEq?.hml != null) dots.push({ key: 'Portfolio', hml: portEq.hml, smb: portEq.smb ?? 0, color: ETF_COLORS.Portfolio, radius: 10 });

  if (dots.length === 0) return null;

  const CELL = 60; // px per cell
  const GRID = CELL * 3;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Grade 3×3 */}
        <div>
          {/* Header estilos (Value / Blend / Growth) */}
          <div style={{ display: 'flex', marginLeft: 36, marginBottom: 2 }}>
            {STYLES.map(s => (
              <div key={s} style={{ width: CELL, textAlign: 'center', fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>
                {s}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex' }}>
            {/* Label tamanhos (Small / Mid / Large) — de baixo para cima visualmente */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', width: 36, height: GRID }}>
              {SIZES.map(s => (
                <div key={s} style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, textAlign: 'right', paddingRight: 4 }}>
                  {s}
                </div>
              ))}
            </div>

            {/* Células + dots sobrepostos */}
            <div style={{ position: 'relative', width: GRID, height: GRID }}>
              {/* Grade */}
              {SIZES.map((sz, row) =>
                STYLES.map((st, col) => {
                  // Destaca células onde algum ETF está
                  const occupied = dots.some(d => classifyValue(d.hml) === st && classifySize(d.smb) === sz);
                  return (
                    <div
                      key={`${sz}-${st}`}
                      style={{
                        position: 'absolute',
                        left: col * CELL,
                        top: row * CELL,
                        width: CELL,
                        height: CELL,
                        border: '1px solid var(--border)',
                        background: occupied ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--bg)',
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                })
              )}

              {/* Dots por ETF (posição contínua) */}
              {dots.map(d => {
                // stylePos: 0=Value(left), 2=Growth(right) → coluna do grid
                const x = (2 - stylePos(d.hml)) * CELL + CELL / 2;   // invertido: Value à esquerda
                // sizePos: 0=Large(bottom), 2=Small(top) → linha do grid
                const y = (2 - sizePos(d.smb)) * CELL + CELL / 2;     // invertido: Small em cima
                return (
                  <div
                    key={d.key}
                    data-testid={`style-box-dot-${d.key.toLowerCase()}`}
                    title={`${d.key}: ${classifyValue(d.hml)} ${classifySize(d.smb)} (HML=${d.hml.toFixed(2)}, SMB=${d.smb.toFixed(2)})`}
                    style={{
                      position: 'absolute',
                      left: x - d.radius,
                      top: y - d.radius,
                      width: d.radius * 2,
                      height: d.radius * 2,
                      borderRadius: '50%',
                      background: d.color,
                      border: '2px solid var(--card)',
                      opacity: 0.9,
                      cursor: 'default',
                      zIndex: d.key === 'Portfolio' ? 2 : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Legenda e tabela de classificações */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>
            Classificação
          </div>
          {dots.map(d => (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: d.key === 'Portfolio' ? 700 : 400, flex: 1 }}>
                {d.key === 'AVGS' ? 'AVGS (comp.)' : d.key}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
                {classifyValue(d.hml)} {classifySize(d.smb)}
              </span>
            </div>
          ))}
          <div className="src" style={{ marginTop: 12, fontSize: 9 }}>
            Via factor loadings FF5 (HML → estilo, SMB → tamanho).
            AVGS = 58% AVUV + 42% AVDV (Avantis factsheet).
            Aproximação — metodologia diferente do Morningstar (P/B, mercap reais).
          </div>
        </div>
      </div>
    </div>
  );
}
