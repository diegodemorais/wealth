'use client';

import React, { useState, useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';

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
    <div style={{ marginBottom: '24px' }}>
      {/* Title */}
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#cbd5e1',
      }}>
        FIRE Simulator — What-If Analysis
      </h3>

      {/* Controls Section */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
      }}>
        {/* Aporte Mensal */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#cbd5e1',
            marginBottom: '8px',
          }}>
            Monthly Contribution: {privacyMode ? '••••' : fmtBrl(aporteMensal)}
          </label>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={aporteMensal}
            onChange={(e) => setAporteMensal(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            Range: R$ 5k — R$ 100k/month
          </div>
        </div>

        {/* Spending Anual */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#cbd5e1',
            marginBottom: '8px',
          }}>
            Annual Spending Target: {privacyMode ? '••••' : fmtBrl(custoVidaAnual)}
          </label>
          <input
            type="range"
            min="100000"
            max="500000"
            step="10000"
            value={custoVidaAnual}
            onChange={(e) => setCustoVidaAnual(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            Range: R$ 100k — R$ 500k/year
          </div>
        </div>

        {/* Retorno Equity */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#cbd5e1',
            marginBottom: '8px',
          }}>
            Expected Equity Return: {fmtPct(retornoEquity / 100, 1)}
          </label>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={retornoEquity}
            onChange={(e) => setRetornoEquity(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            Range: 2% — 12% annual
          </div>
        </div>

        {/* Idade Retiro */}
        <div style={{ marginBottom: '0' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#cbd5e1',
            marginBottom: '8px',
          }}>
            Retirement Age: {idadeRetiro} ({idadeRetiro - idadeAtual} years from now)
          </label>
          <input
            type="range"
            min={idadeAtual}
            max={70}
            step="1"
            value={idadeRetiro}
            onChange={(e) => setIdadeRetiro(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            Range: {idadeAtual} — 70 years old
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* P(FIRE) @ Retirement */}
        <div style={{
          padding: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(71, 85, 105, 0.25)',
        }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            P(FIRE) @ Retirement
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: pfireColor,
            marginBottom: '4px',
          }}>
            {privacyMode ? '••' : fmtPct(results.pfireValue / 100, 0)}
          </div>
          <div style={{
            height: '4px',
            backgroundColor: 'rgba(71, 85, 105, 0.15)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, results.pfireValue)}%`,
              backgroundColor: pfireColor,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Patrimonio @ Retirement */}
        <div style={{
          padding: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(71, 85, 105, 0.25)',
        }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Patrimonio @ Retirement
          </div>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#cbd5e1',
          }}>
            {privacyMode ? '••••' : fmtBrl(results.patrimonioAoRetiro)}
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginTop: '6px',
          }}>
            Target: {privacyMode ? '••••' : fmtBrl(patrimonioGatilho)}
          </div>
        </div>

        {/* Monthly Sustainability */}
        <div style={{
          padding: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(71, 85, 105, 0.25)',
        }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Sustainable Monthly
          </div>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#cbd5e1',
          }}>
            {privacyMode ? '••••' : fmtBrl(results.sustainableSpending)}
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: results.sustainableSpending >= results.monthlySpending ? '#22c55e' : '#ef4444',
            marginTop: '6px',
            fontWeight: 500,
          }}>
            Target: {privacyMode ? '••••' : fmtBrl(results.monthlySpending)}
          </div>
        </div>

        {/* Time to Target */}
        <div style={{
          padding: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(71, 85, 105, 0.25)',
        }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Time to Gateway
          </div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#cbd5e1',
          }}>
            {results.yearsToGateway}y
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginTop: '4px',
          }}>
            {results.monthsToGateway} months
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
      }}>
        <h4 style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#cbd5e1',
          marginBottom: '12px',
          marginTop: 0,
        }}>
          Sensitivity Analysis (Impact on P(FIRE))
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {/* Contribution Sensitivity */}
          <div style={{
            padding: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '6px',
            fontSize: '0.75rem',
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
              Contribution
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
            }}>
              <span style={{ color: '#94a3b8' }}>-10%</span>
              <span style={{ color: results.sensitivities.aporte.minus10 >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.aporte.minus10 / 100, 0)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
            }}>
              <span style={{ color: '#94a3b8' }}>Base</span>
              <span style={{ color: results.sensitivities.aporte.base >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.aporte.base / 100, 0)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span style={{ color: '#94a3b8' }}>+10%</span>
              <span style={{ color: results.sensitivities.aporte.plus10 >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.aporte.plus10 / 100, 0)}
              </span>
            </div>
          </div>

          {/* Spending Sensitivity */}
          <div style={{
            padding: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '6px',
            fontSize: '0.75rem',
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
              Spending
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
            }}>
              <span style={{ color: '#94a3b8' }}>-10%</span>
              <span style={{ color: results.sensitivities.spending.minus10 >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.spending.minus10 / 100, 0)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
            }}>
              <span style={{ color: '#94a3b8' }}>Base</span>
              <span style={{ color: results.sensitivities.spending.base >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.spending.base / 100, 0)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span style={{ color: '#94a3b8' }}>+10%</span>
              <span style={{ color: results.sensitivities.spending.plus10 >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.spending.plus10 / 100, 0)}
              </span>
            </div>
          </div>

          {/* Return Sensitivity */}
          <div style={{
            padding: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '6px',
            fontSize: '0.75rem',
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
              Market Return
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
            }}>
              <span style={{ color: '#94a3b8' }}>-1%</span>
              <span style={{ color: results.sensitivities.retorno.minus10 >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.retorno.minus10 / 100, 0)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '3px',
            }}>
              <span style={{ color: '#94a3b8' }}>Base</span>
              <span style={{ color: results.sensitivities.retorno.base >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.retorno.base / 100, 0)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span style={{ color: '#94a3b8' }}>+1%</span>
              <span style={{ color: results.sensitivities.retorno.plus10 >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {fmtPct(results.sensitivities.retorno.plus10 / 100, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
