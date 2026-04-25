'use client';

/**
 * PerformanceSummary — KPI strip + Annual Returns table for the PERFORMANCE tab.
 *
 * Data sources:
 *   - retornos_mensais.twr_real_brl_pct / twr_nominal_brl_cagr / annual_returns
 *   - rolling_sharpe.information_ratio.itd.active_return_anual_pct
 *   - drawdown_extended.summary.real_max_dd_target
 *   - premissas_vs_realizado.retorno_equity.premissa_real_brl_pct
 *
 * Privacy: percentages shown real (not sensitive per v2 rules).
 */

import React from 'react';
import { KpiCard } from '@/components/primitives/KpiCard';

interface AnnualReturn {
  year: number;
  months: number;
  ytd: boolean;
  twr_nominal_brl: number;
  twr_real_brl: number;
  twr_usd: number;
  vwra_usd?: number | null;
  alpha_pp?: number | null;
  ipca: number;
  cdi: number;
  alpha_vs_vwra?: number;
}

interface PerformanceSummaryProps {
  data: any;
}

/** Semaphore color for CAGR real: green >= 4.5%, yellow 3-4.5%, red < 3% */
function cagrSemaphore(v: number): string {
  if (v >= 4.5) return 'var(--green)';
  if (v >= 3) return 'var(--yellow)';
  return 'var(--red)';
}

function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '--';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(decimals)}%`;
}

function returnColor(v: number | null | undefined): string {
  if (v == null) return 'var(--muted)';
  if (v > 0) return 'var(--green)';
  if (v < 0) return 'var(--red)';
  return 'var(--text)';
}

// ────────────────────────────────────────────────────────────────
// Mini bar: Nominal vs Real lado a lado — dá noção visual rápida
// ────────────────────────────────────────────────────────────────
function MiniCompare({
  nominal,
  real,
  max,
}: {
  nominal: number;
  real: number;
  max: number;
}) {
  if (max <= 0) return null;
  const w1 = Math.min(Math.abs(nominal) / max, 1) * 100;
  const w2 = Math.min(Math.abs(real) / max, 1) * 100;
  return (
    <div
      aria-hidden
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 2,
        width: 48,
        verticalAlign: 'middle',
      }}
    >
      <div style={{ height: 4, background: 'color-mix(in srgb, var(--border) 50%, transparent)', borderRadius: 2 }}>
        <div
          style={{
            width: `${w1}%`,
            height: '100%',
            background: returnColor(nominal),
            borderRadius: 2,
            opacity: 0.55,
          }}
        />
      </div>
      <div style={{ height: 4, background: 'color-mix(in srgb, var(--border) 50%, transparent)', borderRadius: 2 }}>
        <div
          style={{
            width: `${w2}%`,
            height: '100%',
            background: returnColor(real),
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────
export default function PerformanceSummary({ data }: PerformanceSummaryProps) {
  const rm = data?.retornos_mensais ?? {};
  const ir = data?.rolling_sharpe?.information_ratio?.itd ?? {};
  const ddSummary = data?.drawdown_extended?.summary ?? {};
  const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;

  const cagrReal: number | null = rm.twr_real_brl_pct ?? null;
  const cagrNominal: number | null = rm.twr_nominal_brl_cagr ?? null;
  const cagrUsd: number | null = rm.twr_usd_cagr ?? null;
  const cagrVwra: number | null = rm.vwra_usd_cagr ?? null;
  const cagrCdi: number | null = rm.cdi_cagr ?? null;
  const alphaAnual: number | null = ir.active_return_anual_pct ?? null;
  const maxDd: number | null = ddSummary.real_max_dd_target ?? null;
  const annualReturns: AnnualReturn[] = rm.annual_returns ?? [];
  const ipcaCagr: number | null = rm.ipca_cagr_periodo_pct ?? null;
  const periodoAnos: number | null = rm.periodo_anos ?? null;

  // Max DD trough date
  const ddEvents: any[] = data?.drawdown_history?.events ?? [];
  const worstEvent = ddEvents.length > 0
    ? ddEvents.reduce((a: any, b: any) => (b.depth_pct ?? 0) < (a.depth_pct ?? 0) ? b : a, ddEvents[0])
    : null;
  const maxDdDate: string | null = worstEvent?.trough ?? null;
  const maxDdRecoveryMonths: number | null = worstEvent?.recovery_months ?? null;

  // Max absolute return para escala das mini-bars
  const maxAbsReturn = annualReturns.reduce((acc, r) => {
    return Math.max(acc, Math.abs(r.twr_nominal_brl ?? 0), Math.abs(r.twr_real_brl ?? 0));
  }, 1);

  const cagrRealDelta = cagrReal != null ? cagrReal - premissa : null;

  return (
    <div>
      {/* Caption de metodologia — sinaliza TWR de forma fluida, sem poluir cada card */}
      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
          marginBottom: 10,
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>TWR</span>{' '}
        <span>· time-weighted return · Modified Dietz · neutraliza aportes e resgates</span>
      </div>

      {/* ─── KPI strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 18 }}>
        <KpiCard
          label="CAGR Real BRL"
          value={cagrReal != null ? `${cagrReal.toFixed(1)}%` : '--'}
          accent={cagrReal != null ? cagrSemaphore(cagrReal) : 'var(--muted)'}
          delta={cagrRealDelta != null ? {
            text: `${cagrRealDelta >= 0 ? '+' : ''}${cagrRealDelta.toFixed(1)}pp vs ${premissa.toFixed(1)}%`,
            positive: cagrRealDelta >= 0,
          } : undefined}
          progress={cagrReal != null ? cagrReal / (premissa * 1.5) : undefined}
          sub={periodoAnos != null ? `desde abr/2021 · ${periodoAnos.toFixed(1)} anos` : 'desde abr/2021'}
        />
        <KpiCard
          label="CAGR Nominal BRL"
          value={cagrNominal != null ? `${cagrNominal.toFixed(1)}%` : '--'}
          accent="var(--accent)"
          sub={ipcaCagr != null ? `IPCA ${ipcaCagr.toFixed(1)}% no período` : 'nominal anualizado'}
        />
        <KpiCard
          label="Alpha vs VWRA"
          value={alphaAnual != null ? `${alphaAnual >= 0 ? '+' : ''}${alphaAnual.toFixed(2)}%` : '--'}
          accent={alphaAnual != null ? (alphaAnual >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--muted)'}
          delta={alphaAnual != null ? {
            text: '/ano',
            positive: alphaAnual >= 0,
          } : undefined}
          sub="active return anualizado · ITD"
        />
        <KpiCard
          label="Max Drawdown"
          value={maxDd != null ? `${maxDd.toFixed(1)}%` : '--'}
          accent="var(--red)"
          sub={
            maxDdDate
              ? `trough ${maxDdDate}${maxDdRecoveryMonths != null ? ` · recuperou em ${maxDdRecoveryMonths}m` : ''}`
              : 'carteira real'
          }
        />
      </div>

      {/* ─── Tabela Anual ─────────────────────────────────────── */}
      {annualReturns.length > 0 && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}>
              Retornos Anuais
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Real = Nominal ÷ IPCA
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--text-sm)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--card2)' }}>
                  <th style={thL}>Ano</th>
                  <th style={thR}>Nominal BRL</th>
                  <th style={thR}>Real BRL</th>
                  <th style={thC} aria-label="comparação nominal vs real" />
                  <th style={thR}>USD</th>
                  <th style={thR}>VWRA</th>
                  <th style={thR}>Alpha</th>
                  <th style={thR}>IPCA</th>
                  <th style={thR}>CDI</th>
                </tr>
              </thead>
              <tbody>
                {annualReturns.map((row, idx) => {
                  const isYtd = row.ytd || row.months < 12;
                  const zebra = idx % 2 === 1;
                  return (
                    <tr
                      key={row.year}
                      style={{
                        background: zebra ? 'color-mix(in srgb, var(--card2) 22%, transparent)' : 'transparent',
                        borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)',
                      }}
                    >
                      <td style={{ ...tdL, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{row.year}</span>
                        {isYtd && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '9px',
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
                              color: 'var(--accent)',
                              textTransform: 'uppercase',
                            }}
                          >
                            YTD
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdR, color: returnColor(row.twr_nominal_brl) }}>
                        {fmtPct(row.twr_nominal_brl)}
                      </td>
                      <td style={{ ...tdR, color: returnColor(row.twr_real_brl), fontWeight: 700 }}>
                        {fmtPct(row.twr_real_brl)}
                      </td>
                      <td style={{ ...tdC, padding: '4px 8px' }}>
                        <MiniCompare
                          nominal={row.twr_nominal_brl}
                          real={row.twr_real_brl}
                          max={maxAbsReturn}
                        />
                      </td>
                      <td style={{ ...tdR, color: returnColor(row.twr_usd) }}>
                        {fmtPct(row.twr_usd)}
                      </td>
                      <td style={{ ...tdR, color: 'var(--muted)' }}>
                        {row.vwra_usd != null ? fmtPct(row.vwra_usd) : '--'}
                      </td>
                      <td style={{ ...tdR, color: returnColor(row.alpha_pp), fontWeight: 700 }}>
                        {row.alpha_pp != null ? `${row.alpha_pp >= 0 ? '+' : ''}${row.alpha_pp.toFixed(1)}pp` : '--'}
                      </td>
                      <td style={{ ...tdR, color: 'var(--muted)' }}>{row.ipca.toFixed(1)}%</td>
                      <td style={{ ...tdR, color: 'var(--muted)' }}>{row.cdi.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: 'var(--card2)',
                    borderTop: '2px solid var(--accent)',
                  }}
                >
                  <td style={{ ...tdL, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    CAGR
                  </td>
                  <td style={{ ...tdR, fontWeight: 800, color: returnColor(cagrNominal) }}>
                    {cagrNominal != null ? `${cagrNominal.toFixed(1)}%` : '--'}
                  </td>
                  <td
                    style={{
                      ...tdR,
                      fontWeight: 800,
                      color: cagrReal != null ? cagrSemaphore(cagrReal) : 'var(--muted)',
                    }}
                  >
                    {cagrReal != null ? `${cagrReal.toFixed(1)}%` : '--'}
                  </td>
                  <td style={tdC} />
                  <td style={{ ...tdR, fontWeight: 800, color: returnColor(cagrUsd) }}>
                    {cagrUsd != null ? `${cagrUsd.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ ...tdR, fontWeight: 800, color: returnColor(cagrVwra) }}>
                    {cagrVwra != null ? `${cagrVwra.toFixed(1)}%` : '—'}
                  </td>
                  <td
                    style={{
                      ...tdR,
                      fontWeight: 800,
                      color: alphaAnual != null
                        ? (alphaAnual >= 0 ? 'var(--green)' : 'var(--red)')
                        : 'var(--muted)',
                    }}
                  >
                    {alphaAnual != null ? `${alphaAnual >= 0 ? '+' : ''}${alphaAnual.toFixed(1)}pp` : '--'}
                  </td>
                  <td style={{ ...tdR, fontWeight: 700, color: 'var(--muted)' }}>
                    {ipcaCagr != null ? `${ipcaCagr.toFixed(1)}%` : '--'}
                  </td>
                  <td style={{ ...tdR, fontWeight: 700, color: 'var(--muted)' }}>
                    {cagrCdi != null ? `${cagrCdi.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legenda */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              background: 'color-mix(in srgb, var(--card2) 18%, transparent)',
            }}
          >
            <LegendDot color="var(--green)" label="positivo" />
            <LegendDot color="var(--red)" label="negativo" />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '9px',
                  fontWeight: 700,
                  background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                }}
              >
                YTD
              </span>
              ano parcial (≠ 12 meses)
            </span>
            <span>
              <span style={{ color: 'var(--text)' }}>▮</span> barras comparam nominal (topo) vs real (base)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}

// ─── Table cell styles ─────────────────────────────────────
const thBase: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--muted)',
  fontWeight: 700,
  fontSize: '10.5px',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};
const thL: React.CSSProperties = { ...thBase, textAlign: 'left' };
const thR: React.CSSProperties = { ...thBase, textAlign: 'right' };
const thC: React.CSSProperties = { ...thBase, textAlign: 'center', width: 60 };

const tdBase: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 'var(--text-sm)',
};
const tdL: React.CSSProperties = { ...tdBase, textAlign: 'left' };
const tdR: React.CSSProperties = { ...tdBase, textAlign: 'right' };
const tdC: React.CSSProperties = { ...tdBase, textAlign: 'center' };
