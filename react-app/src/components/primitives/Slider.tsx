'use client';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: SliderProps) {
  // Defensive check: ensure value is a number
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const formattedValue = unit ? `${numValue.toFixed(1)}${unit}` : numValue.toFixed(0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>{label}</label>
        <span style={styles.value}>{formattedValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.input}
      />
      <div style={styles.footer}>
        <span style={styles.minMax}>{min}</span>
        <span style={styles.minMax}>{max}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '14px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    color: 'var(--border)',
    fontSize: '14px',
    fontWeight: '600',
  },
  value: {
    color: 'var(--accent)',
    fontSize: '16px',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--card2)',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  minMax: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
};
