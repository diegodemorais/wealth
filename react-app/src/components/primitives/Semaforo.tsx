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
    <div className={`semaforo-container semaforo-${status}`} style={{ backgroundColor: colors.bg }}>
      <div className="semaforo-content">
        <div
          className="semaforo-dot"
          style={{ backgroundColor: colors.dot }}
        />
        <div>
          <div className="semaforo-label" style={{ color: colors.text }}>{label}</div>
          {description && (
            <div className="semaforo-description" style={{ color: colors.text }}>
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
