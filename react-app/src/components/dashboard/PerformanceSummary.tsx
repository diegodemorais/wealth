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

import { InfoCard } from '@/components/primitives/InfoCard';

interface AnnualReturn {
  year: number;
  months: number;
  ytd: boolean;
  twr_nominal_brl: number;
  twr_real_brl: number;
  twr_usd: number;
  ipca: number;
  cdi: number;
}

interface PerformanceSummaryProps {
  data: any; // raw data from dashboardStore
}

/** Semaphore color for CAGR real: green >= 4.5%, yellow 3-4.5%, red < 3% */
function cagrSemaphore(v: number): string {
  if (v >= 4.5) return 'var(--green)';
  if (v >= 3) return 'var(--yellow)';
  return 'var(--red)';
}

/** Format percentage with sign and color */
function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '--';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(decimals)}%`;
}

export default function PerformanceSummary({ data }: PerformanceSummaryProps) {
  const rm = data?.retornos_mensais ?? {};
  const ir = data?.rolling_sharpe?.information_ratio?.itd ?? {};
  const ddSummary = data?.drawdown_extended?.summary ?? {};
  const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;

  const cagrReal: number | null = rm.twr_real_brl_pct ?? null;
  const cagrNominal: number | null = rm.twr_nominal_brl_cagr ?? null;
  const alphaAnual: number | null = ir.active_return_anual_pct ?? null;
  const maxDd: number | null = ddSummary.real_max_dd_target ?? null;
  const annualReturns: AnnualReturn[] = rm.annual_returns ?? [];
  const ipcaCagr: number | null = rm.ipca_cagr_periodo_pct ?? null;

  // Find max DD trough date from drawdown_history events
  const ddEvents: any[] = data?.drawdown_history?.events ?? [];
  const worstEvent = ddEvents.length > 0
    ? ddEvents.reduce((a: any, b: any) => (b.depth_pct ?? 0) < (a.depth_pct ?? 0) ? b : a, ddEvents[0])
    : null;
  const maxDdDate = worstEvent?.trough ?? null;

  return (
    <div>
      {/* KPI strip — 4 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginBottom: 16 }}>
        <InfoCard
          label="CAGR Real BRL"
          value={cagrReal != null ? `${cagrReal.toFixed(1)}%` : '--'}
          description={`premissa ${premissa.toFixed(1)}% · desde abr/2021`}
          accentColor={cagrReal != null ? cagrSemaphore(cagrReal) : undefined}
          bg="var(--card)"
        />
        <InfoCard
          label="CAGR Nominal BRL"
          value={cagrNominal != null ? `${cagrNominal.toFixed(1)}%` : '--'}
          description={ipcaCagr != null ? `IPCA ${ipcaCagr.toFixed(1)}% no período` : 'nominal BRL'}
          accentColor="var(--accent)"
          bg="var(--card)"
        />
        <InfoCard
          label="Alpha vs VWRA (ITD)"
          value={alphaAnual != null ? `${alphaAnual >= 0 ? '+' : ''}${alphaAnual.toFixed(2)}%/ano` : '--'}
          description="active return anualizado"
          accentColor={alphaAnual != null ? (alphaAnual >= 0 ? 'var(--green)' : 'var(--red)') : undefined}
          bg="var(--card)"
        />
        <InfoCard
          label="Max Drawdown"
          value={maxDd != null ? `${maxDd.toFixed(1)}%` : '--'}
          description={maxDdDate ? `trough ${maxDdDate}` : 'carteira real'}
          accentColor="var(--red)"
          bg="var(--card)"
        />
      </div>

      {/* Annual Returns Table */}
      {annualReturns.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Ano</th>
                <th style={thStyleR}>Nominal BRL</th>
                <th style={thStyleR}>Real BRL</th>
                <th style={thStyleR}>USD</th>
                <th style={thStyleR}>IPCA</th>
                <th style={thStyleR}>CDI</th>
              </tr>
            </thead>
            <tbody>
              {annualReturns.map(row => {
                const isYtd = row.ytd || row.months < 12;
                return (
                  <tr
                    key={row.year}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      opacity: isYtd ? 0.7 : 1,
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {row.year}{isYtd ? '*' : ''}
                    </td>
                    <td style={{ ...tdStyleR, color: returnColor(row.twr_nominal_brl) }}>
                      {fmtPct(row.twr_nominal_brl)}
                    </td>
                    <td style={{ ...tdStyleR, color: returnColor(row.twr_real_brl), fontWeight: 600 }}>
                      {fmtPct(row.twr_real_brl)}
                    </td>
                    <td style={{ ...tdStyleR, color: returnColor(row.twr_usd) }}>
                      {fmtPct(row.twr_usd)}
                    </td>
                    <td style={{ ...tdStyleR, color: 'var(--muted)' }}>
                      {row.ipca.toFixed(1)}%
                    </td>
                    <td style={{ ...tdStyleR, color: 'var(--muted)' }}>
                      {row.cdi.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* CAGR summary row */}
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>CAGR</td>
                <td style={{ ...tdStyleR, fontWeight: 700, color: returnColor(cagrNominal) }}>
                  {cagrNominal != null ? `${cagrNominal.toFixed(1)}%` : '--'}
                </td>
                <td style={{ ...tdStyleR, fontWeight: 700, color: cagrReal != null ? cagrSemaphore(cagrReal) : 'var(--text)' }}>
                  {cagrReal != null ? `${cagrReal.toFixed(1)}%` : '--'}
                </td>
                <td style={{ ...tdStyleR, color: 'var(--muted)' }}>--</td>
                <td style={{ ...tdStyleR, fontWeight: 600, color: 'var(--muted)' }}>
                  {ipcaCagr != null ? `${ipcaCagr.toFixed(1)}%` : '--'}
                </td>
                <td style={{ ...tdStyleR, color: 'var(--muted)' }}>--</td>
              </tr>
            </tfoot>
          </table>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 6 }}>
            * Ano parcial (YTD). Real BRL = nominal deflacionado pelo IPCA. USD = TWR em dólares.
          </div>
        </div>
      )}
    </div>
  );
}

// --- Inline style helpers (component used in 1 place) ---

function returnColor(v: number | null | undefined): string {
  if (v == null) return 'var(--muted)';
  if (v > 0) return 'var(--green)';
  if (v < 0) return 'var(--red)';
  return 'var(--text)';
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  color: 'var(--muted)',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const thStyleR: React.CSSProperties = {
  ...thStyle,
  textAlign: 'right',
};

const tdStyle: React.CSSProperties = {
  padding: '5px 8px',
  fontSize: '12px',
};

const tdStyleR: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
};
