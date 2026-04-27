'use client';

import { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useConfig } from '@/hooks/useConfig';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

/**
 * Schema from ibkr/realized_pnl.json:
 * {
 *   "total_usd": number,
 *   "por_simbolo": { [symbol]: realized_pnl_usd },
 *   "detalhado": [
 *     {
 *       "date": "YYYY-MM-DD",
 *       "symbol": "XXX",
 *       "qty_sold": number,
 *       "cost_per_share": number,
 *       "sell_price": number,
 *       "gain_usd": number,
 *       "lot_date": "YYYY-MM-DD",
 *       "currency": "USD" | "EUR"
 *     }
 *   ]
 * }
 */

interface RealizedPnL {
  date: string;
  symbol: string;
  qty_sold: number;
  cost_per_share: number;
  sell_price: number;
  gain_usd: number;
  lot_date: string;
  currency: string;
}

interface DARFData {
  total_usd: number;
  por_simbolo: Record<string, number>;
  detalhado: RealizedPnL[];
}

interface DARFObligationProps {
  realizedPnl?: DARFData;
  cambio?: number;
}

/**
 * Parse DARF due dates based on sale month.
 * Lei 14.754/2023: Accrual-based, monthly filing.
 * - Sales in month M → DARF due by day 20 of month M+1
 *
 * Example: Sales in 2026-04 → DARF 05/2026 due 2026-05-20
 */
function getDARFDueDate(saleDate: string): { month: string; dueDate: string } {
  const [year, month, _] = saleDate.split('-');
  const saleMonth = parseInt(month, 10);
  let dueMonth = saleMonth + 1;
  let dueYear = parseInt(year, 10);

  if (dueMonth > 12) {
    dueMonth = 1;
    dueYear += 1;
  }

  const monthStr = String(dueMonth).padStart(2, '0');
  const monthLabel = new Date(dueYear, dueMonth - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const dueDateStr = `${dueYear}-${monthStr}-20`;

  return {
    month: `${monthStr}/${dueYear}`,
    dueDate: dueDateStr,
  };
}

/**
 * Categorize DARF status based on due date vs today.
 */
function getDARFStatus(dueDate: string, today: Date): 'OVERDUE' | 'DUE_SOON' | 'PENDING' {
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return 'OVERDUE';
  if (daysUntilDue <= 7) return 'DUE_SOON';
  return 'PENDING';
}

const STATUS_CONFIG = {
  OVERDUE: {
    bg: '#dc262622',
    color: '#dc2626',
    icon: AlertCircle,
    label: 'VENCIDO',
  },
  DUE_SOON: {
    bg: '#ca8a0422',
    color: '#ca8a04',
    icon: Clock,
    label: 'VENCE EM <7d',
  },
  PENDING: {
    bg: '#16a34a22',
    color: '#16a34a',
    icon: CheckCircle2,
    label: 'PENDENTE',
  },
};

export default function DARFObligationsPanel({ realizedPnl, cambio = 5.15 }: DARFObligationProps) {
  const { privacyMode } = useUiStore();
  const { config } = useConfig();
  const today = new Date('2026-04-25'); // Use provided date from data
  const TAX_RATE_FOREIGN = config.ui?.darfPanel?.taxRateForeign ?? 0.15; // 15% flat on foreign gains (Lei 14.754/2023)

  const analysis = useMemo(() => {
    if (!realizedPnl?.detalhado?.length) {
      return {
        bySymbol: new Map<string, { totalUsd: number; entries: RealizedPnL[] }>(),
        byDARF: new Map<string, { dueDate: string; status: 'OVERDUE' | 'DUE_SOON' | 'PENDING'; entries: RealizedPnL[] }>(),
        totalRealizedUsd: 0,
        totalGainUsd: 0,
        totalTaxBrl: 0,
        hasOverdue: false,
        hasDueSoon: false,
      };
    }

    const entries = realizedPnl.detalhado;
    const bySymbol = new Map<string, { totalUsd: number; entries: RealizedPnL[] }>();
    const byDARF = new Map<string, { dueDate: string; status: 'OVERDUE' | 'DUE_SOON' | 'PENDING'; entries: RealizedPnL[] }>();

    let totalGainUsd = 0;
    let hasOverdue = false;
    let hasDueSoon = false;

    for (const entry of entries) {
      // Aggregate by symbol
      if (!bySymbol.has(entry.symbol)) {
        bySymbol.set(entry.symbol, { totalUsd: 0, entries: [] });
      }
      const symData = bySymbol.get(entry.symbol)!;
      symData.totalUsd += entry.gain_usd;
      symData.entries.push(entry);

      // Aggregate by DARF period
      const { month, dueDate } = getDARFDueDate(entry.date);
      const status = getDARFStatus(dueDate, today);

      if (!byDARF.has(month)) {
        byDARF.set(month, { dueDate, status, entries: [] });
      }
      const darfData = byDARF.get(month)!;
      darfData.entries.push(entry);

      if (status === 'OVERDUE') hasOverdue = true;
      if (status === 'DUE_SOON') hasDueSoon = true;

      totalGainUsd += entry.gain_usd;
    }

    const totalTaxBrl = totalGainUsd * TAX_RATE_FOREIGN * cambio;

    return {
      bySymbol,
      byDARF,
      totalRealizedUsd: realizedPnl.total_usd,
      totalGainUsd,
      totalTaxBrl,
      hasOverdue,
      hasDueSoon,
    };
  }, [realizedPnl, cambio]);

  if (!realizedPnl?.detalhado?.length) {
    return (
      <div style={{ padding: '16px', background: 'var(--card)', borderRadius: 8, textAlign: 'center', color: 'var(--muted)' }}>
        Sem movimentação de realizadas nos últimos 12 meses.
      </div>
    );
  }

  const fmtBRL = (val: number) => {
    if (privacyMode) return fmtPrivacy(val, true);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const fmtUSD = (val: number) => {
    if (privacyMode) return fmtPrivacy(val, true, { prefix: '$' });
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
  };

  // Sort DARF obligations by due date
  const darfEntries = Array.from(analysis.byDARF.entries())
    .map(([month, data]) => {
      const totalGainByMonth = data.entries.reduce((s, e) => s + e.gain_usd, 0);
      const taxByMonth = totalGainByMonth * TAX_RATE_FOREIGN * cambio;
      return { month, ...data, totalGainByMonth, taxByMonth };
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Sort assets by total gain (largest first)
  const assetEntries = Array.from(analysis.bySymbol.entries())
    .map(([symbol, data]) => ({
      symbol,
      ...data,
      taxBrl: data.totalUsd * TAX_RATE_FOREIGN * cambio,
      pctOfTotal: analysis.totalGainUsd > 0 ? (data.totalUsd / analysis.totalGainUsd) * 100 : 0,
    }))
    .sort((a, b) => b.totalUsd - a.totalUsd);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Card — Resumo Geral */}
      <div style={{
        background: analysis.hasOverdue ? '#dc262622' : analysis.hasDueSoon ? '#ca8a0422' : 'var(--card2)',
        border: analysis.hasOverdue ? '1px solid #dc2626' : analysis.hasDueSoon ? '1px solid #ca8a04' : '1px solid var(--card2)',
        borderRadius: 8,
        padding: '16px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {/* Total Realized P&L */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Total Realizado
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace' }}>
              {fmtUSD(analysis.totalRealizedUsd)}
            </div>
          </div>

          {/* Total Gain */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Total Ganho (USD)
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: analysis.totalGainUsd >= 0 ? 'var(--green)' : 'var(--red)',
            }}>
              {fmtUSD(analysis.totalGainUsd)}
            </div>
          </div>

          {/* DARF Total (15% flat) */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              DARF Total (15%)
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#dc2626',
            }}>
              {fmtBRL(Math.max(0, analysis.totalTaxBrl))}
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Status
            </div>
            {analysis.hasOverdue ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: '13px', fontWeight: 700 }}>
                <AlertCircle size={16} />
                VENCIDO
              </div>
            ) : analysis.hasDueSoon ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ca8a04', fontSize: '13px', fontWeight: 700 }}>
                <Clock size={16} />
                VENCE {'<'}7d
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: '13px', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                TUDO OK
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
          Lei 14.754/2023 (accrual-based): Imposto 15% sobre ganhos em moeda estrangeira. DARF vence no dia 20 do mês seguinte à venda.
        </div>
      </div>

      {/* Seção 1: DARF por Período (Obrigações) */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
          Obrigações DARF
        </h4>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            minWidth: 500,
            borderCollapse: 'collapse',
            fontSize: 'var(--text-sm)',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  DARF (Mês/Ano)
                </th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  Ganho (USD)
                </th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  DARF (BRL)
                </th>
                <th style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  Vence
                </th>
                <th style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {darfEntries.map((entry) => {
                const config = STATUS_CONFIG[entry.status];
                return (
                  <tr key={entry.month} style={{ borderBottom: '1px solid var(--card2)' }}>
                    <td style={{ padding: '8px 6px', fontWeight: 600 }}>DARF {entry.month}</td>
                    <td style={{
                      padding: '8px 6px',
                      textAlign: 'right',
                      color: entry.totalGainByMonth >= 0 ? 'var(--green)' : 'var(--red)',
                      fontFamily: 'monospace',
                    }}>
                      {fmtUSD(entry.totalGainByMonth)}
                    </td>
                    <td style={{
                      padding: '8px 6px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#dc2626',
                      fontFamily: 'monospace',
                    }}>
                      {fmtBRL(entry.taxByMonth)}
                    </td>
                    <td style={{
                      padding: '8px 6px',
                      textAlign: 'center',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted)',
                      fontFamily: 'monospace',
                    }}>
                      {entry.dueDate}
                    </td>
                    <td style={{
                      padding: '8px 6px',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        background: config.bg,
                        color: config.color,
                        borderRadius: 4,
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        <config.icon size={14} />
                        {config.label}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 2: P&L Realizado por Ativo */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
          P&L Realizado por Ativo (últimos 12 meses)
        </h4>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            minWidth: 500,
            borderCollapse: 'collapse',
            fontSize: 'var(--text-sm)',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)' }}>
                  Ativo
                </th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  Qty Vendida
                </th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  Ganho (USD)
                </th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  DARF (BRL)
                </th>
                <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  % do Total
                </th>
              </tr>
            </thead>
            <tbody>
              {assetEntries.map((entry) => (
                <tr key={entry.symbol} style={{ borderBottom: '1px solid var(--card2)' }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600 }}>{entry.symbol}</td>
                  <td style={{
                    padding: '8px 6px',
                    textAlign: 'right',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                  }}>
                    {entry.entries.reduce((s, e) => s + e.qty_sold, 0).toFixed(2)}
                  </td>
                  <td style={{
                    padding: '8px 6px',
                    textAlign: 'right',
                    color: entry.totalUsd >= 0 ? 'var(--green)' : 'var(--red)',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>
                    {fmtUSD(entry.totalUsd)}
                  </td>
                  <td style={{
                    padding: '8px 6px',
                    textAlign: 'right',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>
                    {fmtBRL(entry.taxBrl)}
                  </td>
                  <td style={{
                    padding: '8px 6px',
                    textAlign: 'right',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                  }}>
                    {entry.pctOfTotal.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '12px',
        background: 'var(--bg)',
        borderRadius: 6,
        fontSize: 'var(--text-xs)',
        color: 'var(--muted)',
        lineHeight: 1.6,
      }}>
        <strong>Fonte:</strong> ibkr/realized_pnl.json · <strong>Taxa:</strong> 15% flat sobre ganhos em moeda estrangeira
        <br />
        <strong>Nota:</strong> Lei 14.754/2023 exige accrual-based reporting mensal. Valores em BRL usam cambio {cambio.toFixed(3)}.
      </div>
    </div>
  );
}
