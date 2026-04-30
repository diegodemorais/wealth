'use client';

import { useEffect, useState } from 'react';
import { BRFireSimChart } from '@/components/charts/BRFireSimChart';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Types inline — single consumer
interface BRFireSimCycleResult {
  sucesso: boolean;
  saldo_final: number;
  min_saldo: number;
}

interface BRFireSimCycle {
  ano_inicio: number;
  duracao_anos: number;
  resultados_swr: Record<string, BRFireSimCycleResult>;
}

interface BRFireSimResult {
  _generated: string;
  data_range: { inicio: string; fim: string };
  config: {
    patrimonio_inicial: number;
    custo_vida_anual: number;
    window_anos: number;
    swr_rates: number[];
    equity_alloc: number;
  };
  cycles: BRFireSimCycle[];
  resumo: Record<string, number>;
  series: { datas: string[]; retornos_equity_brl_pct: number[]; ipca_mensal_pct: number[] };
  _fontes: Record<string, string>;
  _caveat: string;
}

const SWR_KEYS = ['3pct', '4pct', '6pct', '8pct'] as const;
const SWR_LABELS: Record<string, string> = {
  '3pct': 'SWR 3% (Fat FIRE)',
  '4pct': 'SWR 4% (FIRE)',
  '6pct': 'SWR 6% (Lean FIRE)',
  '8pct': 'SWR 8% (Barista FIRE)',
};
const SWR_COLORS: Record<string, string> = {
  '3pct': 'var(--green)',
  '4pct': 'var(--accent)',
  '6pct': 'var(--yellow)',
  '8pct': 'var(--red)',
};

function useBRFireSim(): { data: BRFireSimResult | null; error: string | null; loading: boolean } {
  const [data, setData] = useState<BRFireSimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_PATH}/brfiresim_results.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(() => setError('JSON not found'))
      .finally(() => setLoading(false));
  }, []);

  return { data, error, loading };
}

function KpiCard({ label, n_sucesso, n_total, color }: {
  label: string; n_sucesso: number; n_total: number; color: string;
}) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        minWidth: 120,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{n_sucesso}/{n_total}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)' }}>ciclos históricos</div>
    </div>
  );
}

export function BRFireSimSection() {
  const { data, error, loading } = useBRFireSim();

  if (loading) {
    return (
      <div data-testid="brfiresim-section" style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--muted)' }}>
        Carregando dados históricos...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div data-testid="brfiresim-section" style={{ padding: '16px', background: 'color-mix(in srgb, var(--yellow) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--yellow) 30%, transparent)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Dados não disponíveis</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Run <code>python scripts/brfiresim.py</code> to generate historical cycle data.
        </div>
      </div>
    );
  }

  const n = data.resumo.n_ciclos ?? 0;

  return (
    <div data-testid="brfiresim-section" style={{ padding: '0 0 16px' }}>
      {/* Caveat badge — prominent per spec */}
      <div style={{
        margin: '0 16px 14px',
        padding: '10px 14px',
        background: 'color-mix(in srgb, var(--yellow) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--yellow) 35%, transparent)',
        borderRadius: 'var(--radius-md)',
        fontSize: 12,
        color: 'var(--muted)',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--yellow)' }}>⚠ Sanity check only.</strong>{' '}
        {data._caveat}
        {data._fontes._nota_proxy && (
          <div style={{ marginTop: 6, fontSize: 11, fontStyle: 'italic' }}>
            Equity proxy: {data._fontes.equity_brl}
          </div>
        )}
      </div>

      {/* KPI cards — "X de N ciclos históricos" NOT "X% de chance" */}
      <div data-testid="brfiresim-summary" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 16px', marginBottom: 14 }}>
        {SWR_KEYS.map(key => (
          <KpiCard
            key={key}
            label={SWR_LABELS[key]}
            n_sucesso={data.resumo[`n_sucesso_${key}`] ?? 0}
            n_total={n}
            color={SWR_COLORS[key]}
          />
        ))}
      </div>

      {/* Chart */}
      <div data-testid="brfiresim-chart" style={{ padding: '0 16px', marginBottom: 14 }}>
        <BRFireSimChart cycles={data.cycles} />
      </div>

      {/* Cycle detail table */}
      <div style={{ padding: '0 16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ciclo</th>
              {SWR_KEYS.map(key => (
                <th key={key} style={{ textAlign: 'center', padding: '6px 8px', color: SWR_COLORS[key], fontWeight: 600 }}>
                  {key.replace('pct', '%')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.cycles.map(cycle => (
              <tr key={cycle.ano_inicio} style={{ borderBottom: '1px solid var(--card2)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                  {cycle.ano_inicio}–{cycle.ano_inicio + cycle.duracao_anos - 1}
                </td>
                {SWR_KEYS.map(key => {
                  const r = cycle.resultados_swr?.[key];
                  return (
                    <td key={key} style={{ textAlign: 'center', padding: '6px 8px' }}>
                      {r?.sucesso ? (
                        <span style={{ color: SWR_COLORS[key], fontWeight: 700 }}>
                          ✓ {(r.saldo_final / 1e6).toFixed(1)}M
                        </span>
                      ) : (
                        <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗ Falhou</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ margin: '10px 16px 0', fontSize: 10, color: 'var(--muted)' }}>
        Gerado em: {new Date(data._generated).toLocaleString('pt-BR')} ·
        Dados: {data.data_range.inicio} → {data.data_range.fim} ·
        Janela: {data.config.window_anos} anos
      </div>
    </div>
  );
}
