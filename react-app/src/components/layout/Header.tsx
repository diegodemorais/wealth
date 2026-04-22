'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';
import { RefreshCw, Eye, EyeOff, LogOut } from 'lucide-react';

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

const TABS = [
  { href: '/', label: 'NOW', id: 'tab-now' },
  { href: '/fire', label: 'FIRE', id: 'tab-fire' },
  { href: '/portfolio', label: 'PORTFOLIO', id: 'tab-portfolio' },
  { href: '/performance', label: 'PERFORMANCE', id: 'tab-performance' },
  { href: '/withdraw', label: 'WITHDRAW', id: 'tab-withdraw' },
  { href: '/backtest', label: 'BACKTEST', id: 'tab-backtest' },
  { href: '/simulators', label: 'SIMULADORES', id: 'tab-simulators' },
  { href: '/assumptions', label: 'ASSUMPTIONS', id: 'tab-assumptions' },
];

export function Header() {
  const pathname = usePathname();
  const privacyMode = useUiStore(s => s.privacyMode);
  const togglePrivacy = useUiStore(s => s.togglePrivacy);
  const logout = useAuthStore(s => s.logout);

  const buildLabel = formatBrt(BUILD_DATE);

  const handleReload = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={styles.header}>
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo-section">
          <h1 className="header-logo-title" style={styles.logo}>Dashboard Wealth DM</h1>
          <span style={styles.versionPill} title={`Build: ${buildLabel}`}>
            {DASHBOARD_VERSION}
          </span>
        </div>

        {/* Controls — always visible, next to logo on mobile */}
        <div className="header-controls">
          <button onClick={handleReload} title="Reload data" style={styles.iconButton} aria-label="Reload">
            <RefreshCw size={15} />
          </button>

          <button
            onClick={togglePrivacy}
            title={privacyMode ? 'Show values' : 'Hide values'}
            style={{ ...styles.iconButton, backgroundColor: privacyMode ? 'var(--red)' : 'var(--border)' }}
            data-test="privacy-toggle"
            aria-label="Privacy mode"
            suppressHydrationWarning
          >
            {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            style={styles.iconButton}
            aria-label="Logout"
            data-test="logout-button"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Tabs — moves to full-width second row on mobile */}
        <nav className="header-tabs" aria-label="Navigation tabs">
          {TABS.map(tab => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  ...styles.tab,
                  ...(isActive ? styles.tabActive : {}),
                }}
                data-test={tab.id}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: 'var(--card)',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  logo: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    whiteSpace: 'nowrap' as const,
  },
  versionPill: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: 'var(--muted)',
    background: 'var(--card2)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '1px 6px',
    whiteSpace: 'nowrap' as const,
    cursor: 'default',
  },
  tab: {
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
    color: 'var(--muted)',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    transition: 'background-color 0.15s, color 0.15s',
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: 'var(--accent)',
    color: '#fff',
    fontWeight: '700',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px',
    backgroundColor: 'var(--border)',
    color: 'var(--text)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
