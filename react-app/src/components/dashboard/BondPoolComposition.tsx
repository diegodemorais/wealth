"use client"

import { useUiStore } from "@/store/uiStore"

interface BondPoolData {
  valor_atual_brl: number
  anos_gastos: number
  meta_anos: number
  status: "early" | "on_track" | "behind"
  composicao: {
    ipca2040?: number
    ipca2050?: number
    ipca2029?: number
  }
}

interface BondPoolCompositionProps {
  data: BondPoolData
  runwayAnosPosFire?: number
  poolTotal?: number
}

const statusColors = {
  early: "var(--green)",
  on_track: "var(--yellow)",
  behind: "var(--red)",
} as const

const statusLabels = {
  early: "Early Stage",
  on_track: "On Track",
  behind: "Behind",
} as const

export function BondPoolComposition({
  data,
  runwayAnosPosFire = 0,
  poolTotal = 0,
}: BondPoolCompositionProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  if (!data || typeof data !== 'object') {
    return <div style={{ color: 'var(--muted)' }}>Bond pool data unavailable</div>;
  }

  const valor = typeof data.valor_atual_brl === 'number' ? data.valor_atual_brl : 0;
  const anosGastos = typeof data.anos_gastos === 'number' ? data.anos_gastos : 0;
  const metaAnos = typeof data.meta_anos === 'number' ? data.meta_anos : 1;
  const runway = typeof runwayAnosPosFire === 'number' ? runwayAnosPosFire : 0;

  const progressPercent = (anosGastos / metaAnos) * 100;
  const isHealthy = anosGastos >= metaAnos * 0.7;

  const totalComposicao = Object.values(data.composicao).reduce((sum, val) => sum + (val || 0), 0);
  const comp2040Pct = totalComposicao ? ((data.composicao.ipca2040 || 0) / totalComposicao) * 100 : 0;
  const comp2050Pct = totalComposicao ? ((data.composicao.ipca2050 || 0) / totalComposicao) * 100 : 0;
  const comp2029Pct = totalComposicao ? ((data.composicao.ipca2029 || 0) / totalComposicao) * 100 : 0;

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  };

  const progressBar = (value: number, color = 'var(--accent)') => (
    <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s ease' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '16px' }}>
          Bond Pool Status
        </h3>

        {/* Main Status Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' }}>Current Pool</p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {privacyMode ? '••••' : `R$${(valor / 1000).toFixed(0)}k`}
              </p>
            </div>
            <div style={{ textAlign: 'right', color: statusColors[data.status] }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px 0' }}>{statusLabels[data.status]}</p>
              <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', margin: 0 }}>
                {anosGastos.toFixed(1)}/{metaAnos.toFixed(0)} anos
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Progress to Target</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            {progressBar(progressPercent)}
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px', marginBottom: 0 }}>
              Target: {metaAnos.toFixed(0)} years of expenses
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '14px', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' }}>Post-FIRE Runway</p>
            <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
              {runway.toFixed(1)} years
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
              of spending coverage available after FIRE date
            </p>
          </div>
        </div>

        {/* Composition Breakdown */}
        <div style={cardStyle}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>Composição por Vencimento</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.composicao.ipca2040 !== undefined && data.composicao.ipca2040 > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>IPCA+ 2040</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>{comp2040Pct.toFixed(0)}%</span>
                </div>
                {progressBar(comp2040Pct)}
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px', marginBottom: 0 }}>
                  {privacyMode ? '••••' : `R$${(data.composicao.ipca2040 / 1000).toFixed(0)}k`}
                </p>
              </div>
            )}

            {data.composicao.ipca2050 !== undefined && data.composicao.ipca2050 > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>IPCA+ 2050</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>{comp2050Pct.toFixed(0)}%</span>
                </div>
                {progressBar(comp2050Pct)}
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px', marginBottom: 0 }}>
                  {privacyMode ? '••••' : `R$${(data.composicao.ipca2050 / 1000).toFixed(0)}k`}
                </p>
              </div>
            )}

            {data.composicao.ipca2029 !== undefined && data.composicao.ipca2029 > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>IPCA+ 2029</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>{comp2029Pct.toFixed(0)}%</span>
                </div>
                {progressBar(comp2029Pct)}
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px', marginBottom: 0 }}>
                  {privacyMode ? '••••' : `R$${(data.composicao.ipca2029 / 1000).toFixed(0)}k`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Note */}
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
          {isHealthy
            ? "Bond pool on track. Continue building towards 7-year target for FIRE flexibility."
            : "Bond pool below healthy threshold. Prioritize building RF runway."}
        </p>
      </div>
    </div>
  );
}
