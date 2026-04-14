'use client';

import { useUiStore } from '@/store/uiStore';

export function Header() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const togglePrivacy = useUiStore(s => s.togglePrivacy);

  const handleReload = () => {
    window.location.reload();
  };

  const handleEruda = () => {
    // Eruda is loaded via CDN (can be added to layout if needed)
    console.log('Eruda console toggle');
  };

  return (
    <header className="header" style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <h1 style={styles.logo}>💰 Wealth</h1>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          {/* Reload Button */}
          <button
            onClick={handleReload}
            title="Reload data"
            style={styles.button}
            aria-label="Reload"
          >
            🔄 Reload
          </button>

          {/* Eruda Button */}
          <button
            onClick={handleEruda}
            title="Open console"
            style={styles.button}
            aria-label="Console"
          >
            🛠️
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacy}
            title={privacyMode ? 'Show values' : 'Hide values'}
            style={{
              ...styles.button,
              backgroundColor: privacyMode ? '#ef4444' : '#10b981',
            }}
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
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: '12px 0',
    borderBottom: '1px solid #374151',
    position: 'sticky',
    top: 0,
    zIndex: 100,
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
    gap: '10px',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#4b5563',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
};
