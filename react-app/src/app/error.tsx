'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TABS } from '@/config/dashboard.config';

/**
 * Root error boundary. Next.js App Router bubbles errors up to the nearest
 * error.tsx; with no route-level boundaries, this handles every tab.
 *
 * Tab label is derived from usePathname() + TABS config (single source of
 * truth for href→label mapping), so adding/renaming a route updates this
 * message automatically.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const tab = TABS.find((t) => t.href === pathname);
  const label = tab?.label ?? 'esta página';

  useEffect(() => {
    console.error(`[Dashboard Error · ${pathname}]`, error);
  }, [error, pathname]);

  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
        Erro ao carregar {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--muted)',
          fontFamily: 'monospace',
          marginBottom: 24,
          opacity: 0.7,
        }}
      >
        {error.message}
      </div>
      <button
        onClick={reset}
        style={{
          padding: '8px 16px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
