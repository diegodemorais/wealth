'use client';

import { useUiStore } from '@/store/uiStore';

interface BondEntry {
  valor?: number;
  taxa?: number;
}

export interface BondLadderTimelineProps {
  ipca2029?: BondEntry;
  ipca2040?: BondEntry;
  ipca2050?: BondEntry;
  renda2065?: BondEntry;
  /** Monthly spending in BRL (custo_vida_base / 12) */
  custoVidaMensal: number;
}

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (pm) return '••••';
  if (val == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

export default function BondLadderTimeline({
  ipca2029,
  ipca2040,
  ipca2050,
  renda2065,
  custoVidaMensal,
}: BondLadderTimelineProps) {
  const { privacyMode } = useUiStore();

  const bonds = [
    { key: 'ipca2029', label: 'IPCA+2029', year: 2029, d: ipca2029 },
    { key: 'ipca2040', label: 'IPCA+2040', year: 2040, d: ipca2040 },
    { key: 'ipca2050', label: 'IPCA+2050', year: 2050, d: ipca2050 },
    { key: 'renda2065', label: 'Renda+2065', year: 2065, d: renda2065, vitalicio: true },
  ].filter(b => b.d);

  const maxVal = Math.max(...bonds.map(b => b.d?.valor ?? 0), 1);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Bond Ladder Timeline</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, paddingBottom: 4 }}>
        {bonds.map(({ key, label, year, d, vitalicio }) => {
          const val = d?.valor ?? 0;
          const meses = custoVidaMensal > 0 ? val / custoVidaMensal : 0;
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{meses.toFixed(1)}m</div>
              <div style={{ width: '100%', height: `${heightPct}%`, background: vitalicio ? '#7c3aed' : '#2563eb', borderRadius: '3px 3px 0 0', minHeight: 8 }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {bonds.map(({ key, label, year, d }) => (
          <div key={key} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
            <div style={{ fontSize: 10, fontWeight: 600 }} className="pv">{fmtBRL(d?.valor, privacyMode)}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
