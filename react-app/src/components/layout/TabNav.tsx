'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TABS } from '@/config/dashboard.config';

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
