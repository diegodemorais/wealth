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
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#10b981';
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
    return delta.includes('-') ? '#ef4444' : '#10b981';
  }
  return delta >= 0 ? '#10b981' : '#ef4444';
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderLeft: '4px solid #10b981',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    gap: '12px',
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
    gap: '8px',
  },
  label: {
    color: '#9ca3af',
    fontSize: '12px',
    textTransform: 'uppercase',
    fontWeight: '600',
    margin: 0,
  },
  valueSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  value: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
  },
  unit: {
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '400',
    marginLeft: '4px',
  },
  delta: {
    fontSize: '14px',
    fontWeight: '500',
  },
};
