'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { createDrawdownHistChartOption } from '@/utils/chartSetup';

export interface DrawdownHistChartProps {
  data: DashboardData;
}

export function DrawdownHistChart({ data }: DrawdownHistChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();

  const option = useMemo(
    () => createDrawdownHistChartOption({ data, privacyMode, theme }),
    [data, privacyMode, theme]
  );

  const crises = (data as any)?.drawdown_history?.crises ?? [];

  return (
    <div>
      <EChart option={option} style={{ height: 250 }} />
      {crises.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>EVENTO</th>
                <th style={styles.th}>INÍCIO</th>
                <th style={styles.th}>FIM</th>
                <th style={{ ...styles.th, color: 'var(--red)' }}>PROFUND.</th>
              </tr>
            </thead>
            <tbody>
              {crises.map((c: any, i: number) => (
                <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.td}>{c.nome}</td>
                  <td style={styles.td}>{c.inicio}</td>
                  <td style={styles.td}>{c.fim}</td>
                  <td style={{ ...styles.td, color: 'var(--red)', fontWeight: 600 }}>
                    {c.drawdown_max !== 0 ? `${c.drawdown_max.toFixed(1)}%` : 'em aberto'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 16px 0',
    color: 'var(--text)',
  },
  tableWrapper: {
    marginTop: '16px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  th: {
    backgroundColor: 'var(--card2)',
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    fontSize: '11px',
    fontWeight: 600,
    padding: '8px 12px',
    textAlign: 'left' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    color: 'var(--text)',
    padding: '7px 12px',
    borderBottom: '1px solid var(--border)',
  },
  rowEven: {
    backgroundColor: 'var(--card)',
  },
  rowOdd: {
    backgroundColor: 'var(--card2)',
  },
};
