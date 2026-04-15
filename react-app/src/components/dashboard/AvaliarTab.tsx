'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export function AvaliarTab() {
  const totalLinesRemoved = COMPONENT_AUDITS.reduce((sum, c) => sum + c.linesRemoved, 0);
  const totalLinesAdded = COMPONENT_AUDITS.reduce((sum, c) => sum + c.linesAdded, 0);
  const netReduction = totalLinesRemoved - totalLinesAdded;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/30 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">
              Components Refactored
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {COMPONENT_AUDITS.length}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              All HOJE tab components
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">
              Lines Removed
            </div>
            <div className="text-2xl font-bold text-green-500">
              {totalLinesRemoved}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Inline styles eliminated
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">
              Lines Added
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {totalLinesAdded}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Tailwind + Card classes
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">
              Net Reduction
            </div>
            <div className="text-2xl font-bold text-amber-500">
              {netReduction}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              ({((netReduction / totalLinesRemoved) * 100).toFixed(0)}% efficiency)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Audit */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Component Audit — Refactoring Details
        </h3>

        {COMPONENT_AUDITS.map((comp) => (
          <Card key={comp.name} className="bg-slate-900/30 border-slate-700/25">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold text-slate-200">
                    {comp.name}
                  </CardTitle>
                  <div className="text-xs text-slate-500 mt-1">
                    {comp.phase} — Complexity: <span className={
                      comp.complexity === 'High' ? 'text-red-500' :
                      comp.complexity === 'Medium' ? 'text-amber-500' :
                      'text-green-500'
                    }>{comp.complexity}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Before/After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2 bg-slate-950/40 rounded">
                  <div className="text-xs text-slate-500 mb-1 font-semibold">Before</div>
                  <div className="text-xs text-slate-400">{comp.oldStyle}</div>
                </div>
                <div className="p-2 bg-slate-950/40 rounded">
                  <div className="text-xs text-slate-500 mb-1 font-semibold">After</div>
                  <div className="text-xs text-slate-400">{comp.newStyle}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Removed: </span>
                  <span className="text-green-500 font-semibold">{comp.linesRemoved}</span>
                </div>
                <div>
                  <span className="text-slate-500">Added: </span>
                  <span className="text-blue-500 font-semibold">{comp.linesAdded}</span>
                </div>
                <div>
                  <span className="text-slate-500">Net: </span>
                  <span className="text-amber-500 font-semibold">
                    {comp.linesRemoved - comp.linesAdded > 0 ? '-' : '+'}
                    {Math.abs(comp.linesRemoved - comp.linesAdded)}
                  </span>
                </div>
              </div>

              {/* Consolidation Notes */}
              <div className="p-2 bg-blue-950/20 rounded border border-blue-900/30">
                <div className="text-xs text-blue-400 leading-relaxed">
                  💡 {comp.consolidationNotes}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consolidation Opportunities */}
      <Card className="bg-slate-900/30 border-slate-700/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-200">
            Consolidation Opportunities
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-xs">
          <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
            <div className="font-semibold text-amber-400 mb-1">🔀 Pattern: Color-Coded Status</div>
            <div className="text-slate-400">
              Used in: EtfsPositionsTable (P/L), LifeEventsTable (ΔP(FIRE)), FireSimulator (P(FIRE))
              <br />
              <span className="text-amber-300 mt-1 block">Consolidate into utility hook: `useStatusColor(value, thresholds)`</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
            <div className="font-semibold text-amber-400 mb-1">🔀 Pattern: Conditional Button Styling</div>
            <div className="text-slate-400">
              Used in: FireMatrixTable (scenario selector), FamilyScenarioCards (profile selector)
              <br />
              <span className="text-amber-300 mt-1 block">Consolidate into component: `&lt;ToggleButton selected={} /&gt;`</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
            <div className="font-semibold text-amber-400 mb-1">🔀 Pattern: Progress Bar Visualization</div>
            <div className="text-slate-400">
              Used in: MonthlyReturnsHeatmap, FamilyScenarioCards, FireSimulator
              <br />
              <span className="text-amber-300 mt-1 block">Consolidate into component: `&lt;ProgressBar value={} color={} /&gt;`</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
            <div className="font-semibold text-amber-400 mb-1">🔀 Pattern: Expandable Card with Details</div>
            <div className="text-slate-400">
              Used in: LifeEventsTable (event details)
              <br />
              <span className="text-amber-300 mt-1 block">Reusable for: Portfolio/Performance tabs (position details, metric drilldown)</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
            <div className="font-semibold text-amber-400 mb-1">🔀 Pattern: Sensitivity Grid (Key-Value Pairs)</div>
            <div className="text-slate-400">
              Used in: FireSimulator (3-column sensitivity analysis)
              <br />
              <span className="text-amber-300 mt-1 block">Reusable for: Backtest tab (scenario sensitivity analysis)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-950/20 border-blue-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-300">
            Phase 2 → Phase 3 Roadmap
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-blue-300">Priority 1:</span> Portfolio tab (29 components, high reuse of HOJE patterns)
          </div>
          <div>
            <span className="font-semibold text-blue-300">Priority 2:</span> Performance tab (extract chart patterns, consolidate with Phase 1 color logic)
          </div>
          <div>
            <span className="font-semibold text-blue-300">Priority 3:</span> FIRE tab (complex tables, consolidate with FireMatrixTable pattern)
          </div>
          <div>
            <span className="font-semibold text-blue-300">Priority 4:</span> Withdraw tab (similar to FIRE, reuse scenario selector pattern)
          </div>
          <div>
            <span className="font-semibold text-blue-300">Priority 5:</span> Simulators & Backtest (lowest priority, fewer inline styles)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
