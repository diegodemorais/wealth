'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface RfBond {
  taxa?: number;
  valor?: number;
}

export interface RealYieldGaugeProps {
  ipca2029?: RfBond;
  ipca2040?: RfBond;
  ipca2050?: RfBond;
  renda2065?: RfBond;
  ipca12m: number | undefined;
  selicMeta: number | undefined;
}

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (val == null) return '—';
  return fmtPrivacy(val, pm);
}

function fmtPct(val: number | undefined | null): string {
  if (val == null) return '—';
  return val.toFixed(2) + '%';
}

export default function RealYieldGauge({
  ipca2029,
  ipca2040,
  ipca2050,
  renda2065,
  ipca12m,
  selicMeta,
}: RealYieldGaugeProps) {
  const { privacyMode } = useUiStore();
  const selicReal = (selicMeta != null && ipca12m != null) ? selicMeta - ipca12m : null;

  const bonds = [
    { key: 'ipca2029', label: 'IPCA+2029', d: ipca2029 },
    { key: 'ipca2040', label: 'IPCA+2040', d: ipca2040 },
    { key: 'ipca2050', label: 'IPCA+2050', d: ipca2050 },
    { key: 'renda2065', label: 'Renda+2065', d: renda2065 },
  ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Real Yield Gauge</h3>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        IPCA 12M: {ipca12m != null ? ipca12m.toFixed(2) + '%' : '—'} · Selic Real: {selicReal != null ? selicReal.toFixed(2) + '%' : '—'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bonds.map(({ key, label, d }) => {
          if (!d) return null;
          // Fórmula correta: IR 15% incide sobre o retorno nominal, não real
          const taxaReal = (d.taxa ?? 0) / 100;
          const ipcaDecimal = (ipca12m ?? 0) / 100;
          const nominalReturn = (1 + taxaReal) * (1 + ipcaDecimal) - 1;
          const afterTaxNominal = nominalReturn * 0.85;
          const yieldRealLiq = ((1 + afterTaxNominal) / (1 + ipcaDecimal) - 1) * 100;
          const color = yieldRealLiq > 5 ? '#16a34a' : yieldRealLiq >= 4 ? '#ca8a04' : '#dc2626';
          const barPct = Math.min(100, Math.max(0, (yieldRealLiq / 7) * 100));
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Nominal {fmtPct(d.taxa)} · Real Liq {fmtPct(yieldRealLiq)}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${barPct}%`, height: '100%', background: color, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                {fmtBRL(d.valor, privacyMode)} · Carry vs Selic real: {selicReal != null ? (yieldRealLiq - selicReal).toFixed(2) + 'pp' : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
