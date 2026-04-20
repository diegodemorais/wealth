'use client';

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { ExpectedReturnWaterfall } from '@/components/dashboard/ExpectedReturnWaterfall';
import { BtcFIREProjectionCard } from '@/components/dashboard/BtcFIREProjectionCard';
import { BtcIndicatorsChart } from '@/components/dashboard/BtcIndicatorsChart';
import { usePageData } from '@/hooks/usePageData';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// Determine base path for GitHub Pages deployment
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface BtcIndicatorsData {
  generated_at: string;
  ma200w: {
    current_price_usd: number;
    ma200w_usd: number;
    pct_above_ma: number;
    zone: string;
    last_touch_below: string | null;
    series: Array<{
      date: string;
      price_usd: number;
      ma200w_usd: number;
      growth_rate_pct: number;
    }>;
  };
  mvrv_zscore: {
    current_value: number;
    signal: string;
    zone: string;
    market_cap_usd: number | null;
    realized_cap_usd: number | null;
    series: Array<{
      date: string;
      zscore: number;
      market_cap_usd?: number | null;
      realized_cap_usd?: number | null;
    }>;
    thresholds: Record<string, number>;
    z_range?: { min: number; max: number };
    note?: string;
  };
  errors?: string[] | null;
}

function useBtcIndicators() {
  const [btcData, setBtcData] = useState<BtcIndicatorsData | null>(null);
  const [btcError, setBtcError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${BASE_PATH}/btc_indicators.json`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: BtcIndicatorsData) => {
        // Verify the data has the required fields
        if (!data.ma200w || !data.mvrv_zscore) {
          throw new Error('Dados BTC incompletos — verifique o arquivo btc_indicators.json');
        }
        setBtcData(data);
      })
      .catch((e: Error) => {
        setBtcError(e.message);
      });
  }, []);

  return { btcData, btcError };
}

export default function DiscoveryPage() {
  const { data, isLoading, dataError } = usePageData();
  const { btcData, btcError } = useBtcIndicators();

  const guard = pageStateElement({ isLoading, dataError, data });
  if (guard) return guard;

  const hodl11 = (data as any)?.hodl11 ?? {};
  const fireProjection = hodl11?.fire_projection;

  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Componentes em avaliação antes de integrar às abas permanentes. Anteriores integrados:
          IR Shield → Portfolio · Bond Strategy → Withdraw · Próximo Aporte → Now · Carry Differential → Now
        </p>
      </div>

      {/* Componente 1: Expected Return Waterfall */}
      <CollapsibleSection
        id="discovery-factor-waterfall"
        title="Expected Return Waterfall — Decomposição Fatorial FF6"
        defaultOpen={true}
      >
        <ExpectedReturnWaterfall />
      </CollapsibleSection>

      {/* Componente 2: BTC FIRE Projection */}
      {fireProjection && (
        <CollapsibleSection
          id="discovery-btc-fire-projection"
          title="HODL11 — Projeção FIRE Day (3 Cenários BTC)"
          defaultOpen={true}
        >
          <BtcFIREProjectionCard
            hodl11BrlAtual={fireProjection.hodl11_brl_atual}
            btcAtualUsd={fireProjection.btc_atual_usd}
            cenarios={fireProjection.cenarios}
          />
        </CollapsibleSection>
      )}

      {/* Componente 3: BTC On-Chain Indicators */}
      <CollapsibleSection
        id="discovery-btc-indicators"
        title="Bitcoin — 200WMA Heatmap & MVRV Z-Score"
        defaultOpen={true}
      >
        <div style={{ padding: 16 }}>
          {btcError ? (
            <div style={{
              padding: 16,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              fontSize: 13,
              color: '#ef4444',
            }}>
              <strong>Dados BTC não disponíveis</strong>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                Rodar: <code>scripts/btc_indicators.py</code> — Erro: {btcError}
              </p>
            </div>
          ) : btcData ? (
            <>
              {btcData.errors && btcData.errors.length > 0 && (
                <div style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#f59e0b',
                }}>
                  Avisos na coleta: {btcData.errors.join(' | ')}
                </div>
              )}
              <BtcIndicatorsChart
                ma200w={btcData.ma200w}
                mvrvZscore={btcData.mvrv_zscore}
              />
              <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--muted)', opacity: 0.6 }}>
                Dados gerados em: {new Date(btcData.generated_at).toLocaleString('pt-BR')}
                {' · '}Atualizar: <code style={{ fontSize: 9 }}>python scripts/btc_indicators.py</code>
              </p>
            </>
          ) : (
            <div style={{
              padding: 20,
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 13,
            }}>
              Carregando dados BTC...
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
