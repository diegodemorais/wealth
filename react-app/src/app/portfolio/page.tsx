'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { DonutCharts } from '@/components/charts/DonutCharts';
import { StackedAllocChart } from '@/components/charts/StackedAllocChart';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { CustoBaseTable } from '@/components/portfolio/CustoBaseTable';
import { TaxAnalysisGrid } from '@/components/portfolio/TaxAnalysisGrid';
import { RFCryptoComposition } from '@/components/portfolio/RFCryptoComposition';
import ETFRegionComposition from '@/components/dashboard/ETFRegionComposition';

export default function PortfolioPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">Carregando dados da carteira...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>Erro ao carregar carteira:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">Dados carregados mas carteira não disponível</div>;
  }

  return (
    <div>

      {/* 1. Exposição Geográfica — Equities */}
      <div className="section">
        <h2>Exposição Geográfica — Equities</h2>
        <DonutCharts data={data} />
        <div className="src">Premissa: SWRD ≈ 67% US. AVUV/USSC = 100% US. AVDV = 100% DM ex-US. AVGS ~58% US. (Exclui Fixed Income.)</div>
      </div>

      {/* 2. Alocação — Barras Empilhadas */}
      <div className="section">
        <h2>Alocação — Barras Empilhadas</h2>
        <StackedAllocChart data={data} />
      </div>

      {/* 3. Composição por Região — ETFs da Carteira (collapsible) */}
      <CollapsibleSection
        id="section-etf-region"
        title="Composição por Região — ETFs da Carteira"
        defaultOpen={false}
        icon="🗺️"
      >
        <div style={{ padding: '16px' }}>
          <ETFRegionComposition />
          <div className="src">Fonte: etf_composition.json · SWRD=MSCI World, AVGS=Global Small Cap Value, AVEM=Emerging Markets</div>
        </div>
      </CollapsibleSection>

      {/* 4. Exposição Fatorial — ETFs da Carteira (collapsible) */}
      <CollapsibleSection
        id="section-etf-factor"
        title="Exposição Fatorial — ETFs da Carteira"
        defaultOpen={false}
        icon="📊"
      >
        <div style={{ padding: '16px' }}>
          <div style={{ color: 'var(--muted)', fontSize: '.82rem', marginBottom: 8 }}>
            Fatores: Value, Size, Profitability, Investment
          </div>
          <div className="src">Fonte: etf_composition.json · Fatores: Value, Size, Profitability, Investment</div>
        </div>
      </CollapsibleSection>

      {/* 5. Posições — ETFs Internacionais (IBKR) */}
      <HoldingsTable />

      {/* 6. Base de Custo e Alocação — Equity por Bucket (collapsible) */}
      <CustoBaseTable />

      {/* 7. IR Diferido — Alvo & Transitório (collapsible) */}
      <CollapsibleSection
        id="section-tax-ir"
        title="IR Diferido — Alvo & Transitório"
        defaultOpen={false}
        icon="🏛️"
      >
        <div style={{ padding: '16px' }}>
          <TaxAnalysisGrid />
        </div>
      </CollapsibleSection>

      {/* 8. Renda Fixa + Cripto */}
      <RFCryptoComposition />

    </div>
  );
}
