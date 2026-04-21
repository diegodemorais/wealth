'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { Slider } from '@/components/primitives/Slider';

export function SimulatorParams() {
  const mcParams = useDashboardStore(s => s.mcParams);
  const setMcParams = useDashboardStore(s => s.setMcParams);
  const runMC = useDashboardStore(s => s.runMC);
  const privacyMode = useUiStore(s => s.privacyMode);

  // Defensive: ensure mcParams is initialized
  if (!mcParams || typeof mcParams !== 'object') {
    return <div style={styles.container}>Loading simulator parameters...</div>;
  }

  const handleParamChange = (param: keyof typeof mcParams, value: number) => {
    const newParams = { ...mcParams, [param]: value };
    setMcParams(newParams);
    // Trigger simulation
    runMC(newParams);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Scenario Parameters</h3>

      <div style={styles.grid}>
        <div style={styles.sliderGroup}>
          <Slider
            label="Market Stress Level"
            value={mcParams.stressLevel}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => handleParamChange('stressLevel', v)}
          />
          <p style={styles.hint}>
            0% = Base case | 100% = Severe market downturn
          </p>
        </div>

        <div style={styles.sliderGroup}>
          <Slider
            label="Monthly Contribution"
            value={mcParams.monthlyContribution}
            min={5000}
            max={25000}
            step={1000}
            unit=" BRL"
            onChange={(v) => handleParamChange('monthlyContribution', v)}
          />
          <p style={styles.hint}>
            Current allocation to savings
          </p>
        </div>

        <div style={styles.sliderGroup}>
          <Slider
            label="Expected Annual Return"
            value={mcParams.returnMean}
            min={2}
            max={12}
            step={0.5}
            unit="%"
            onChange={(v) => handleParamChange('returnMean', v)}
          />
          <p style={styles.hint}>
            Long-term expected return (inflation-adjusted)
          </p>
        </div>

        <div style={styles.sliderGroup}>
          <Slider
            label="Return Volatility"
            value={mcParams.returnStd}
            min={5}
            max={25}
            step={1}
            unit="%"
            onChange={(v) => handleParamChange('returnStd', v)}
          />
          <p style={styles.hint}>
            Standard deviation of returns
          </p>
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Scenario:</span>
          <span style={styles.summaryValue}>
            {mcParams?.stressLevel > 0
              ? `Stress: ${mcParams.stressLevel}% | `
              : ''}
            {privacyMode ? '••••' : `R$${(mcParams?.monthlyContribution ?? 0).toLocaleString('pt-BR')}`}/mo | {(mcParams?.returnMean ?? 0).toFixed(1)}% ± {(mcParams?.returnStd ?? 0).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderRadius: '8px',
    padding: 'var(--space-6)',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 24px 0',
    color: 'var(--text)',
    fontSize: 'var(--text-xl)',
    fontWeight: '700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--space-7)',
    marginBottom: '14px',
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  hint: {
    margin: '8px 0 0 0',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--card2)',
    borderRadius: '4px',
    padding: '12px 16px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'var(--muted)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
  },
  summaryValue: {
    color: 'var(--accent)',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
};
