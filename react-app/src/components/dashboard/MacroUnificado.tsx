'use client';

import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import BRLPurchasingPowerTimeline from './BRLPurchasingPowerTimeline';

interface MacroUnificadoProps {
  // Taxas
  selic: number | null;
  ipca12m: number | null;
  fedFunds: number | null;
  cambio: number | null;
  cambioMtdPct?: number | null;

  // Ativos de Referência
  ipcaTaxa: number | null;
  ipcaDescricao?: string;
  rendaTaxa: number | null;
  rendaDescricao?: string;

  // Exposição Brasil
  concentrationBrazil: number | null;
  hodl11Brl?: number | null;
  rfBrl?: number | null;
  exposicaoCambialPct?: number;

  // Para BRL timeline (sub-seção)
  patrimonioAtual?: number | null;
  equityPctUsd?: number | null;

  // Risco soberano
  cdsBrazil5y?: number | null;
}

function semaforoColor(taxa: number | null) {
  if (taxa == null) return 'var(--muted)';
  if (taxa >= 7.5) return 'var(--green)';
  if (taxa >= 6.5) return 'var(--yellow)';
  return 'var(--red)';
}

export default function MacroUnificado({
  selic,
  ipca12m,
  fedFunds,
  cambio,
  cambioMtdPct,
  ipcaTaxa,
  ipcaDescricao,
  rendaTaxa,
  rendaDescricao,
  concentrationBrazil,
  hodl11Brl,
  rfBrl,
  exposicaoCambialPct = 87.9,
  patrimonioAtual,
  equityPctUsd,
  cdsBrazil5y,
}: MacroUnificadoProps) {
  const { privacyMode } = useUiStore();
  const spread = selic != null && fedFunds != null ? selic - fedFunds : null;
  const spreadColor = spread == null
    ? 'var(--muted)'
    : spread >= 10 ? 'var(--green)'
    : spread >= 6 ? 'var(--yellow)'
    : 'var(--red)';
  const cdsColor = cdsBrazil5y == null ? 'var(--muted)' : cdsBrazil5y >= 400 ? 'var(--red)' : cdsBrazil5y >= 250 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Linha 1: Taxas BR/EUA */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Taxas BR / EUA
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3.5">
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
        <div className="bg-slate-700/40 rounded p-2.5 text-center">
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

      {/* Linha 2: Ativos de Referência */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Ativos de Referência
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3.5">
        <div className="bg-slate-700/40 rounded p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            IPCA+ 2040 — Taxa
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: semaforoColor(ipcaTaxa) }} />
          </div>
          <div className="text-lg font-bold text-text">{ipcaTaxa != null ? `${ipcaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="text-xs text-muted mt-0.5">{ipcaDescricao ?? 'Tesouro IPCA+ 2040'}</div>
        </div>
        <div className="bg-slate-700/40 rounded p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            Renda+ 2065 — Taxa
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: semaforoColor(rendaTaxa) }} />
          </div>
          <div className="text-lg font-bold text-text">{rendaTaxa != null ? `${rendaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="text-xs text-muted mt-0.5">{rendaDescricao ?? 'Tesouro Renda+ 2065'}</div>
        </div>
      </div>

      {/* Linha 3: Exposição Brasil */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Exposição Brasil
      </div>
      <div className="bg-slate-700/40 rounded p-3 mb-2">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <div className="text-xs text-muted">Total Brasil</div>
            <div className="text-lg font-bold text-green mt-0.5">
              {concentrationBrazil != null ? `${(concentrationBrazil * 100).toFixed(1)}%` : '—'}
            </div>
            <div className="text-xs text-muted mt-0.5">Exp. cambial ~{exposicaoCambialPct.toFixed(0)}%</div>
          </div>
          <div className="text-sm text-muted text-right">
            <div>HODL11: {privacyMode ? '••••' : `R$${(((hodl11Brl ?? 0)) / 1000).toFixed(0)}k`}</div>
            <div>RF Total: {privacyMode ? '••••' : `R$${(((rfBrl ?? 0)) / 1000).toFixed(0)}k`}</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">
        Fonte: BCB / FRED · Spread alto (&gt;10pp) favorece carry, mas BRL apreciado reduz retorno em BRL do equity internacional.
      </div>

      {/* Sub-seção colapsada: Sensibilidade Cambial */}
      {patrimonioAtual != null && equityPctUsd != null && cambio != null && (
        <CollapsibleSection
          id="section-brl-fx-now"
          title="Sensibilidade Cambial — Equity USD em BRL"
          defaultOpen={false}
          icon="💱"
        >
          <div style={{ padding: '0 16px 16px' }}>
            <BRLPurchasingPowerTimeline
              cambio={cambio}
              equityPctUsd={equityPctUsd}
              patrimonioAtual={patrimonioAtual}
            />
            <div className="src">
              Projeção do valor da equity em BRL sob diferentes cenários cambiais. Retorno USD nominal: 7% a.a.
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
