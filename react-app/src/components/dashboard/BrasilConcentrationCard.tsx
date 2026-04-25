import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface BrasilConcentrationCardProps {
  // DEV-coe-hodl11-classificacao: hodl11 removido do brasil (agora é cripto global)
  coeNet: number;
  ipcaTotal: number;
  rendaPlus: number;
  cryptoLegado: number;
  totalBrl: number;          // brasil total (RF + COE + crypto_legado)
  concentrationBrazil: number; // brasil_pct / 100
}

const BrasilConcentrationCard: React.FC<BrasilConcentrationCardProps> = ({
  coeNet,
  ipcaTotal,
  rendaPlus,
  cryptoLegado,
  totalBrl,
  concentrationBrazil,
}) => {
  const { privacyMode } = useUiStore();

  const fmtPct = (val: number) => {
    if (!totalBrl) return '0.0';
    return (val / totalBrl * 100).toFixed(1);
  };

  const concentrationColor = concentrationBrazil > 0.65 ? 'var(--red)' : concentrationBrazil > 0.55 ? 'var(--yellow)' : 'var(--green)';
  const concentrationBg = concentrationBrazil > 0.65
    ? 'rgba(239, 68, 68, 0.1)'
    : concentrationBrazil > 0.55
    ? 'rgba(234, 179, 8, 0.1)'
    : 'rgba(34, 197, 94, 0.1)';

  const rowStyle: React.CSSProperties = { marginBottom: '12px' };
  const labelStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' };
  const subStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--muted)', paddingLeft: '12px', marginBottom: '8px' };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Brasil Concentration Risk
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Main concentration metric */}
        <div style={{ padding: 'var(--space-3)', borderRadius: '4px', textAlign: 'center', backgroundColor: concentrationBg, border: `1px solid ${concentrationColor}` }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Brasil Concentration
          </div>
          <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: '4px', color: concentrationColor }}>
            {`${(concentrationBrazil * 100).toFixed(1)}%`}
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
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
            Composição Brasil (RF Soberano + COE)
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>Renda Fixa (IPCA+ Ladder)</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 600 }}>{fmtPrivacy(ipcaTotal, privacyMode)}</span>
            </div>
            <div style={subStyle}>
              <span>IPCA+ 2029/2040/2050</span>
              <span>{`${fmtPct(ipcaTotal)}%`}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={labelStyle}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>Renda+ 2065</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 600 }}>{fmtPrivacy(rendaPlus, privacyMode)}</span>
            </div>
            <div style={subStyle}>
              <span>Título prefixado</span>
              <span>{`${fmtPct(rendaPlus)}%`}</span>
            </div>
          </div>

          {coeNet > 0 && (
            <div style={rowStyle}>
              <div style={labelStyle}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>COE XP (estruturado)</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 600 }}>{fmtPrivacy(coeNet, privacyMode)}</span>
              </div>
              <div style={subStyle}>
                <span>COE XP0121A3C3W net (ativo – empréstimo)</span>
                <span>{`${fmtPct(coeNet)}%`}</span>
              </div>
            </div>
          )}

          {cryptoLegado > 0 && (
            <div style={rowStyle}>
              <div style={labelStyle}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>Crypto Legado</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 600 }}>{fmtPrivacy(cryptoLegado, privacyMode)}</span>
              </div>
              <div style={subStyle}>
                <span>Posições anteriores</span>
                <span>{`${fmtPct(cryptoLegado)}%`}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* Risk note */}
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', padding: '8px 12px', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Nota:</strong> Brasil = RF Tesouro Direto + COE XP. Cripto = HODL11 (BTC wrapper B3) + Binance legado (BTC/ETH/BNB). Nenhum cripto conta como soberano BR.
        </div>
      </div>
    </div>
  );
};

export default BrasilConcentrationCard;
