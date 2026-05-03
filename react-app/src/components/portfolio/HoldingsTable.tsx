'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';
import {
  BUCKET_ORDER,
  BUCKET_LABELS,
  BUCKET_DRIFT_KEY,
  TICKER_TO_BUCKET_ID,
  TARGET_TICKERS,
  LEGACY_TICKERS,
  type BucketId,
} from '@/lib/portfolioConfig';
import {
  classifyDriftBucket,
  classifyTwrYtd,
  classifyMaxDdItd,
  classifyTerAllIn,
  SEMAPHORE_CSS_VAR,
} from '@/utils/holdingsSemaphore';

/**
 * HoldingsTable — Posições agrupadas por bucket alvo (HD-portfolio-buckets-view).
 *
 * Estrutura: 6 seções (EQUITY DM CORE, FACTOR, EM, RF ESTRUTURAL, RF TÁTICO,
 * CRYPTO). Cada seção tem subheader com target/atual/drift e linhas de ativos
 * (target + legacy). AVEM aparece em EM com badge "NÃO INICIADO".
 *
 * Colunas desktop (≥640px): Ticker | Status | PM USD | Preço | Ganho% |
 *   Valor BRL | TWR YTD | Max DD | TER all-in.
 * Mobile (<640px): 3 linhas compactas por ativo, sem TER.
 */

type RowStatus = 'target' | 'legacy' | 'empty';

interface Row {
  ticker: string;
  bucketId: BucketId;
  rowStatus: RowStatus;
  qty: number;
  pm: number | null;        // PM em USD (ETFs) ou null (RF/Crypto)
  preco: number | null;     // Preço atual mesma unidade do PM
  ganhoPct: number | null;  // (preco/PM - 1) * 100
  valorBrl: number;
  pctPortfolio: number;     // % carteira financeira
  twrYtdPct: number | null;
  maxDdItdPct: number | null;
  terAllInPct: number | null;
  seriesShort: boolean;
  isMonetaryUsd: boolean;   // true => PM/preço em USD (ETF IBKR); false => BRL
}

interface BucketSection {
  bucketId: BucketId;
  label: string;
  targetPct: number | null;
  actualPct: number | null;
  driftPp: number | null;
  rows: Row[];
  totalBrl: number;
}

function fmtPctSigned(v: number | null): string {
  if (v == null || Number.isNaN(v)) return '—';
  const r = Math.round(v * 10) / 10;
  return `${r >= 0 ? '+' : ''}${r.toFixed(1)}%`;
}

function fmtPctAbs(v: number | null, decimals = 1): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v.toFixed(decimals)}%`;
}

export function HoldingsTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const { sections, totalBrl } = useMemo(() => {
    if (!data) return { sections: [] as BucketSection[], totalBrl: 0 };
    const cambio = data.cambio ?? 1;
    const drift = (data as any).drift ?? {};
    const posicoes = (data as any).posicoes ?? {};
    const rf = (data as any).rf ?? {};
    const hodl11 = (data as any).hodl11 ?? null;

    const patrimonioFinanceiro = (data as any)?.patrimonio_holistico?.financeiro_brl;

    // Bucket scaffolding
    const buckets: Record<BucketId, BucketSection> = {} as any;
    BUCKET_ORDER.forEach(bid => {
      buckets[bid] = {
        bucketId: bid,
        label: BUCKET_LABELS[bid],
        targetPct: null,
        actualPct: null,
        driftPp: null,
        rows: [],
        totalBrl: 0,
      };
    });

    // Helper: empurra row em seu bucket
    const pushRow = (bid: BucketId, r: Row) => {
      buckets[bid].rows.push(r);
      buckets[bid].totalBrl += r.valorBrl;
    };

    // ─── ETFs (posicoes) ────────────────────────────────────────────────
    Object.entries(posicoes as Record<string, any>).forEach(([ticker, p]) => {
      const bid = TICKER_TO_BUCKET_ID[ticker];
      if (!bid) return;  // ignora se sem mapping (defensivo)
      const isTarget = TARGET_TICKERS.has(ticker);
      const isLegacy = LEGACY_TICKERS.has(ticker);
      const qty = Number(p.qty ?? 0);
      const pm = (p.avg_cost ?? p.pm) as number | null | undefined;
      const preco = p.price as number | null | undefined;
      const valorUsd = (qty > 0 && preco != null) ? qty * preco : 0;
      const valorBrl = valorUsd * cambio;
      const ganho = (pm != null && preco != null && pm > 0) ? (preco / pm - 1) * 100 : null;
      const empty = isTarget && qty === 0;

      pushRow(bid, {
        ticker,
        bucketId: bid,
        rowStatus: empty ? 'empty' : (isTarget ? 'target' : (isLegacy ? 'legacy' : 'target')),
        qty,
        pm: pm ?? null,
        preco: preco ?? null,
        ganhoPct: ganho,
        valorBrl,
        pctPortfolio: 0, // calculado depois
        twrYtdPct: (p.twr_ytd_pct ?? null) as number | null,
        maxDdItdPct: (p.max_dd_itd_pct ?? null) as number | null,
        terAllInPct: (p.ter_all_in_pct ?? p.ter ?? null) as number | null,
        seriesShort: Boolean(p.series_short),
        isMonetaryUsd: true,
      });
    });

    // ─── RF Estrutural (Tesouro IPCA+) ──────────────────────────────────
    const rfEstruturalEntries: Array<[string, any]> = [];
    Object.entries(rf as Record<string, any>).forEach(([key, val]) => {
      // Tudo que começa com "ipca" vai para RF Estrutural
      if (key.toLowerCase().startsWith('ipca')) rfEstruturalEntries.push([key, val]);
    });
    rfEstruturalEntries.forEach(([key, val]) => {
      const valor = Number(val?.valor ?? 0);
      const ticker = `IPCA+ ${key.replace(/^ipca/i, '')}`;
      pushRow('RF_ESTRUTURAL', {
        ticker,
        bucketId: 'RF_ESTRUTURAL',
        rowStatus: 'target',
        qty: 0,
        pm: null,
        preco: val?.taxa != null ? Number(val.taxa) : null,  // taxa real %
        ganhoPct: null,
        valorBrl: valor,
        pctPortfolio: 0,
        twrYtdPct: null,
        maxDdItdPct: null,
        terAllInPct: 0.10,
        seriesShort: false,
        isMonetaryUsd: false,
      });
    });

    // ─── RF Tático (Renda+) ─────────────────────────────────────────────
    Object.entries(rf as Record<string, any>).forEach(([key, val]) => {
      if (key.toLowerCase().startsWith('renda')) {
        const valor = Number(val?.valor ?? 0);
        pushRow('RF_TATICO', {
          ticker: `Renda+ ${key.replace(/^renda/i, '')}`,
          bucketId: 'RF_TATICO',
          rowStatus: 'target',
          qty: 0,
          pm: null,
          preco: val?.taxa != null ? Number(val.taxa) : null,
          ganhoPct: null,
          valorBrl: valor,
          pctPortfolio: 0,
          twrYtdPct: null,
          maxDdItdPct: null,
          terAllInPct: 0.10,
          seriesShort: false,
          isMonetaryUsd: false,
        });
      }
    });

    // ─── Crypto (HODL11) ────────────────────────────────────────────────
    if (hodl11 && (hodl11.valor ?? 0) > 0) {
      const pm = Number(hodl11.preco_medio ?? 0);
      const preco = Number(hodl11.preco ?? 0);
      const ganho = (pm > 0 && preco > 0) ? (preco / pm - 1) * 100 : null;
      pushRow('CRYPTO', {
        ticker: 'HODL11',
        bucketId: 'CRYPTO',
        rowStatus: 'target',
        qty: Number(hodl11.qty ?? 0),
        pm,
        preco,
        ganhoPct: ganho,
        valorBrl: Number(hodl11.valor ?? 0),
        pctPortfolio: 0,
        twrYtdPct: posicoes?.HODL11?.twr_ytd_pct ?? null,
        maxDdItdPct: posicoes?.HODL11?.max_dd_itd_pct ?? null,
        terAllInPct: 0.20,
        seriesShort: false,
        isMonetaryUsd: false,
      });
    }

    // ─── Total para % carteira ──────────────────────────────────────────
    const totalBrl = Object.values(buckets).reduce((s, b) => s + b.totalBrl, 0)
      || patrimonioFinanceiro || 1;

    // Preencher pctPortfolio + drift bucket
    BUCKET_ORDER.forEach(bid => {
      const b = buckets[bid];
      b.rows.forEach(r => {
        r.pctPortfolio = (r.valorBrl / totalBrl) * 100;
      });
      const driftKey = BUCKET_DRIFT_KEY[bid];
      if (driftKey && drift[driftKey]) {
        b.actualPct = Number(drift[driftKey].atual ?? 0);
        b.targetPct = Number(drift[driftKey].alvo ?? 0);
        b.driftPp = b.actualPct - b.targetPct;
      } else {
        // Bucket sem drift mapeado (ex: RF_TATICO Renda+) — calcular do total
        b.actualPct = (b.totalBrl / totalBrl) * 100;
        b.targetPct = bid === 'RF_TATICO' ? 3.0 : null;
        b.driftPp = b.targetPct != null ? b.actualPct - b.targetPct : null;
      }
    });

    return { sections: BUCKET_ORDER.map(bid => buckets[bid]), totalBrl };
  }, [data]);

  const ibkrDate = data?.timestamps?.posicoes_ibkr;
  const stalenessBadge = useMemo(() => {
    if (!ibkrDate) return null;
    const diffDays = Math.round(
      (Date.now() - new Date(ibkrDate + 'T00:00:00').getTime()) / 86400000
    );
    if (diffDays > 3) {
      return (
        <span style={badgeWarn}>⚠ dados de {diffDays} dias atrás</span>
      );
    }
    return <span style={badgeOk}>{ibkrDate}</span>;
  }, [ibkrDate]);

  const fmtBrl = (v: number) => fmtPrivacy(v / 1000, privacyMode);

  return (
    <div className="section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <h2 style={{ marginBottom: 0 }}>Posições por Bucket</h2>
        {stalenessBadge}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map(section => (
          <BucketSectionView
            key={section.bucketId}
            section={section}
            privacyMode={privacyMode}
          />
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 'var(--text-sm)' }}>
        <span>Total BRL (financeiro): <strong className="pv">{fmtBrl(totalBrl)}</strong></span>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function BucketSectionView({ section, privacyMode }: {
  section: BucketSection;
  privacyMode: boolean;
}) {
  const driftColor = SEMAPHORE_CSS_VAR[classifyDriftBucket(section.driftPp)];
  const fmtBrl = (v: number) => fmtPrivacy(v / 1000, privacyMode);

  return (
    <div
      data-testid={`bucket-section-${section.bucketId}`}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 6,
        background: 'var(--card)',
      }}
    >
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        fontSize: 'var(--text-sm)',
      }}>
        <strong style={{ color: 'var(--text)', fontSize: 'var(--text-md)' }}>
          {section.label}
        </strong>
        <span style={{ color: 'var(--muted)' }}>
          target {fmtPctAbs(section.targetPct)} · atual {fmtPctAbs(section.actualPct)} · drift{' '}
          <strong style={{ color: driftColor }}>
            {section.driftPp != null
              ? `${section.driftPp >= 0 ? '+' : ''}${section.driftPp.toFixed(1)}pp`
              : '—'}
          </strong>
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--muted)' }} className="pv">
          {fmtBrl(section.totalBrl)}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hide-mobile" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <Th>Ativo</Th>
              <Th>Status</Th>
              <Th align="right">PM</Th>
              <Th align="right">Preço</Th>
              <Th align="right">Ganho %</Th>
              <Th align="right">Valor BRL</Th>
              <Th align="right">TWR YTD</Th>
              <Th align="right">Max DD</Th>
              <Th align="right">TER all-in</Th>
            </tr>
          </thead>
          <tbody>
            {section.rows.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '8px 12px', color: 'var(--muted)', fontStyle: 'italic' }}>—</td></tr>
            ) : section.rows.map(r => (
              <DesktopRow key={r.ticker} row={r} privacyMode={privacyMode} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile compact list */}
      <div className="hide-desktop" style={{ display: 'flex', flexDirection: 'column' }}>
        {section.rows.length === 0
          ? <div style={{ padding: '8px 12px', color: 'var(--muted)', fontStyle: 'italic' }}>—</div>
          : section.rows.map(r => <MobileRow key={r.ticker} row={r} privacyMode={privacyMode} />)
        }
      </div>
    </div>
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

function DesktopRow({ row, privacyMode }: { row: Row; privacyMode: boolean }) {
  const fmtBrl = (v: number) => fmtPrivacy(v / 1000, privacyMode);
  const fmtMoney = (v: number | null) => {
    if (v == null || v === 0) return '—';
    if (row.isMonetaryUsd) return privacyMode ? '$ ••••' : `$${v.toFixed(2)}`;
    return `${v.toFixed(2)}%`; // RF: taxa real
  };
  const twrColor = SEMAPHORE_CSS_VAR[classifyTwrYtd(row.twrYtdPct)];
  const ddColor = SEMAPHORE_CSS_VAR[classifyMaxDdItd(row.maxDdItdPct)];
  const terColor = SEMAPHORE_CSS_VAR[classifyTerAllIn(row.terAllInPct)];

  return (
    <tr
      data-testid={`holdings-row-${row.ticker}`}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <td style={tdStyle}>
        <span style={{ fontWeight: 700 }}>{row.ticker}</span>
        <span style={{ marginLeft: 6 }}><Badges row={row} /></span>
      </td>
      <td style={tdStyle}><StatusPill row={row} /></td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{fmtMoney(row.pm)}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{fmtMoney(row.preco)}</td>
      <td style={{ ...tdStyle, textAlign: 'right', color: row.ganhoPct == null ? 'var(--muted)' : (row.ganhoPct >= 0 ? 'var(--green)' : 'var(--red)'), fontWeight: 600 }}>
        {fmtPctSigned(row.ganhoPct)}
      </td>
      <td style={{ ...tdStyle, textAlign: 'right' }} className="pv">{row.valorBrl > 0 ? fmtBrl(row.valorBrl) : '—'}</td>
      <td style={{ ...tdStyle, textAlign: 'right', color: twrColor, fontWeight: 600 }} data-testid={`holdings-twr-${row.ticker}`}>
        {fmtPctSigned(row.twrYtdPct)}
      </td>
      <td style={{ ...tdStyle, textAlign: 'right', color: ddColor, fontWeight: 600 }} data-testid={`holdings-dd-${row.ticker}`}>
        {fmtPctSigned(row.maxDdItdPct)}
      </td>
      <td style={{ ...tdStyle, textAlign: 'right', color: terColor }} data-testid={`holdings-ter-${row.ticker}`}>
        {row.terAllInPct != null ? `${row.terAllInPct.toFixed(2)}%` : '—'}
      </td>
    </tr>
  );
}

function MobileRow({ row, privacyMode }: { row: Row; privacyMode: boolean }) {
  const fmtBrl = (v: number) => fmtPrivacy(v / 1000, privacyMode);
  const twrColor = SEMAPHORE_CSS_VAR[classifyTwrYtd(row.twrYtdPct)];
  const ddColor = SEMAPHORE_CSS_VAR[classifyMaxDdItd(row.maxDdItdPct)];
  return (
    <div
      data-testid={`holdings-row-${row.ticker}`}
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <strong>{row.ticker}</strong>
        <Badges row={row} />
        <span style={{ marginLeft: 'auto' }}><StatusPill row={row} /></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span className="pv">{row.valorBrl > 0 ? fmtBrl(row.valorBrl) : '—'}</span>
        <span style={{ color: 'var(--muted)' }}>
          {row.pctPortfolio > 0 ? `${row.pctPortfolio.toFixed(1)}% port.` : ''}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, fontSize: 'var(--text-xs)' }}>
        <span data-testid={`holdings-twr-${row.ticker}`} style={{ color: twrColor }}>
          TWR YTD {fmtPctSigned(row.twrYtdPct)}
        </span>
        <span data-testid={`holdings-dd-${row.ticker}`} style={{ color: ddColor }}>
          DD {fmtPctSigned(row.maxDdItdPct)}
        </span>
      </div>
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function Badges({ row }: { row: Row }) {
  const badges: Array<{ kind: string; label: string; bg: string; fg: string }> = [];
  if (TARGET_TICKERS.has(row.ticker) && row.qty > 0) {
    badges.push({ kind: 'target', label: '🎯 alvo', bg: 'rgba(59,130,246,.15)', fg: 'var(--accent)' });
  }
  if (LEGACY_TICKERS.has(row.ticker)) {
    badges.push({ kind: 'legacy', label: '🔄 legacy', bg: 'rgba(148,163,184,.18)', fg: 'var(--muted)' });
  }
  if (row.seriesShort && row.qty > 0) {
    badges.push({ kind: 'short', label: '📅 <3M', bg: 'rgba(234,179,8,.18)', fg: 'var(--yellow)' });
  }
  if (row.rowStatus === 'empty') {
    badges.push({ kind: 'empty', label: '⚠ NÃO INICIADO', bg: 'rgba(239,68,68,.15)', fg: 'var(--red)' });
  }
  return (
    <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
      {badges.map(b => (
        <span
          key={b.kind}
          data-testid={`holdings-badge-${row.ticker}-${b.kind}`}
          style={{
            display: 'inline-block',
            padding: '1px 6px',
            borderRadius: 4,
            background: b.bg,
            color: b.fg,
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}
        >
          {b.label}
        </span>
      ))}
    </span>
  );
}

function StatusPill({ row }: { row: Row }) {
  if (row.rowStatus === 'empty') {
    return <span style={pillRed}>alvo s/ posição</span>;
  }
  if (row.rowStatus === 'legacy') {
    return <span style={pillGray}>transit.</span>;
  }
  return <span style={pillGreen}>alvo</span>;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const tdStyle: React.CSSProperties = { padding: '7px 10px' };

function Th({ children, align = 'left' as 'left' | 'right' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{
      padding: '6px 10px',
      textAlign: align,
      color: 'var(--muted)',
      fontWeight: 600,
      fontSize: 'var(--text-xs)',
      textTransform: 'uppercase',
    }}>
      {children}
    </th>
  );
}

const pillBase: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 4,
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
};
const pillGreen: React.CSSProperties = { ...pillBase, background: 'rgba(34,197,94,.15)', color: 'var(--green)' };
const pillGray: React.CSSProperties  = { ...pillBase, background: 'rgba(148,163,184,.18)', color: 'var(--muted)' };
const pillRed: React.CSSProperties   = { ...pillBase, background: 'rgba(239,68,68,.15)', color: 'var(--red)' };

const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 9999,
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  border: '1px solid transparent',
};
const badgeOk: React.CSSProperties = {
  ...badgeBase,
  fontWeight: 600,
  background: 'rgba(34,197,94,.12)',
  color: 'var(--green)',
};
const badgeWarn: React.CSSProperties = {
  ...badgeBase,
  background: 'rgba(234,179,8,.2)',
  color: 'var(--yellow)',
  borderColor: 'rgba(234,179,8,.3)',
};
