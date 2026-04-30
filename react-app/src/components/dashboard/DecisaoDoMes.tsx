'use client';

import { useUiStore } from '@/store/uiStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { SimpleProgressBar } from '@/components/primitives/SimpleProgressBar';
import { CheckCircle } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { getStatusStyle } from '@/utils/statusStyles';
import { DcaItem } from '@/types/dashboard';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface AporteEtf {
  ticker: string;
  atual: number;
  alvo: number;
  expectedReturn: number;
}

export interface DecisaoDoMesProps {
  // Equity
  etfs: AporteEtf[];
  dcaItems: DcaItem[];

  // Aporte
  aporteMensal: number;
  ultimoAporte: number;
  ultimoAporteData: string;
  acumuladoMes: number;
  acumuladoAno: number;

  // Macro (sem ipcaTaxa/rendaTaxa — já em dcaItems)
  selic: number | null;
  ipca12m: number | null;
  fedFunds: number | null;
  cambio: number | null;
  cambioMtdPct?: number | null;
  cdsBrazil5y?: number | null;
  concentrationBrazil: number | null;
  hodl11Brl?: number | null;
  cryptoLegadoBrl?: number | null;
  rfBrl?: number | null;
  exposicaoCambialPct?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface EtfWithScore extends AporteEtf {
  gap: number;
  priorityScore: number;
}

const CATEGORIA_LABEL: Record<string, string> = {
  rf_ipca: 'taxa',
  rf_renda: 'taxa',
  crypto: 'crypto',
};

const statusOrder: Record<string, number> = { vermelho: 0, amarelo: 1, verde: 2 };

function formatValor(item: DcaItem): string {
  if (item.categoria === 'crypto') {
    const { bandaAtual, bandaMin, bandaMax } = item;
    if (bandaAtual != null) {
      return `${bandaAtual.toFixed(1)}% (banda ${bandaMin?.toFixed(1)}–${bandaMax?.toFixed(1)}%)`;
    }
    return '—';
  }
  const ref = item.pisoVenda ?? item.pisoCompra;
  if (item.taxa != null && ref != null) {
    return `${item.taxa.toFixed(2)}% vs piso ${ref.toFixed(1)}%`;
  }
  return '—';
}

function formatContexto(item: DcaItem, privacyMode: boolean): string | undefined {
  const parts: string[] = [];
  if (item.taxa != null) parts.push(`taxa: ${item.taxa.toFixed(2)}%`);
  const ref = item.pisoVenda ?? item.pisoCompra;
  if (ref != null) parts.push(`piso: ${ref.toFixed(1)}%`);
  if (item.gapPiso != null) {
    parts.push(`gap: ${item.gapPiso >= 0 ? '+' : ''}${item.gapPiso.toFixed(2)}pp`);
  }
  if (item.posicaoBrl > 0) {
    parts.push(`pos: ${fmtPrivacy(item.posicaoBrl, privacyMode)}`);
  }
  if (item.pctCarteira != null && item.alvoPct != null) {
    parts.push(`${item.pctCarteira.toFixed(1)}% vs alvo ${item.alvoPct.toFixed(0)}%`);
  }
  return parts.length ? parts.join(' · ') : undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecisaoDoMes({
  etfs,
  dcaItems,
  aporteMensal,
  ultimoAporte,
  ultimoAporteData,
  acumuladoMes,
  acumuladoAno,
  selic,
  ipca12m,
  fedFunds,
  cambio,
  cambioMtdPct,
  cdsBrazil5y,
  concentrationBrazil,
  hodl11Brl,
  cryptoLegadoBrl,
  rfBrl,
  exposicaoCambialPct = 87.9,
}: DecisaoDoMesProps) {
  const { privacyMode } = useUiStore();
  const data = useDashboardStore(s => s.data);

  // ── Aporte status ────────────────────────────────────────────────────────
  const anoAtual = (data?.premissas as Record<string, unknown>)?.ano_atual as number ?? new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  const mesAtualStr = `${anoAtual}-${String(mesAtual).padStart(2, '0')}`;
  const ultimoAporteMes = ultimoAporteData || ((data?.premissas as Record<string, unknown>)?.ultimo_aporte_data as string ?? null);
  const executadoMesCorrente = ultimoAporteMes === mesAtualStr;
  const valorRealizado = executadoMesCorrente
    ? ((data?.premissas as Record<string, unknown>)?.ultimo_aporte_brl as number ?? (ultimoAporte > 0 ? ultimoAporte : null))
    : null;
  const primaryValue = ultimoAporte > 0 ? ultimoAporte : aporteMensal;
  const isPremissa = ultimoAporte === 0;

  // ── Savings rate ─────────────────────────────────────────────────────────
  const rendaMensal = data?.premissas?.renda_mensal_liquida as number ?? 0;
  const savingsRate = rendaMensal > 0 ? (primaryValue / rendaMensal) * 100 : null;
  const srColor =
    savingsRate != null && savingsRate >= 50 ? 'var(--green)' :
    savingsRate != null && savingsRate >= 40 ? 'var(--yellow)' :
    'var(--red)';
  const metaPct = aporteMensal > 0 ? Math.min(100, (acumuladoMes / aporteMensal) * 100) : null;

  // ── ETF scoring ───────────────────────────────────────────────────────────
  const scored: EtfWithScore[] = etfs
    .map(e => ({
      ...e,
      gap: e.alvo - e.atual,
      priorityScore: (e.alvo - e.atual) * e.expectedReturn,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const top = scored.find(e => e.priorityScore > 0);
  const gapColor = (gap: number) => gap > 0 ? 'var(--green)' : gap < 0 ? 'var(--red)' : 'var(--muted)';

  // ── DCA items sorted ──────────────────────────────────────────────────────
  const sortedDca = [...dcaItems].sort((a, b) => {
    const oa = statusOrder[a.status] ?? 3;
    const ob = statusOrder[b.status] ?? 3;
    return oa - ob;
  });

  // ── Macro calculations ────────────────────────────────────────────────────
  const spread = selic != null && fedFunds != null ? selic - fedFunds : null;
  const spreadColor = spread == null
    ? 'var(--muted)'
    : spread >= 10 ? 'var(--green)'
    : spread >= 6 ? 'var(--yellow)'
    : 'var(--red)';
  const cdsColor = cdsBrazil5y == null ? 'var(--muted)' : cdsBrazil5y >= 400 ? 'var(--red)' : cdsBrazil5y >= 250 ? 'var(--yellow)' : 'var(--green)';

  const selicAcao = selic == null ? null
    : selic > 14 ? { text: '→ RF doméstica competitiva — manter peso equity', color: 'var(--green)' }
    : selic >= 11 ? { text: '→ Ciclo neutro', color: 'var(--yellow)' }
    : { text: '→ Favorecer equity', color: 'var(--accent)' };
  const cdsAcao = cdsBrazil5y != null && cdsBrazil5y > 250
    ? { text: '→ Risco soberano elevado — IPCA+ como hedge natural', color: 'var(--yellow)' }
    : null;

  // ── Concentração Brasil — informacional (sem faixa alvo: Diego tem carteira global, ~10% Brasil intencional)
  const brazilPct = concentrationBrazil != null ? concentrationBrazil * 100 : null;
  // Alerta real: só se Brasil > 25% (excesso de risco soberano) ou < 5% (RF zerada)
  const brazilAlerta = brazilPct != null && (brazilPct > 25 || brazilPct < 5);
  const brazilFora = brazilPct != null; // sempre mostra quando há dado

  return (
    <>
      {/* ── Card Principal: Decisão ── */}
      <div className="bg-card border border-border/50 rounded-lg p-4 mb-3.5">

        {/* Header: título + badge status do aporte */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted m-0">
            Decisão do Mês
          </h2>
          <div className="flex items-center gap-2">
            {savingsRate != null && (
              <span data-testid="savings-rate" className="text-xs font-bold font-mono" style={{ color: srColor }}>
                {privacyMode ? '••%' : `${savingsRate.toFixed(0)}% SR`}
              </span>
            )}
            {ultimoAporteMes == null ? (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.12)', color: 'var(--muted)' }}>
                — Sem dados
              </span>
            ) : executadoMesCorrente ? (
              <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                <CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Executado{valorRealizado != null ? ` · ${fmtPrivacy(valorRealizado, privacyMode)}` : ''}
              </span>
            ) : (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(234,179,8,0.12)', color: 'var(--yellow)' }}>
                ⏳ Pendente · meta {fmtPrivacy(aporteMensal, privacyMode)}/mês
              </span>
            )}
            {ultimoAporteData && (
              <span className="text-xs text-muted font-mono">{ultimoAporteData}</span>
            )}
          </div>
        </div>

        {/* Banner ETF Prioritário */}
        {top && (
          <div style={{
            background: 'color-mix(in srgb, var(--green) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--green) 25%, transparent)',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>
              ETF PRIORITÁRIO: {top.ticker} &nbsp;+{top.gap.toFixed(1)}pp subpeso · E[R] {top.expectedReturn.toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>
              comprar no próximo aporte
            </div>
          </div>
        )}

        {/* Tabela de ETFs: sem coluna Score */}
        <div style={{ overflowX: 'auto', marginBottom: 10 }}>
          <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%', minWidth: 280 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>#</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>ETF</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Atual%</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Alvo%</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Gap</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>E[R]</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((e, i) => (
                <tr
                  key={e.ticker}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i === 0 ? 'rgba(202,138,4,0.1)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '5px 6px', fontWeight: 700, color: i === 0 ? 'var(--yellow)' : 'var(--muted)', fontSize: 11 }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '5px 6px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>{e.ticker}</div>
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--muted)', fontSize: 10 }}>
                    {privacyMode ? '••%' : `${e.atual.toFixed(1)}%`}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--muted)', fontSize: 10 }}>
                    {privacyMode ? '••%' : `${e.alvo.toFixed(1)}%`}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, color: gapColor(e.gap) }}>
                    {privacyMode ? '••pp' : `${e.gap >= 0 ? '+' : ''}${e.gap.toFixed(1)}pp`}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {privacyMode ? '••%' : `${e.expectedReturn.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Separador */}
        <div style={{ borderTop: '1px solid rgba(100,116,139,0.2)', margin: '12px 0' }} />

        {/* Gatilhos RF & Crypto */}
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Gatilhos RF &amp; Crypto
        </div>
        <div data-testid="semaforo-triggers" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {sortedDca.map(item => {
            const style = getStatusStyle(item.status);
            const catLabel = CATEGORIA_LABEL[item.categoria] ?? item.categoria;
            const contexto = formatContexto(item, privacyMode);
            const acaoColor = item.proxAcao === 'comprar' ? 'var(--green)' : item.proxAcao === 'vender' ? 'var(--red)' : 'var(--muted)';

            return (
              <div
                key={item.id}
                style={{
                  padding: '8px 10px',
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{item.nome}</span>
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(88,166,255,0.15)', color: 'var(--accent)', border: '1px solid rgba(88,166,255,0.3)' }}>
                    {catLabel}
                  </span>
                  {item.dcaAtivo && (
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(62,211,129,0.15)', color: 'var(--green)', border: '1px solid rgba(62,211,129,0.3)' }}>
                      DCA
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>
                    {formatValor(item)}
                  </span>
                  {item.proxAcao && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: acaoColor, whiteSpace: 'nowrap' }}>
                      {item.proxAcao}
                    </span>
                  )}
                </div>
                {contexto && (
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, marginLeft: 14 }}>
                    {contexto}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Separador */}
        <div style={{ borderTop: '1px solid rgba(100,116,139,0.2)', margin: '12px 0' }} />

        {/* Strip Macro — 6 tiles compactos */}
        <div data-testid="macro-strip" style={{ opacity: 0.85 }}>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3">
            <div className="bg-slate-700/40 rounded p-2.5 text-center">
              <div className="text-lg font-bold text-text">{selic != null ? `${selic.toFixed(2)}%` : '—'}</div>
              <div className="text-xs text-muted mt-1">Selic</div>
            </div>
            <div className="bg-slate-700/40 rounded p-2.5 text-center">
              <div className="text-lg font-bold text-text">{ipca12m != null ? `${ipca12m.toFixed(1)}%` : '—'}</div>
              <div className="text-xs text-muted mt-1">IPCA 12M</div>
            </div>
            <div className="bg-slate-700/40 rounded p-2.5 text-center">
              <div className="text-lg font-bold text-text">{fedFunds != null ? `${fedFunds.toFixed(2)}%` : '—'}</div>
              <div className="text-xs text-muted mt-1">Fed Funds</div>
            </div>
            <div className="bg-slate-700/40 rounded p-2.5 text-center">
              <div className="text-lg font-bold" style={{ color: spreadColor }}>
                {spread != null ? `${spread.toFixed(1)}pp` : '—'}
              </div>
              <div className="text-xs text-muted mt-1">Spread Selic–FF</div>
            </div>
            <div data-testid="cambio-mercado" className="bg-slate-700/40 rounded p-2.5 text-center">
              <div className="text-lg font-bold text-text">
                {cambio != null ? `R$${cambio.toFixed(2)}` : '—'}
              </div>
              <div className="text-xs text-muted mt-1">
                BRL/USD
                {cambioMtdPct != null && (
                  <span style={{ marginLeft: 4, opacity: 0.85 }}>
                    · {cambioMtdPct > 0 ? '+' : ''}{cambioMtdPct.toFixed(1)}%MtD
                  </span>
                )}
              </div>
            </div>
            <div className="bg-slate-700/40 rounded p-2.5 text-center" style={{ borderLeft: `3px solid ${cdsColor}` }}>
              <div className="text-lg font-bold" style={{ color: cdsColor }}>
                {cdsBrazil5y != null ? `${cdsBrazil5y.toFixed(0)}` : '—'}
              </div>
              <div className="text-xs text-muted mt-1">CDS 5Y (bps)</div>
            </div>
          </div>

          {/* Linha de ação recomendada */}
          {(selicAcao || cdsAcao) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 px-0.5">
              {selicAcao && (
                <span className="font-mono text-xs" style={{ color: selicAcao.color }}>{selicAcao.text}</span>
              )}
              {cdsAcao && (
                <span className="font-mono text-xs" style={{ color: cdsAcao.color }}>{cdsAcao.text}</span>
              )}
            </div>
          )}

          <div className="text-xs text-slate-500 mb-2">
            Fonte: BCB / FRED · Spread alto (&gt;10pp) favorece carry, mas BRL apreciado reduz retorno em BRL do equity internacional.
          </div>
        </div>

        {/* Exposição Brasil — informacional */}
        {brazilFora && brazilPct != null && (
          <>
            <div style={{ borderTop: '1px solid rgba(100,116,139,0.2)', margin: '12px 0' }} />
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Exposição Brasil{brazilAlerta && <span style={{ color: 'var(--yellow)' }}> ⚠ fora de faixa</span>}
            </div>
            <div data-testid="exposicao-cambial" className="bg-slate-700/40 rounded p-3">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="text-xs text-muted">Total Brasil</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: brazilAlerta ? 'var(--yellow)' : 'var(--text)' }}>
                    {brazilPct.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted mt-0.5">Exp. cambial ~{exposicaoCambialPct.toFixed(0)}%</div>
                </div>
                <div className="text-sm text-muted text-right">
                  <div>Cripto: {fmtPrivacy(((hodl11Brl ?? 0) + (cryptoLegadoBrl ?? 0)) / 1000, privacyMode)}</div>
                  <div>RF Total: {fmtPrivacy((rfBrl ?? 0) / 1000, privacyMode)}</div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Strip de Execução (fora do card) ── */}
      <div data-testid="kpi-grid-mercado" className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
        <div className="bg-card border border-border/50 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">{isPremissa ? 'Meta mensal' : 'Último aporte'}</div>
          <div className="text-base font-bold" style={{ color: 'var(--green)' }}>
            {fmtPrivacy(primaryValue, privacyMode)}
          </div>
          {!isPremissa && savingsRate != null && (
            <div className="text-xs mt-0.5" style={{ color: srColor }}>
              {privacyMode ? '••% da renda' : `${savingsRate.toFixed(0)}% da renda`}
            </div>
          )}
        </div>
        <div className="bg-card border border-border/50 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Meta mensal</div>
          <div className="text-base font-bold" style={{ color: 'var(--accent)' }}>
            {fmtPrivacy(aporteMensal, privacyMode)}
          </div>
          {metaPct != null && (
            <div className="text-xs text-muted mt-0.5">{metaPct.toFixed(0)}% acumulado</div>
          )}
        </div>
        <div className="bg-card border border-border/50 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Acumulado mês</div>
          <div className="text-base font-bold text-text">
            {fmtPrivacy(acumuladoMes, privacyMode)}
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded px-3 py-2.5">
          <div className="text-xs text-muted mb-1">Acumulado ano</div>
          <div className="text-base font-bold text-text">
            {fmtPrivacy(acumuladoAno, privacyMode)}
          </div>
        </div>
      </div>

      {/* Barra de Savings Rate */}
      {savingsRate != null && (
        <div className="mb-3.5">
          <SimpleProgressBar value={savingsRate} color={srColor} />
        </div>
      )}
    </>
  );
}
