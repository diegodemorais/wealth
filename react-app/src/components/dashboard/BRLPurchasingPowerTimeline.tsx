'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

export interface BRLPurchasingPowerTimelineProps {
  /** Current BRL/USD exchange rate */
  cambio: number;
  /** Fraction of portfolio in USD equity (e.g. 0.879 for 87.9%) */
  equityPctUsd: number;
  /** Total portfolio value in BRL */
  patrimonioAtual: number;
}

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (pm) return fmtPrivacy(val ?? 0, true);
  if (val == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

export default function BRLPurchasingPowerTimeline({
  cambio,
  equityPctUsd,
  patrimonioAtual,
}: BRLPurchasingPowerTimelineProps) {
  const { privacyMode } = useUiStore();
  const equityBRL = patrimonioAtual * equityPctUsd;
  const equityUSD = equityBRL / cambio;
  // retorno equity em USD (nominal): assume ~7% USD nominal para ETFs globais
  const retornoUSD = 0.07;

  const scenarios = [
    { label: 'BRL aprecia 3%/a', depBRL: -0.03, color: '#dc2626' },   // BRL fortalece = portfolio BRL vale menos
    { label: 'Base (flat)', depBRL: 0.00, color: '#2563eb' },
    { label: 'BRL deprecia 4%/a', depBRL: 0.04, color: '#16a34a' }, // BRL enfraquece = portfolio BRL vale mais
  ];
  const checkYears = [2030, 2035, 2040];

  function equityBRLat(yr: number, dep: number): number {
    const t = yr - 2026;
    const newCambio = cambio * Math.pow(1 + dep, t);
    return equityUSD * Math.pow(1 + retornoUSD, t) * newCambio;
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Equity USD em BRL — Sensibilidade Cambial</h3>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        Equity: {(equityPctUsd * 100).toFixed(0)}% da carteira · USD {fmtBRL(equityUSD, false).replace('R$', 'US$')} · Câmbio R${cambio.toFixed(3)}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 300 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Cenário</th>
              {checkYears.map(yr => (
                <th key={yr} style={{ padding: '4px 6px', color: 'var(--muted)', fontWeight: 500 }}>{yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(sc => (
              <tr key={sc.label}>
                <td style={{ padding: '4px 6px', fontWeight: 500, color: sc.color }}>{sc.label}</td>
                {checkYears.map(yr => (
                  <td key={yr} style={{ padding: '4px 6px', fontWeight: 600, color: 'var(--text)' }} className="pv">
                    {fmtPrivacy(equityBRLat(yr, sc.depBRL), privacyMode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        Apenas equity USD · Exclui RF (IPCA+), cripto e aportes futuros · Retorno equity 7%/a nominal USD
      </div>
    </div>
  );
}
