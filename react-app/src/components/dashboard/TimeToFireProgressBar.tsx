'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';

export interface TimeToFireProgressBarProps {
  fireProgress: number; // 0-1 (e.g., 0.2477 for 24.77%)
  yearsToFire: number; // decimal years (e.g., 14.0)
}

export function TimeToFireProgressBar({
  fireProgress,
  yearsToFire,
}: TimeToFireProgressBarProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Format years and months for "14a 0m" format
  const yearsInt = Math.floor(yearsToFire);
  const monthsInt = Math.round((yearsToFire - yearsInt) * 12);
  const yearsMonthsStr = `${yearsInt}a ${monthsInt}m`;

  // Clamp to 0-100
  const progressPct = Math.min(Math.max(fireProgress, 0), 1) * 100;

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Time to FIRE</h2>

      {/* Progress Bar Container */}
      <div style={styles.barContainer}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progressPct}%`,
          }}
        />
      </div>

      {/* Label below bar */}
      <div style={styles.label}>
        {privacyMode ? '••••' : yearsMonthsStr} restantes
      </div>

      {/* Secondary info: percentage */}
      <div style={styles.progressText}>
        {privacyMode ? '••••' : fmtPct(fireProgress, 2)}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '30px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: 'var(--surface, #1a1a1a)',
    border: '1px solid var(--border, #333)',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text, #fff)',
  },
  barContainer: {
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'var(--muted-bg, #2a2a2a)',
    overflow: 'hidden',
    marginBottom: '8px',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent, #3b82f6) 0%, var(--purple, #a855f7) 100%)',
    transition: 'width 0.5s ease-out',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--muted, #999)',
    marginBottom: '8px',
    textAlign: 'right',
  },
  progressText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--accent, #3b82f6)',
    textAlign: 'right',
  },
};
