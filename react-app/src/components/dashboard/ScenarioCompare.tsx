import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // Color helpers
  const baseScenarioColor = '#8b5cf6';
  const aspirationalColor = '#22c55e';
  const timeDeltaColor = deltaMeses < 0 ? 'bg-green-500/10 border-green-500/25' : 'bg-red-500/10 border-red-500/25';
  const timeDeltaTextColor = deltaMeses < 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Comparativo de Cenários — Base vs Aspiracional
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Scenario cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map(scenario => (
            <div
              key={scenario.name}
              className="p-3 rounded border"
              style={{ backgroundColor: `${scenario.color}15`, borderColor: `${scenario.color}40` }}
            >
              <div className="text-xs text-slate-400 mb-2 uppercase font-semibold">
                Cenário {scenario.name}
              </div>

              <div className="flex flex-col gap-2">
                {/* Patrimonio */}
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Pat. aos 50a
                  </div>
                  <div className="text-sm font-bold" style={{ color: scenario.color }}>
                    {privacyMode ? 'R$••••' : fmtBrl(scenario.data.patrimonio50anos)}
                  </div>
                </div>

                {/* P(FIRE) */}
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    P(FIRE)
                  </div>
                  <div className="text-sm font-bold" style={{ color: scenario.color }}>
                    {scenario.data.pfirePercentual.toFixed(1)}%
                  </div>
                </div>

                {/* Meses até FIRE */}
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Tempo até FIRE
                  </div>
                  <div className="text-sm font-bold" style={{ color: scenario.color }}>
                    {(scenario.data.mesesParaFire / 12).toFixed(1)} anos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Differences highlight */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Principais Diferenças
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Delta Patrimonio */}
            <div className="p-3 bg-green-500/10 border border-green-500/25 rounded">
              <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                Δ Patrimônio (aspiracional)
              </div>
              <div className="text-base font-bold text-green-500 mb-1">
                {privacyMode ? 'R$••••' : `+${fmtBrl(deltaPatrimonio)}`}
              </div>
              <div className="text-xs text-slate-500">
                +{deltaPatrimonioPct.toFixed(1)}%
              </div>
            </div>

            {/* Delta P(FIRE) */}
            <div className="p-3 bg-green-500/10 border border-green-500/25 rounded">
              <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                Δ P(FIRE)
              </div>
              <div className="text-base font-bold text-green-500 mb-1">
                +{deltaPfire.toFixed(1)}pp
              </div>
              <div className="text-xs text-slate-500">
                {aspirationalScenario.pfirePercentual.toFixed(1)}% vs {baseScenario.pfirePercentual.toFixed(1)}%
              </div>
            </div>

            {/* Delta Tempo */}
            <div className={`p-3 rounded border ${timeDeltaColor}`}>
              <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
                Δ Tempo até FIRE
              </div>
              <div className={`text-base font-bold mb-1 ${timeDeltaTextColor}`}>
                {deltaMeses < 0 ? '−' : '+'}{Math.abs(deltaMeses / 12).toFixed(1)} anos
              </div>
              <div className="text-xs text-slate-500">
                {deltaMeses < 0 ? 'Antecipa FIRE' : 'Adia FIRE'}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable details table */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer border-t border-slate-700/15 mt-3"
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 className="text-sm font-semibold m-0 text-slate-200">
            Detalhes Completos
          </h3>
          <span className="text-xs text-slate-400">
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-slate-700/25 text-slate-400 font-semibold">
                    Métrica
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 font-semibold text-violet-500">
                    Base
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 font-semibold text-green-500">
                    Aspiracional
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    Diferença
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border-b border-slate-700/15 text-slate-200">
                      {metric.label}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 font-semibold text-violet-500">
                      {metric.unit === 'BRL'
                        ? privacyMode
                          ? 'R$••••'
                          : (metric.baseVal / 1000000).toFixed(2) + 'M'
                        : metric.baseVal.toFixed(1) + metric.unit}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 font-semibold text-green-500">
                      {metric.unit === 'BRL'
                        ? privacyMode
                          ? 'R$••••'
                          : (metric.aspVal / 1000000).toFixed(2) + 'M'
                        : metric.aspVal.toFixed(1) + metric.unit}
                    </td>
                    <td className={`text-right p-2 border-b border-slate-700/15 font-semibold ${metric.deltaVal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
      </CardContent>
    </Card>
  );
};

export default ScenarioCompare;
