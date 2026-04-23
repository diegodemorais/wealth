'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

export interface IRDeferralLote {
  ticker: string;
  nome: string;
  qty: number;
  pm: number;
  price: number;
  ucits: string;
}

export interface IRDeferralEtf {
  ticker: string;
  custo_total_brl: number;
  valor_atual_brl: number;
  ganho_brl: number;
  ir_estimado: number;
}

export interface IRDeferralSectionProps {
  // Zona 1
  irDiferidoTotal: number;
  patrimonioTotal: number;
  // Zona 2 — breakdown por ETF
  irPorEtf: IRDeferralEtf[];
  // Zona 3 — lotes TLH
  lotes: IRDeferralLote[];
  gatilho: number;
  cambio: number;
}

function fmtBRL(val: number, pm: boolean): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '−' : '';
  return sign + fmtPrivacy(abs, pm);
}

function fmtUSD(val: number, pm: boolean): string {
  const sign = val >= 0 ? '+' : '';
  return sign + fmtPrivacy(Math.abs(val), pm, { prefix: '$', compact: true });
}

type LoteStatus = 'PERDA' | 'MONITOR' | 'GANHO';

const statusConfig: Record<LoteStatus, { bg: string; color: string; border: string; label: string }> = {
  PERDA:   { bg: '#dc262622', color: '#dc2626', border: '#dc262644', label: 'VENDER PRIMEIRO' },
  MONITOR: { bg: '#ca8a0422', color: '#ca8a04', border: '#ca8a0444', label: 'MONITOR' },
  GANHO:   { bg: '#16a34a22', color: '#16a34a', border: '#16a34a44', label: 'EVITAR VENDER' },
};

export default function IRDeferralSection({
  irDiferidoTotal,
  patrimonioTotal,
  irPorEtf,
  lotes,
  gatilho,
  cambio,
}: IRDeferralSectionProps) {
  const { privacyMode } = useUiStore();

  // === ZONA 1 computations ===
  const patrimonioLiquido = patrimonioTotal - irDiferidoTotal;
  const irLatentePct = patrimonioTotal > 0 ? (irDiferidoTotal / patrimonioTotal) * 100 : 0;
  const liquidoPct = Math.max(0, Math.min(100, 100 - irLatentePct));

  const totalValueBRL = irPorEtf.reduce((s, e) => s + e.valor_atual_brl, 0);
  const totalIREstimado = irPorEtf.reduce((s, e) => s + e.ir_estimado, 0);
  const afterTaxValue = totalValueBRL - totalIREstimado;

  // === ZONA 3 computations ===
  const lotesComPnl = lotes.map(l => {
    const pnl_pct = l.pm > 0 ? (l.price - l.pm) / l.pm : 0;
    const pnl_usd = (l.price - l.pm) * l.qty;
    const pnl_brl = pnl_usd * cambio;
    let status: LoteStatus;
    if (pnl_pct >= 0) status = 'GANHO';
    else if (pnl_pct > -gatilho) status = 'MONITOR';
    else status = 'PERDA';
    return { ...l, pnl_pct, pnl_usd, pnl_brl, status };
  });

  const sorted = [...lotesComPnl].sort((a, b) => {
    const order: Record<LoteStatus, number> = { PERDA: 0, MONITOR: 1, GANHO: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.pnl_pct - b.pnl_pct;
  });

  const totalLossBrl = lotesComPnl
    .filter(l => l.status === 'PERDA')
    .reduce((s, l) => s + l.pnl_brl, 0);
  const irCompensavel = Math.abs(totalLossBrl) * 0.15;
  const hasPerda = totalLossBrl < 0;

  // === ETF table totals ===
  const totalCustoBrl = irPorEtf.reduce((s, e) => s + e.custo_total_brl, 0);
  const totalGanhoBrl = irPorEtf.reduce((s, e) => s + e.ganho_brl, 0);

  return (
    <div>

      {/* ─── ZONA 1 — Headline ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 12 }}>
        {/* Card 1 — IR Diferido Total */}
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>IR Diferido Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
            {fmtBRL(irDiferidoTotal, privacyMode)}
          </div>
        </div>

        {/* Card 2 — Patrimônio Líquido */}
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Patrimônio Líquido</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            {fmtBRL(patrimonioLiquido, privacyMode)}
          </div>
        </div>

        {/* Card 3 — IR Latente % */}
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>IR Latente</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>
            {`${irLatentePct.toFixed(1)}%`}
          </div>
        </div>

        {/* Card 4 — After-Tax Value */}
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>After-Tax Value</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
            {fmtBRL(afterTaxValue, privacyMode)}
          </div>
        </div>
      </div>

      {/* Bicolor bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${liquidoPct}%`, background: 'var(--accent)' }} />
          <div style={{ flex: 1, background: '#dc2626' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
          <span>Líquido {liquidoPct.toFixed(1)}%</span>
          <span>IR latente {irLatentePct.toFixed(1)}%</span>
        </div>
      </div>

      {/* ─── ZONA 2 — Breakdown por ETF ─── */}
      {irPorEtf.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Breakdown por ETF
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Ticker</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Custo BRL</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Valor Atual BRL</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Ganho BRL</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>IR Est.</th>
                </tr>
              </thead>
              <tbody>
                {irPorEtf.map(e => (
                  <tr key={e.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 6px', fontWeight: 600, color: 'var(--accent)', fontSize: 12 }}>{e.ticker}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--text)' }}>{fmtBRL(e.custo_total_brl, privacyMode)}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--text)', fontWeight: 500 }}>{fmtBRL(e.valor_atual_brl, privacyMode)}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', color: e.ganho_brl >= 0 ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                      {fmtBRL(e.ganho_brl, privacyMode)}
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--orange)', fontWeight: 600 }}>
                      {fmtBRL(e.ir_estimado, privacyMode)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td style={{ padding: '5px 6px', fontWeight: 700, color: 'var(--text)' }}>Total</td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{fmtBRL(totalCustoBrl, privacyMode)}</td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{fmtBRL(totalValueBRL, privacyMode)}</td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: totalGanhoBrl >= 0 ? '#16a34a' : '#dc2626' }}>
                    {fmtBRL(totalGanhoBrl, privacyMode)}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, color: 'var(--orange)' }}>{fmtBRL(totalIREstimado, privacyMode)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ─── ZONA 3 — Quando a venda for inevitável ─── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Quando a venda for inevitável
        </div>

        {/* Monitor TLH cards */}
        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
          <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Perda Elegível (BRL)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: hasPerda ? '#dc2626' : 'var(--muted)' }}>
              {hasPerda ? fmtBRL(Math.abs(totalLossBrl), privacyMode) : '—'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
              Lotes com perda ≥ {(gatilho * 100).toFixed(0)}% · câmbio {cambio.toFixed(3)}
            </div>
          </div>
          <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>IR Compensável Est.</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: hasPerda ? '#16a34a' : 'var(--muted)' }}>
              {hasPerda ? fmtBRL(irCompensavel, privacyMode) : '—'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
              Perda BRL × 15% · requer ganho a compensar
            </div>
          </div>
        </div>

        {/* Tabela de lotes */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%', minWidth: 340 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Ticker</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>UCITS</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>P&L %</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>P&L USD</th>
                <th style={{ padding: '4px 6px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>Ordem de Venda</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '12px 6px', textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>
                    Nenhum lote registrado — preencher tlh_lotes.json
                  </td>
                </tr>
              ) : sorted.map(l => {
                const sc = statusConfig[l.status];
                const pnlColor = l.status === 'GANHO' ? '#16a34a' : l.status === 'PERDA' ? '#dc2626' : '#ca8a04';
                return (
                  <tr key={l.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 6px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>{l.ticker}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 9 }}>{l.nome}</div>
                    </td>
                    <td style={{ padding: '5px 6px', color: 'var(--muted)', fontFamily: 'monospace' }}>{l.ucits}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, color: pnlColor }}>
                      {l.pnl_pct >= 0 ? '+' : ''}{(l.pnl_pct * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', color: pnlColor }}>
                      {fmtUSD(l.pnl_usd, privacyMode)}
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 3,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                        fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
          Diferimento puro (não vender) é superior quando horizonte &gt;10 anos · Art. 21 Lei 14.654/2014 · McLean &amp; Pontiff 2016: haircut 58% pós-publicação
        </div>
      </div>
    </div>
  );
}
