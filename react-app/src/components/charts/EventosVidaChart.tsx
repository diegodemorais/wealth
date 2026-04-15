'use client';

import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';

export interface EventosVidaChartProps {
  data: DashboardData;
}

export function EventosVidaChart({ data }: EventosVidaChartProps) {
  const { privacyMode } = useEChartsPrivacy();

  const milestones = [
    { year: 2026, event: 'Current Age (35)', age: 35, icon: '👤' },
    { year: 2031, event: 'Target Savings Rate Hit', age: 40, icon: '📈' },
    { year: 2036, event: 'Mid-Life Review', age: 45, icon: '🔄' },
    { year: 2041, event: 'FIRE Target (Base)', age: 50, icon: '🔥' },
    { year: 2051, event: 'Social Security Eligible', age: 60, icon: '🏛️' },
    { year: 2056, event: 'Full Retirement Age', age: 65, icon: '🏖️' },
  ];

  if (privacyMode) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Life Milestones & FIRE Timeline</h3>
        <div style={styles.maskedContent}>••••</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Life Milestones & FIRE Timeline</h3>
      <div style={styles.timeline}>
        {milestones.map((milestone, idx) => (
          <div key={idx} style={styles.milestone}>
            <div style={styles.dot}>
              <span style={styles.icon}>{milestone.icon}</span>
            </div>
            <div style={styles.content}>
              <div style={styles.year}>{milestone.year}</div>
              <div style={styles.event}>{milestone.event}</div>
              <div style={styles.age}>Age {milestone.age}</div>
            </div>
            {idx < milestones.length - 1 && <div style={styles.connector} />}
          </div>
        ))}
      </div>
    </div>
  );
}

const DOT_SIZE = 36;
const DOT_OFFSET = 58;
const CONNECTOR_OFFSET = 49;

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px', marginBottom: '20px' },
  title: { margin: '0 0 16px 0', color: '#fff' },
  maskedContent: { color: '#9ca3af', fontSize: '18px', padding: '24px', textAlign: 'center' },
  timeline: { position: 'relative', paddingLeft: '40px' },
  milestone: { marginBottom: '24px', position: 'relative' },
  dot: { position: 'absolute', left: -DOT_OFFSET, width: DOT_SIZE, height: DOT_SIZE, backgroundColor: '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1f2937' },
  icon: { fontSize: '18px' },
  content: { paddingBottom: '12px' },
  year: { color: '#f59e0b', fontWeight: '700', fontSize: '14px' },
  event: { color: '#d1d5db', fontWeight: '600', fontSize: '15px', marginTop: '4px' },
  age: { color: '#9ca3af', fontSize: '12px', marginTop: '2px' },
  connector: { position: 'absolute', left: -CONNECTOR_OFFSET, top: DOT_SIZE, width: '2px', height: 'calc(100% + 12px)', backgroundColor: '#4b5563' },
};
