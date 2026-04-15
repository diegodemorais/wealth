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
      <div className="bg-card border border-border rounded-md p-4 mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Life Milestones & FIRE Timeline</h3>
        <div className="text-muted-foreground text-lg py-6 text-center">••••</div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Life Milestones & FIRE Timeline</h3>
      <div className="relative pl-10">
        {milestones.map((milestone, idx) => (
          <div key={idx} className="mb-6 relative">
            <div className="absolute -left-14 w-9 h-9 bg-secondary rounded-full flex items-center justify-center border-2 border-card">
              <span className="text-lg">{milestone.icon}</span>
            </div>
            <div className="pb-3">
              <div className="text-amber-500 font-bold text-sm">{milestone.year}</div>
              <div className="text-gray-300 font-semibold text-sm mt-1">{milestone.event}</div>
              <div className="text-muted-foreground text-xs mt-0.5">Age {milestone.age}</div>
            </div>
            {idx < milestones.length - 1 && <div className="absolute -left-11 top-9 w-0.5 h-8 bg-muted" />}
          </div>
        ))}
      </div>
    </div>
  );
}
