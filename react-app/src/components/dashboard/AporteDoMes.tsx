import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

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
  const [inputValue, setInputValue] = useState<string>('');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCalculate = () => {
    const adjustment = parseFloat(inputValue);
    if (!isNaN(adjustment)) {
      const result = aporteMensal + adjustment;
      setCalculatedValue(Math.max(0, result));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

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
        Aporte do Mês
      </h2>

      {/* Main metrics grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginBottom: '16px',
        }}
      >
        {/* Aporte Mensal */}
        <div style={{ padding: '10px', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Aporte Mensal
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>
            {privacyMode ? '••••' : fmtBrl(aporteMensal).replace('R$', '')}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
            {privacyMode ? 'R$••••' : fmtBrl(aporteMensal)}
          </div>
        </div>

        {/* Último Aporte */}
        <div style={{ padding: '10px', backgroundColor: 'rgba(6, 182, 212, 0.08)', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Último Aporte
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#06b6d4' }}>
            {privacyMode ? '••••' : fmtBrl(ultimoAporte).replace('R$', '').substring(0, 8)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
            {ultimoAporteData}
          </div>
        </div>
      </div>

      {/* Accumulated values */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '16px',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ padding: '6px 8px', backgroundColor: 'rgba(71, 85, 105, 0.1)', borderRadius: '4px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Acumulado Mês</div>
          <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
            {privacyMode ? 'R$••••' : fmtBrl(acumuladoMes)}
          </div>
        </div>
        <div style={{ padding: '6px 8px', backgroundColor: 'rgba(71, 85, 105, 0.1)', borderRadius: '4px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Acumulado Ano</div>
          <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
            {privacyMode ? 'R$••••' : fmtBrl(acumuladoAno)}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)', margin: '14px 0' }} />

      {/* Calculation form */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
          Simular Aporte (+/-)
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Valor em R$ (ex: +5000)"
            style={{
              flex: 1,
              padding: '8px 10px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCalculate();
              }
            }}
          />
          <button
            onClick={handleCalculate}
            style={{
              padding: '8px 14px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            Calcular
          </button>
        </div>

        {/* Result display */}
        {calculatedValue !== null && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              marginTop: '8px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Aporte Ajustado
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
              {privacyMode ? '••••' : fmtBrl(calculatedValue)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Diferença: {privacyMode ? '••••' : fmtBrl(calculatedValue - aporteMensal)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AporteDoMes;
