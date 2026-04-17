'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

/**
 * Posições — ETFs Internacionais (IBKR)
 * Colunas: Ativo | Bucket | Status | PM (USD) | Preço | Ganho % | Valor USD | Valor BRL
 */
export function HoldingsTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const { positions, totals } = useMemo(() => {
    if (!data?.posicoes) return { positions: [], totals: { usd: 0, brl: 0 } };
    const cambio = data.cambio ?? 1;
    const bucketOrder: Record<string, number> = { SWRD: 0, AVGS: 1, AVEM: 2 };

    const positions = Object.entries(data.posicoes as Record<string, any>)
      .map(([ticker, p]) => {
        const pm = p.avg_cost ?? p.pm ?? 0;
        const preco = p.price ?? 0;
        const ganho_pct = pm > 0 ? (preco / pm - 1) * 100 : 0;
        const valor_usd = p.qty * preco;
        const valor_brl = valor_usd * cambio;
        return { ticker, bucket: p.bucket, status: p.status, pm, preco, ganho_pct, valor_usd, valor_brl };
      })
      .sort((a, b) => {
        const aOrd = bucketOrder[a.bucket] ?? 99;
        const bOrd = bucketOrder[b.bucket] ?? 99;
        return aOrd !== bOrd ? aOrd - bOrd : a.ticker.localeCompare(b.ticker);
      });

    const totals = {
      usd: positions.reduce((s, p) => s + p.valor_usd, 0),
      brl: positions.reduce((s, p) => s + p.valor_brl, 0),
    };

    return { positions, totals };
  }, [data]);

  const fmtUsd = (v: number) => (privacyMode ? '••••' : `$${(v / 1000).toFixed(1)}k`);
  const fmtBrl = (v: number) => (privacyMode ? '••••' : `R$${(v / 1000).toFixed(0)}k`);
  const fmtPct = (v: number) => (privacyMode ? '••' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`);
  const fmtPm  = (v: number) => (privacyMode ? '••' : `$${v.toFixed(2)}`);

  const bucketColors: Record<string, string> = {
    SWRD: 'var(--accent)',
    AVGS: 'var(--purple)',
    AVEM: 'var(--cyan)',
  };

  const ibkrDate = data?.timestamps?.posicoes_ibkr;
  const stalenessBadge = (() => {
    if (!ibkrDate) return null;
    const diffDays = Math.round((Date.now() - new Date(ibkrDate + 'T00:00:00').getTime()) / 86400000);
    if (diffDays > 3) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: '.6rem', fontWeight: 700, background: 'rgba(234,179,8,.2)', color: 'var(--yellow)', border: '1px solid rgba(234,179,8,.3)' }}>
          ⚠ dados de {diffDays} dias atrás
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: '.6rem', fontWeight: 600, background: 'rgba(34,197,94,.12)', color: 'var(--green)' }}>
        {ibkrDate}
      </span>
    );
  })();

  return (
    <div className="section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <h2 style={{ marginBottom: 0 }}>Posições — ETFs Internacionais (IBKR)</h2>
        {stalenessBadge}
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: '.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ativo</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Bucket</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }} className="hide-mobile">PM (USD)</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Preço</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ganho %</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Valor USD</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }} className="pv">Valor BRL</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '7px 8px', fontWeight: 700 }}>{p.ticker}</td>
                <td style={{ padding: '7px 8px', color: bucketColors[p.bucket] ?? 'var(--muted)', fontSize: '.7rem' }}>{p.bucket}</td>
                <td style={{ padding: '7px 8px' }}>
                  {p.status === 'alvo'
                    ? <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,.15)', color: 'var(--green)', fontSize: '.7rem', fontWeight: 600 }}>alvo</span>
                    : <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, background: 'rgba(234,179,8,.15)', color: 'var(--yellow)', fontSize: '.7rem', fontWeight: 600 }}>transit.</span>
                  }
                </td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }} className="hide-mobile">{fmtPm(p.pm)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }}>{fmtPm(p.preco)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px', color: p.ganho_pct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{fmtPct(p.ganho_pct)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }} className="pv">{fmtUsd(p.valor_usd)}</td>
                <td style={{ textAlign: 'right', padding: '7px 8px' }} className="pv">{fmtBrl(p.valor_brl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: '.75rem', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Total USD: <strong className="pv">{fmtUsd(totals.usd)}</strong></span>
        <span>Total BRL: <strong className="pv">{fmtBrl(totals.brl)}</strong></span>
      </div>
    </div>
  );
}
