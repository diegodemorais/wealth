'use client';

// privacy-ok: toLocaleString here formats dates only (timestamps), not BRL monetary values

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';
import { formatBrt } from '@/utils/time';

export function Footer() {
  const data = useDashboardStore(s => s.data);

  const buildLabel = formatBrt(BUILD_DATE);

  const { dataDate, daysOld, isStale } = useMemo(() => {
    const raw = (data as any)?._generated_brt ?? (data as any)?._generated ?? data?.date;
    if (!raw) return { dataDate: '—', daysOld: 0, isStale: false };
    const generated = new Date(raw);
    const diffMs = Date.now() - generated.getTime();
    const daysOld = Math.floor(diffMs / 86400000);
    return {
      dataDate: formatBrt(raw),
      daysOld,
      isStale: daysOld > 7,
    };
  }, [data]);

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <small style={styles.label}>Dados gerados</small>
          <small style={styles.value}>{dataDate}</small>
          {daysOld > 0 && (
            <small style={styles.sub}>{daysOld}d atrás</small>
          )}
        </div>

        {isStale && (
          <div style={{ ...styles.section, ...styles.stale }} data-test="staleness-banner">
            <small style={{ color: '#fff', fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={13} />Dados com {daysOld} dias — considere atualizar</span>
            </small>
          </div>
        )}
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    backgroundColor: 'var(--bg)',
    borderTop: '1px solid var(--border)',
    padding: '24px 0',
    marginTop: '40px',
    lineHeight: '1.6',
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
    flexDirection: 'column' as const,
    gap: '2px',
  },
  label: {
    color: 'var(--muted)',
    fontSize: 'var(--text-xs)',
    textTransform: 'uppercase' as const,
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  value: {
    color: 'var(--text)',
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  sub: {
    color: 'var(--muted)',
    fontSize: 'var(--text-xs)',
  },
  stale: {
    padding: '8px 12px',
    backgroundColor: 'var(--orange)',
    borderRadius: '4px',
  },
};
