'use client';

export interface CarryDifferentialProps {
  selic: number;
  fedFunds: number;
  cambio: number | null;
  exposicaoCambialPct?: number;
}

export default function CarryDifferential({
  selic,
  fedFunds,
  cambio,
  exposicaoCambialPct = 89,
}: CarryDifferentialProps) {
  const spread = selic - fedFunds;
  const spreadColor = spread >= 10 ? '#16a34a' : spread >= 6 ? '#ca8a04' : '#dc2626';

  return (
    <div>
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 10 }}>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Spread Selic–FF</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: spreadColor }}>
            {`${spread.toFixed(2)}pp`}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>Selic {selic}% · FF {fedFunds}%</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Câmbio BRL/USD</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
            {cambio != null ? `R$${cambio.toFixed(3)}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
            Exp. cambial ~{exposicaoCambialPct}% (equity UCITS)
          </div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        Spread alto (&gt;10pp) favorece carry mas BRL apreciado reduz retorno em BRL do equity internacional.
        Próx. COPOM: 28-29/abr · Próx. FOMC: mai/2026.
      </div>
    </div>
  );
}
