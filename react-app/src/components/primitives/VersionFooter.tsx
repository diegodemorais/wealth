'use client';

// privacy-ok: toLocaleString here formats dates only (timestamps), not BRL monetary values

import { useMemo, useEffect } from 'react';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';
import { useDashboardStore } from '@/store/dashboardStore';
import { AlertTriangle } from 'lucide-react';

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
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  useEffect(() => {
    loadDataOnce().catch(() => {});
  }, [loadDataOnce]);

  const { dataDate, hoursOld, stalenessLevel, ibkrDate } = useMemo(() => {
    const raw = (data as any)?._generated_brt ?? (data as any)?._generated ?? data?.date;
    if (!raw) return { dataDate: '—', hoursOld: 0, stalenessLevel: null as null | 'warn' | 'critical', ibkrDate: null as string | null };
    const hoursOld = (Date.now() - new Date(raw).getTime()) / 3600000;
    const stalenessLevel: null | 'warn' | 'critical' =
      hoursOld > 168 ? 'critical' : hoursOld > 48 ? 'warn' : null;
    const ibkrRaw = (data as any)?._ibkr_sync_date ?? null;
    return {
      dataDate: fmtBrt(raw),
      hoursOld,
      stalenessLevel,
      ibkrDate: ibkrRaw ? fmtBrt(ibkrRaw) : null,
    };
  }, [data]);

  const daysOld = Math.floor(hoursOld / 24);

  return (
    <footer style={styles.footer} data-testid="version-footer">
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
        {ibkrDate && (
          <>
            <span style={styles.sep}>·</span>
            <div style={styles.group}>
              <span style={styles.label}>IBKR sync</span>
              <span style={styles.value}>{ibkrDate}</span>
            </div>
          </>
        )}
        {stalenessLevel === 'warn' && (
          <span style={styles.staleWarn} data-testid="staleness-banner">
            <AlertTriangle size={13} className="inline mr-1" /> Dados {daysOld}d — rode o pipeline
          </span>
        )}
        {stalenessLevel === 'critical' && (
          <span style={styles.staleCritical} data-testid="staleness-banner">
            <AlertTriangle size={13} className="inline mr-1" /> Dados muito antigos ({daysOld}d) — atualize agora
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
  staleWarn: {
    color: 'var(--orange)',
    fontWeight: 600,
    marginLeft: '8px',
  },
  staleCritical: {
    color: 'var(--red, #ef4444)',
    fontWeight: 700,
    marginLeft: '8px',
  },
};
