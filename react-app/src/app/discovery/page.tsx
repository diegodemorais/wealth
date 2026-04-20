'use client';

export default function DiscoveryPage() {
  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Componentes em avaliação antes de integrar às abas permanentes. Anteriores integrados:
          IR Shield → Portfolio · Bond Strategy → Withdraw · Próximo Aporte → Now · Carry Differential → Now ·
          Expected Return Waterfall → Performance · BTC Indicators → Backtest · HODL11 FIRE Projection → Backtest
        </p>
      </div>

      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        Sem componentes em avaliação no momento.
      </div>
    </div>
  );
}
