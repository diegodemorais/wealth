'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function FireScenariosTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const scenarios = useMemo(() => {
    if (!data?.scenario_comparison) return [];
    const sc = data.scenario_comparison;
    return [
      {
        name: 'Base Case',
        desc: 'Conservative target age',
        age: sc.base?.idade || 53,
        base: sc.base?.base || 0,
        fav: sc.base?.fav || 0,
        stress: sc.base?.stress || 0,
        pat_mediano: sc.base?.pat_mediano || 0,
        pat_p10: sc.base?.pat_p10 || 0,
        pat_p90: sc.base?.pat_p90 || 0,
        gasto: sc.base?.gasto_anual || 0,
        swr: sc.base?.swr || 0,
      },
      {
        name: 'Aspiracional',
        desc: 'Early FIRE target',
        age: sc.aspiracional?.idade || 49,
        base: sc.aspiracional?.base || 0,
        fav: sc.aspiracional?.fav || 0,
        stress: sc.aspiracional?.stress || 0,
        pat_mediano: sc.aspiracional?.pat_mediano || 0,
        pat_p10: sc.aspiracional?.pat_p10 || 0,
        pat_p90: sc.aspiracional?.pat_p90 || 0,
        gasto: sc.aspiracional?.gasto_anual || 0,
        swr: sc.aspiracional?.swr || 0,
      },
    ];
  }, [data?.scenario_comparison]);

  const formatCurrency = (value: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (privacyMode) return '••••';
    return `${value.toFixed(1)}%`;
  };

  const getSuccessColor = (value: number) => {
    if (value >= 90) return 'var(--green)';
    if (value >= 75) return 'var(--accent)';
    if (value >= 60) return 'var(--orange)';
    return 'var(--red)';
  };

  if (scenarios.length === 0) {
    return (
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">FIRE Scenarios Comparison</h3>
        <div className="bg-secondary/20 border border-border rounded p-4">
          <p className="text-muted-foreground">No scenario data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <h3 className="text-sm font-semibold text-foreground mb-2">🎯 FIRE Scenarios — Detailed Comparison</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Success probabilities and wealth projections for different retirement targets
      </p>

      {scenarios.map((scenario, idx) => (
        <div key={idx} className="bg-secondary/20 border border-border rounded-md p-4 mb-4" style={styles.scenarioBlock}>
          <div style={styles.scenarioHeader}>
            <div>
              <h4 style={styles.scenarioName}>{scenario.name}</h4>
              <p style={styles.scenarioDesc}>{scenario.desc}</p>
            </div>
            <div style={styles.ageBadge}>
              <span style={styles.ageBadgeLabel}>Target Age</span>
              <span style={styles.ageBadgeValue}>{scenario.age}</span>
            </div>
          </div>

          <div style={styles.metricsGrid}>
            {/* Success Probabilities */}
            <div style={styles.metricSection}>
              <h5 style={styles.metricTitle}>Success Probability</h5>
              <div style={styles.metricList}>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Base Case</span>
                  <span style={{ ...styles.metricValue, color: getSuccessColor(scenario.base) }}>
                    {formatPercent(scenario.base)}
                  </span>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Favorable</span>
                  <span style={{ ...styles.metricValue, color: getSuccessColor(scenario.fav) }}>
                    {formatPercent(scenario.fav)}
                  </span>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Stress Test</span>
                  <span style={{ ...styles.metricValue, color: getSuccessColor(scenario.stress) }}>
                    {formatPercent(scenario.stress)}
                  </span>
                </div>
              </div>
            </div>

            {/* Median Wealth */}
            <div style={styles.metricSection}>
              <h5 style={styles.metricTitle}>Median Net Worth</h5>
              <div style={styles.metricValue}>{formatCurrency(scenario.pat_mediano)}</div>
            </div>

            {/* Wealth Distribution */}
            <div style={styles.metricSection}>
              <h5 style={styles.metricTitle}>Wealth Distribution (MC)</h5>
              <div style={styles.metricList}>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>P10 (Pessimistic)</span>
                  <span style={styles.metricValue}>{formatCurrency(scenario.pat_p10)}</span>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>P50 (Median)</span>
                  <span style={styles.metricValue}>{formatCurrency(scenario.pat_mediano)}</span>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>P90 (Optimistic)</span>
                  <span style={styles.metricValue}>{formatCurrency(scenario.pat_p90)}</span>
                </div>
              </div>
            </div>

            {/* Spending & SWR */}
            <div style={styles.metricSection}>
              <h5 style={styles.metricTitle}>Annual Spending & SWR</h5>
              <div style={styles.metricList}>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Target Spending</span>
                  <span style={styles.metricValue}>{formatCurrency(scenario.gasto)}</span>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Safe Withdrawal Rate</span>
                  <span style={{ ...styles.metricValue, color: 'var(--accent)' }}>
                    {formatPercent(scenario.swr)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Range Indicator */}
          <div style={styles.wealthRangeSection}>
            <div style={styles.rangeLabel}>
              Projected Wealth Range (P10 → P90)
            </div>
            <div style={styles.rangeBar}>
              <div style={styles.rangeMin}>{privacyMode ? '••••' : formatCurrency(scenario.pat_p10)}</div>
              <div style={styles.rangeVisualization}>
                <div style={styles.rangeLine} />
                <div style={styles.rangeMarker} />
              </div>
              <div style={styles.rangeMax}>{privacyMode ? '••••' : formatCurrency(scenario.pat_p90)}</div>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-secondary/10 border border-border rounded-md p-4 mt-4">
        <p className="text-xs text-muted-foreground m-0">
          <strong>Notes:</strong> Success probabilities from 10,000 Monte Carlo simulations.
          Base Case = conservative return assumptions; Favorable = best-case market scenario;
          Stress Test = downturn scenario. SWR (Safe Withdrawal Rate) ensures portfolio
          sustainability through 30-year retirement horizon.
        </p>
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
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: 'var(--muted)',
  },
  scenarioBlock: {
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: 'var(--bg)',
  },
  scenarioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border)',
  },
  scenarioName: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  scenarioDesc: {
    margin: '0',
    fontSize: '12px',
    color: 'var(--muted)',
  },
  agebadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--card)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  ageBadgeLabel: {
    fontSize: '10px',
    color: 'var(--muted)',
    fontWeight: '500',
    marginBottom: '2px',
  },
  ageBadgeValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  metricSection: {
    padding: '12px',
    backgroundColor: 'var(--card)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  metricTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--muted)',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent)',
  },
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  metricLabel: {
    color: 'var(--muted)',
    fontWeight: '500',
  },
  wealthRangeSection: {
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
  },
  rangeLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--muted)',
    marginBottom: '8px',
  },
  rangeBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },
  rangeMin: {
    fontSize: '11px',
    color: 'var(--muted)',
    minWidth: '80px',
    textAlign: 'right',
  },
  rangeVisualization: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  rangeLine: {
    position: 'absolute',
    width: '100%',
    height: '3px',
    backgroundColor: 'var(--border)',
    borderRadius: '2px',
  },
  rangeMarker: {
    position: 'absolute',
    width: '50%',
    height: '8px',
    backgroundColor: 'var(--accent)',
    borderRadius: '2px',
  },
  rangeMax: {
    fontSize: '11px',
    color: 'var(--muted)',
    minWidth: '80px',
    textAlign: 'left',
  },
  empty: {
    minHeight: '100px',
    backgroundColor: 'var(--card)',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--muted)',
  },
  noteSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '12px',
    marginTop: '16px',
  },
  note: {
    margin: '0',
    fontSize: '12px',
    color: 'var(--muted)',
    lineHeight: '1.5',
  },
};
