'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

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

  const formatCurrency = (value: number) => fmtPrivacy(value, privacyMode);

  const totalRFValue = rfComposition.reduce((sum, item) => sum + item.valor, 0);
  const hodlValue = (data?.hodl11?.valor || 0) + ((data as any)?.concentracao_brasil?.composicao?.crypto_legado_brl ?? 0);
  // coe_net_brl: top-level field populated by generate_data.py (lê historico_carteira.csv)
  const coeNetBrl: number = (data as any)?.coe_net_brl ?? 0;
  const totalDerivatives = totalRFValue + coeNetBrl + hodlValue;

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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Instrument</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Type</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Value (BRL)</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Quotes</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {rfComposition.map((item) => (
                <tr key={item.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-2)', ...styles.instrumentName }}>{item.name}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    {item.type}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency(item.valor)}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text)' }}>
                    {fmtPrivacy(item.cotas, privacyMode, { prefix: '', decimals: 2, compact: false })}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: '500', color: 'var(--accent)' }}>
                    {`${item.taxa.toFixed(2)}%`}
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

      {/* COE Row — só exibe quando pipeline popula coe_net_brl */}
      {coeNetBrl > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Estruturados (COE)</h4>
          <div style={styles.tableWrapper}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Instrument</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Value (BRL)</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Quotes</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-2)', ...styles.instrumentName }}>COE XP0121A3C3W</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>COE</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency(coeNetBrl)}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>—</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={styles.subtotalRow}>
            <span>Total Estruturados</span>
            <span style={styles.subtotalValue}>{formatCurrency(coeNetBrl)}</span>
          </div>
        </div>
      )}

      {/* Crypto Table */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Crypto (HODL)</h4>
        <div style={styles.tableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Asset</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Price</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>Value (BRL)</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontWeight: '600', fontSize: 'var(--text-xs)' }}>P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {data.hodl11 && (
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-2)', ...styles.instrumentName }}>HODL11 (BTC Wrapper)</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--text)' }}>
                    {fmtPrivacy(data.hodl11.qty, privacyMode, { prefix: '', decimals: 0, compact: false })}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--text)' }}>
                    {`R$ ${data.hodl11.preco.toFixed(2)}`}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency(data.hodl11.valor)}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: (data.hodl11.pnl_pct ?? 0) >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: '500' }}>
                    {`${(data.hodl11.pnl_pct ?? 0).toFixed(2)}%`}
                  </td>
                </tr>
              )}
              {((data as any)?.concentracao_brasil?.composicao?.crypto_legado_brl ?? 0) > 0 && (
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-2)', ...styles.instrumentName }}>Binance (BTC/ETH/BNB/ADA)</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>—</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>legado</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: '500', color: 'var(--text)' }}>
                    {formatCurrency((data as any).concentracao_brasil.composicao.crypto_legado_brl)}
                  </td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>—</td>
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
          <span style={styles.totalLabel}>RF + COE + Crypto Total</span>
          <span style={styles.totalValue}>{formatCurrency(totalDerivatives)}</span>
        </div>
        <div className={`grid gap-3 ${coeNetBrl > 0 ? 'grid-cols-3' : 'grid-cols-2'}`} style={styles.percentages}>
          <div style={styles.percentItem}>
            <span>Fixed Income</span>
            <span style={styles.percentValue}>
              {`${((totalRFValue / totalDerivatives) * 100).toFixed(1)}%`}
            </span>
          </div>
          {coeNetBrl > 0 && (
            <div style={styles.percentItem}>
              <span>COE</span>
              <span style={styles.percentValue}>
                {`${((coeNetBrl / totalDerivatives) * 100).toFixed(1)}%`}
              </span>
            </div>
          )}
          <div style={styles.percentItem}>
            <span>Crypto</span>
            <span style={styles.percentValue}>
              {`${((hodlValue / totalDerivatives) * 100).toFixed(1)}%`}
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
    padding: 'var(--space-6)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: 'var(--text-lg)',
    fontWeight: '600',
    color: 'var(--text)',
  },
  section: {
    marginBottom: '14px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: 'var(--text-sm)',
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
    fontSize: 'var(--text-sm)',
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
  },
  percentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    fontSize: 'var(--text-xs)',
  },
  percentValue: {
    fontWeight: '600',
    color: 'var(--accent)',
  },
};
