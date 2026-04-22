'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { VersionFooter } from '@/components/primitives/VersionFooter';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { useChartSetup } from '@/hooks/useChartSetup';
import { AuthGuard } from '@/components/auth/AuthGuard';

export function LayoutClient({ children }: { children: ReactNode }) {
  // Chart.js removed - using ECharts instead
  // TODO: Remove useChartSetup hook and react-chartjs-2 dependencies

  // Initialize privacy mode hook (handles localStorage + DOM class)
  usePrivacyMode();

  // Initialize Chart.js setup (required for /simulators route — still uses react-chartjs-2)
  useChartSetup();

  // Note: PTAX live updates removed - cambio is loaded from data.json
  // API calls to BCB from browser cause CORS/406 errors and break rendering

  return (
    <AuthGuard>
      <Header />
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        {children}
      </div>
      <VersionFooter />
    </AuthGuard>
  );
}
