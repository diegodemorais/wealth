'use client';

import { useMemo } from 'react';
import { DASHBOARD_VERSION } from '@/config/version';
import { useDashboardStore } from '@/store/dashboardStore';

export function VersionFooter() {
  const data = useDashboardStore(s => s.data);

  const { daysOld, isStale } = useMemo(() => {
    const raw = (data as any)?._generated_brt ?? (data as any)?._generated ?? data?.date;
    if (!raw) return { daysOld: 0, isStale: false };
    const daysOld = Math.floor((Date.now() - new Date(raw).getTime()) / 86400000);
    return { daysOld, isStale: daysOld > 7 };
  }, [data]);

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <span>v{DASHBOARD_VERSION}</span>
        {isStale && (
          <span style={styles.stale} data-test="staleness-banner">
            ⚠️ Dados com {daysOld} dias — considere atualizar
          </span>
        )}
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  stale: {
    color: 'var(--orange)',
    fontWeight: 600,
  },
};
