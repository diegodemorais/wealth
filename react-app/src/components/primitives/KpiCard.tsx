'use client';

import { useUiStore } from '@/store/uiStore';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number | string;
  unit?: string;
  status?: 'ok' | 'warning' | 'critical';
  icon?: string;
  showDelta?: boolean;
}

export function KpiCard({
  label,
  value,
  delta,
  unit = '',
  status = 'ok',
  icon = '',
  showDelta = true,
}: KpiCardProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'critical':
        return 'var(--red)';
      case 'warning':
        return 'var(--yellow)';
      default:
        return 'var(--green)';
    }
  };

  const displayValue = privacyMode ? '••••' : value;
  const displayDelta = privacyMode && delta ? '••••' : delta;

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: getStatusColor(status),
      }}
    >
      {icon && <div style={styles.icon}>{icon}</div>}

      <div style={styles.content}>
        <label style={styles.label}>{label}</label>
        <div style={styles.valueSection}>
          <span style={styles.value} data-test="kpi-value">
            {displayValue}
            {unit && <span style={styles.unit}>{unit}</span>}
          </span>

          {showDelta && delta && (
            <span style={{ ...styles.delta, color: getDeltaColor(delta) }}>
              {typeof delta === 'number' && delta >= 0 && '+'}
              {displayDelta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getDeltaColor(delta: number | string): string {
  if (typeof delta === 'string') {
    return delta.includes('-') ? 'var(--red)' : 'var(--green)';
  }
  return delta >= 0 ? 'var(--green)' : 'var(--red)';
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--card2)',
    borderLeft: '4px solid var(--green)',
    borderRadius: '8px',
    padding: 'var(--space-5)',
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: '24px',
    minWidth: '32px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  label: {
    color: 'var(--muted)',
    fontSize: 'var(--text-xs)',
    textTransform: 'uppercase',
    fontWeight: '600',
    margin: 0,
  },
  valueSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-2)',
  },
  value: {
    color: 'var(--text)',
    fontSize: '24px',
    fontWeight: '600',
  },
  unit: {
    color: 'var(--muted)',
    fontSize: 'var(--text-sm)',
    fontWeight: '400',
    marginLeft: '4px',
  },
  delta: {
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
  },
};
