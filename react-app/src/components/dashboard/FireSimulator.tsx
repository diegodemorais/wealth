'use client';

import React, { useState, useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FireSimulatorProps {
  patrimonioAtual?: number;
  patrimonioGatilho?: number;
  aporteMensalBase?: number;
  custoVidaBase?: number;
  retornoEquityBase?: number;
  idadeAtual?: number;
  idadeAposentadoria?: number;
  swrGatilho?: number;
}

export function FireSimulator({
  patrimonioAtual = 3589111,
  patrimonioGatilho = 8333333,
  aporteMensalBase = 25000,
  custoVidaBase = 250000,
  retornoEquityBase = 0.0485,
  idadeAtual = 39,
  idadeAposentadoria = 53,
  swrGatilho = 0.03,
}: FireSimulatorProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Slider controls
  const [aporteMensal, setAporteMensal] = useState(aporteMensalBase);
  const [custoVidaAnual, setCustoVidaAnual] = useState(custoVidaBase);
  const [retornoEquity, setRetornoEquity] = useState(retornoEquityBase * 100); // percentage
  const [idadeRetiro, setIdadeRetiro] = useState(idadeAposentadoria);

  // Calculate results
  const results = useMemo(() => {
    const monthlySpending = custoVidaAnual / 12;
    const monthlyReturn = retornoEquity / 100 / 12;
    const yearsToRetiro = Math.max(0, idadeRetiro - idadeAtual);
    const monthsToRetiro = yearsToRetiro * 12;

    // Simple compound interest: FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
    let patrimonio = patrimonioAtual;
    for (let m = 0; m < monthsToRetiro; m++) {
      patrimonio = patrimonio * (1 + monthlyReturn) + aporteMensal;
    }

    // Calculate months to FIRE target (gateway patrimonio)
    let monthsToGateway = 0;
    let tempPatrimonio = patrimonioAtual;
    while (tempPatrimonio < patrimonioGatilho && monthsToGateway < 360) { // max 30 years
      tempPatrimonio = tempPatrimonio * (1 + monthlyReturn) + aporteMensal;
      monthsToGateway++;
    }

    // P(FIRE) calculation: can we sustain spending with SWR?
    const sustainableSpending = patrimonio * swrGatilho;
    const pfireValue = Math.min(100, (sustainableSpending / monthlySpending) * 100);

    // Sensitivity analysis: what if we change each parameter by ±10%?
    const sensitivities = {
      aporte: {
        base: pfireValue,
        plus10: calculatePfire(aporteMensal * 1.1, custoVidaAnual, retornoEquity, monthsToRetiro),
        minus10: calculatePfire(aporteMensal * 0.9, custoVidaAnual, retornoEquity, monthsToRetiro),
      },
      spending: {
        base: pfireValue,
        plus10: calculatePfire(aporteMensal, custoVidaAnual * 1.1, retornoEquity, monthsToRetiro),
        minus10: calculatePfire(aporteMensal, custoVidaAnual * 0.9, retornoEquity, monthsToRetiro),
      },
      retorno: {
        base: pfireValue,
        plus10: calculatePfire(aporteMensal, custoVidaAnual, retornoEquity + 1, monthsToRetiro),
        minus10: calculatePfire(aporteMensal, custoVidaAnual, retornoEquity - 1, monthsToRetiro),
      },
    };

    return {
      patrimonioAoRetiro: patrimonio,
      monthsToGateway,
      yearsToGateway: (monthsToGateway / 12).toFixed(1),
      pfireValue: Math.max(0, pfireValue),
      monthlySpending,
      sustainableSpending,
      sensitivities,
    };
  }, [aporteMensal, custoVidaAnual, retornoEquity, idadeRetiro, patrimonioAtual, patrimonioGatilho]);

  // Helper to calculate P(FIRE) for sensitivity
  function calculatePfire(
    aporte: number,
    spending: number,
    retorno: number,
    months: number
  ): number {
    const monthlyReturn = retorno / 100 / 12;
    const monthlySpending = spending / 12;

    let patrimonio = patrimonioAtual;
    for (let m = 0; m < months; m++) {
      patrimonio = patrimonio * (1 + monthlyReturn) + aporte;
    }

    const sustainableSpending = patrimonio * swrGatilho;
    return Math.min(100, (sustainableSpending / monthlySpending) * 100);
  }

  const pfireColor = results.pfireValue >= 90 ? '#22c55e'
    : results.pfireValue >= 70 ? '#eab308'
      : results.pfireValue >= 50 ? '#f59e0b'
        : '#ef4444';

  return (
    <div className="mb-6">
      {/* Controls Section */}
      <Card className="bg-slate-900/30 border-slate-700/25 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-200">
            FIRE Simulator — What-If Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
        {/* Aporte Mensal */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            Monthly Contribution: {privacyMode ? '••••' : fmtBrl(aporteMensal)}
          </label>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={aporteMensal}
            onChange={(e) => setAporteMensal(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-500 mt-1">
            Range: R$ 5k — R$ 100k/month
          </div>
        </div>

        {/* Spending Anual */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            Annual Spending Target: {privacyMode ? '••••' : fmtBrl(custoVidaAnual)}
          </label>
          <input
            type="range"
            min="100000"
            max="500000"
            step="10000"
            value={custoVidaAnual}
            onChange={(e) => setCustoVidaAnual(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-500 mt-1">
            Range: R$ 100k — R$ 500k/year
          </div>
        </div>

        {/* Retorno Equity */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            Expected Equity Return: {fmtPct(retornoEquity / 100, 1)}
          </label>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={retornoEquity}
            onChange={(e) => setRetornoEquity(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-500 mt-1">
            Range: 2% — 12% annual
          </div>
        </div>

        {/* Idade Retiro */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            Retirement Age: {idadeRetiro} ({idadeRetiro - idadeAtual} years from now)
          </label>
          <input
            type="range"
            min={idadeAtual}
            max={70}
            step="1"
            value={idadeRetiro}
            onChange={(e) => setIdadeRetiro(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-500"
          />
          <div className="text-xs text-slate-500 mt-1">
            Range: {idadeAtual} — 70 years old
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* P(FIRE) @ Retirement */}
        <Card className="bg-slate-900/40 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase font-semibold">
              P(FIRE) @ Retirement
            </div>
            <div className="text-2xl font-bold mb-2" style={{ color: pfireColor }}>
              {privacyMode ? '••' : fmtPct(results.pfireValue / 100, 0)}
            </div>
            <div className="h-1 bg-slate-700/15 rounded overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, results.pfireValue)}%`,
                  backgroundColor: pfireColor,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Patrimonio @ Retirement */}
        <Card className="bg-slate-900/40 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase font-semibold">
              Patrimonio @ Retirement
            </div>
            <div className="text-sm font-bold text-slate-200">
              {privacyMode ? '••••' : fmtBrl(results.patrimonioAoRetiro)}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Target: {privacyMode ? '••••' : fmtBrl(patrimonioGatilho)}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sustainability */}
        <Card className="bg-slate-900/40 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase font-semibold">
              Sustainable Monthly
            </div>
            <div className="text-sm font-bold text-slate-200">
              {privacyMode ? '••••' : fmtBrl(results.sustainableSpending)}
            </div>
            <div className="text-xs mt-1.5 font-medium" style={{
              color: results.sustainableSpending >= results.monthlySpending ? '#22c55e' : '#ef4444',
            }}>
              Target: {privacyMode ? '••••' : fmtBrl(results.monthlySpending)}
            </div>
          </CardContent>
        </Card>

        {/* Time to Target */}
        <Card className="bg-slate-900/40 border-slate-700/25">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase font-semibold">
              Time to Gateway
            </div>
            <div className="text-lg font-bold text-slate-200">
              {results.yearsToGateway}y
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {results.monthsToGateway} months
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensitivity Analysis */}
      <Card className="bg-slate-900/30 border-slate-700/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold text-slate-200">
            Sensitivity Analysis (Impact on P(FIRE))
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Contribution Sensitivity */}
          <div className="p-2.5 bg-slate-950/50 rounded text-xs">
            <div className="text-slate-500 mb-1.5 font-semibold">
              Contribution
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">-10%</span>
              <span className="font-semibold" style={{ color: results.sensitivities.aporte.minus10 >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.aporte.minus10 / 100, 0)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Base</span>
              <span className="font-semibold" style={{ color: results.sensitivities.aporte.base >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.aporte.base / 100, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">+10%</span>
              <span className="font-semibold" style={{ color: results.sensitivities.aporte.plus10 >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.aporte.plus10 / 100, 0)}
              </span>
            </div>
          </div>

          {/* Spending Sensitivity */}
          <div className="p-2.5 bg-slate-950/50 rounded text-xs">
            <div className="text-slate-500 mb-1.5 font-semibold">
              Spending
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">-10%</span>
              <span className="font-semibold" style={{ color: results.sensitivities.spending.minus10 >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.spending.minus10 / 100, 0)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Base</span>
              <span className="font-semibold" style={{ color: results.sensitivities.spending.base >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.spending.base / 100, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">+10%</span>
              <span className="font-semibold" style={{ color: results.sensitivities.spending.plus10 >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.spending.plus10 / 100, 0)}
              </span>
            </div>
          </div>

          {/* Return Sensitivity */}
          <div className="p-2.5 bg-slate-950/50 rounded text-xs">
            <div className="text-slate-500 mb-1.5 font-semibold">
              Market Return
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">-1%</span>
              <span className="font-semibold" style={{ color: results.sensitivities.retorno.minus10 >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.retorno.minus10 / 100, 0)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Base</span>
              <span className="font-semibold" style={{ color: results.sensitivities.retorno.base >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.retorno.base / 100, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">+1%</span>
              <span className="font-semibold" style={{ color: results.sensitivities.retorno.plus10 >= 90 ? '#22c55e' : '#f59e0b' }}>
                {fmtPct(results.sensitivities.retorno.plus10 / 100, 0)}
              </span>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
