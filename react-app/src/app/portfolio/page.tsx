'use client';

import { usePageData } from '@/hooks/usePageData';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { DonutCharts } from '@/components/charts/DonutCharts';
import StackedAllocationBar from '@/components/dashboard/StackedAllocationBar';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { CustoBaseTable } from '@/components/portfolio/CustoBaseTable';
import { TaxAnalysisGrid } from '@/components/portfolio/TaxAnalysisGrid';
import { RFCryptoComposition } from '@/components/portfolio/RFCryptoComposition';
import ETFRegionComposition from '@/components/dashboard/ETFRegionComposition';
import ETFFactorComposition from '@/components/dashboard/ETFFactorComposition';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';
import { EtfsPositionsTable } from '@/components/dashboard/EtfsPositionsTable';
import BrasilConcentrationCard from '@/components/dashboard/BrasilConcentrationCard';
import { CryptoBandChart } from '@/components/dashboard/CryptoBandChart';
import RealYieldGauge from '@/components/dashboard/RealYieldGauge';
import IRShield from '@/components/dashboard/IRShield';

export default function PortfolioPage() {
  const { data, isLoading, dataError } = usePageData();
  const { privacyMode } = useUiStore();

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data,
    loadingText: 'Carregando dados da carteira...',
    errorPrefix: 'Erro ao carregar carteira:',
    warningText: 'Dados carregados mas carteira não disponível',
  });
  if (stateEl) return stateEl;

  return (
    <div>

      {/* 1. Alocação — Por Classe de Ativo (moved first: visão geral antes do detalhe) */}
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
        // Threshold constants (mirror dataWiring.ts)
        const DRIFT_VERDE_PP = 3;
        const DRIFT_AMARELO_PP = 5;
        const eq = ['SWRD', 'AVGS', 'AVEM'];
        const eqData = eq.map(k => ({ name: k, ...(data.drift as Record<string, any>)[k] })).filter(d => d.atual != null);
        if (!eqData.length) return null;
        const totalAtual = eqData.reduce((s, d) => s + d.atual, 0);
        const totalAlvo = eqData.reduce((s, d) => s + d.alvo, 0);
        return (
          <div className="section">
            <h2>Drift Intra-Equity — SWRD / AVGS / AVEM</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {eqData.map((etf) => {
                const pctAtual = totalAtual > 0 ? (etf.atual / totalAtual) * 100 : 0;
                const pctAlvo = totalAlvo > 0 ? (etf.alvo / totalAlvo) * 100 : 0;
                const delta = pctAtual - pctAlvo;
                const absGap = Math.abs(delta);
                const isAbove = delta > 0;
                const deltaColor = absGap <= DRIFT_VERDE_PP ? 'var(--green)'
                  : absGap <= DRIFT_AMARELO_PP ? 'var(--yellow)' : 'var(--red)';
                const sign = delta >= 0 ? '+' : '';
                // Threshold band markers on bar: bar goes 0→100% (allocation axis)
                // threshold lines placed at alvo ± N pp relative to 0-100 scale
                const barMax = Math.max(pctAtual, pctAlvo) + 6; // add headroom
                const verdeLine1Pct = Math.max(0, Math.min(100, ((pctAlvo - DRIFT_VERDE_PP) / barMax) * 100));
                const verdeLine2Pct = Math.max(0, Math.min(100, ((pctAlvo + DRIFT_VERDE_PP) / barMax) * 100));
                const amarLine1Pct = Math.max(0, Math.min(100, ((pctAlvo - DRIFT_AMARELO_PP) / barMax) * 100));
                const amarLine2Pct = Math.max(0, Math.min(100, ((pctAlvo + DRIFT_AMARELO_PP) / barMax) * 100));
                const alvoLinePct = Math.max(0, Math.min(100, (pctAlvo / barMax) * 100));
                const actualLinePct = Math.max(0, Math.min(100, (pctAtual / barMax) * 100));
                return (
                  <div key={etf.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>{etf.name}</span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                          atual <strong style={{ color: 'var(--text)' }}>{pctAtual.toFixed(1)}%</strong>
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                          alvo <strong style={{ color: 'var(--text)' }}>{pctAlvo.toFixed(1)}%</strong>
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: deltaColor }}>
                          {sign}{delta.toFixed(1)}pp
                        </span>
                      </div>
                    </div>
                    {/* Bar track with threshold band markers */}
                    <div style={{ position: 'relative', height: 12, background: 'rgba(148,163,184,.15)', borderRadius: 5, overflow: 'visible' }}>
                      {/* Verde band background (alvo ± 3pp) */}
                      <div style={{
                        position: 'absolute', top: 0, height: '100%',
                        left: `${verdeLine1Pct}%`,
                        width: `${Math.max(0, verdeLine2Pct - verdeLine1Pct)}%`,
                        background: 'rgba(34,197,94,.10)',
                        borderRadius: 2,
                      }} />
                      {/* Actual fill */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${actualLinePct}%`,
                        background: deltaColor,
                        borderRadius: 5,
                        opacity: 0.8,
                        transition: 'width .4s',
                      }} />
                      {/* Threshold lines: ±3pp (verde) */}
                      <div style={{ position: 'absolute', left: `${verdeLine1Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--green)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', left: `${verdeLine2Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--green)', opacity: 0.6 }} />
                      {/* Threshold lines: ±5pp (amarelo) */}
                      <div style={{ position: 'absolute', left: `${amarLine1Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--yellow)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', left: `${amarLine2Pct}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--yellow)', opacity: 0.6 }} />
                      {/* Target marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${alvoLinePct}%`,
                        top: -4, bottom: -4, width: 2,
                        background: 'var(--muted)',
                        transform: 'translateX(-50%)',
                        borderRadius: 1,
                      }} />
                      {/* Target label */}
                      <div style={{
                        position: 'absolute',
                        left: `${alvoLinePct}%`,
                        top: 16, fontSize: 'var(--text-xs)', color: 'var(--muted)',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}>▲ {pctAlvo.toFixed(0)}%</div>
                    </div>
                    <div style={{ marginBottom: 14 }} />
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <span style={{ color: 'var(--green)' }}>● verde ≤3pp</span>
              <span style={{ color: 'var(--yellow)' }}>● amarelo 3–5pp</span>
              <span style={{ color: 'var(--red)' }}>● vermelho &gt;5pp</span>
              <span>· rebalanceamento via aporte</span>
            </div>
            <div className="src">Drift = % intra-equity (sobre total equity). Alvo IPS: SWRD 50% / AVGS 30% / AVEM 20%.</div>
          </div>
        );
      })()}

      {/* 3. Exposição Geográfica — via ETFRegionComposition (mais detalhado; DonutCharts removido por redundância) */}
      {/* 4. Composição por Região — ETFs da Carteira (collapsible) */}
      <CollapsibleSection
        id="section-etf-region"
        title={secTitle('portfolio', 'etf-region')}
        defaultOpen={secOpen('portfolio', 'etf-region')}
        icon="🗺️"
      >
        <div style={{ padding: '16px' }}>
          <ETFRegionComposition />
          <div className="src">Fonte: etf_composition.json · SWRD=MSCI World, AVGS=Global Small Cap Value, AVEM=Emerging Markets</div>
        </div>
      </CollapsibleSection>

      {/* 4. Concentração Geográfica */}
      {data && <ConcentrationChart data={data} />}

      {/* 4b. Exposição Fatorial — ETFs da Carteira (collapsible) */}
      <CollapsibleSection
        id="section-etf-factor"
        title={secTitle('portfolio', 'etf-factor')}
        defaultOpen={secOpen('portfolio', 'etf-factor')}
        icon="📊"
      >
        <div style={{ padding: '16px' }}>
          <ETFFactorComposition />
          <div className="src">Fonte: etf_composition.json · Fatores: Market, Value, Size, Quality (escala 0–100%)</div>
        </div>
      </CollapsibleSection>

      {/* 5. Posições — ETFs Internacionais (IBKR) */}
      <HoldingsTable />

      {/* 6. Base de Custo e Alocação — Equity por Bucket (collapsible) */}
      <CustoBaseTable defaultOpen={secOpen('portfolio', 'custo-base')} />

      {/* 7. IR Diferido — Alvo & Transitório (collapsible) */}
      <CollapsibleSection
        id="section-tax-ir"
        title={secTitle('portfolio', 'tax-ir')}
        defaultOpen={secOpen('portfolio', 'tax-ir')}
        icon="🏛️"
      >
        <div style={{ padding: '16px' }}>
          <TaxAnalysisGrid />
        </div>
      </CollapsibleSection>

      {/* 8. Renda Fixa + Cripto */}
      <RFCryptoComposition />

      {/* 8b. ETF Positions Table — posições detalhadas */}
      {data?.posicoes && (
        <CollapsibleSection
          id="section-etf-positions"
          title={secTitle('portfolio', 'etf-positions', 'Posições ETF — Tabela Detalhada')}
          defaultOpen={secOpen('portfolio', 'etf-positions', false)}
          icon="📋"
        >
          <div style={{ padding: '16px' }}>
            <EtfsPositionsTable data={data.posicoes} />
          </div>
        </CollapsibleSection>
      )}

      {/* 8c. Brasil Concentration Card */}
      {data?.concentracao_brasil && (
        <CollapsibleSection
          id="section-brasil-conc"
          title={secTitle('portfolio', 'brasil-conc', 'Concentração Brasil — Detalhe')}
          defaultOpen={secOpen('portfolio', 'brasil-conc', false)}
          icon="🇧🇷"
        >
          <div style={{ padding: '16px' }}>
            {(() => {
              const c = (data as any).concentracao_brasil ?? {};
              const comp = c.composicao ?? {};
              const rfDetalhe = comp.rf_detalhe ?? {};
              return (
                <BrasilConcentrationCard
                  hodl11={comp.hodl11_brl ?? 0}
                  ipcaTotal={(rfDetalhe.ipca2029 ?? 0) + (rfDetalhe.ipca2040 ?? 0) + (rfDetalhe.ipca2050 ?? 0)}
                  rendaPlus={rfDetalhe.renda2065 ?? 0}
                  cryptoLegado={comp.crypto_legado_brl ?? 0}
                  totalBrl={c.total_brasil_brl ?? 0}
                  concentrationBrazil={c.brasil_pct ?? 0}
                />
              );
            })()}
          </div>
        </CollapsibleSection>
      )}

      {/* 8d. Crypto Band Chart */}
      {data?.hodl11?.banda && (
        <CollapsibleSection
          id="section-crypto-band"
          title={secTitle('portfolio', 'crypto-band', 'HODL11 — Banda Criptográfica')}
          defaultOpen={secOpen('portfolio', 'crypto-band', false)}
          icon="₿"
        >
          <div style={{ padding: '16px' }}>
            <CryptoBandChart
              banda={(data as any).hodl11.banda}
              label="HODL11 — BTC Wrapper — B3"
              valor={(data as any).hodl11?.valor}
              pnl_pct={(data as any).hodl11?.pnl_pct}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* 8e. Real Yield Gauge — rendimento real líquido de IR das NTN-Bs */}
      {data?.rf && (
        <CollapsibleSection
          id="section-real-yield"
          title={secTitle('portfolio', 'real-yield', 'Real Yield Gauge — NTN-Bs Líquido de IR')}
          defaultOpen={secOpen('portfolio', 'real-yield', false)}
          icon="📊"
        >
          <div style={{ padding: '16px' }}>
            <RealYieldGauge
              ipca2029={(data as any).rf.ipca2029}
              ipca2040={(data as any).rf.ipca2040}
              ipca2050={(data as any).rf.ipca2050}
              renda2065={(data as any).rf.renda2065}
              ipca12m={(data as any).macro?.ipca_12m ?? 4.14}
              selicMeta={(data as any).macro?.selic_meta ?? 14.75}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* 8f. IR Shield */}
      <CollapsibleSection
        id="section-ir-shield"
        title={secTitle('portfolio', 'ir-shield', 'IR Shield — Diferimento & Seletividade de Lotes')}
        defaultOpen={secOpen('portfolio', 'ir-shield', false)}
        icon="🛡️"
      >
        <div style={{ padding: '16px' }}>
          <IRShield
            irDiferidoTotal={(data as any)?.tax?.ir_diferido_total_brl ?? 0}
            patrimonioTotal={(data as any)?.patrimonio_holistico?.financeiro_brl ?? (data as any)?.premissas?.patrimonio_atual ?? 0}
            lotes={(data as any)?.tlh ?? []}
            gatilho={(data as any)?.tlhGatilho ?? 0.05}
            cambio={(data as any)?.mercado?.cambio_brl_usd ?? (data as any)?.patrimonio?.cambio ?? 5.15}
          />
        </div>
      </CollapsibleSection>

      {/* 9. Últimas Operações (removed HeatmapChart - duplicates ETFFactorComposition) */}

      {/* 9. Últimas Operações */}
      {data?.minilog && Array.isArray(data.minilog) && data.minilog.length > 0 && (
        <div className="section">
          <h2>Últimas Operações</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: 440, borderCollapse: 'collapse', fontSize: 'var(--text-base)', marginBottom: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Data</th>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)' }}>Ativo</th>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }} className="hide-mobile">Corretora</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.minilog.slice(0, 10).map((op: any, i: number) => {
                const valorStr = typeof op.valor === 'string' ? op.valor : String(op.valor ?? '—');
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card2)' }}>
                    <td style={{ padding: '6px 6px', fontSize: 'var(--text-sm)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{op.data}</td>
                    <td style={{ padding: '6px 6px', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>{op.tipo}</td>
                    <td style={{ padding: '6px 6px', fontWeight: 600 }}>{op.ativo}</td>
                    <td style={{ padding: '6px 6px', fontSize: 'var(--text-sm)', color: 'var(--muted)' }} className="hide-mobile">{op.corretora}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: 'var(--green)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {privacyMode ? '••••' : valorStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <div className="src">Fonte: IBKR · Nubank · Binance</div>
        </div>
      )}

    </div>
  );
}
