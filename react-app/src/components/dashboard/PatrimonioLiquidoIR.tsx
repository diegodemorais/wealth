'use client';

import { useUiStore } from '@/store/uiStore';

export interface PatrimonioLiquidoIRProps {
  irDiferido: number;
  patrimonioFinanceiro: number;
}

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (pm) return '••••';
  if (val == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

export default function PatrimonioLiquidoIR({
  irDiferido,
  patrimonioFinanceiro,
}: PatrimonioLiquidoIRProps) {
  const { privacyMode } = useUiStore();
  const patLiq = patrimonioFinanceiro - irDiferido;
  const irPct = patrimonioFinanceiro > 0 ? (irDiferido / patrimonioFinanceiro) * 100 : 0;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Patrimônio Líquido de IR</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Patrimônio bruto</span>
          <span style={{ fontSize: 12, fontWeight: 600 }} className="pv">{fmtBRL(patrimonioFinanceiro, privacyMode)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#dc2626' }}>IR diferido</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }} className="pv">- {fmtBRL(irDiferido, privacyMode)}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Patrimônio líquido</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }} className="pv">{fmtBRL(patLiq, privacyMode)}</span>
        </div>
      </div>
      <div style={{ marginTop: 10, height: 20, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: patLiq > 0 ? patLiq : 0, background: 'var(--accent,#2563eb)' }} />
        <div style={{ flex: irDiferido > 0 ? irDiferido : 0, background: '#dc2626' }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
        IR representa {irPct.toFixed(1)}% do bruto · P(FIRE) calculado sobre bruto (erro de framing)
      </div>
    </div>
  );
}
