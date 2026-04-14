'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: '📡 Dashboard', id: 'tab-dashboard' },
  { href: '/portfolio', label: '🎯 Portfolio', id: 'tab-portfolio' },
  { href: '/performance', label: '📈 Performance', id: 'tab-performance' },
  { href: '/fire', label: '🔥 FIRE', id: 'tab-fire' },
  { href: '/withdraw', label: '💸 Withdraw', id: 'tab-withdraw' },
  { href: '/simulators', label: '🧪 Simulators', id: 'tab-simulators' },
  { href: '/backtest', label: '📊 Backtest', id: 'tab-backtest' },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="tab-nav" style={styles.tabNav}>
      <div style={styles.container}>
        {TABS.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              style={{
                ...styles.tabButton,
                ...(isActive ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
              data-test={tab.id}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabNav: {
    backgroundColor: '#111827',
    borderBottom: '1px solid #374151',
    position: 'sticky',
    top: 59, // Below header
    zIndex: 99,
  },
  container: {
    display: 'flex',
    gap: '0',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  tabButton: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderBottom: '2px solid transparent',
    textDecoration: 'none',
    display: 'inline-block',
  },
  tabButtonActive: {
    color: '#fff',
    borderBottomColor: '#3b82f6',
  },
  tabButtonInactive: {
    color: '#9ca3af',
  },
};
