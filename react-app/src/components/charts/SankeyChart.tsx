'use client';

import { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { DashboardData } from '@/types/dashboard';

export interface SankeyChartProps {
  data: DashboardData;
}

export function SankeyChart({ data }: SankeyChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const sankeyData = useMemo(() => {
    // Create Sankey allocation flow
    // Total → Asset Classes → Buckets → Tickers
    const totalValue = 2500000;
    const equity = totalValue * 0.65;
    const rf = totalValue * 0.30;
    const crypto = totalValue * 0.05;

    return {
      nodes: [
        { name: 'Total Assets' },
        { name: 'Equity' },
        { name: 'Fixed Income' },
        { name: 'Crypto' },
        { name: 'SWRD' },
        { name: 'AVGS' },
        { name: 'AVEM' },
        { name: 'JPGL' },
        { name: 'IPCA+' },
        { name: 'Renda+' },
        { name: 'HODL11' },
      ],
      links: [
        // Total to asset classes
        { source: 0, target: 1, value: equity },
        { source: 0, target: 2, value: rf },
        { source: 0, target: 3, value: crypto },
        // Equity to buckets
        { source: 1, target: 4, value: equity * 0.40 },
        { source: 1, target: 5, value: equity * 0.25 },
        { source: 1, target: 6, value: equity * 0.25 },
        { source: 1, target: 7, value: equity * 0.10 },
        // RF
        { source: 2, target: 8, value: rf * 0.60 },
        { source: 2, target: 9, value: rf * 0.40 },
        // Crypto
        { source: 3, target: 10, value: crypto },
      ],
    };
  }, []);

  if (privacyMode) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Asset Allocation Flow (Privacy Mode)</h3>
        <div style={styles.masked}>
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>
            Sankey diagram hidden in privacy mode
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Asset Allocation Flow</h3>
      <div style={styles.placeholder}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: 'auto' }}>
          {/* Source nodes */}
          <circle cx="50" cy="200" r="20" fill="#3b82f6" />
          <text x="50" y="235" textAnchor="middle" fill="#d1d5db" fontSize="12">
            Total
          </text>

          {/* Asset class nodes */}
          <circle cx="200" cy="80" r="20" fill="#10b981" />
          <text x="200" y="115" textAnchor="middle" fill="#d1d5db" fontSize="12">
            Equity
          </text>
          <circle cx="200" cy="200" r="20" fill="#f59e0b" />
          <text x="200" y="235" textAnchor="middle" fill="#d1d5db" fontSize="12">
            RF
          </text>
          <circle cx="200" cy="320" r="20" fill="#ec4899" />
          <text x="200" y="355" textAnchor="middle" fill="#d1d5db" fontSize="12">
            Crypto
          </text>

          {/* Buckets nodes */}
          <circle cx="350" cy="50" r="15" fill="#0ea5e9" />
          <text x="350" y="80" textAnchor="middle" fill="#d1d5db" fontSize="11">
            SWRD
          </text>
          <circle cx="350" cy="130" r="15" fill="#0ea5e9" />
          <text x="350" y="160" textAnchor="middle" fill="#d1d5db" fontSize="11">
            AVGS
          </text>
          <circle cx="350" cy="210" r="15" fill="#0ea5e9" />
          <text x="350" y="240" textAnchor="middle" fill="#d1d5db" fontSize="11">
            AVEM
          </text>
          <circle cx="350" cy="290" r="15" fill="#0ea5e9" />
          <text x="350" y="320" textAnchor="middle" fill="#d1d5db" fontSize="11">
            IPCA+
          </text>
          <circle cx="350" cy="350" r="15" fill="#0ea5e9" />
          <text x="350" y="380" textAnchor="middle" fill="#d1d5db" fontSize="11">
            HODL11
          </text>

          {/* Sample flows */}
          <path
            d="M 70 200 Q 135 140 180 80"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 70 200 Q 135 200 180 200"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 70 200 Q 135 260 180 320"
            stroke="#3b82f6"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />

          <path
            d="M 220 80 Q 285 65 335 50"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 220 80 Q 285 105 335 130"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />

          <path
            d="M 220 200 Q 285 250 335 290"
            stroke="#f59e0b"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />

          <path
            d="M 220 320 Q 285 335 335 350"
            stroke="#ec4899"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </svg>
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
          Sankey diagram showing allocation flows from Total → Asset Classes → Holdings
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#fff',
  },
  placeholder: {
    minHeight: '400px',
    backgroundColor: '#111827',
    borderRadius: '4px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  masked: {
    minHeight: '400px',
    backgroundColor: '#111827',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
