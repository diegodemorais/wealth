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
    { name: 'Base', color: 'var(--purple)', data: baseScenario },
    { name: 'Aspiracional', color: 'var(--green)', data: aspirationalScenario },
  ];

  const deltaPatrimonio = aspirationalScenario.patrimonio50anos - baseScenario.patrimonio50anos;
  const deltaPatrimonioPct = baseScenario.patrimonio50anos > 0
    ? (deltaPatrimonio / baseScenario.patrimonio50anos) * 100
    : 0;
  const deltaPfire = aspirationalScenario.pfirePercentual - baseScenario.pfirePercentual;
  const deltaMeses = aspirationalScenario.mesesParaFire - baseScenario.mesesParaFire;

  const metrics = [
    { label: 'Patrimônio aos 50 anos', baseVal: baseScenario.patrimonio50anos, aspVal: aspirationalScenario.patrimonio50anos, unit: 'BRL', deltaVal: deltaPatrimonio, deltaPct: deltaPatrimonioPct },
    { label: 'P(FIRE) Sucesso', baseVal: baseScenario.pfirePercentual, aspVal: aspirationalScenario.pfirePercentual, unit: '%', deltaVal: deltaPfire, deltaPct: deltaPfire },
    { label: 'SWR no FIRE Day', baseVal: baseScenario.swrPercent, aspVal: aspirationalScenario.swrPercent, unit: '%', deltaVal: aspirationalScenario.swrPercent - baseScenario.swrPercent, deltaPct: (((aspirationalScenario.swrPercent - baseScenario.swrPercent) / baseScenario.swrPercent) * 100) || 0 },
    { label: 'Tempo até FIRE', baseVal: baseScenario.mesesParaFire / 12, aspVal: aspirationalScenario.mesesParaFire / 12, unit: 'anos', deltaVal: (aspirationalScenario.mesesParaFire - baseScenario.mesesParaFire) / 12, deltaPct: deltaMeses / 12 },
  ];

  const timeDeltaBg = deltaMeses < 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
  const timeDeltaBorder = deltaMeses < 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
  const timeDeltaColor = deltaMeses < 0 ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Comparativo de Cenários — Base vs Aspiracional
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Scenario cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
          {scenarios.map(scenario => (
            <div
              key={scenario.name}
              style={{ padding: 'var(--space-3)', borderRadius: '4px', backgroundColor: `${scenario.color}15`, border: `1px solid ${scenario.color}40` }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Cenário {scenario.name}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '4px' }}>Pat. aos 50a</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: scenario.color }}>
                    {privacyMode ? 'R$••••' : fmtBrl(scenario.data.patrimonio50anos)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '4px' }}>P(FIRE)</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: scenario.color }}>
                    {scenario.data.pfirePercentual.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '4px' }}>Tempo até FIRE</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: scenario.color }}>
                    {(scenario.data.mesesParaFire / 12).toFixed(1)} anos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Differences highlight */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Principais Diferenças</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Δ Patrimônio (aspiracional)</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--green)', marginBottom: '4px' }}>
                {privacyMode ? 'R$••••' : `+${fmtBrl(deltaPatrimonio)}`}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>+{deltaPatrimonioPct.toFixed(1)}%</div>
            </div>

            <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Δ P(FIRE)</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--green)', marginBottom: '4px' }}>+{deltaPfire.toFixed(1)}pp</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{aspirationalScenario.pfirePercentual.toFixed(1)}% vs {baseScenario.pfirePercentual.toFixed(1)}%</div>
            </div>

            <div style={{ padding: 'var(--space-3)', borderRadius: '4px', background: timeDeltaBg, border: `1px solid ${timeDeltaBorder}` }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Δ Tempo até FIRE</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px', color: timeDeltaColor }}>
                {deltaMeses < 0 ? '−' : '+'}{Math.abs(deltaMeses / 12).toFixed(1)} anos
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{deltaMeses < 0 ? 'Antecipa FIRE' : 'Adia FIRE'}</div>
            </div>
          </div>
        </div>

        {/* Expandable details table */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', cursor: 'pointer', borderTop: '1px solid var(--border)', marginTop: '12px' }}
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--text)' }}>Detalhes Completos</h3>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{expandDetails ? '▼' : '▶'}</span>
        </div>

        {expandDetails && (
          <div style={{ marginTop: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Métrica</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'rgba(168, 85, 247, 0.7)' }}>Base</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--green)' }}>Aspiracional</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Diferença</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{metric.label}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'rgba(168, 85, 247, 0.7)' }}>
                      {metric.unit === 'BRL' ? privacyMode ? 'R$••••' : (metric.baseVal / 1000000).toFixed(2) + 'M' : metric.baseVal.toFixed(1) + metric.unit}
                    </td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--green)' }}>
                      {metric.unit === 'BRL' ? privacyMode ? 'R$••••' : (metric.aspVal / 1000000).toFixed(2) + 'M' : metric.aspVal.toFixed(1) + metric.unit}
                    </td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: metric.deltaVal >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {metric.deltaVal >= 0 ? '+' : ''}
                      {metric.unit === 'BRL' ? privacyMode ? 'R$••••' : (metric.deltaVal / 1000000).toFixed(2) + 'M' : metric.deltaVal.toFixed(1) + metric.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioCompare;
