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
          {data?.etf_composition?.etfs && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', marginBottom: '8px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card2)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>ETF</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>Market</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>Value</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>Size</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 600, color: 'var(--muted)' }}>Quality</th>
                </tr>
              </thead>
              <tbody>
                {['SWRD', 'AVGS', 'AVEM'].map((etf) => {
                  const comp = data.etf_composition.etfs[etf];
                  if (!comp || !comp.fatores) return null;
                  const f = comp.fatores;
                  const getColor = (val: number | null) => {
                    if (val === null || val === 0) return 'var(--muted)';
                    if (val > 0.5) return 'var(--green)';
                    if (val > 0) return 'var(--yellow)';
                    return 'var(--muted)';
                  };
                  return (
                    <tr key={etf} style={{ borderBottom: '1px solid var(--card2)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600 }}>{etf}</td>
                      <td style={{ textAlign: 'center', padding: '6px 0', color: 'var(--green)' }}>
                        {f.market != null ? `${(f.market * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 0', color: getColor(f.value) }}>
                        {f.value != null ? `${(f.value * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 0', color: getColor(f.size) }}>
                        {f.size != null ? `${(f.size * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 0', color: getColor(f.quality) }}>
                        {f.quality != null ? `${(f.quality * 100).toFixed(0)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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

      {/* 9. Últimas Operações */}
      {data?.minilog && Array.isArray(data.minilog) && data.minilog.length > 0 && (
        <div className="section">
          <h2>Últimas Operações</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', marginBottom: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: 'var(--muted)' }}>Data</th>
                <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: 'var(--muted)' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: 'var(--muted)' }}>Ativo</th>
                <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: 'var(--muted)' }}>Corretora</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: 'var(--muted)' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.minilog.slice(0, 10).map((op: any, i: number) => {
                // Parse valor string if needed (e.g., "R$ 46,498" → 46498)
                const valorNum = typeof op.valor === 'string'
                  ? parseFloat(op.valor.replace('R$ ', '').replace('.', '').replace(',', '.'))
                  : (op.valor || 0);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card2)' }}>
                    <td style={{ padding: '6px 0', fontSize: '.75rem', color: 'var(--muted)' }}>{op.data}</td>
                    <td style={{ padding: '6px 0', fontSize: '.75rem' }}>{op.tipo}</td>
                    <td style={{ padding: '6px 0', fontWeight: 600 }}>{op.ativo}</td>
                    <td style={{ padding: '6px 0', fontSize: '.75rem', color: 'var(--muted)' }}>{op.corretora}</td>
                    <td style={{
                      padding: '6px 0',
                      textAlign: 'right',
                      color: valorNum > 0 ? 'var(--green)' : 'var(--red)',
                      fontWeight: 700,
                    }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Math.abs(valorNum))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="src">Fonte: IBKR · Nubank · Binance</div>
        </div>
      )}

    </div>
  );
}
