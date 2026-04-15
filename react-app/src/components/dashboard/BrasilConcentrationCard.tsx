import React from 'react';
import { useUiStore } from '@/store/uiStore';

interface BrasilConcentrationCardProps {
  hodl11: number;
  ipcaTotal: number;
  rendaPlus: number;
  cryptoLegado: number;
  totalBrl: number;
  concentrationBrazil: number;
}

const BrasilConcentrationCard: React.FC<BrasilConcentrationCardProps> = ({
  hodl11,
  ipcaTotal,
  rendaPlus,
  cryptoLegado,
  totalBrl,
  concentrationBrazil,
}) => {
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fmtPct = (val: number) => {
    return (val * 100).toFixed(1);
  };

  const concentrationColor = concentrationBrazil > 0.65 ? '#ef4444' : concentrationBrazil > 0.55 ? '#eab308' : '#22c55e';
  const concentrationBg = concentrationBrazil > 0.65
    ? 'rgba(239, 68, 68, 0.1)'
    : concentrationBrazil > 0.55
    ? 'rgba(234, 179, 8, 0.1)'
    : 'rgba(34, 197, 94, 0.1)';

  const rowStyle: React.CSSProperties = { marginBottom: '12px' };
  const labelStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' };
  const subStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', paddingLeft: '12px', marginBottom: '8px' };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Brasil Concentration Risk
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Main concentration metric */}
        <div style={{ padding: '12px', borderRadius: '4px', textAlign: 'center', backgroundColor: concentrationBg, border: `1px solid ${concentrationColor}` }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Brasil Concentration
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px', color: concentrationColor }}>
            {privacyMode ? '••' : `${fmtPct(concentrationBrazil)}%`}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            {concentrationBrazil > 0.65
              ? 'Alto risco — acima de 65%'
              : concentrationBrazil > 0.55
              ? 'Moderado — 55-65%'
              : 'Aceitável — abaixo de 55%'}
          </div>
        </div>

        {/* Breakdown by asset class */}
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
            Composição
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>Renda Fixa (IPCA+ Ladder)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>{privacyMode ? 'R$••••' : fmtBrl(ipcaTotal)}</span>
            </div>
            <div style={subStyle}>
              <span>IPCA+ 2029/2040/2050</span>
              <span>{privacyMode ? '••' : `${fmtPct(ipcaTotal / totalBrl)}%`}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>Renda+ 2065</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>{privacyMode ? 'R$••••' : fmtBrl(rendaPlus)}</span>
            </div>
            <div style={subStyle}>
              <span>Título prefixado</span>
              <span>{privacyMode ? '••' : `${fmtPct(rendaPlus / totalBrl)}%`}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>Criptoativos (HODL11)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>{privacyMode ? 'R$••••' : fmtBrl(hodl11)}</span>
            </div>
            <div style={subStyle}>
              <span>Bitcoin + Crypto Legado</span>
              <span>{privacyMode ? '••' : `${fmtPct(hodl11 / totalBrl)}%`}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>Crypto Legado</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>{privacyMode ? 'R$••••' : fmtBrl(cryptoLegado)}</span>
            </div>
            <div style={subStyle}>
              <span>Posições anteriores</span>
              <span>{privacyMode ? '••' : `${fmtPct(cryptoLegado / totalBrl)}%`}</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* Risk note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '8px 12px', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Nota:</strong> Concentração acima de 65% em Brasil aumenta risco de taxa (Selic), câmbio e inflação. Meta: reduzir para 50-60% via alocação internacional.
        </div>
      </div>
    </div>
  );
};

export default BrasilConcentrationCard;
