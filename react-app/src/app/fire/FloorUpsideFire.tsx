'use client';

/**
 * FloorUpsideFire — Cobertura por Fase (FIRE Day vs pós-INSS)
 *
 * Extracted from fire/page.tsx (ARCH P2: sub-component extraction).
 * Shows floor vs equity gap coverage for two retirement phases as a comparison table.
 */

import { fmtPrivacy } from '@/utils/privacyTransform';

interface FloorUpsideFireProps {
  gastoPiso: number;
  custoVida: number;
  inssD: number;
  inssK: number;
  swrGatilho: number;
  patrimonio: number;
  privacyMode: boolean;
}

export function FloorUpsideFire({
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

  const fmtK = (v: number) => fmtPrivacy(v / 1000, privacyMode);
  const fmtPct = (v: number | null) =>
    v == null ? '—' : privacyMode ? '••%' : `${v.toFixed(0)}%`;
  const cobColor = (v: number | null) =>
    v != null && v >= 100 ? 'var(--green)' : v != null && v >= 80 ? 'var(--yellow)' : 'var(--red)';

  const thStyle = (color: string): React.CSSProperties => ({
    borderTop: `3px solid ${color}`,
    padding: '10px 8px 8px',
    textAlign: 'center' as const,
    background: 'var(--card)',
    fontWeight: 700,
    fontSize: 'var(--text-xs)',
    color: color,
    letterSpacing: '.3px',
    textTransform: 'uppercase' as const,
  });

  const tdLabel: React.CSSProperties = {
    fontSize: 9,
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '.4px',
    padding: '7px 8px',
    whiteSpace: 'nowrap' as const,
  };

  const tdVal = (even: boolean): React.CSSProperties => ({
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    padding: '7px 8px',
    textAlign: 'center' as const,
    background: even ? 'var(--card-alt, rgba(255,255,255,0.02))' : 'transparent',
  });

  const trStyle = (even: boolean): React.CSSProperties => ({
    borderTop: '1px solid var(--border)',
    background: even ? 'var(--card-alt, rgba(255,255,255,0.02))' : 'transparent',
  });

  // Cobertura bar (compact visual indicator)
  const CobBar = ({ pct }: { pct: number | null }) => {
    const p = Math.min(100, pct ?? 0);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <div style={{ flex: 1, maxWidth: 60, height: 6, background: 'var(--card2)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${p}%`, height: '100%', background: cobColor(pct), borderRadius: 3 }} />
        </div>
        <span style={{ fontWeight: 700, color: cobColor(pct), fontSize: 'var(--text-sm)', minWidth: 34, textAlign: 'right' }}>
          {fmtPct(pct)}
        </span>
      </div>
    );
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
        🏦 Floor vs Upside — Cobertura por Fase
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 280 }}>
          <thead>
            <tr>
              <th style={{ width: '40%', padding: '10px 8px 8px', textAlign: 'left', background: 'var(--card)' }} />
              <th style={thStyle('var(--accent)')}>FIRE Day<br /><span style={{ fontWeight: 400, fontSize: 8, color: 'var(--muted)' }}>50–65 anos</span></th>
              <th style={thStyle('var(--green)')}>Pós-INSS<br /><span style={{ fontWeight: 400, fontSize: 8, color: 'var(--muted)' }}>65+ anos</span></th>
            </tr>
          </thead>
          <tbody>
            <tr style={trStyle(false)}>
              <td style={tdLabel}>Floor RF</td>
              <td style={{ ...tdVal(false), color: 'var(--accent)' }}>{fmtK(floorFireDay)}</td>
              <td style={{ ...tdVal(false), color: 'var(--green)' }}>{fmtK(Math.min(floorPosInss, custoVida))}</td>
            </tr>
            <tr style={trStyle(true)}>
              <td style={{ ...tdLabel, background: 'var(--card-alt, rgba(255,255,255,0.02))' }}>Gap equity</td>
              <td style={{ ...tdVal(true), color: gapFireDay > 0 ? 'var(--red)' : 'var(--green)' }}>{fmtK(gapFireDay)}</td>
              <td style={{ ...tdVal(true), color: gapPosInss > 0 ? 'var(--red)' : 'var(--green)' }}>{fmtK(gapPosInss)}</td>
            </tr>
            <tr style={trStyle(false)}>
              <td style={tdLabel}>Pat. necessário</td>
              <td style={{ ...tdVal(false), color: 'var(--muted)' }}>
                {patNecFireDay != null ? fmtPrivacy(patNecFireDay, privacyMode) : '—'}
              </td>
              <td style={{ ...tdVal(false), color: 'var(--muted)' }}>
                {patNecPosInss != null ? fmtPrivacy(patNecPosInss, privacyMode) : '—'}
              </td>
            </tr>
            <tr style={trStyle(true)}>
              <td style={{ ...tdLabel, background: 'var(--card-alt, rgba(255,255,255,0.02))' }}>Cobertura</td>
              <td style={{ ...tdVal(true) }}>
                <CobBar pct={cobFireDay} />
              </td>
              <td style={{ ...tdVal(true) }}>
                <CobBar pct={cobPosInss} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="src" style={{ marginTop: '8px' }}>
        Floor FIRE Day: gasto_piso (RF) · Floor pós-INSS: + INSS Diego + INSS Katia · Cobertura: patrimônio / (gap/SWR)
      </div>
    </div>
  );
}
