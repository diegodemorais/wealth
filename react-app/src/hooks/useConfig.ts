'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

/**
 * Centralized UI configuration hook.
 * Provides access to numeric constants and configurations from data.json::_meta.ui
 *
 * Usage:
 *   const { config } = useConfig();
 *   const BAR_MAX = config.ui?.hodl11?.barMax ?? 6.5; // fallback to default
 */
export function useConfig() {
  const data = useDashboardStore(s => s.data);

  const config = useMemo(() => {
    return {
      ui: (data as any)?._meta?.ui ?? {},
    };
  }, [data]);

  return { config };
}
