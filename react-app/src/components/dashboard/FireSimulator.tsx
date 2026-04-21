'use client';

// NOTE: orphan component — not rendered in any page.
// Prop defaults below are UX fallbacks only. When this component is wired
// into a page, always pass real values from useDashboardStore / data props.
// Do NOT update numeric defaults here — change carteira.md instead.

import React, { useState, useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';
import { pfireColor as pfireColorFn } from '@/utils/fire';

interface FireSimulatorProps {
  patrimonioAtual?: number;
  patrimonioGatilho?: number;
  aporteMensalBase?: number;   // fallback only — pass from store/data
  custoVidaBase?: number;      // fallback only — pass from store/data
  retornoEquityBase?: number;  // fallback only — pass from store/data
  idadeAtual?: number;         // fallback only — pass from store/data
  idadeAposentadoria?: number; // fallback only — pass from store/data
  swrGatilho?: number;         // fallback only — pass from store/data
}

export function FireSimulator({
  patrimonioAtual = 0,
  patrimonioGatilho = 0,
  aporteMensalBase = 25000,    // R$25k/mês — carteira.md aporte_mensal
  custoVidaBase = 250000,      // R$250k/ano — spending smile go-go
  retornoEquityBase = 0.0485,  // 4.85% real — carteira.md retorno_equity_real
  idadeAtual = 39,             // carteira.md idade_atual
  idadeAposentadoria = 53,     // carteira.md idade_cenario_base
  swrGatilho = 0.03,           // 3.0% — carteira.md swr_gatilho
}: FireSimulatorProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const [aporteMensal, setAporteMensal] = useState(aporteMensalBase);
  const [custoVidaAnual, setCustoVidaAnual] = useState(custoVidaBase);
  const [retornoEquity, setRetornoEquity] = useState(retornoEquityBase * 100);
  const [idadeRetiro, setIdadeRetiro] = useState(idadeAposentadoria);

  function calculatePfire(aporte: number, spending: number, retorno: number, months: number): number {
    const monthlyReturn = retorno / 100 / 12;
    const monthlySpending = spending / 12;
    let patrimonio = patrimonioAtual;
    for (let m = 0; m < months; m++) {
      patrimonio = patrimonio * (1 + monthlyReturn) + aporte;
    }
    const sustainableSpending = patrimonio * swrGatilho;
    return Math.min(100, (sustainableSpending / monthlySpending) * 100);
  }

  const results = useMemo(() => {
    const monthlySpending = custoVidaAnual / 12;
    const monthlyReturn = retornoEquity / 100 / 12;
    const yearsToRetiro = Math.max(0, idadeRetiro - idadeAtual);
    const monthsToRetiro = yearsToRetiro * 12;

    let patrimonio = patrimonioAtual;
    for (let m = 0; m < monthsToRetiro; m++) {
      patrimonio = patrimonio * (1 + monthlyReturn) + aporteMensal;
    }

    let monthsToGateway = 0;
    let tempPatrimonio = patrimonioAtual;
    while (tempPatrimonio < patrimonioGatilho && monthsToGateway < 360) {
      tempPatrimonio = tempPatrimonio * (1 + monthlyReturn) + aporteMensal;
      monthsToGateway++;
    }

    const sustainableSpending = patrimonio * swrGatilho;
    const pfireValue = Math.min(100, (sustainableSpending / monthlySpending) * 100);

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

  const pfireColor = pfireColorFn(results.pfireValue);

  const metricCard = (bg: string, border: string) => ({
    background: bg, border: `1px solid ${border}`, borderRadius: '4px', padding: 'var(--space-5)',
  });

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Controls Section */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
        <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
          FIRE Simulator — What-If Analysis
        </h2>

        {/* Aporte Mensal */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            Monthly Contribution: {privacyMode ? '••••' : fmtBrl(aporteMensal)}
          </label>
          <input
            type="range" min="5000" max="100000" step="5000"
            value={aporteMensal}
            onChange={(e) => setAporteMensal(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>Range: R$ 5k — R$ 100k/month</div>
        </div>

        {/* Spending Anual */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            Annual Spending Target: {privacyMode ? '••••' : fmtBrl(custoVidaAnual)}
          </label>
          <input
            type="range" min="100000" max="500000" step="10000"
            value={custoVidaAnual}
            onChange={(e) => setCustoVidaAnual(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>Range: R$ 100k — R$ 500k/year</div>
        </div>

        {/* Retorno Equity */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            Expected Equity Return: {fmtPct(retornoEquity / 100, 1)}
          </label>
          <input
            type="range" min="2" max="12" step="0.5"
            value={retornoEquity}
            onChange={(e) => setRetornoEquity(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>Range: 2% — 12% annual</div>
        </div>

        {/* Idade Retiro */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            Retirement Age: {idadeRetiro} ({idadeRetiro - idadeAtual} years from now)
          </label>
          <input
            type="range" min={idadeAtual} max={70} step="1"
            value={idadeRetiro}
            onChange={(e) => setIdadeRetiro(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>Range: {idadeAtual} — 70 years old</div>
        </div>
      </div>

      {/* Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: '16px' }}>
        <div style={{ ...metricCard('var(--card)', 'var(--border)'), padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
            P(FIRE) @ Retirement
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '8px', color: pfireColor }}>
            {privacyMode ? '••%' : fmtPct(results.pfireValue / 100, 0)}
          </div>
          <div style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, results.pfireValue)}%`, height: '100%', backgroundColor: pfireColor, transition: 'width 0.3s' }} />
          </div>
        </div>

        <div style={{ ...metricCard('var(--card)', 'var(--border)'), padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
            Patrimonio @ Retirement
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
            {privacyMode ? '••••' : fmtBrl(results.patrimonioAoRetiro)}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '6px' }}>
            Target: {privacyMode ? '••••' : fmtBrl(patrimonioGatilho)}
          </div>
        </div>

        <div style={{ ...metricCard('var(--card)', 'var(--border)'), padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
            Sustainable Monthly
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
            {privacyMode ? '••••' : fmtBrl(results.sustainableSpending)}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', marginTop: '6px', fontWeight: 500, color: results.sustainableSpending >= results.monthlySpending ? 'var(--green)' : 'var(--red)' }}>
            Target: {privacyMode ? '••••' : fmtBrl(results.monthlySpending)}
          </div>
        </div>

        <div style={{ ...metricCard('var(--card)', 'var(--border)'), padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
            Time to Gateway
          </div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)' }}>
            {results.yearsToGateway}y
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>
            {results.monthsToGateway} months
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
          Sensitivity Analysis (Impact on P(FIRE))
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {[
            { title: 'Contribution', key: 'aporte' as const, labels: ['-10%', 'Base', '+10%'] },
            { title: 'Spending', key: 'spending' as const, labels: ['-10%', 'Base', '+10%'] },
            { title: 'Market Return', key: 'retorno' as const, labels: ['-1%', 'Base', '+1%'] },
          ].map(({ title, key, labels }) => (
            <div key={key} style={{ padding: '10px', background: 'var(--bg)', borderRadius: '4px', fontSize: 'var(--text-sm)' }}>
              <div style={{ color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>{title}</div>
              {[
                { label: labels[0], val: results.sensitivities[key].minus10 },
                { label: labels[1], val: results.sensitivities[key].base },
                { label: labels[2], val: results.sensitivities[key].plus10 },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: pfireColorFn(val) }}>
                    {fmtPct(val / 100, 0)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
