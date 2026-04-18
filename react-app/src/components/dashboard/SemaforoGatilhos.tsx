import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { DcaItem } from '@/types/dashboard';
import { getStatusStyle } from '@/utils/statusStyles';

interface SemaforoGatilhosProps {
  items: DcaItem[];
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
    parts.push(privacyMode ? 'pos: ••••' : `pos: R$${(item.posicaoBrl / 1000).toFixed(0)}k`);
  }
  if (item.pctCarteira != null && item.alvoPct != null) {
    parts.push(`${item.pctCarteira.toFixed(1)}% vs alvo ${item.alvoPct.toFixed(0)}%`);
  }
  return parts.length ? parts.join(' · ') : undefined;
}

const SemaforoGatilhos: React.FC<SemaforoGatilhosProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { privacyMode } = useUiStore();

  const worstStatus =
    items.some(i => i.status === 'vermelho') ? 'vermelho' :
    items.some(i => i.status === 'amarelo') ? 'amarelo' : 'verde';

  const dcaAtivos = items.filter(i => i.dcaAtivo).length;
  const resumo = `${items.length} ativos monitorados · ${dcaAtivos} DCA ativo${dcaAtivos !== 1 ? 's' : ''}`;

  return (
    <section className="mb-3.5 rounded overflow-hidden" style={{ border: '1px solid rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.04)' }}>
      {/* Header — collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center cursor-pointer px-4 py-3 text-text hover:bg-border/20 transition-colors"
      >
        <h2 className="m-0 text-base font-semibold">Semáforos de Gatilhos ›</h2>
        <span className="text-xs text-muted">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {/* Summary when collapsed */}
      {!isOpen && (
        <div className="mx-4 mb-3 flex flex-col gap-1">
          {items.filter(i => i.proxAcao === 'comprar' || i.proxAcao === 'vender').map(item => {
            const color = getStatusStyle(item.status).color;
            const acaoColor = item.proxAcao === 'comprar' ? 'var(--green)' : 'var(--red)';
            return (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-text font-medium w-28 flex-shrink-0">{item.nome}</span>
                <span className="font-semibold" style={{ color: acaoColor }}>{item.proxAcao}</span>
              </div>
            );
          })}
          {items.filter(i => i.proxAcao === 'comprar' || i.proxAcao === 'vender').length === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: getStatusStyle('verde').color }} />
              {items.length} ativos — nenhuma ação pendente
            </div>
          )}
        </div>
      )}

      {/* Expanded table */}
      {isOpen && items.length > 0 && (
        <div className="overflow-x-auto px-4 pb-4 mt-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-left">Gatilho</th>
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-center">Status</th>
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-right">Valor</th>
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-left">Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const color = getStatusStyle(item.status).color;
                const catLabel = CATEGORIA_LABEL[item.categoria] ?? item.categoria;
                const contexto = formatContexto(item, privacyMode);

                return (
                  <tr key={item.id} className="border-b border-border/30">
                    <td className="px-2 py-2">
                      <div className="text-slate-100 flex items-center gap-1.5 flex-wrap">
                        {item.nome}
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{
                          background: 'rgba(88,166,255,0.15)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(88,166,255,0.3)',
                        }}>
                          {catLabel}
                        </span>
                        {item.dcaAtivo && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{
                            background: 'rgba(62,211,129,0.15)',
                            color: 'var(--green)',
                            border: '1px solid rgba(62,211,129,0.3)',
                          }}>
                            DCA
                          </span>
                        )}
                      </div>
                      {contexto && (
                        <div className="text-xs text-muted mt-0.5">{contexto}</div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
                        <span style={{ color }}>{item.status}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-slate-100">
                      {privacyMode ? '••••' : formatValor(item)}
                    </td>
                    <td className="px-2 py-2 text-muted">
                      {item.proxAcao}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default SemaforoGatilhos;
