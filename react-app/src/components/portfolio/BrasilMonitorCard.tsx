'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import BrasilConcentrationCard from '@/components/dashboard/BrasilConcentrationCard';

/**
 * BrasilMonitorCard
 * Wrapper around BrasilConcentrationCard that extracts data from dashboard store
 * and calculates Brasil concentration metrics
 */
export function BrasilMonitorCard() {
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);

  const metrics = useMemo(() => {
    if (!data || !derived) {
      return {
        hodl11: 0,
        ipcaTotal: 0,
        rendaPlus: 0,
        cryptoLegado: 0,
        totalBrl: 1,
        concentrationBrazil: 0,
      };
    }

    // Extract RF positions (IPCA ladder)
    const ipcaTotal = (data.rf?.ipca2029?.posicao_brl || 0) +
                      (data.rf?.ipca2040?.posicao_brl || 0) +
                      (data.rf?.ipca2050?.posicao_brl || 0);

    // Renda+ 2065
    const rendaPlus = data.rf?.renda2065?.posicao_brl || 0;

    // HODL11 (Bitcoin)
    const hodl11 = (data.hodl11?.valor || 0) + (data.cryptoLegado || 0);

    // Crypto Legado (separate tracking if available)
    const cryptoLegado = data.cryptoLegado || 0;

    // Total BRL patrimonio from derived
    const totalBrl = derived.networth || 1; // prevent division by zero

    // Brasil concentration: all RF + crypto = Brasil-denominated
    const brasilAssets = ipcaTotal + rendaPlus + hodl11;
    const concentrationBrazil = brasilAssets / totalBrl;

    return {
      hodl11,
      ipcaTotal,
      rendaPlus,
      cryptoLegado,
      totalBrl,
      concentrationBrazil,
    };
  }, [data, derived]);

  return (
    <BrasilConcentrationCard
      hodl11={metrics.hodl11}
      ipcaTotal={metrics.ipcaTotal}
      rendaPlus={metrics.rendaPlus}
      cryptoLegado={metrics.cryptoLegado}
      totalBrl={metrics.totalBrl}
      concentrationBrazil={metrics.concentrationBrazil}
    />
  );
}
