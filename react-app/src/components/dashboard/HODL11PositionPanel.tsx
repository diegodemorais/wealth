'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface BtcIndicatorsData {
  ma200w?: { zone?: string };
  mvrv_zscore?: { current_value?: number; signal?: string };
  correlation_90d?: number;
}

interface HODL11PositionPanelProps {
  hodl11: {
    valor?: number;
    preco_medio?: number | null;
    preco?: number | null;
    pnl_pct?: number | null;
    banda?: { atual_pct?: number };
  };
}

/**
 * HODL11 Position actionable panel: banda, sinal combinado, trigger checklist.
 * Moved from backtest page (Fase 5).
 */
export default function HODL11PositionPanel({ hodl11 }: HODL11PositionPanelProps) {
  const { privacyMode } = useUiStore();
  const [btcData, setBtcData] = useState<BtcIndicatorsData | null>(null);
  useEffect(() => {
    fetch(`${BASE_PATH}/btc_indicators.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: BtcIndicatorsData) => setBtcData(d))
      .catch(() => { /* silent: no BTC data */ });
  }, []);

  const hodl11Brl = hodl11?.valor ?? 0;
  const avgCost = hodl11?.preco_medio ?? null;
  const allocPct = hodl11?.banda?.atual_pct ?? 0;
  const BANDS = { buy: 1.5, target: 3.0, sell: 5.0 };
  const BAR_MAX = 6.5;
  const pos = (v: number) => `${(Math.min(v, BAR_MAX) / BAR_MAX * 100).toFixed(2)}%`;
  const buyWidth = pos(BANDS.buy);
  const neutralWidth = `calc(${pos(BANDS.sell)} - ${pos(BANDS.buy)})`;
  const currentPos = pos(allocPct);

  const zone200 = btcData?.ma200w?.zone ?? null;
  const mvrvSig = btcData?.mvrv_zscore?.signal ?? null;
  const mvrvZ = btcData?.mvrv_zscore?.current_value ?? null;

  let signal = { label: 'Aguardando dados', color: '#64748b', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
  if (zone200 && mvrvSig) {
    if ((zone200 === 'below' || zone200 === 'near') && mvrvSig === 'accumulate')
      signal = { label: 'Zona de Compra Forte', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' };
    else if ((zone200 === 'below' || zone200 === 'near') && mvrvSig === 'neutral')
      signal = { label: 'Zona de Compra', color: '#86efac', bg: 'rgba(134,239,172,0.10)', border: 'rgba(134,239,172,0.3)' };
    else if (zone200 === 'above' && mvrvSig === 'accumulate')
      signal = { label: 'Possível Compra', color: '#86efac', bg: 'rgba(134,239,172,0.08)', border: 'rgba(134,239,172,0.25)' };
    else if (zone200 === 'above' && mvrvSig === 'neutral')
      signal = { label: 'Hold — Neutro', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
    else if (zone200 === 'above' && mvrvSig === 'caution')
      signal = { label: 'Cautela — Não Adicionar', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.3)' };
    else if (zone200 === 'euphoria' || mvrvSig === 'trim')
      signal = { label: 'Zona de Venda', color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.3)' };
  }

  const fmtBrl = (v: number) => fmtPrivacy(v, privacyMode);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
      {/* Top row: signal + P&L */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          HODL11 Position
        </div>
        <span style={{ padding: '2px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: signal.bg, border: `1px solid ${signal.border}`, color: signal.color }}>
          {signal.label}
        </span>
        {allocPct > BANDS.sell && (
          <span style={{
            padding: '2px 10px',
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 700,
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#ef4444',
          }}>
            ⚠️ SOBREPESO — Vender {(allocPct - BANDS.sell).toFixed(2)}%
          </span>
        )}
        {hodl11?.pnl_pct != null && (
          <span style={{ fontSize: 11, color: hodl11.pnl_pct >= 0 ? '#22c55e' : '#ef4444', marginLeft: 'auto' }}>
            P&L: {hodl11.pnl_pct >= 0 ? '+' : ''}{hodl11.pnl_pct.toFixed(1)}%
            {avgCost && <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>(avg {fmtPrivacy(avgCost, privacyMode, { compact: false, decimals: 0 })})</span>}
          </span>
        )}
      </div>

      {/* Allocation bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 4 }}>
          <span>Alocação HODL11</span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{allocPct.toFixed(2)}% · {fmtBrl(hodl11Brl)}</span>
        </div>
        <div style={{ position: 'relative', height: 12, borderRadius: 6, background: '#0f172a', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: buyWidth, background: 'rgba(34,197,94,0.22)' }} />
          <div style={{ position: 'absolute', left: buyWidth, top: 0, bottom: 0, width: neutralWidth, background: 'rgba(148,163,184,0.07)' }} />
          <div style={{ position: 'absolute', left: pos(BANDS.sell), top: 0, bottom: 0, right: 0, background: 'rgba(239,68,68,0.18)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: pos(BANDS.target), width: 2, background: '#3b82f6', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: currentPos, width: 14, height: 14, background: '#fff', borderRadius: '50%', border: '2px solid #3b82f6', transform: 'translate(-50%, -50%)', zIndex: 3 }} />
        </div>
        <div style={{ position: 'relative', height: 18, marginTop: 2 }}>
          <span style={{ position: 'absolute', left: buyWidth, transform: 'translateX(-50%)', fontSize: 9, color: '#22c55e', textAlign: 'center', lineHeight: 1.2 }}>1.5%<br/>compra</span>
          <span style={{ position: 'absolute', left: pos(BANDS.target), transform: 'translateX(-50%)', fontSize: 9, color: '#3b82f6', textAlign: 'center', lineHeight: 1.2 }}>3%<br/>meta</span>
          <span style={{ position: 'absolute', left: pos(BANDS.sell), transform: 'translateX(-50%)', fontSize: 9, color: '#ef4444', textAlign: 'center', lineHeight: 1.2 }}>5%<br/>venda</span>
        </div>
      </div>

      {/* Trigger checklist */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Compra (aloc < 1.5%)', active: allocPct < BANDS.buy },
          { label: 'Venda (aloc > 5%)', active: allocPct > BANDS.sell },
          { label: 'MVRV Z < 0 (capitulação)', active: mvrvZ != null && mvrvZ < 0 },
        ].map(({ label, active }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: active ? '#22c55e' : '#64748b' }}>
            <span style={{ fontSize: 12, lineHeight: 1 }}>{active ? '●' : '○'}</span>
            {label}
          </span>
        ))}
      </div>

      {/* BTC/SWRD 90-day rolling correlation */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'var(--muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>BTC/SWRD Correlação (90d)</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: btcData?.correlation_90d != null ? 'var(--text)' : 'var(--muted)' }}>
            {btcData?.correlation_90d != null
              ? `${(btcData.correlation_90d * 100).toFixed(0)}%`
              : '—'}
          </span>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--muted)', fontStyle: 'italic' }}>
          Diversificador quando {'<'} 40%; Risco sistêmico quando {'>'} 60%
        </p>
      </div>
    </div>
  );
}
