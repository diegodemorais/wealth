'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function RFCryptoComposition() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const rfComposition = useMemo(() => {
    if (!data?.rf) return [];
    return [
      {
        name: 'IPCA+ 2029',
        key: 'ipca2029',
        type: 'IPCA+',
      },
      {
        name: 'IPCA+ 2040',
        key: 'ipca2040',
        type: 'IPCA+',
      },
      {
        name: 'IPCA+ 2050',
        key: 'ipca2050',
        type: 'IPCA+',
      },
      {
        name: 'Renda+ 2065',
        key: 'renda2065',
        type: 'Renda+',
      },
    ]
      .map((item) => {
        const rfData = data.rf?.[item.key as keyof typeof data.rf];
        return {
          ...item,
          valor: rfData?.valor || 0,
          taxa: rfData?.taxa || 0,
          cotas: rfData?.cotas || 0,
          tipo: rfData?.tipo || '',
        };
      });
  }, [data?.rf]);

  const formatCurrency = (value: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalRFValue = rfComposition.reduce((sum, item) => sum + item.valor, 0);
  const hodlValue = data?.hodl11?.valor || 0;
  const totalDerivatives = totalRFValue + hodlValue;

  if (!data) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Renda Fixa + Cripto</h2>
        <div style={styles.empty}>
          <p>Loading composition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Renda Fixa + Cripto</h2>

      {/* Fixed Income Table */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Fixed Income (RF)</h4>
        <div style={styles.tableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Instrument</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Type</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Value (BRL)</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Quotes</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {rfComposition.map((item) => (
                <tr key={item.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px', ...styles.instrumentName }}>{item.name}</td>
                  <td style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                    {item.type}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency(item.valor)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: 'var(--text)' }}>
                    {privacyMode ? '••••' : item.cotas.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', fontWeight: '500', color: 'var(--accent)' }}>
                    {privacyMode ? '••••' : `${item.taxa.toFixed(2)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.subtotalRow}>
          <span>Total Fixed Income</span>
          <span style={styles.subtotalValue}>{formatCurrency(totalRFValue)}</span>
        </div>
      </div>

      {/* Crypto Table */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Crypto (HODL)</h4>
        <div style={styles.tableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Asset</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Value (BRL)</th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {data.hodl11 && (
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px', ...styles.instrumentName }}>HODL11 (BTC Wrapper)</td>
                  <td style={{ textAlign: 'right', padding: '8px', color: 'var(--text)' }}>
                    {privacyMode ? '••••' : data.hodl11.qty.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', color: 'var(--text)' }}>
                    {privacyMode ? '••••' : `R$ ${data.hodl11.preco.toFixed(2)}`}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency(data.hodl11.valor)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', color: data.hodl11.pnl_pct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: '500' }}>
                    {privacyMode ? '••••' : `${data.hodl11.pnl_pct.toFixed(2)}%`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={styles.subtotalRow}>
          <span>Total Crypto</span>
          <span style={styles.subtotalValue}>{formatCurrency(hodlValue)}</span>
        </div>
      </div>

      {/* Total Summary */}
      <div style={styles.totalSection}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>RF + Crypto Total</span>
          <span style={styles.totalValue}>{formatCurrency(totalDerivatives)}</span>
        </div>
        <div style={styles.percentages}>
          <div style={styles.percentItem}>
            <span>Fixed Income</span>
            <span style={styles.percentValue}>
              {privacyMode ? '••••' : `${((totalRFValue / totalDerivatives) * 100).toFixed(1)}%`}
            </span>
          </div>
          <div style={styles.percentItem}>
            <span>Crypto</span>
            <span style={styles.percentValue}>
              {privacyMode ? '••••' : `${((hodlValue / totalDerivatives) * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>
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
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--muted)',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '12px',
  },
  instrumentName: {
    fontWeight: '500',
    color: 'var(--accent)',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  subtotalValue: {
    color: 'var(--accent)',
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
  totalSection: {
    borderTop: '2px solid var(--border)',
    paddingTop: '16px',
    marginTop: '16px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '12px',
  },
  totalLabel: {
    fontSize: '15px',
  },
  totalValue: {
    color: 'var(--green)',
  },
  percentages: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  percentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    fontSize: '12px',
  },
  percentValue: {
    fontWeight: '600',
    color: 'var(--accent)',
  },
};
