'use client';

/**
 * FloorUpsideFire — Cobertura por Fase (FIRE Day vs pós-INSS)
 *
 * Extracted from fire/page.tsx (ARCH P2: sub-component extraction).
 * Shows floor vs equity gap coverage for two retirement phases.
 */

import { EC } from '@/utils/echarts-theme';
import { EChart } from '@/components/primitives/EChart';
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

  // Fase 1 bar %
  const floorPct1 = custoVida > 0 ? (floorFireDay / custoVida) * 100 : 0;
  const gapPct1 = 100 - floorPct1;
  const cobPct1 = cobFireDay != null ? Math.min(gapPct1, (cobFireDay / 100) * gapPct1) : 0;
  const descPct1 = Math.max(0, gapPct1 - cobPct1);

  // Fase 2 bar %
  const floorPct2 = custoVida > 0 ? (Math.min(floorPosInss, custoVida) / custoVida) * 100 : 0;
  const gapPct2 = Math.max(0, 100 - floorPct2);
  const cobPct2 = cobPosInss != null ? Math.min(gapPct2, (cobPosInss / 100) * gapPct2) : 0;
  const descPct2 = Math.max(0, gapPct2 - cobPct2);

  const barOption = (floorBar: number, cobBar: number, descBar: number) => ({
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 4, bottom: 4 },
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: { type: 'category', data: [''], show: false },
    series: [
      { type: 'bar', stack: 'total', data: [floorBar], itemStyle: { color: EC.accent }, barMaxWidth: 32 },
      { type: 'bar', stack: 'total', data: [cobBar], itemStyle: { color: '#22c55e' }, barMaxWidth: 32 },
      { type: 'bar', stack: 'total', data: [descBar], itemStyle: { color: '#ef4444' }, barMaxWidth: 32 },
    ],
  });

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fase 1 — FIRE Day */}
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '4px',
              fontWeight: 600,
            }}
          >
            FIRE Day (50–65 anos)
          </div>
          <EChart option={barOption(floorPct1, cobPct1, descPct1)} style={{ height: 44 }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-2">
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(59,130,246,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Floor RF</div>
              <div style={{ fontWeight: 700, color: EC.accent }} className="pv">
                {fmtPrivacy(floorFireDay / 1000, privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(239,68,68,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Gap equity</div>
              <div style={{ fontWeight: 700, color: '#ef4444' }} className="pv">
                {fmtPrivacy(gapFireDay / 1000, privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: `1px solid ${cobFireDay != null && cobFireDay >= 100 ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Cobertura</div>
              <div
                style={{
                  fontWeight: 700,
                  color: cobFireDay != null && cobFireDay >= 100 ? '#22c55e' : '#ef4444',
                }}
              >
                {cobFireDay != null ? (privacyMode ? '••%' : `${cobFireDay.toFixed(0)}%`) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Fase 2 — pós-INSS */}
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              marginBottom: '4px',
              fontWeight: 600,
            }}
          >
            Pós-INSS (65+ anos)
          </div>
          <EChart option={barOption(floorPct2, cobPct2, descPct2)} style={{ height: 44 }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-2">
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(59,130,246,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Floor c/INSS</div>
              <div style={{ fontWeight: 700, color: EC.accent }} className="pv">
                {fmtPrivacy(Math.min(floorPosInss, custoVida), privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: '1px solid rgba(239,68,68,.25)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Gap equity</div>
              <div style={{ fontWeight: 700, color: '#ef4444' }} className="pv">
                {fmtPrivacy(gapPosInss / 1000, privacyMode)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '6px',
                padding: '6px',
                border: `1px solid ${cobPosInss != null && cobPosInss >= 100 ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Cobertura</div>
              <div
                style={{
                  fontWeight: 700,
                  color: cobPosInss != null && cobPosInss >= 100 ? '#22c55e' : '#ef4444',
                }}
              >
                {cobPosInss != null ? (privacyMode ? '••%' : `${cobPosInss.toFixed(0)}%`) : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="src" style={{ marginTop: '8px' }}>
        Floor FIRE Day: gasto_piso (RF) · Floor pós-INSS: + INSS Diego + INSS Katia · Cobertura: patrimônio / (gap/SWR)
      </div>
    </div>
  );
}
