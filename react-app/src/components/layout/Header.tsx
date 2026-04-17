'use client';

import { useUiStore } from '@/store/uiStore';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';

// Format ISO UTC timestamp → "DD/MM/AA HH:mm BRT"
function formatBrt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' BRT';
  } catch {
    return iso;
  }
}

export function Header() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const togglePrivacy = useUiStore(s => s.togglePrivacy);

  const buildLabel = formatBrt(BUILD_DATE);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <header className="header" style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <h1 style={styles.logo}>Dashboard Wealth DM</h1>
          <span style={styles.version} title={`Build: ${DASHBOARD_VERSION} · ${buildLabel}`}>
            {DASHBOARD_VERSION}
            <span style={styles.buildTime}> · {buildLabel}</span>
          </span>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <button onClick={handleReload} title="Reload data" style={styles.button} aria-label="Reload">
            🔄 Reload
          </button>

          <button
            onClick={togglePrivacy}
            title={privacyMode ? 'Show values' : 'Hide values'}
            style={{ ...styles.button, backgroundColor: privacyMode ? 'var(--red)' : 'var(--green)' }}
            data-test="privacy-toggle"
            aria-label="Privacy mode"
          >
            {privacyMode ? '🔒' : '👁️'}
          </button>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: 'var(--card)',
    color: 'var(--text)',
    padding: '12px 0',
    borderBottom: '1px solid var(--border)',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  version: {
    fontSize: 'var(--text-xs)',
    color: 'var(--muted)',
    fontFamily: 'monospace',
    paddingLeft: '8px',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  buildTime: {
    fontSize: '11px',
    color: 'var(--muted)',
    opacity: 0.7,
  },
  controls: {
    display: 'flex',
    gap: 'var(--space-2)',
    alignItems: 'center',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: 'var(--border)',
    color: 'var(--text)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    transition: 'background-color 0.2s',
  },
};
