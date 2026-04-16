'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export function Footer() {
  const data = useDashboardStore(s => s.data);

  const { generatedDate, daysOld, isStale } = useMemo(() => {
    if (!data?.date) {
      return { generatedDate: '—', daysOld: 0, isStale: false };
    }

    const generated = new Date(data.date);
    const now = new Date();
    const diffMs = now.getTime() - generated.getTime();
    const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isStale = daysOld > 7;

    const formatted = generated.toLocaleDateString('pt-BR');
    return { generatedDate: formatted, daysOld, isStale };
  }, [data?.date]);

  const nextCheckDate = useMemo(() => {
    if (!data?.date) return '—';
    const generated = new Date(data.date);
    generated.setDate(generated.getDate() + 30);
    return generated.toLocaleDateString('pt-BR');
  }, [data?.date]);

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <small style={styles.label}>Generated</small>
          <small style={styles.value}>{generatedDate}</small>
          {daysOld > 0 && (
            <small style={styles.subtext}>({daysOld}d ago)</small>
          )}
        </div>

        <div style={styles.section}>
          <small style={styles.label}>Next Check</small>
          <small style={styles.value}>{nextCheckDate}</small>
        </div>

        {isStale && (
          <div
            style={{
              ...styles.section,
              ...styles.staleness,
            }}
            data-test="staleness-banner"
          >
            <small style={{ color: 'var(--text)', fontWeight: '600' }}>
              ⚠️ Data is {daysOld} days old — consider updating
            </small>
          </div>
        )}

        <div style={styles.section}>
          <small style={styles.label}>Version</small>
          <small style={styles.value}>v1.0.0-F2</small>
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    backgroundColor: 'var(--bg)',
    borderTop: '1px solid var(--border)',
    padding: '12px 0',
    marginTop: '40px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    gap: 'var(--space-6)',
    flexWrap: 'wrap',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    color: 'var(--muted)',
    fontSize: 'var(--text-xs)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    color: 'var(--text)',
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
  },
  subtext: {
    color: 'var(--muted)',
    fontSize: 'var(--text-xs)',
  },
  staleness: {
    padding: '8px 12px',
    backgroundColor: 'var(--orange)',
    borderRadius: '4px',
    flex: 1,
  },
};
