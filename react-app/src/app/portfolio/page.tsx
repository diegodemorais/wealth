'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { DonutCharts } from '@/components/charts/DonutCharts';
import StackedAllocationBar from '@/components/dashboard/StackedAllocationBar';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { CustoBaseTable } from '@/components/portfolio/CustoBaseTable';
import { TaxAnalysisGrid } from '@/components/portfolio/TaxAnalysisGrid';
import { RFCryptoComposition } from '@/components/portfolio/RFCryptoComposition';
import ETFRegionComposition from '@/components/dashboard/ETFRegionComposition';
import ETFFactorComposition from '@/components/dashboard/ETFFactorComposition';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';

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

      {/* 2. Alocação — Por Classe de Ativo */}
      <div className="section">
        <h2>Alocação — Por Classe de Ativo</h2>
        {(() => {
          const conc = (data as any)?.concentracao_brasil ?? {};
          const comp = conc.composicao ?? {};
          const totalBrl = conc.total_portfolio_brl ?? 0;
          const rfDetalhe = comp.rf_detalhe ?? {};
          const ipcaBrl = (rfDetalhe.ipca2029 ?? 0) + (rfDetalhe.ipca2040 ?? 0) + (rfDetalhe.ipca2050 ?? 0);
          const rendaPlusBrl = rfDetalhe.renda2065 ?? 0;
          const cryptoBrl = (comp.hodl11_brl ?? 0) + (comp.crypto_legado_brl ?? 0);
          const rfTotal = comp.rf_total_brl ?? 0;
          const equityBrl = Math.max(0, totalBrl - rfTotal - cryptoBrl);
          return (
            <StackedAllocationBar
              equityBrl={equityBrl}
              ipcaBrl={ipcaBrl}
              rendaPlusBrl={rendaPlusBrl}
              cryptoBrl={cryptoBrl}
              totalBrl={totalBrl}
            />
          );
        })()}
      </div>

      {/* 2b. Drift Intra-Equity — SWRD / AVGS / AVEM */}
      {data?.drift && (() => {
        const eq = ['SWRD', 'AVGS', 'AVEM'];
        const eqData = eq.map(k => ({ name: k, ...(data.drift as Record<string, any>)[k] })).filter(d => d.atual != null);
        if (!eqData.length) return null;
        const totalAtual = eqData.reduce((s, d) => s + d.atual, 0);
        const totalAlvo = eqData.reduce((s, d) => s + d.alvo, 0);
        return (
          <div className="section">
            <h2>Drift Intra-Equity — SWRD / AVGS / AVEM</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {eqData.map((etf) => {
                const pctAtual = totalAtual > 0 ? (etf.atual / totalAtual) * 100 : 0;
                const pctAlvo = totalAlvo > 0 ? (etf.alvo / totalAlvo) * 100 : 0;
                const delta = pctAtual - pctAlvo;
                const isAbove = delta > 0;
                const deltaColor = isAbove ? 'var(--red)' : 'var(--green)';
                const sign = delta >= 0 ? '+' : '';
                return (
                  <div key={etf.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{etf.name}</span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                          atual <strong style={{ color: 'var(--text)' }}>{pctAtual.toFixed(1)}%</strong>
                        </span>
                        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                          alvo <strong style={{ color: 'var(--text)' }}>{pctAlvo.toFixed(1)}%</strong>
                        </span>
                        <span style={{ fontSize: '.82rem', fontWeight: 700, color: deltaColor }}>
                          {sign}{delta.toFixed(1)}pp
                        </span>
                      </div>
                    </div>
                    {/* Bar track */}
                    <div style={{ position: 'relative', height: 10, background: 'rgba(148,163,184,.15)', borderRadius: 5, overflow: 'visible' }}>
                      {/* Actual fill */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${Math.min(100, pctAtual)}%`,
                        background: isAbove ? 'var(--red)' : 'var(--accent)',
                        borderRadius: 5,
                        transition: 'width .4s',
                      }} />
                      {/* Target marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${Math.min(100, pctAlvo)}%`,
                        top: -3, bottom: -3, width: 2,
                        background: 'var(--muted)',
                        transform: 'translateX(-50%)',
                        borderRadius: 1,
                      }} />
                      {/* Target label */}
                      <div style={{
                        position: 'absolute',
                        left: `${Math.min(100, pctAlvo)}%`,
                        top: 14, fontSize: '.5rem', color: 'var(--muted)',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}>▲ {pctAlvo.toFixed(0)}%</div>
                    </div>
                    <div style={{ marginBottom: 8 }} />
                  </div>
                );
              })}
            </div>
            <div className="src">Drift = % intra-equity (sobre total equity). Alvo IPS: SWRD 50% / AVGS 30% / AVEM 20%.</div>
          </div>
        );
      })()}

      {/* 3. Composição por Região — ETFs da Carteira (collapsible) */}
      <CollapsibleSection
        id="section-etf-region"
        title="Composição por Região — ETFs da Carteira"
        defaultOpen={true}
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
        defaultOpen={true}
        icon="📊"
      >
        <div style={{ padding: '16px' }}>
          <ETFFactorComposition />
          <div className="src">Fonte: etf_composition.json · Fatores: Market, Value, Size, Quality (escala 0–100%)</div>
        </div>
      </CollapsibleSection>

      {/* 4b. Concentração Geográfica */}
      {data && <ConcentrationChart data={data} />}

      {/* 5. Posições — ETFs Internacionais (IBKR) */}
      <HoldingsTable />

      {/* 6. Base de Custo e Alocação — Equity por Bucket (collapsible) */}
      <CustoBaseTable />

      {/* 7. IR Diferido — Alvo & Transitório (collapsible) */}
      <CollapsibleSection
        id="section-tax-ir"
        title="IR Diferido — Alvo & Transitório"
        defaultOpen={true}
        icon="🏛️"
      >
        <div style={{ padding: '16px' }}>
          <TaxAnalysisGrid />
        </div>
      </CollapsibleSection>

      {/* 8. Renda Fixa + Cripto */}
      <RFCryptoComposition />

      {/* 9. Últimas Operações (removed HeatmapChart - duplicates ETFFactorComposition) */}

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
                // Render valor as raw string — values are mixed currency/format (BRL, USD, compound "N × $price")
                const valorStr = typeof op.valor === 'string' ? op.valor : String(op.valor ?? '—');
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card2)' }}>
                    <td style={{ padding: '6px 0', fontSize: '.75rem', color: 'var(--muted)' }}>{op.data}</td>
                    <td style={{ padding: '6px 0', fontSize: '.75rem' }}>{op.tipo}</td>
                    <td style={{ padding: '6px 0', fontWeight: 600 }}>{op.ativo}</td>
                    <td style={{ padding: '6px 0', fontSize: '.75rem', color: 'var(--muted)' }}>{op.corretora}</td>
                    <td style={{
                      padding: '6px 0',
                      textAlign: 'right',
                      color: 'var(--green)',
                      fontWeight: 700,
                    }}>
                      {valorStr}
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
