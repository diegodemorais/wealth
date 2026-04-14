'use client';

export type SemaforoStatus = 'ok' | 'warning' | 'critical' | 'excellent';

export interface SemaforoProps {
  status: SemaforoStatus;
  label: string;
  description?: string;
}

export function Semaforo({ status, label, description }: SemaforoProps) {
  const getColor = (s: SemaforoStatus) => {
    switch (s) {
      case 'critical':
        return { bg: '#fee2e2', dot: '#dc2626', text: '#7f1d1d' };
      case 'warning':
        return { bg: '#fef3c7', dot: '#d97706', text: '#78350f' };
      default:
        return { bg: '#dcfce7', dot: '#16a34a', text: '#14532d' };
    }
  };

  const colors = getColor(status);

  return (
    <div style={{ ...styles.container, backgroundColor: colors.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.dot,
          }}
        />
        <div>
          <div style={{ ...styles.label, color: colors.text }}>{label}</div>
          {description && (
            <div style={{ ...styles.description, color: colors.text }}>
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '12px',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    margin: 0,
  },
  description: {
    fontSize: '12px',
    margin: '4px 0 0 0',
  },
};
