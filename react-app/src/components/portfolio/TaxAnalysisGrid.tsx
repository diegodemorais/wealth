'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function TaxAnalysisGrid() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const taxData = useMemo(() => {
    if (!data?.tax?.ir_por_etf) return [];
    return Object.entries(data.tax.ir_por_etf)
      .map(([ticker, etfData]: [string, any]) => ({
        ticker,
        ganho_usd: etfData.ganho_usd || 0,
        ptax_medio: etfData.ptax_compra_medio || 0,
        ptax_atual: etfData.ptax_atual || 0,
        custo_brl: etfData.custo_total_brl || 0,
        valor_brl: etfData.valor_atual_brl || 0,
        ganho_brl: etfData.ganho_brl || 0,
        ir_estimado: etfData.ir_estimado || 0,
      }))
      .sort((a, b) => b.ir_estimado - a.ir_estimado);
  }, [data?.tax?.ir_por_etf]);

  const formatCurrency = (value: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatUSD = (value: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatRate = (value: number) => {
    if (privacyMode) return '••••';
    return value.toFixed(4);
  };

  const getGainColor = (value: number) => {
    if (value > 0) return 'var(--green)';
    if (value < 0) return 'var(--red)';
    return 'var(--text)';
  };

  const totalCostBRL = taxData.reduce((sum, item) => sum + item.custo_brl, 0);
  const totalValueBRL = taxData.reduce((sum, item) => sum + item.valor_brl, 0);
  const totalGainBRL = taxData.reduce((sum, item) => sum + item.ganho_brl, 0);
  const totalIREstimado = data?.tax?.ir_diferido_total_brl || 0;

  if (taxData.length === 0) {
    return (
      <div style={styles.empty}>
        <p>Sem dados de IR disponíveis</p>
      </div>
    );
  }

  return (
    <div>

      <div style={styles.tableWrapper}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Ticker</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Ganho USD</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>PTAX Médio</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Custo BRL</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Valor Atual BRL</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>Ganho BRL</th>
              <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: '600', fontSize: '12px' }}>IR Estimado</th>
            </tr>
          </thead>
          <tbody>
            {taxData.map((item) => (
              <tr key={item.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px', ...styles.ticker }}>{item.ticker}</td>
                <td style={{ textAlign: 'right', padding: '8px', color: 'var(--text)' }}>
                  {formatUSD(item.ganho_usd)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: 'var(--text)' }}>
                  {formatRate(item.ptax_medio)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: 'var(--text)' }}>
                  {formatCurrency(item.custo_brl)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', fontWeight: '500', color: 'var(--text)' }}>
                  {formatCurrency(item.valor_brl)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: getGainColor(item.ganho_brl), fontWeight: '500' }}>
                  {formatCurrency(item.ganho_brl)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px', color: 'var(--orange)', fontWeight: '600' }}>
                  {formatCurrency(item.ir_estimado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.summarySection}>
        <h4 style={styles.summaryTitle}>Tax Summary</h4>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Cost Basis</span>
            <span style={styles.summaryValue}>{formatCurrency(totalCostBRL)}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Current Value</span>
            <span style={styles.summaryValue}>{formatCurrency(totalValueBRL)}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Unrealized Gain</span>
            <span style={{ ...styles.summaryValue, color: getGainColor(totalGainBRL) }}>
              {formatCurrency(totalGainBRL)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Deferred Tax</span>
            <span style={{ ...styles.summaryValue, color: 'var(--orange)' }}>
              {formatCurrency(totalIREstimado)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Effective Tax Rate</span>
            <span style={styles.summaryValue}>
              {privacyMode ? '••••' : totalGainBRL > 0 ? `${((totalIREstimado / totalGainBRL) * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>After-Tax Value</span>
            <span style={styles.summaryValue}>
              {formatCurrency(totalValueBRL - totalIREstimado)}
            </span>
          </div>
        </div>
      </div>

      <div className="src">Regime: ACC UCITS — diferimento fiscal (Lei 14.754/2023). IR 15% flat. PTAX histórica por lote. Transitórios: diluir via aportes, não comprar mais. TLH: ⚠️ = perda ≥ 5%.</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '14px',
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
    marginBottom: '14px',
  },
  ticker: {
    fontWeight: '600',
    color: 'var(--accent)',
  },
  summarySection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  summaryTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--muted)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    backgroundColor: 'var(--bg)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  summaryLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontWeight: '500',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: '600',
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
  noteSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '12px',
  },
  note: {
    margin: '0',
    fontSize: '12px',
    color: 'var(--muted)',
    lineHeight: '1.5',
  },
};
