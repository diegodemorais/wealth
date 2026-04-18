'use client';

import { PrivacyMask } from '@/components/primitives/PrivacyMask';
import { useUiStore } from '@/store/uiStore';

interface PatrimonioHolistico {
  financeiro_brl: number;
  imovel_equity_brl: number;
  imovel_valor_mercado: number;
  saldo_devedor_brl: number;
  terreno_brl: number;
  capital_humano_vp: number;
  anos_ate_fire: number;
  inss_pv_brl: number;
  total_brl: number;
}

interface BalancoHolisticoProps {
  data: {
    patrimonio_holistico?: PatrimonioHolistico;
    premissas?: {
      patrimonio_atual?: number;
    };
  };
  /** Se true, mostra label de capital humano com badge ilíquido */
  showCapitalHumanoBadge?: boolean;
}

function fmt(val: number): string {
  if (val >= 1_000_000) return `R$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `R$${(val / 1_000).toFixed(0)}k`;
  return `R$${val.toFixed(0)}`;
}

interface AssetCard {
  label: string;
  value: number;
  badge?: string;
  badgeColor?: string;
  sublabel?: string;
}

export function BalancoHolistico({ data, showCapitalHumanoBadge = false }: BalancoHolisticoProps) {
  const h = data?.patrimonio_holistico;
  const { privacyMode } = useUiStore();
  if (!h) return null;

  const totalBrl = h.total_brl;
  const cards: AssetCard[] = [
    {
      label: 'Financeiro',
      value: h.financeiro_brl,
      sublabel: `${totalBrl > 0 ? ((h.financeiro_brl / totalBrl) * 100).toFixed(0) : '?'}% do total`,
    },
    {
      label: 'Imóvel (equity)',
      value: h.imovel_equity_brl,
      sublabel: privacyMode ? '••••' : `Mercado ${fmt(h.imovel_valor_mercado)} − dívida ${fmt(h.saldo_devedor_brl)}`,
    },
    {
      label: 'Terreno',
      value: h.terreno_brl,
      badge: 'Ilíquido',
      badgeColor: 'var(--muted)',
    },
    {
      label: 'Capital Humano',
      value: h.capital_humano_vp,
      badge: showCapitalHumanoBadge ? `Ilíquido — decai a zero em ${new Date().getFullYear() + h.anos_ate_fire}` : undefined,
      badgeColor: 'var(--muted)',
      sublabel: `${h.anos_ate_fire} anos × renda × 0.65`,
    },
    {
      label: 'INSS (VP)',
      value: h.inss_pv_brl,
      sublabel: 'Valor presente benefício',
    },
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Totalizador */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>
          <PrivacyMask>{fmt(totalBrl)}</PrivacyMask>
        </span>
        <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>patrimônio holístico total</span>
      </div>

      {/* Cards 2 cols mobile, 5 cols sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm, 6px)',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 2 }}>
              {card.label}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              <PrivacyMask>{fmt(card.value)}</PrivacyMask>
            </div>
            {card.badge && (
              <span
                style={{
                  fontSize: '.65rem',
                  color: card.badgeColor ?? 'var(--muted)',
                  border: `1px solid ${card.badgeColor ?? 'var(--border)'}`,
                  borderRadius: 3,
                  padding: '0 4px',
                  display: 'inline-block',
                  marginTop: 3,
                }}
              >
                {card.badge}
              </span>
            )}
            {card.sublabel && !card.badge && (
              <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 2 }}>
                {card.sublabel}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota metodológica */}
      <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 8, marginBottom: 0 }}>
        Capital humano = renda × 12 × {h.anos_ate_fire} anos × 65% (desconto iliquidez/mortalidade).
        Valores ilíquidos não integram o portfólio de investimentos.
      </p>
    </div>
  );
}
