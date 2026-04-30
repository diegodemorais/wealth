'use client';

/**
 * CascadeSection — Calculadora de Aporte (cascade allocation decision)
 *
 * Extracted from simulators/page.tsx (ARCH P2: sub-component extraction)
 * Determines monthly contribution allocation: IPCA+ Longo → Renda+ → Equity overflow.
 */

import { useEffect, useState, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { Input } from '@/components/ui/input';
import { fmtPrivacy } from '@/utils/privacyTransform';

/** Single derivation for patrimônio total financeiro — source: premissas.patrimonio_atual */
function derivePatrimonio(data: unknown): number | undefined {
  return (data as any)?.premissas?.patrimonio_atual;
}

export function CascadeSection() {
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const { privacyMode } = useUiStore();
  const [aporte, setAporte] = useState<number | undefined>(undefined);
  const dataInitCasc = useRef(false);

  useEffect(() => {
    if (data && !dataInitCasc.current) {
      dataInitCasc.current = true;
      const ap = (data as any)?.premissas?.aporte_mensal;
      if (ap != null) setAporte(ap);
    }
  }, [data]);

  const cambio: number = data?.cambio ?? 0;

  // Derive total portfolio value (BRL) — from data only, no hardcoded fallback
  const totalBrl: number | undefined = derivePatrimonio(data);

  // IPCA+ Longo gap — from unified derived.dcaItems (single source of truth)
  const ipcaItem = derived?.dcaItems?.find(i => i.id === 'ipca2040') ?? null;
  const ipcaGapPp: number | null = ipcaItem?.gapAlvoPp ?? null;
  const ipcaGapBrl: number | null = ipcaGapPp != null && ipcaGapPp > 0 && totalBrl != null
    ? Math.round((ipcaGapPp / 100) * totalBrl)
    : 0;

  // Renda+ gap — from unified derived.dcaItems
  const rendaItem = derived?.dcaItems?.find(i => i.id === 'renda2065') ?? null;
  const rendaGapPp: number | null = rendaItem?.gapAlvoPp ?? null;
  const rendaGapBrl: number | null = rendaGapPp != null && rendaGapPp > 0 && totalBrl != null
    ? Math.round((rendaGapPp / 100) * totalBrl)
    : 0;

  // B14: taxa atual / piso / gap por instrumento RF
  const ipcaTaxa: number | null = (data as any)?.rf?.ipca2040?.taxa ?? null;
  const ipcaPiso: number | null = (data as any)?.pisos?.pisoTaxaIpcaLongo ?? null;
  const ipcaYieldGap: number | null = ipcaTaxa != null && ipcaPiso != null ? ipcaTaxa - ipcaPiso : null;
  const rendaTaxa: number | null = (data as any)?.rf?.renda2065?.taxa ?? null;
  const rendaPiso: number | null = (data as any)?.pisos?.pisoTaxaRendaPlus ?? null;
  const rendaYieldGap: number | null = rendaTaxa != null && rendaPiso != null ? rendaTaxa - rendaPiso : null;

  // Cascade allocation: IPCA+ Longo → Renda+ → Equity (overflow)
  let remaining = aporte ?? 0;
  const ipcaAlloc = ipcaGapBrl !== null ? Math.min(remaining, ipcaGapBrl) : 0;
  remaining -= ipcaAlloc;
  const rendaAlloc = rendaGapBrl !== null ? Math.min(remaining, rendaGapBrl) : 0;
  remaining -= rendaAlloc;
  const equityAlloc = remaining;

  // DCA active status from unified dcaItems
  const ipcaAtivo: boolean = ipcaItem?.dcaAtivo ?? false;
  const rendaAtivo: boolean = rendaItem?.dcaAtivo ?? false;

  return (
    <div className="section" style={{ marginTop: '16px' }}>
      <h2>Calculadora de Aporte — Cascade</h2>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div className="slider-row" style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Aporte Mensal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>R$</span>
              <Input
                type="number"
                min="1000"
                max="1000000"
                step="1000"
                value={aporte}
                onChange={e => setAporte(+e.target.value)}
                style={{ width: '90px', fontSize: 'var(--text-base)', textAlign: 'right' }}
              />
            </span>
          </label>
          <input
            type="range" min="1" max="1000" step="1" value={aporte != null ? Math.round(aporte / 1000) : 25}
            onChange={e => setAporte(+e.target.value * 1000)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span>R$ 1k</span><span>R$ 1M</span>
          </div>
        </div>
        {cambio > 0 && (
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            Câmbio: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cambio.toFixed(2)}</span>{' '}
            <span style={{ fontSize: 'var(--text-xs)' }}>(PTAX BCB)</span>
          </div>
        )}
      </div>

      {/* Cascade result — always show all 3 levels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
        {/* Nível 1: IPCA+ Longo */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${ipcaAtivo ? 'var(--green)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              1 · IPCA+ Longo
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)', background: ipcaAtivo ? 'rgba(34,197,94,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {ipcaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: ipcaAtivo ? 'var(--green)' : 'var(--muted)' }} className="pv">
            {fmtPrivacy(ipcaAlloc, privacyMode)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Tesouro IPCA+2040 via XP
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{ipcaGapBrl != null ? (fmtPrivacy(ipcaGapBrl, privacyMode)) : '—'}</span>
            {ipcaGapPp != null && ` (${ipcaGapPp.toFixed(1)}pp)`}
          </div>
          {ipcaTaxa != null && ipcaPiso != null && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
              Taxa: <strong style={{ color: 'var(--text)' }}>IPCA+{ipcaTaxa.toFixed(2)}%</strong>
              {' '}· piso: {ipcaPiso.toFixed(1)}%
              {ipcaYieldGap != null && (
                <span style={{ color: ipcaYieldGap > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {' '}· gap: {ipcaYieldGap >= 0 ? '+' : ''}{ipcaYieldGap.toFixed(2)}pp
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nível 2: Renda+ */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: `3px solid ${rendaAtivo ? 'var(--accent)' : 'var(--muted)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              2 · Renda+ 2065
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)', background: rendaAtivo ? 'rgba(59,130,246,.12)' : 'rgba(148,163,184,.1)', borderRadius: '3px', padding: '1px 4px' }}>
              {rendaAtivo ? 'ATIVO' : 'PAUSADO'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: rendaAtivo ? 'var(--accent)' : 'var(--muted)' }} className="pv">
            {fmtPrivacy(rendaAlloc, privacyMode)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(88,166,255,.08)', borderRadius: '4px' }}>
            → Renda+ 2065 via Tesouro Direto
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            gap: <span className="pv">{rendaGapBrl != null ? (fmtPrivacy(rendaGapBrl, privacyMode)) : '—'}</span>
            {rendaGapPp != null && (rendaGapPp > 0 ? ` (${rendaGapPp.toFixed(1)}pp)` : ' (acima do alvo)')}
          </div>
          {rendaTaxa != null && rendaPiso != null && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
              Taxa: <strong style={{ color: 'var(--text)' }}>IPCA+{rendaTaxa.toFixed(2)}%</strong>
              {' '}· piso: {rendaPiso.toFixed(1)}%
              {rendaYieldGap != null && (
                <span style={{ color: rendaYieldGap > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {' '}· gap: {rendaYieldGap >= 0 ? '+' : ''}{rendaYieldGap.toFixed(2)}pp
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nível 3: Equity (overflow) */}
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)', borderTop: '3px solid var(--orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              3 · Equity (overflow)
            </div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--orange)', background: 'rgba(249,115,22,.12)', borderRadius: '3px', padding: '1px 4px' }}>
              SEMPRE
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--orange)' }} className="pv">
            {fmtPrivacy(equityAlloc, privacyMode)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--orange)', fontWeight: 600, marginTop: '6px', padding: '4px 6px', background: 'rgba(249,115,22,.08)', borderRadius: '4px' }}>
            → SWRD + AVGS + AVEM via IBKR
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            pesos: 50% SWRD · 30% AVGS · 20% AVEM
          </div>
        </div>
      </div>

      <div className="src">
        Cascade: nível 1 preenche até gap IPCA+ · nível 2 preenche até gap Renda+ · overflow sempre para equity IBKR.
      </div>
    </div>
  );
}
