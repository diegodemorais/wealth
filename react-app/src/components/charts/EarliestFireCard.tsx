'use client';

import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';

export interface EarliestFireCardProps {
  earliestFireDate?: Date;
  probability?: number;
}

export function EarliestFireCard({
  earliestFireDate = new Date(2040, 0, 1),
  probability = 0.85
}: EarliestFireCardProps) {
  const { privacyMode } = useEChartsPrivacy();

  if (privacyMode) {
    return (
      <div style={styles.card}>
        <h3 style={styles.title}>Earliest FIRE Date (Optimistic)</h3>
        <p style={styles.masked}>••••</p>
      </div>
    );
  }

  const yearsAway = earliestFireDate.getFullYear() - new Date().getFullYear();

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Earliest FIRE Date (Optimistic)</h3>
      <p style={styles.date}>
        {earliestFireDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <p style={styles.subtitle}>
        {yearsAway} years away • {(probability * 100).toFixed(0)}% confidence
      </p>
      <div style={styles.badge}>
        <span style={styles.badgeText}>🚀 Optimistic Scenario</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#1f2937',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
    fontSize: '18px',
  },
  date: {
    margin: '12px 0',
    color: '#10b981',
    fontSize: '28px',
    fontWeight: '700',
  },
  subtitle: {
    margin: '8px 0',
    color: '#9ca3af',
    fontSize: '14px',
  },
  masked: {
    fontSize: '28px',
    color: '#9ca3af',
  },
  badge: {
    marginTop: '16px',
    padding: '8px 12px',
    backgroundColor: '#10b981',
    borderRadius: '6px',
    display: 'inline-block',
  },
  badgeText: {
    color: '#000',
    fontWeight: '600',
    fontSize: '12px',
  },
};
