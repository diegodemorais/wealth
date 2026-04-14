'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';
import { Footer } from '@/components/layout/Footer';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { usePtaxLive } from '@/hooks/usePtaxLive';
import { useChartSetup } from '@/hooks/useChartSetup';

export function LayoutClient({ children }: { children: ReactNode }) {
  // Initialize Chart.js FIRST - must happen before any charts render
  useChartSetup();

  // Initialize privacy mode hook (handles localStorage + DOM class)
  usePrivacyMode();

  // Initialize PTAX live updates
  usePtaxLive();

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
    </>
  );
}
