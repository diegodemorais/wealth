'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PremisesTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const premises = useMemo(() => {
    if (!data?.premissas_vs_realizado) return [];
    const pvr = data.premissas_vs_realizado;

    return [
      {
        category: 'Return (Equity)',
        item: 'Annual Real Return (BRL)',
        assumption: `${pvr.retorno_equity?.premissa_real_brl_pct?.toFixed(2) || '—'}%`,
        actual: `${pvr.retorno_equity?.twr_real_brl_pct?.toFixed(2) || '—'}%`,
        delta: pvr.retorno_equity?.twr_real_brl_pct && pvr.retorno_equity?.premissa_real_brl_pct
          ? (pvr.retorno_equity.twr_real_brl_pct - pvr.retorno_equity.premissa_real_brl_pct).toFixed(2)
          : '—',
      },
      {
        category: 'Contributions',
        item: 'Monthly Contribution (BRL)',
        assumption: pvr.aporte_mensal?.premissa_brl
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pvr.aporte_mensal.premissa_brl)
          : '—',
        actual: pvr.aporte_mensal?.realizado_media_brl
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pvr.aporte_mensal.realizado_media_brl)
          : '—',
        delta: pvr.aporte_mensal?.delta_pct
          ? `${(pvr.aporte_mensal.delta_pct).toFixed(1)}%`
          : '—',
      },
      {
        category: 'Contributions',
        item: 'Total Contribution (All Period)',
        assumption: '—',
        actual: pvr.aporte_mensal?.total_aporte_brl
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pvr.aporte_mensal.total_aporte_brl)
          : '—',
        delta: '—',
      },
    ];
  }, [data?.premissas_vs_realizado]);

  const formatValue = (value: string | number) => {
    if (privacyMode && typeof value === 'string' && value.includes('R$')) {
      return '••••';
    }
    return value;
  };

  const getDeltaColor = (delta: string) => {
    if (delta === '—') return 'var(--text)';
    const numDelta = parseFloat(delta);
    if (isNaN(numDelta)) return 'var(--text)';
    if (numDelta > 0) return 'var(--green)';
    if (numDelta < 0) return 'var(--red)';
    return 'var(--text)';
  };

  if (!data?.premissas_vs_realizado) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Premises vs Actual</h3>
        <div style={styles.empty}>
          <p>No comparison data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Premises vs Actual Performance</h3>
      <p style={styles.subtitle}>
        Comparison of initial assumptions with realized outcomes
      </p>
      <div style={styles.tableWrapper}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Item</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Assumption</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actual</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Delta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {premises.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell style={styles.category}>{row.category}</TableCell>
                <TableCell>{row.item}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  {formatValue(row.assumption)}
                </TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: '500' }}>
                  {formatValue(row.actual)}
                </TableCell>
                <TableCell style={{ textAlign: 'right', color: getDeltaColor(row.delta), fontWeight: '500' }}>
                  {formatValue(row.delta)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.premissas_vs_realizado.aporte_mensal?.por_ano_brl && (
        <div style={styles.annualSection}>
          <h4 style={styles.sectionTitle}>Annual Contribution Breakdown</h4>
          <div style={styles.annualGrid}>
            {Object.entries(data.premissas_vs_realizado.aporte_mensal.por_ano_brl)
              .sort()
              .reverse()
              .map(([year, amount]) => (
                <div key={year} style={styles.annualItem}>
                  <span style={styles.yearLabel}>{year}</span>
                  <span style={styles.yearValue}>
                    {privacyMode ? '••••' : new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                      maximumFractionDigits: 0,
                    }).format(amount as number)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  subtitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: 'var(--muted)',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  category: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--muted)',
  },
  empty: {
    minHeight: '100px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--muted)',
  },
  annualSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
    marginTop: '16px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--muted)',
  },
  annualGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
  },
  annualItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
    textAlign: 'center',
  },
  yearLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontWeight: '500',
    marginBottom: '4px',
  },
  yearValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent)',
  },
};
