'use client';

import React from 'react';

interface ComponentAudit {
  name: string;
  phase: string;
  oldStyle: string;
  newStyle: string;
  linesRemoved: number;
  linesAdded: number;
  consolidationNotes: string;
  complexity: 'Low' | 'Medium' | 'High';
}

const COMPONENT_AUDITS: ComponentAudit[] = [
  {
    name: 'EtfsPositionsTable',
    phase: 'Phase 4-6',
    oldStyle: 'Inline style={{}} objects (131 lines)',
    newStyle: 'shadcn/ui Card + Tailwind classes (131 lines)',
    linesRemoved: 40,
    linesAdded: 15,
    consolidationNotes: 'Color logic for P/L values still uses inline styles (dynamic RGB). Could consolidate with LifeEventsTable color pattern.',
    complexity: 'Medium',
  },
  {
    name: 'FireMatrixTable',
    phase: 'Phase 4-6',
    oldStyle: 'Inline style={{}} + className mix (109 lines)',
    newStyle: 'shadcn/ui Card + Tailwind classes (109 lines)',
    linesRemoved: 35,
    linesAdded: 12,
    consolidationNotes: 'Scenario selector buttons pattern reusable across Fire/Withdraw tabs. Cell color logic (getColor fn) still uses inline styles.',
    complexity: 'Medium',
  },
  {
    name: 'FamilyScenarioCards',
    phase: 'Phase 4-6',
    oldStyle: 'Inline style={{}} (143 lines)',
    newStyle: 'shadcn/ui Card + Tailwind classes (143 lines)',
    linesRemoved: 38,
    linesAdded: 18,
    consolidationNotes: 'Profile selector pattern (conditional border/bg) matches button pattern in FireMatrixTable. Progress bar pattern reused from Heatmap.',
    complexity: 'Low',
  },
  {
    name: 'MonthlyReturnsHeatmap',
    phase: 'Phase 4-6',
    oldStyle: 'Inline style={{}} (87 lines)',
    newStyle: 'shadcn/ui Card + Tailwind classes (87 lines)',
    linesRemoved: 30,
    linesAdded: 12,
    consolidationNotes: 'Dynamic grid columns (gridTemplateColumns inline) necessary for responsive heatmap. Legend/stats cards follow Card pattern.',
    complexity: 'Low',
  },
  {
    name: 'LifeEventsTable',
    phase: 'Phase 4-6',
    oldStyle: 'Inline style={{}} (178 lines)',
    newStyle: 'shadcn/ui Card + Tailwind classes (178 lines)',
    linesRemoved: 52,
    linesAdded: 22,
    consolidationNotes: 'Expandable card pattern reusable. Color variables (deltaColor) could consolidate with EtfsPositionsTable. Badge component used.',
    complexity: 'Medium',
  },
  {
    name: 'FireSimulator',
    phase: 'Phase 4-6',
    oldStyle: 'Inline style={{}} (560 lines)',
    newStyle: 'shadcn/ui Card + Tailwind classes (560 lines)',
    linesRemoved: 198,
    linesAdded: 89,
    consolidationNotes: 'Slider pattern reusable. Sensitivity grid pattern (3-col with key-value pairs) could consolidate. Dynamic color logic (pfireColor) preserved.',
    complexity: 'High',
  },
];

const complexityColor = (c: string) => {
  if (c === 'High') return 'var(--red)';
  if (c === 'Medium') return 'var(--yellow)';
  return 'var(--green)';
};

export function AvaliarTab() {
  const totalLinesRemoved = COMPONENT_AUDITS.reduce((sum, c) => sum + c.linesRemoved, 0);
  const totalLinesAdded = COMPONENT_AUDITS.reduce((sum, c) => sum + c.linesAdded, 0);
  const netReduction = totalLinesRemoved - totalLinesAdded;

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Components Refactored', value: COMPONENT_AUDITS.length, color: 'var(--text)', sub: 'All HOJE tab components' },
          { label: 'Lines Removed', value: totalLinesRemoved, color: 'var(--green)', sub: 'Inline styles eliminated' },
          { label: 'Lines Added', value: totalLinesAdded, color: 'var(--accent)', sub: 'Tailwind + Card classes' },
          { label: 'Net Reduction', value: netReduction, color: 'var(--yellow)', sub: `(${((netReduction / totalLinesRemoved) * 100).toFixed(0)}% efficiency)` },
        ].map(item => (
          <div key={item.label} style={cardStyle}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>
              {item.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '8px' }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Audit */}
      <div>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
          Component Audit — Refactoring Details
        </h3>

        {COMPONENT_AUDITS.map((comp) => (
          <div key={comp.name} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{comp.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
                  {comp.phase} — Complexity: <span style={{ color: complexityColor(comp.complexity) }}>{comp.complexity}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', background: 'var(--bg)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Before</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{comp.oldStyle}</div>
              </div>
              <div style={{ padding: '8px', background: 'var(--bg)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>After</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{comp.newStyle}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', marginBottom: '12px' }}>
              <div>
                <span style={{ color: 'var(--muted)' }}>Removed: </span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>{comp.linesRemoved}</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>Added: </span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{comp.linesAdded}</span>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>Net: </span>
                <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>
                  {comp.linesRemoved - comp.linesAdded > 0 ? '-' : '+'}
                  {Math.abs(comp.linesRemoved - comp.linesAdded)}
                </span>
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', lineHeight: 1.5 }}>
                {comp.consolidationNotes}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Consolidation Opportunities */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
          Consolidation Opportunities
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
          {[
            {
              title: 'Pattern: Color-Coded Status',
              body: 'Used in: EtfsPositionsTable (P/L), LifeEventsTable (ΔP(FIRE)), FireSimulator (P(FIRE))',
              note: 'Consolidate into utility hook: `useStatusColor(value, thresholds)`',
            },
            {
              title: 'Pattern: Conditional Button Styling',
              body: 'Used in: FireMatrixTable (scenario selector), FamilyScenarioCards (profile selector)',
              note: 'Consolidate into component: <ToggleButton selected={} />',
            },
            {
              title: 'Pattern: Progress Bar Visualization',
              body: 'Used in: MonthlyReturnsHeatmap, FamilyScenarioCards, FireSimulator',
              note: 'Consolidate into component: <ProgressBar value={} color={} />',
            },
            {
              title: 'Pattern: Expandable Card with Details',
              body: 'Used in: LifeEventsTable (event details)',
              note: 'Reusable for: Portfolio/Performance tabs (position details, metric drilldown)',
            },
            {
              title: 'Pattern: Sensitivity Grid (Key-Value Pairs)',
              body: 'Used in: FireSimulator (3-column sensitivity analysis)',
              note: 'Reusable for: Backtest tab (scenario sensitivity analysis)',
            },
          ].map(item => (
            <div key={item.title} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, color: 'var(--yellow)', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ color: 'var(--muted)' }}>{item.body}</div>
              <div style={{ color: 'var(--accent)', marginTop: '4px' }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div style={{ ...cardStyle, background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '12px' }}>
          Phase 2 → Phase 3 Roadmap
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>
          {[
            { label: 'Priority 1:', text: 'Portfolio tab (29 components, high reuse of HOJE patterns)' },
            { label: 'Priority 2:', text: 'Performance tab (extract chart patterns, consolidate with Phase 1 color logic)' },
            { label: 'Priority 3:', text: 'FIRE tab (complex tables, consolidate with FireMatrixTable pattern)' },
            { label: 'Priority 4:', text: 'Withdraw tab (similar to FIRE, reuse scenario selector pattern)' },
            { label: 'Priority 5:', text: 'Simulators & Backtest (lowest priority, fewer inline styles)' },
          ].map(item => (
            <div key={item.label}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{item.label}</span> {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
