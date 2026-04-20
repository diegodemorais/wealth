'use client';

import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { BtcFIREProjectionCard } from '@/components/dashboard/BtcFIREProjectionCard';
import { usePageData } from '@/hooks/usePageData';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

export default function DiscoveryPage() {
  const { data, isLoading, dataError } = usePageData();

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
          IR Shield → Portfolio · Bond Strategy → Withdraw · Próximo Aporte → Now · Carry Differential → Now ·
          Expected Return Waterfall → Performance · BTC Indicators → Backtest
        </p>
      </div>

      {/* HODL11 FIRE Projection */}
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

      {!fireProjection && (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Sem componentes em avaliação no momento.
        </div>
      )}
    </div>
  );
}
