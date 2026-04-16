'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';

const EQUITY_BUCKETS = ['SWRD', 'AVGS', 'AVEM'];
const BUCKET_COLORS: Record<string, string> = {
  SWRD: 'var(--accent)',
  AVGS: 'var(--purple)',
  AVEM: 'var(--cyan)',
};

/**
 * Base de Custo e Alocação — Equity por Bucket
 * Colunas: Bucket | Valor USD | Custo USD | Ganho % | Peso equity | Meta equity | Δ
 */
export function CustoBaseTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const rows = useMemo(() => {
    if (!data?.posicoes) return [];
    const posicoes = data.posicoes as Record<string, any>;
    const pesosTarget = (data.pesosTarget as Record<string, number>) ?? {};

    const totalEquityTarget = EQUITY_BUCKETS.reduce((s, k) => s + (pesosTarget[k] ?? 0), 0);

    const acc: Record<string, { valor: number; custo: number }> = {};
    EQUITY_BUCKETS.forEach(b => { acc[b] = { valor: 0, custo: 0 }; });

    Object.values(posicoes).forEach((p: any) => {
      const b = p.bucket as string;
      if (!acc[b]) return;
      acc[b].valor += p.qty * p.price;
      acc[b].custo += p.qty * (p.avg_cost ?? p.pm ?? p.price);
    });

    const totalValor = EQUITY_BUCKETS.reduce((s, b) => s + acc[b].valor, 0);

    return EQUITY_BUCKETS.map(b => {
      const { valor, custo } = acc[b];
      const ganho_pct = custo > 0 ? (valor / custo - 1) * 100 : 0;
      const peso = totalValor > 0 ? valor / totalValor * 100 : 0;
      const meta = totalEquityTarget > 0 ? pesosTarget[b] / totalEquityTarget * 100 : 0;
      const delta = peso - meta;
      return { bucket: b, valor, custo, ganho_pct, peso, meta: Math.round(meta), delta };
    });
  }, [data]);

  const fmtUsd = (v: number) => (privacyMode ? '••••' : `$${(v / 1000).toFixed(0)}k`);
  const fmtPct = (v: number, sign = false) =>
    privacyMode ? '••' : `${sign && v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

  const deltaColor = (d: number) =>
    Math.abs(d) <= 2 ? 'var(--green)' : Math.abs(d) <= 5 ? 'var(--yellow)' : 'var(--red)';

  return (
    <CollapsibleSection
      id="section-custo-base"
      title="Base de Custo e Alocação — Equity por Bucket"
      defaultOpen={true}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Bucket</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Valor USD</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Custo USD</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ganho %</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Peso equity</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Meta equity</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.bucket} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '7px 8px', fontWeight: 700, color: BUCKET_COLORS[r.bucket] }}>{r.bucket}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }} className="pv">{fmtUsd(r.valor)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }} className="pv">{fmtUsd(r.custo)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px', color: r.ganho_pct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {fmtPct(r.ganho_pct, true)}
                </td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }}>{fmtPct(r.peso)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px', color: 'var(--muted)' }}>{r.meta}%</td>
                <td style={{ textAlign: 'right', padding: '7px 8px', color: deltaColor(r.delta), fontWeight: 600 }}>
                  {fmtPct(r.delta, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="src">Fonte: IBKR · Custo médio ponderado (USD) · Pesos intra-equity vs alvo 50/30/20</div>
    </CollapsibleSection>
  );
}
