'use client';

import { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { InfoCard } from '@/components/primitives/InfoCard';
import { ScenarioBadge } from '@/components/primitives/ScenarioBadge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SWRDashboardProps {
  // Acumulação
  patrimonioAtual: number;
  custoVidaBase: number;
  swrTarget: number;

  // FIRE Day (percentis, derivados por perfil no parent)
  swrP10: number | null;
  swrP50: number | null;
  swrP90: number | null;
  patrimonioP10?: number | null;
  patrimonioP50?: number | null;
  patrimonioP90?: number | null;

  // Label perfil ativo (para ScenarioBadge)
  scenarioLabel: string;

  // Ano FIRE (rótulo)
  anoCenarioBase?: string | number;
}

type Tab = 'acumulacao' | 'fire';

export default function SWRDashboard({
  patrimonioAtual,
  custoVidaBase,
  swrTarget,
  swrP10,
  swrP50,
  swrP90,
  patrimonioP10,
  patrimonioP50,
  patrimonioP90,
  scenarioLabel,
  anoCenarioBase = '2040',
}: SWRDashboardProps) {
  const { privacyMode } = useUiStore();
  const [tab, setTab] = useState<Tab>('acumulacao');

  const swrAtual = patrimonioAtual > 0 ? custoVidaBase / patrimonioAtual : null;
  const swrFireColor = swrP50 == null ? 'var(--muted)'
    : swrP50 <= swrTarget ? 'var(--green)'
    : swrP50 <= swrTarget * 1.33 ? 'var(--yellow)'
    : 'var(--red)';
  const swrFireStatus = swrP50 == null ? null
    : swrP50 <= swrTarget ? <><CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> dentro do target</>
    : swrP50 <= swrTarget * 1.33 ? <><AlertTriangle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> atenção</>
    : <><XCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> acima do target</>;

  const fmtBrl = (v: number) => privacyMode
    ? '••••'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

  return (
    <div>
      <ScenarioBadge label={scenarioLabel} gasto={custoVidaBase} privacyMode={privacyMode} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, marginBottom: 12, borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'acumulacao' as Tab, label: 'Acumulação (atual)' },
          { id: 'fire' as Tab, label: `FIRE Day (${anoCenarioBase}) — P10/P50/P90` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '6px 14px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'acumulacao' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            label="SWR Atual"
            value={swrAtual != null ? (privacyMode ? '••%' : `${(swrAtual * 100).toFixed(2)}%`) : '—'}
            description={<>Patrimônio hoje / custo de vida · <em>Em fase de acumulação — este SWR não é sustentável no FIRE.</em><br />Meta: ≤{(swrTarget * 100).toFixed(0)}% no FIRE day.</>}
            accentColor="var(--muted)"
            size="lg"
          />
          <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '16px 18px', border: '1px solid var(--border)', borderLeft: `4px solid ${swrFireColor}` }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6, fontWeight: 600 }}>
              SWR Projetado — FIRE {anoCenarioBase} (P50)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: swrFireColor, lineHeight: 1 }}>
                {swrP50 != null ? (privacyMode ? '••%' : `${(swrP50 * 100).toFixed(2)}%`) : '—'}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>P50</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              {swrP10 != null && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>P10: {privacyMode ? '••%' : `${(swrP10 * 100).toFixed(2)}%`}</span>}
              {swrP90 != null && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>P90: {privacyMode ? '••%' : `${(swrP90 * 100).toFixed(2)}%`}</span>}
            </div>
            {swrFireStatus && <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: swrFireColor }}>{swrFireStatus} · alvo ≤{(swrTarget * 100).toFixed(0)}%</div>}
          </div>
        </div>
      )}

      {tab === 'fire' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* P10 */}
            <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--red)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P10 — Pessimista</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--red)' }}>
                {swrP10 != null ? (privacyMode ? '••%' : `${(swrP10 * 100).toFixed(2)}%`) : '—'}
              </div>
              {patrimonioP10 != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  Pat: {fmtBrl(patrimonioP10)}
                </div>
              )}
            </div>
            {/* P50 */}
            <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--yellow)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P50 — Mediano</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--yellow)' }}>
                {swrP50 != null ? (privacyMode ? '••%' : `${(swrP50 * 100).toFixed(2)}%`) : '—'}
              </div>
              {patrimonioP50 != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  Pat: {fmtBrl(patrimonioP50)}
                </div>
              )}
            </div>
            {/* P90 */}
            <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--green)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P90 — Otimista</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>
                {swrP90 != null ? (privacyMode ? '••%' : `${(swrP90 * 100).toFixed(2)}%`) : '—'}
              </div>
              {patrimonioP90 != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
                  Pat: {fmtBrl(patrimonioP90)}
                </div>
              )}
            </div>
          </div>
          <div className="src">
            P10 = cenário pessimista (menor patrimônio → SWR mais alta); P90 = cenário otimista (maior patrimônio → SWR baixa).
            Patrimônio MC não muda por perfil; SWR efetiva = gasto {`{perfil}`} ÷ patrimônio.
          </div>
        </>
      )}
    </div>
  );
}
