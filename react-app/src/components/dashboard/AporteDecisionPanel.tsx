'use client';

import { useUiStore } from '@/store/uiStore';
import { DcaItem } from '@/types/dashboard';
import { getStatusStyle } from '@/utils/statusStyles';
import { fmtPrivacy } from '@/utils/privacyTransform';

export interface AporteEtf {
  ticker: string;
  atual: number;
  alvo: number;
  expectedReturn: number;
}

export interface AporteDecisionPanelProps {
  etfs: AporteEtf[];
  dcaItems: DcaItem[];
}

interface EtfWithScore extends AporteEtf {
  gap: number;
  priorityScore: number;
}

const CATEGORIA_LABEL: Record<string, string> = {
  rf_ipca: 'taxa',
  rf_renda: 'taxa',
  crypto: 'crypto',
};

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

const statusOrder: Record<string, number> = { vermelho: 0, amarelo: 1, verde: 2 };

export default function AporteDecisionPanel({ etfs, dcaItems }: AporteDecisionPanelProps) {
  const { privacyMode } = useUiStore();

  const scored: EtfWithScore[] = etfs
    .map(e => ({
      ...e,
      gap: e.alvo - e.atual,
      priorityScore: (e.alvo - e.atual) * e.expectedReturn,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const maxScore = Math.max(...scored.map(e => Math.abs(e.priorityScore)), 0.01);
  const top = scored.find(e => e.priorityScore > 0);

  const gapColor = (gap: number) => gap > 0 ? '#16a34a' : gap < 0 ? '#dc2626' : 'var(--muted)';

  const sortedDca = [...dcaItems].sort((a, b) => {
    const oa = statusOrder[a.status] ?? 3;
    const ob = statusOrder[b.status] ?? 3;
    return oa - ob;
  });

  return (
    <div>
      {/* ZONA 1 — Recomendação de Aporte (banner) */}
      {top && (
        <div style={{
          background: '#16a34a18', border: '1px solid #16a34a44',
          borderRadius: 6, padding: '8px 12px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
              ETF PRIORITÁRIO: {top.ticker} &nbsp;+{top.gap.toFixed(1)}pp subpeso · E[R] {top.expectedReturn.toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>
              Score: gap × E[R] = {top.priorityScore.toFixed(1)} · comprar no próximo aporte
            </div>
          </div>
        </div>
      )}

      {/* ZONA 2 — Tabela de Equity */}
      <div style={{ overflowX: 'auto', marginBottom: 10 }}>
        <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%', minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>#</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>ETF</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Atual%→Alvo%</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Gap</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>E[R]</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((e, i) => {
              const barPct = Math.min(100, (Math.abs(e.priorityScore) / maxScore) * 100);
              const barColor = e.priorityScore > 0 ? '#16a34a' : '#dc2626';
              return (
                <tr key={e.ticker} style={{ borderBottom: '1px solid var(--border)', background: i === 0 ? '#ca8a041a' : 'transparent' }}>
                  <td style={{ padding: '5px 6px', fontWeight: 700, color: i === 0 ? '#ca8a04' : 'var(--muted)', fontSize: 11 }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '5px 6px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>{e.ticker}</div>
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--muted)', fontSize: 9 }}>
                    {`${e.atual.toFixed(1)}% → ${e.alvo.toFixed(1)}%`}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, color: gapColor(e.gap) }}>
                    {`${e.gap >= 0 ? '+' : ''}${e.gap.toFixed(1)}pp`}
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {e.expectedReturn.toFixed(1)}%
                  </td>
                  <td style={{ padding: '5px 6px', minWidth: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${barPct}%`, height: '100%', background: barColor, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 9, color: barColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {e.priorityScore >= 0 ? '+' : ''}{e.priorityScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>
        Score = Drift Gap × E[R] aprovado 2026-04-01 · haircut 58% McLean &amp; Pontiff 2016
      </div>

      {/* Separador */}
      <div style={{ borderTop: '1px solid rgba(100,116,139,0.2)', margin: '12px 0' }} />
      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
        Gatilhos RF &amp; Crypto
      </div>

      {/* ZONA 3 — Semáforos RF & Crypto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sortedDca.map(item => {
          const style = getStatusStyle(item.status);
          const catLabel = CATEGORIA_LABEL[item.categoria] ?? item.categoria;
          const contexto = formatContexto(item, privacyMode);
          const acaoColor = item.proxAcao === 'comprar' ? 'var(--green)' : item.proxAcao === 'vender' ? 'var(--red)' : 'var(--muted)';

          return (
            <div key={item.id} style={{
              padding: '8px 10px',
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: 6,
            }}>
              {/* Linha 1 */}
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
              {/* Linha 2 */}
              {contexto && (
                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, marginLeft: 14 }}>
                  {contexto}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
