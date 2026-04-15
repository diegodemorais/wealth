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

  // Get color based on concentration risk
  const getConcentrationColor = (pct: number): string => {
    if (pct > 0.65) return '#ef4444'; // red - high risk
    if (pct > 0.55) return '#eab308'; // yellow - moderate
    return '#22c55e'; // green - acceptable
  };

  const concentrationColor = getConcentrationColor(concentrationBrazil);
  const concentrationBg = concentrationBrazil > 0.65
    ? 'rgba(239, 68, 68, 0.1)'
    : concentrationBrazil > 0.55
    ? 'rgba(234, 179, 8, 0.1)'
    : 'rgba(34, 197, 94, 0.1)';

  return (
    <div
      style={{
        padding: '16px 18px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
        borderRadius: '8px',
        marginBottom: '14px',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
      }}
    >
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 14px', padding: 0 }}>
        Brasil Concentration Risk
      </h2>

      {/* Main concentration metric */}
      <div
        style={{
          padding: '12px',
          backgroundColor: concentrationBg,
          border: `1px solid ${concentrationColor}`,
          borderRadius: '6px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Brasil Concentration
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: concentrationColor, marginBottom: '4px' }}>
          {privacyMode ? '••' : `${fmtPct(concentrationBrazil)}%`}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
          {concentrationBrazil > 0.65
            ? '⚠️ Alto risco — acima de 65%'
            : concentrationBrazil > 0.55
            ? '⚠️ Moderado — 55-65%'
            : '✅ Aceitável — abaixo de 55%'}
        </div>
      </div>

      {/* Breakdown by asset class */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
          Composição
        </div>

        {/* RF Ladder */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '0px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
              Renda Fixa (IPCA+ Ladder)
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              {privacyMode ? 'R$••••' : fmtBrl(ipcaTotal)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#64748b',
              paddingLeft: '12px',
              marginBottom: '8px',
            }}
          >
            <span>IPCA+ 2029/2040/2050</span>
            <span>{privacyMode ? '••' : `${fmtPct(ipcaTotal / totalBrl)}%`}</span>
          </div>
        </div>

        {/* Renda+ */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '0px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
              Renda+ 2065
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              {privacyMode ? 'R$••••' : fmtBrl(rendaPlus)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#64748b',
              paddingLeft: '12px',
              marginBottom: '8px',
            }}
          >
            <span>Título prefixado</span>
            <span>{privacyMode ? '••' : `${fmtPct(rendaPlus / totalBrl)}%`}</span>
          </div>
        </div>

        {/* HODL11 */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '0px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
              Criptoativos (HODL11)
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              {privacyMode ? 'R$••••' : fmtBrl(hodl11)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#64748b',
              paddingLeft: '12px',
              marginBottom: '8px',
            }}
          >
            <span>Bitcoin + Crypto Legado</span>
            <span>{privacyMode ? '••' : `${fmtPct(hodl11 / totalBrl)}%`}</span>
          </div>
        </div>

        {/* Crypto Legado */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '0px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
              Crypto Legado
            </span>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
              {privacyMode ? 'R$••••' : fmtBrl(cryptoLegado)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#64748b',
              paddingLeft: '12px',
              marginBottom: '8px',
            }}
          >
            <span>Posições anteriores</span>
            <span>{privacyMode ? '••' : `${fmtPct(cryptoLegado / totalBrl)}%`}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)', margin: '14px 0' }} />

      {/* Risk note */}
      <div style={{ fontSize: '0.7rem', color: '#64748b', padding: '8px', backgroundColor: 'rgba(71, 85, 105, 0.08)', borderRadius: '4px' }}>
        <strong>📌 Nota:</strong> Concentração acima de 65% em Brasil aumenta risco de taxa (Selic), câmbio e inflação. Meta: reduzir para 50-60% via alocação internacional.
      </div>
    </div>
  );
};

export default BrasilConcentrationCard;
