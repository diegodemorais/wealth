'use client';

import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';

export interface EarliestFireCardProps {
  earliestFireDate?: Date;
  probability?: number;
}

export function EarliestFireCard({
  earliestFireDate = new Date(2040, 0, 1),
  probability = 0.85,
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
  card: { backgroundColor: 'var(--card)', border: '2px solid var(--green)', borderRadius: '12px', padding: '24px', marginBottom: '14px', textAlign: 'center' },
  title: { margin: '0 0 16px 0', color: '#fff', fontSize: '18px' },
  date: { margin: '12px 0', color: 'var(--green)', fontSize: '28px', fontWeight: '700' },
  subtitle: { margin: '8px 0', color: 'var(--muted)', fontSize: '14px' },
  masked: { fontSize: '28px', color: 'var(--muted)' },
  badge: { marginTop: '16px', padding: '8px 12px', backgroundColor: 'var(--green)', borderRadius: '6px', display: 'inline-block' },
  badgeText: { color: '#000', fontWeight: '600', fontSize: '12px' },
};
