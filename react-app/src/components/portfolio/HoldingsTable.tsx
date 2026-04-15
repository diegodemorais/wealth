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

export function HoldingsTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const holdings = useMemo(() => {
    if (!data?.hodl11) return [];
    return [{
      ticker: 'HODL11',
      qty: data.hodl11.qty,
      preco_medio: data.hodl11.preco_medio,
      preco: data.hodl11.preco,
      valor: data.hodl11.valor,
      pnl_brl: data.hodl11.pnl_brl,
      pnl_pct: data.hodl11.pnl_pct,
      ytd_pct: 0, // Will be calculated if historical data available
    }];
  }, [data?.hodl11]);

  const formatCurrency = (value: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    if (privacyMode) return '••••';
    return value.toFixed(decimals);
  };

  const getTextColor = (value: number) => {
    if (value > 0) return 'var(--green)';
    if (value < 0) return 'var(--red)';
    return 'var(--text)';
  };

  if (!data) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>HODL11 Holdings</h3>
        <div style={styles.empty}>
          <p>Loading holdings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🪙 HODL11 Holdings</h3>
      <div style={styles.tableWrapper}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Qty</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Avg Cost</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Current</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Value (BRL)</TableHead>
              <TableHead style={{ textAlign: 'right' }}>P&L ($)</TableHead>
              <TableHead style={{ textAlign: 'right' }}>P&L (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h) => (
              <TableRow key={h.ticker}>
                <TableCell style={styles.ticker}>{h.ticker}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  {privacyMode ? '••••' : h.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  {formatNumber(h.preco_medio, 2)}
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  {formatNumber(h.preco, 2)}
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  {formatCurrency(h.valor)}
                </TableCell>
                <TableCell style={{ textAlign: 'right', color: getTextColor(h.pnl_brl) }}>
                  {formatCurrency(h.pnl_brl)}
                </TableCell>
                <TableCell style={{ textAlign: 'right', color: getTextColor(h.pnl_pct) }}>
                  {formatNumber(h.pnl_pct, 2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div style={styles.bandaSection}>
        <h4 style={styles.bandaTitle}>Allocation Band</h4>
        {data.hodl11?.banda && (
          <div style={styles.bandaGrid}>
            <div style={styles.bandaItem}>
              <span style={styles.bandaLabel}>Min</span>
              <span>{data.hodl11.banda.min_pct}%</span>
            </div>
            <div style={styles.bandaItem}>
              <span style={styles.bandaLabel}>Target</span>
              <span>{data.hodl11.banda.alvo_pct}%</span>
            </div>
            <div style={styles.bandaItem}>
              <span style={styles.bandaLabel}>Current</span>
              <span style={{
                color: data.hodl11.banda.status === 'verde' ? 'var(--green)' : 'var(--orange)'
              }}>
                {data.hodl11.banda.atual_pct}%
              </span>
            </div>
            <div style={styles.bandaItem}>
              <span style={styles.bandaLabel}>Max</span>
              <span>{data.hodl11.banda.max_pct}%</span>
            </div>
            <div style={styles.bandaItem}>
              <span style={styles.bandaLabel}>Status</span>
              <span style={{
                color: data.hodl11.banda.status === 'verde' ? 'var(--green)' : 'var(--orange)'
              }}>
                {data.hodl11.banda.status === 'verde' ? '✓ Within band' : '⚠ Review'}
              </span>
            </div>
          </div>
        )}
      </div>
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
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  ticker: {
    fontWeight: '600',
    color: 'var(--accent)',
  },
  bandaSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
    marginTop: '16px',
  },
  bandaTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--muted)',
  },
  bandaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  bandaItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  bandaLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontWeight: '500',
    marginBottom: '4px',
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
};
