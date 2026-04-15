'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';
import { Footer } from '@/components/layout/Footer';
import { VersionFooter } from '@/components/primitives/VersionFooter';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { useChartSetup } from '@/hooks/useChartSetup';

export function LayoutClient({ children }: { children: ReactNode }) {
  // Initialize Chart.js FIRST - must happen before any charts render
  // TODO: Re-enable once charts are properly integrated
  // useChartSetup();

  // Initialize privacy mode hook (handles localStorage + DOM class)
  usePrivacyMode();

  // Note: PTAX live updates removed - cambio is loaded from data.json
  // API calls to BCB from browser cause CORS/406 errors and break rendering

  return (
    <>
      <Header />
      <TabNav />
      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        {children}
      </main>
      <Footer />
      <VersionFooter />
    </>
  );
}
