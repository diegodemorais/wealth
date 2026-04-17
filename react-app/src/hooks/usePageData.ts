/**
 * usePageData — boot pattern hook shared by all dashboard pages
 *
 * Encapsulates the repeated pattern of:
 *   - loadDataOnce (triggers on mount)
 *   - data, derived, isLoading, dataError selectors
 *   - privacyMode from uiStore
 *
 * Usage:
 *   const { data, derived, isLoading, dataError, privacyMode } = usePageData();
 */
import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function usePageData() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const privacyMode = useUiStore(s => s.privacyMode);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Data load failed:', e));
  }, [loadDataOnce]);

  return { data, derived, isLoading, dataError, privacyMode };
}
