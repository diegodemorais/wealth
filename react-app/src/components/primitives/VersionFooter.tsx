'use client';

import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';

export function VersionFooter() {
  const buildDateObj = new Date(BUILD_DATE);
  const formattedDate = buildDateObj.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          Dashboard: <strong>v{DASHBOARD_VERSION}</strong>
        </p>
        <p style={styles.text}>
          Built: <time>{formattedDate}</time>
        </p>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: '60px',
    padding: '24px 16px',
    borderTop: '1px solid rgba(107, 114, 128, 0.2)',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    fontSize: '0.75rem',
    color: 'var(--muted)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
  },
  text: {
    margin: 0,
  },
};
