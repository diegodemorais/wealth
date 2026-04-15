import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { useDashboardStore } from '@/store/dashboardStore';

interface AporteDoMesProps {
  aporteMensal: number;
  ultimoAporte: number;
  ultimoAporteData: string;
  acumuladoMes: number;
  acumuladoAno: number;
}

const AporteDoMes: React.FC<AporteDoMesProps> = ({
  aporteMensal,
  ultimoAporte,
  ultimoAporteData,
  acumuladoMes,
  acumuladoAno,
}) => {
  const { privacyMode } = useUiStore();
  const data = useDashboardStore(s => s.data);

  const fmtShort = (val: number) => {
    if (val >= 1_000_000) return `R$${(val / 1e6).toFixed(1)}M`;
    if (val >= 1_000) return `R$${Math.round(val / 1000)}k`;
    return `R$${Math.round(val)}`;
  };

  const fmtBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  // Savings rate: aporte / renda mensal líquida
  const rendaMensal = data?.premissas?.renda_mensal_liquida ?? 0;
  const savingsRate = rendaMensal > 0 ? (aporteMensal / rendaMensal) * 100 : null;

  // Savings rate color
  const srColor =
    savingsRate != null && savingsRate >= 50 ? 'var(--green)' :
    savingsRate != null && savingsRate >= 40 ? 'var(--yellow)' :
    'var(--red)';

  return (
    <section className="section">
      <h2>Aporte do Mês</h2>

      {/* Big aporte value */}
      <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
          {privacyMode ? '••••' : fmtShort(aporteMensal)}
        </div>
        {savingsRate != null && (
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '6px' }}>
            {privacyMode ? '••••' : `${savingsRate.toFixed(1)}% savings rate`}
            {rendaMensal > 0 && !privacyMode && ` · renda est. ${fmtShort(rendaMensal)}/mês`}
          </div>
        )}
      </div>

      {/* Savings rate bar */}
      {savingsRate != null && (
        <div style={{ margin: '8px 0' }}>
          <div style={{ height: '4px', background: 'var(--card2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: Math.min(100, savingsRate) + '%',
              height: '100%',
              background: srColor,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--muted)', marginTop: '4px' }}>
            <span>≥50% excelente</span>
            <span>≥40% ok</span>
            <span>≥35% atenção</span>
          </div>
        </div>
      )}

      {/* Accumulated values */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Acumulado Mês</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
            {privacyMode ? '••••' : fmtShort(acumuladoMes)}
          </div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Acumulado Ano</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
            {privacyMode ? '••••' : fmtShort(acumuladoAno)}
          </div>
        </div>
      </div>

      {/* Last contribution */}
      {ultimoAporte > 0 && (
        <div style={{ marginTop: '10px', fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'center' }}>
          Último: {privacyMode ? '••••' : fmtBrl(ultimoAporte)} · {ultimoAporteData}
        </div>
      )}
    </section>
  );
};

export default AporteDoMes;
