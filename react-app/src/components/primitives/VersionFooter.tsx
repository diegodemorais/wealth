'use client';

import { useMemo } from 'react';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';
import { useDashboardStore } from '@/store/dashboardStore';

function fmtBrt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }) + ' BRT';
  } catch { return iso; }
}

export function VersionFooter() {
  const data = useDashboardStore(s => s.data);

  const { dataDate, daysOld, isStale } = useMemo(() => {
    const raw = (data as any)?._generated_brt ?? (data as any)?._generated ?? data?.date;
    if (!raw) return { dataDate: '—', daysOld: 0, isStale: false };
    const daysOld = Math.floor((Date.now() - new Date(raw).getTime()) / 86400000);
    return { dataDate: fmtBrt(raw), daysOld, isStale: daysOld > 7 };
  }, [data]);

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.group}>
          <span style={styles.label}>Dashboard</span>
          <span style={styles.value}>v{DASHBOARD_VERSION}</span>
        </div>
        <span style={styles.sep}>·</span>
        <div style={styles.group}>
          <span style={styles.label}>Build</span>
          <span style={styles.value}>{fmtBrt(BUILD_DATE)}</span>
        </div>
        <span style={styles.sep}>·</span>
        <div style={styles.group}>
          <span style={styles.label}>Dados</span>
          <span style={styles.value}>{dataDate}</span>
          {daysOld > 0 && <span style={styles.age}>{daysOld}d atrás</span>}
        </div>
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
    padding: '10px 16px',
    borderTop: '1px solid var(--border)',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    marginTop: '32px',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    alignItems: 'center',
  },
  group: {
    display: 'flex',
    gap: '4px',
    alignItems: 'baseline',
  },
  label: {
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    fontWeight: 600,
    fontSize: '10px',
    color: 'var(--muted)',
  },
  value: {
    fontFamily: 'monospace',
    color: 'var(--text)',
  },
  age: {
    color: 'var(--muted)',
    marginLeft: '4px',
  },
  sep: {
    color: 'var(--border)',
  },
  stale: {
    color: 'var(--orange)',
    fontWeight: 600,
    marginLeft: '8px',
  },
};
