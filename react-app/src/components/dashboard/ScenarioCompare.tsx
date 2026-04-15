import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface ScenarioData {
  patrimonio50anos: number;
  pfirePercentual: number;
  swrPercent: number;
  mesesParaFire: number;
}

interface ScenarioCompareProps {
  baseScenario: ScenarioData;
  aspirationalScenario: ScenarioData;
  currentPatrimonio: number;
}

const ScenarioCompare: React.FC<ScenarioCompareProps> = ({
  baseScenario,
  aspirationalScenario,
  currentPatrimonio,
}) => {
  const { privacyMode } = useUiStore();
  const [expandDetails, setExpandDetails] = useState(false);

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const scenarios = [
    {
      name: 'Base',
      color: '#8b5cf6',
      data: baseScenario,
    },
    {
      name: 'Aspiracional',
      color: '#22c55e',
      data: aspirationalScenario,
    },
  ];

  const deltaPatrimonio = aspirationalScenario.patrimonio50anos - baseScenario.patrimonio50anos;
  const deltaPatrimonioPct = baseScenario.patrimonio50anos > 0
    ? (deltaPatrimonio / baseScenario.patrimonio50anos) * 100
    : 0;
  const deltaPfire = aspirationalScenario.pfirePercentual - baseScenario.pfirePercentual;
  const deltaMeses = aspirationalScenario.mesesParaFire - baseScenario.mesesParaFire;

  const metrics = [
    {
      label: 'Patrimônio aos 50 anos',
      baseVal: baseScenario.patrimonio50anos,
      aspVal: aspirationalScenario.patrimonio50anos,
      unit: 'BRL',
      deltaVal: deltaPatrimonio,
      deltaPct: deltaPatrimonioPct,
    },
    {
      label: 'P(FIRE) Sucesso',
      baseVal: baseScenario.pfirePercentual,
      aspVal: aspirationalScenario.pfirePercentual,
      unit: '%',
      deltaVal: deltaPfire,
      deltaPct: deltaPfire,
    },
    {
      label: 'SWR no FIRE Day',
      baseVal: baseScenario.swrPercent,
      aspVal: aspirationalScenario.swrPercent,
      unit: '%',
      deltaVal: aspirationalScenario.swrPercent - baseScenario.swrPercent,
      deltaPct: (((aspirationalScenario.swrPercent - baseScenario.swrPercent) / baseScenario.swrPercent) * 100) || 0,
    },
    {
      label: 'Tempo até FIRE',
      baseVal: baseScenario.mesesParaFire / 12,
      aspVal: aspirationalScenario.mesesParaFire / 12,
      unit: 'anos',
      deltaVal: (aspirationalScenario.mesesParaFire - baseScenario.mesesParaFire) / 12,
      deltaPct: deltaMeses / 12,
    },
  ];

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
        Comparativo de Cenários — Base vs Aspiracional
      </h2>

      {/* Scenario cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {scenarios.map(scenario => (
          <div
            key={scenario.name}
            style={{
              padding: '12px',
              backgroundColor: `${scenario.color}10`,
              border: `1px solid ${scenario.color}40`,
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
              Cenário {scenario.name}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Patrimonio */}
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
                  Pat. aos 50a
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: scenario.color }}>
                  {privacyMode ? 'R$••••' : fmtBrl(scenario.data.patrimonio50anos)}
                </div>
              </div>

              {/* P(FIRE) */}
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
                  P(FIRE)
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: scenario.color }}>
                  {scenario.data.pfirePercentual.toFixed(1)}%
                </div>
              </div>

              {/* Meses até FIRE */}
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
                  Tempo até FIRE
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: scenario.color }}>
                  {(scenario.data.mesesParaFire / 12).toFixed(1)} anos
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Differences highlight */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Principais Diferenças
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >
          {/* Delta Patrimonio */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e40',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Δ Patrimônio (aspiracional)
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>
              {privacyMode ? 'R$••••' : `+${fmtBrl(deltaPatrimonio)}`}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              +{deltaPatrimonioPct.toFixed(1)}%
            </div>
          </div>

          {/* Delta P(FIRE) */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e40',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Δ P(FIRE)
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>
              +{deltaPfire.toFixed(1)}pp
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              {aspirationalScenario.pfirePercentual.toFixed(1)}% vs {baseScenario.pfirePercentual.toFixed(1)}%
            </div>
          </div>

          {/* Delta Tempo */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: deltaMeses < 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: deltaMeses < 0 ? '1px solid #22c55e40' : '1px solid #ef444440',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Δ Tempo até FIRE
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: deltaMeses < 0 ? '#22c55e' : '#ef4444',
                marginBottom: '2px',
              }}
            >
              {deltaMeses < 0 ? '−' : '+'}{Math.abs(deltaMeses / 12).toFixed(1)} anos
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
              {deltaMeses < 0 ? 'Antecipa FIRE' : 'Adia FIRE'}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable details table */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          paddingTop: '14px',
          borderTop: '1px solid rgba(71, 85, 105, 0.15)',
        }}
        onClick={() => setExpandDetails(!expandDetails)}
      >
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#cbd5e1' }}>
          Detalhes Completos
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {expandDetails ? '▼' : '▶'}
        </span>
      </div>

      {expandDetails && (
        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  Métrica
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#8b5cf6',
                    fontWeight: 700,
                  }}
                >
                  Base
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#22c55e',
                    fontWeight: 700,
                  }}
                >
                  Aspiracional
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  Diferença
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#cbd5e1',
                    }}
                  >
                    {metric.label}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#8b5cf6',
                      fontWeight: 600,
                    }}
                  >
                    {metric.unit === 'BRL'
                      ? privacyMode
                        ? 'R$••••'
                        : (metric.baseVal / 1000000).toFixed(2) + 'M'
                      : metric.baseVal.toFixed(1) + metric.unit}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#22c55e',
                      fontWeight: 600,
                    }}
                  >
                    {metric.unit === 'BRL'
                      ? privacyMode
                        ? 'R$••••'
                        : (metric.aspVal / 1000000).toFixed(2) + 'M'
                      : metric.aspVal.toFixed(1) + metric.unit}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: metric.deltaVal >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    {metric.deltaVal >= 0 ? '+' : ''}
                    {metric.unit === 'BRL'
                      ? privacyMode
                        ? 'R$••••'
                        : (metric.deltaVal / 1000000).toFixed(2) + 'M'
                      : metric.deltaVal.toFixed(1) + metric.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScenarioCompare;
