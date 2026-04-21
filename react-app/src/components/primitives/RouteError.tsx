'use client';

import { useEffect } from 'react';

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  routeLabel?: string;
}

export function RouteError({ error, reset, routeLabel }: RouteErrorProps) {
  useEffect(() => {
    console.error(`[Dashboard Error${routeLabel ? ` · ${routeLabel}` : ''}]`, error);
  }, [error, routeLabel]);

  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
        Erro ao carregar {routeLabel ? `a aba ${routeLabel}` : 'esta página'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace', marginBottom: 24, opacity: 0.7 }}>
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
