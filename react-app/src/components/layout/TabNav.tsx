'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: '🕐 Now', id: 'tab-now' },
  { href: '/portfolio', label: '🎯 Portfolio', id: 'tab-portfolio' },
  { href: '/performance', label: '📈 Performance', id: 'tab-performance' },
  { href: '/fire', label: '🔥 FIRE', id: 'tab-fire' },
  { href: '/withdraw', label: '💸 Retirada', id: 'tab-withdraw' },
  { href: '/simulators', label: '🧪 Simuladores', id: 'tab-simulators' },
  { href: '/backtest', label: '📊 Backtest', id: 'tab-backtest' },
  { href: '/avaliar', label: '🔍 AVALIAR', id: 'tab-avaliar' },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="tab-nav">
      <div className="tab-nav-container">
        {TABS.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tab-btn ${isActive ? 'active' : ''}`}
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
