'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

export interface PatrimonioLiquidoIRProps {
  irDiferido: number;
  patrimonioFinanceiro: number;
  // Optional: P(FIRE) líquido (descontado IR diferido antes da simulação)
  pfireLiquidoPct?: number | null;
  pfireBrutoPct?: number | null;
}

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (val == null) return '—';
  return fmtPrivacy(val, pm);
}

export default function PatrimonioLiquidoIR({
  irDiferido,
  patrimonioFinanceiro,
  pfireLiquidoPct = null,
  pfireBrutoPct = null,
}: PatrimonioLiquidoIRProps) {
  const { privacyMode } = useUiStore();
  const patLiq = patrimonioFinanceiro - irDiferido;
  const irPct = patrimonioFinanceiro > 0 ? (irDiferido / patrimonioFinanceiro) * 100 : 0;
  const deltaPp = pfireLiquidoPct != null && pfireBrutoPct != null ? pfireLiquidoPct - pfireBrutoPct : null;

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
        IR representa {irPct.toFixed(1)}% do bruto · Simulação líquida desconta IR antes do MC
      </div>
      {/* Gap C: P(FIRE) Líquido — exibe impacto do IR diferido na probabilidade */}
      {pfireLiquidoPct != null && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>P(FIRE) Líquido</div>
            <div
              data-testid="pfire-liquido"
              style={{ fontSize: '1.1rem', fontWeight: 800, color: pfireLiquidoPct >= 85 ? 'var(--green)' : pfireLiquidoPct >= 75 ? 'var(--yellow)' : 'var(--red)' }}
            >
              {privacyMode ? '••%' : `${pfireLiquidoPct.toFixed(1)}%`}
            </div>
          </div>
          {pfireBrutoPct != null && (
            <>
              <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>P(FIRE) Bruto</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--muted)' }}>{privacyMode ? '••%' : `${pfireBrutoPct.toFixed(1)}%`}</div>
              </div>
              {deltaPp != null && (
                <>
                  <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Delta IR</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red)' }}>
                      {deltaPp >= 0 ? '+' : ''}{deltaPp.toFixed(1)}pp
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
