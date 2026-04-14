'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

/**
 * Hook to fetch live PTAX (USD/BRL) from BCB API
 * Updates dashboard store when new rate is available
 */
export function usePtaxLive() {
  const updateField = useDashboardStore(s => s.updateField);

  useEffect(() => {
    const fetchPtax = async () => {
      try {
        // BCB API: SGS 10813 = PTAX USD/BRL closing rate
        const response = await fetch(
          'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?formato=json&quantidade=1'
        );

        if (!response.ok) {
          console.warn('PTAX fetch failed:', response.status);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const ptaxRate = parseFloat(data[0].valor);
          if (!isNaN(ptaxRate)) {
            updateField('cambio', ptaxRate);
          }
        }
      } catch (error) {
        console.error('Error fetching PTAX:', error);
      }
    };

    // Fetch on mount
    fetchPtax();

    // Optionally set up periodic refresh (e.g., every hour)
    const interval = setInterval(fetchPtax, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateField]);
}
