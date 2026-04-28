'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';
import { TABS } from '@/config/dashboard.config';
import { RefreshCw, Eye, EyeOff, LogOut, ClipboardList } from 'lucide-react';

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

// Format ISO UTC timestamp → "28/4 10:07" (compact)
function formatBuildCompact(iso: string): string {
  try {
    const d = new Date(iso);
    const brt = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return `${brt.getDate()}/${brt.getMonth() + 1} ${String(brt.getHours()).padStart(2, '0')}:${String(brt.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

export function Header() {
  const pathname = usePathname();
  const privacyMode = useUiStore(s => s.privacyMode);
  const togglePrivacy = useUiStore(s => s.togglePrivacy);
  const logout = useAuthStore(s => s.logout);

  const buildLabel = formatBrt(BUILD_DATE);
  const buildCompact = formatBuildCompact(BUILD_DATE);

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
          <h1 className="header-logo-title" style={styles.logo}>Dash Wealth [DM]</h1>
          <span style={styles.versionPill} title={`Build: ${buildLabel}`} suppressHydrationWarning>
            {DASHBOARD_VERSION} · {buildCompact}
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

          <Link
            href="/assumptions#dashboard-updates"
            title="Changelog"
            style={styles.iconButton}
            aria-label="Changelog"
          >
            <ClipboardList size={15} />
          </Link>

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
    textDecoration: 'none',
  },
};
