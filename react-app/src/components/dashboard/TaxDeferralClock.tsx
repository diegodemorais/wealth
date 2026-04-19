'use client';

import { useUiStore } from '@/store/uiStore';

export interface TaxDeferralClockProps {
  irDiferidoTotal: number;
  patrimonioTotal: number;
}

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (pm) return '••••';
  if (val == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

export default function TaxDeferralClock({
  irDiferidoTotal,
  patrimonioTotal,
}: TaxDeferralClockProps) {
  const { privacyMode } = useUiStore();
  const liqPct = patrimonioTotal > 0 ? ((patrimonioTotal - irDiferidoTotal) / patrimonioTotal) * 100 : 0;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Tax Deferral Clock</h3>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }} className="pv">
          {fmtBRL(irDiferidoTotal, privacyMode)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>IR diferido total</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontStyle: 'italic' }}>
          Cada dia sem vender = empréstimo gratuito do governo
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${liqPct}%`, background: 'var(--accent,#2563eb)' }} />
          <div style={{ flex: 1, background: '#dc2626' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
          <span>Líquido {liqPct.toFixed(1)}%</span>
          <span>IR latente {(100 - liqPct).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
