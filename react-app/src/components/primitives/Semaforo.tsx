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
        return { bg: 'rgba(239, 68, 68, 0.15)', dot: 'rgba(239, 68, 68, 0.85)', text: 'rgba(239, 68, 68, 0.3)' };
      case 'warning':
        return { bg: 'rgba(249, 115, 22, 0.15)', dot: 'rgba(249, 115, 22, 0.7)', text: 'rgba(249, 115, 22, 0.3)' };
      default:
        return { bg: 'rgba(34, 197, 94, 0.15)', dot: 'rgba(34, 197, 94, 0.6)', text: 'rgba(34, 197, 94, 0.3)' };
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
