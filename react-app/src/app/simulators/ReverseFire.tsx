'use client';

import { useState, useMemo } from 'react';
import { Slider } from '@/components/primitives/Slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import { EChartsOption } from 'echarts';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type Perfil = 'essencial' | 'moderado' | 'balanceado' | 'confortavel' | 'affluente' | 'premium';
type Mercado = 'base' | 'bull';

interface PerfilConfig {
  label: string;
  gasto_anual: number;
}

interface MercadoConfig {
  label: string;
  retorno_anual: number; // as percentage (4.85, 6.0)
}

// ── Constants ────────────────────────────────────────────────────────────────

const PERFIS: Record<Perfil, PerfilConfig> = {
  essencial: { label: 'Essencial', gasto_anual: 120000 },
  moderado: { label: 'Moderado', gasto_anual: 180000 },
  balanceado: { label: 'Balanceado', gasto_anual: 240000 },
  confortavel: { label: 'Confortável', gasto_anual: 360000 },
  affluente: { label: 'Affluente', gasto_anual: 480000 },
  premium: { label: 'Premium', gasto_anual: 720000 },
};

const MERCADOS: Record<Mercado, MercadoConfig> = {
  base: { label: 'Base (4.85%)', retorno_anual: 4.85 },
  bull: { label: 'Bull (6.0%)', retorno_anual: 6.0 },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a number as R$ with thousands separator, no decimals.
 * Round to nearest R$100.
 */
function fmtBRL(value: number): string {
  const rounded = Math.round(value / 100) * 100;
  return `R$ ${rounded.toLocaleString('pt-BR')}`;
}

/**
 * Calculate reverse FIRE: aporte mensal needed to reach target patrimonio
 *
 * Formula:
 *   r_m = (1 + r_anual)^(1/12) - 1
 *   patrimonio_alvo = gasto_anual / swr
 *   fator = (1 + r_m)^meses
 *   aporte = (patrimonio_alvo - patrimonio_atual * fator) / ((fator - 1) / r_m)
 */
function calcReverseFireAporte(
  patrimonio_atual: number,
  idade_atual: number,
  idade_fire: number,
  gasto_anual: number,
  retorno_anual_pct: number,
  swr_pct: number
): {
  patrimonio_alvo: number;
  aporte_mensal: number;
  meses: number;
} {
  const retorno_anual = retorno_anual_pct / 100;
  const swr = swr_pct / 100;
  const meses = (idade_fire - idade_atual) * 12;

  const patrimonio_alvo = gasto_anual / swr;

  // Monthly return
  const r_m = Math.pow(1 + retorno_anual, 1 / 12) - 1;

  // Future value factor
  const fator = Math.pow(1 + r_m, meses);

  // Aporte mensal
  let aporte_mensal: number;
  if (Math.abs(r_m) < 1e-10) {
    // Edge case: r_m ≈ 0
    aporte_mensal = (patrimonio_alvo - patrimonio_atual) / meses;
  } else {
    const numerador = patrimonio_alvo - patrimonio_atual * fator;
    const denominador = (fator - 1) / r_m;
    aporte_mensal = numerador / denominador;
  }

  return {
    patrimonio_alvo,
    aporte_mensal,
    meses,
  };
}

/**
 * Build array of wealth growth year-by-year
 */
function buildWealthGrowthData(
  patrimonio_atual: number,
  idade_atual: number,
  idade_fire: number,
  aporte_mensal: number,
  retorno_anual_pct: number
): Array<{ idade: number; patrimonio_acumulado: number }> {
  const retorno_anual = retorno_anual_pct / 100;
  const r_m = Math.pow(1 + retorno_anual, 1 / 12) - 1;

  const data: Array<{ idade: number; patrimonio_acumulado: number }> = [];

  let patrimonio = patrimonio_atual;
  let idade = idade_atual;

  // Add initial point
  data.push({ idade, patrimonio_acumulado: patrimonio });

  // Year-by-year growth
  while (idade < idade_fire) {
    // 12 months of growth
    for (let m = 0; m < 12; m++) {
      patrimonio = patrimonio * (1 + r_m) + aporte_mensal;
    }
    idade += 1;
    data.push({ idade, patrimonio_acumulado: patrimonio });
  }

  return data;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ReverseFire() {
  // State
  const [patrimonio_atual, setPatrimonio] = useState<number | string>('');
  const [idade_atual, setIdadeAtual] = useState(40);
  const [idade_fire, setIdadeFire] = useState(50);
  const [perfil, setPerfil] = useState<Perfil>('balanceado');
  const [mercado, setMercado] = useState<Mercado>('base');
  const [swr, setSWR] = useState(4.0);

  const { privacyMode, pv, pvLabel } = useEChartsPrivacy();

  // Parse patrimonio
  const patrimonio_num =
    typeof patrimonio_atual === 'number'
      ? patrimonio_atual
      : patrimonio_atual === ''
        ? 0
        : parseFloat(patrimonio_atual.replace(/\D/g, '')) || 0;

  // Derived values
  const gasto_anual = PERFIS[perfil].gasto_anual;
  const retorno_anual_pct = MERCADOS[mercado].retorno_anual;

  // Calculate
  const calculo = useMemo(() => {
    if (idade_fire <= idade_atual || swr <= 0) {
      return null;
    }

    return calcReverseFireAporte(
      patrimonio_num,
      idade_atual,
      idade_fire,
      gasto_anual,
      retorno_anual_pct,
      swr
    );
  }, [patrimonio_num, idade_atual, idade_fire, gasto_anual, retorno_anual_pct, swr]);

  // Guardrails
  const gap = calculo ? calculo.patrimonio_alvo - patrimonio_num : 0;
  const meses = calculo?.meses ?? 0;
  const aporte = calculo?.aporte_mensal ?? 0;
  const anos = meses / 12;

  const metaAtingida = aporte <= 0;
  const horizonteImpossivel = anos <= 0;
  const aporteAlto = aporte > 150000;
  const horizonteCurto = anos > 0 && anos < 3;
  const swrAlto = swr >= 4.5 && anos >= 20;

  // Build chart data
  const chartData = useMemo(() => {
    if (!calculo || aporte < 0) return [];
    return buildWealthGrowthData(
      patrimonio_num,
      idade_atual,
      idade_fire,
      aporte,
      retorno_anual_pct
    );
  }, [patrimonio_num, idade_atual, idade_fire, aporte, retorno_anual_pct, calculo]);

  // Chart options
  const chartOption: EChartsOption = useMemo(() => {
    if (chartData.length === 0) {
      return {};
    }

    const patrimonio_alvo = calculo?.patrimonio_alvo ?? 0;

    return {
      tooltip: {
        ...EC_TOOLTIP,
        formatter: (params: any) => {
          if (Array.isArray(params)) {
            return params.map(p => {
              const idade = p.axisValue;
              const valor = p.value;
              return `Idade ${idade}: ${pv(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}`;
            }).join('<br/>');
          }
          return '';
        },
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => `${Math.floor(d.idade)}`),
        axisLabel: {
          color: EC.muted,
          fontSize: 10,
        },
        axisLine: EC_AXIS_LINE,
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: EC.muted,
          fontSize: 10,
          formatter: (v: number) => {
            if (privacyMode) {
              return pvLabel(v);
            }
            return `R$${(v / 1e6).toFixed(1)}M`;
          },
        },
        axisLine: EC_AXIS_LINE,
        splitLine: EC_SPLIT_LINE,
      },
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 30,
      },
      series: [
        {
          name: 'Patrimônio',
          type: 'area',
          data: chartData.map(d => pv(d.patrimonio_acumulado)),
          smooth: false,
          areaStyle: {
            color: EC.accent.replace('ff', '20'),
          },
          lineStyle: {
            color: EC.accent,
            width: 2,
          },
          itemStyle: {
            color: EC.accent,
          },
        },
        {
          name: 'Patrimônio Alvo (FIRE)',
          type: 'line',
          data: Array(chartData.length).fill(pv(patrimonio_alvo)),
          lineStyle: {
            color: EC.green,
            width: 2,
            type: 'dashed',
          },
          itemStyle: { color: EC.green },
        },
      ],
    };
  }, [chartData, calculo, privacyMode, pv, pvLabel]);

  return (
    <div style={{ marginBottom: '40px' }}>
      {/* Inputs Section */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
          Parâmetros
        </h3>

        {/* Patrimonio Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
            Patrimônio Atual (R$)
          </label>
          <Input
            type="text"
            placeholder="ex: 3.470.000"
            value={patrimonio_atual}
            onChange={(e) => setPatrimonio(e.target.value)}
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          />
          <div style={{ marginTop: '4px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Valor parseado: {fmtBRL(patrimonio_num)}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ marginBottom: '20px' }}>
          <Slider
            label="Idade Atual"
            value={idade_atual}
            min={25}
            max={65}
            step={1}
            onChange={setIdadeAtual}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Slider
            label="Idade FIRE"
            value={idade_fire}
            min={Math.max(idade_atual + 1, 26)}
            max={65}
            step={1}
            onChange={setIdadeFire}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Slider
            label="SWR (%)"
            value={swr}
            min={2.5}
            max={5.0}
            step={0.5}
            unit="%"
            onChange={setSWR}
          />
        </div>

        {/* Perfis Buttons (6) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', color: 'var(--muted)', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
            Perfil (Gasto Anual)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            {(Object.entries(PERFIS) as Array<[Perfil, PerfilConfig]>).map(([key, cfg]) => (
              <Button
                key={key}
                onClick={() => setPerfil(key)}
                variant={perfil === key ? 'default' : 'outline'}
                style={{
                  fontSize: 'var(--text-sm)',
                  padding: '8px 12px',
                  height: 'auto',
                }}
              >
                <div style={{ lineHeight: '1.2' }}>
                  <div>{cfg.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>
                    {(cfg.gasto_anual / 1000).toFixed(0)}k/ano
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Mercado Buttons (2) */}
        <div>
          <div style={{ marginBottom: '8px', color: 'var(--muted)', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
            Cenário de Mercado
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {(Object.entries(MERCADOS) as Array<[Mercado, MercadoConfig]>).map(([key, cfg]) => (
              <Button
                key={key}
                onClick={() => setMercado(key)}
                variant={mercado === key ? 'default' : 'outline'}
                style={{
                  fontSize: 'var(--text-sm)',
                  padding: '8px 12px',
                  height: 'auto',
                }}
              >
                {cfg.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Guardrails / Warnings */}
      {(metaAtingida || aporteAlto || horizonteCurto || swrAlto) && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ marginBottom: '12px', color: 'var(--text)', fontWeight: '600', fontSize: 'var(--text-sm)' }}>
            Alertas e Informações
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {metaAtingida && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(62, 211, 129, 0.1)',
                  border: '1px solid rgba(62, 211, 129, 0.3)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                  color: EC.green,
                }}
              >
                <CheckCircle size={16} />
                <span>Meta já atingida! Aporte necessário &le; 0.</span>
              </div>
            )}
            {aporteAlto && !metaAtingida && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(217, 119, 6, 0.1)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                  color: EC.yellow,
                }}
              >
                <AlertTriangle size={16} />
                <span>Aporte muito alto (&gt; R$150k/mês). Verificar premissas.</span>
              </div>
            )}
            {horizonteCurto && !metaAtingida && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(217, 119, 6, 0.1)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                  color: EC.yellow,
                }}
              >
                <AlertTriangle size={16} />
                <span>Horizonte curto (&lt; 3 anos). Objetivo muito próximo.</span>
              </div>
            )}
            {swrAlto && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(88, 166, 255, 0.1)',
                  border: '1px solid rgba(88, 166, 255, 0.3)',
                  borderRadius: '4px',
                  fontSize: 'var(--text-sm)',
                  color: EC.cyan,
                }}
              >
                <AlertTriangle size={16} />
                <span>SWR alto (&ge; 4.5%) com horizonte longo (&ge; 20 anos). Risco de sequência.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Output: Números */}
      {calculo && !horizonteImpossivel && (
        <>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
              Números
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  Patrimônio Necessário Hoje
                </div>
                <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xl)', fontWeight: '700' }}>
                  {fmtBRL(calculo.patrimonio_alvo)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  Patrimônio Atual Estimado
                </div>
                <div style={{ color: 'var(--text)', fontSize: 'var(--text-xl)', fontWeight: '700' }}>
                  {fmtBRL(patrimonio_num)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  Gap
                </div>
                <div
                  style={{
                    color: gap >= 0 ? EC.positive : EC.negative,
                    fontSize: 'var(--text-xl)',
                    fontWeight: '700',
                  }}
                >
                  {fmtBRL(gap)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  Aporte Mensal Necessário
                </div>
                <div style={{ color: 'var(--green)', fontSize: 'var(--text-xl)', fontWeight: '700' }}>
                  {fmtBRL(aporte)}/mês
                </div>
              </div>
            </div>
          </div>

          {/* EChart */}
          {chartData.length > 0 && (
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
                Projeção de Patrimônio
              </h3>
              <div style={{ width: '100%', height: '300px' }}>
                <EChart option={chartOption} />
              </div>
            </div>
          )}

          {/* Context */}
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontSize: 'var(--text-lg)', fontWeight: '600' }}>
              Resumo
            </h3>
            <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
              <p>
                Com gasto de <strong style={{ color: 'var(--accent)' }}>R${(gasto_anual / 12 / 1000).toFixed(0)}k/mês</strong>, você precisa de{' '}
                <strong style={{ color: 'var(--accent)' }}>
                  {fmtBRL(calculo.patrimonio_alvo)}
                </strong>{' '}
                (SWR {swr.toFixed(1)}%).
              </p>
              <p>
                Faltam <strong style={{ color: 'var(--accent)' }}>{anos.toFixed(1)} anos</strong>. Aportes de{' '}
                <strong style={{ color: 'var(--green)' }}>{fmtBRL(aporte)}/mês</strong> constantes chegam lá.
              </p>
              <p>
                Taxa real assumida: <strong style={{ color: 'var(--accent)' }}>{retorno_anual_pct.toFixed(2)}%/ano</strong> (cenário{' '}
                <strong>{MERCADOS[mercado].label}</strong>).
              </p>
            </div>
          </div>
        </>
      )}

      {/* Error state: horizonte impossível */}
      {horizonteImpossivel && (
        <div
          style={{
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            color: EC.red,
            fontSize: 'var(--text-sm)',
          }}
        >
          <strong>Horizonte Impossível:</strong> Idade FIRE deve ser maior que idade atual.
        </div>
      )}
    </div>
  );
}
