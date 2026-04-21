'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
        Erro ao carregar esta página
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
