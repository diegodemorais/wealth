'use client';

import { useState, useMemo } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import { EChartsOption } from 'echarts';
import { fmtPrivacy } from '@/utils/privacyTransform';

// ── Types ────────────────────────────────────────────────────────────────────

type Cond = 'solteiro' | 'casado' | 'filho';
type Mkt = 'stress' | 'base' | 'fav' | 'aspiracional';

// ── Constants ────────────────────────────────────────────────────────────────

const COND_LABELS: Record<Cond, string> = {
  solteiro: 'Solteiro',
  casado:   'Casado',
  filho:    'Filho',
};

const MKT_LABELS: Record<Exclude<Mkt, 'aspiracional'>, string> = {
  stress: 'Stress',
  base:   'Base',
  fav:    'Favorável',
};

// Retornos reais BRL anuais por cenário (fração)
const MKT_RETORNOS: Record<Exclude<Mkt, 'aspiracional'>, number> = {
  stress: 0.0435,
  base:   0.0485,
  fav:    0.0585,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtBRL(value: number, privacyMode: boolean): string {
  return fmtPrivacy(value, privacyMode);
}

function fmtM(value: number): string {
  if (Math.abs(value) >= 1e6) return `R$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `R$${(value / 1e3).toFixed(0)}k`;
  return `R$${Math.round(value).toLocaleString('pt-BR')}`;
}

/** Forward simulation: patrimônio projetado no FIRE Day dado aporte fixo */
function calcForwardFire(
  patrimonioAtual: number,
  idadeAtual: number,
  idadeFire: number,
  aporteMensal: number,
  retornoAnual: number,
): {
  patrimonioFire: number;
  meses: number;
} {
  const meses = (idadeFire - idadeAtual) * 12;
  const r_m = Math.pow(1 + retornoAnual, 1 / 12) - 1;
  const fator = Math.pow(1 + r_m, meses);
  const patrimonioFire = patrimonioAtual * fator + aporteMensal * (fator - 1) / r_m;
  return { patrimonioFire, meses };
}

/** Aporte mínimo para atingir meta (reverse) */
function calcAporteMinimo(
  patrimonioAtual: number,
  idadeAtual: number,
  idadeFire: number,
  metaFire: number,
  retornoAnual: number,
): number {
  const meses = (idadeFire - idadeAtual) * 12;
  const r_m = Math.pow(1 + retornoAnual, 1 / 12) - 1;
  const fator = Math.pow(1 + r_m, meses);
  if (Math.abs(r_m) < 1e-10) return (metaFire - patrimonioAtual) / meses;
  return (metaFire - patrimonioAtual * fator) / ((fator - 1) / r_m);
}

/** Evolução anual do patrimônio */
function buildGrowthData(
  patrimonioAtual: number,
  idadeAtual: number,
  idadeFire: number,
  aporteMensal: number,
  retornoAnual: number,
): Array<{ idade: number; patrimonio: number }> {
  const r_m = Math.pow(1 + retornoAnual, 1 / 12) - 1;
  const result: Array<{ idade: number; patrimonio: number }> = [
    { idade: idadeAtual, patrimonio: patrimonioAtual },
  ];
  let p = patrimonioAtual;
  for (let age = idadeAtual + 1; age <= idadeFire; age++) {
    for (let m = 0; m < 12; m++) {
      p = p * (1 + r_m) + aporteMensal;
    }
    result.push({ idade: age, patrimonio: p });
  }
  return result;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ReverseFire() {
  const { data, privacyMode } = usePageData();
  const { pv, pvLabel } = useEChartsPrivacy();

  // Dados fixos do sistema
  const premissas = (data as any)?.premissas ?? {};
  const fmPerfis  = (data as any)?.fire_matrix?.perfis ?? {};
  const fmRetornos = (data as any)?.fire_matrix?.retornos_equity ?? {};

  const patrimonioAtual: number = premissas.patrimonio_atual ?? 3570565;
  const idadeAtual: number      = premissas.idade_atual ?? 39;
  const swrGatilho: number      = premissas.swr_gatilho ?? 0.03;

  // Custos de vida por condição
  const custosPorCond: Record<Cond, number> = {
    solteiro: fmPerfis.atual?.gasto_anual  ?? premissas.custo_vida_base   ?? 250000,
    casado:   fmPerfis.casado?.gasto_anual ?? premissas.custo_vida_casado ?? 270000,
    filho:    fmPerfis.filho?.gasto_anual  ?? premissas.custo_vida_filho  ?? 300000,
  };

  // State
  const [cond, setCond]           = useState<Cond>('solteiro');
  const [mkt, setMkt]             = useState<Mkt>('base');
  const [idadeFire, setIdadeFire] = useState(53);
  const [aporte, setAporte]       = useState(25000);

  // Retorno real anual (fração)
  const retornoAnual: number = useMemo(() => {
    if (mkt === 'aspiracional') {
      return fmRetornos.fav ? fmRetornos.fav : MKT_RETORNOS.fav;
    }
    const mktKey = mkt as Exclude<Mkt, 'aspiracional'>;
    return fmRetornos[mktKey] ? fmRetornos[mktKey] : MKT_RETORNOS[mktKey];
  }, [mkt, fmRetornos]);

  // Cálculo principal
  const custo = custosPorCond[cond];
  const metaFire = custo / swrGatilho;
  const { patrimonioFire } = calcForwardFire(patrimonioAtual, idadeAtual, idadeFire, aporte, retornoAnual);
  const gap = metaFire - patrimonioFire; // positivo = falta, negativo = excede
  const aporteMinimo = calcAporteMinimo(patrimonioAtual, idadeAtual, idadeFire, metaFire, retornoAnual);
  const excedente = aporte - aporteMinimo; // quanto o aporte atual supera o mínimo

  const metaAtingida = patrimonioFire >= metaFire;
  const anos = idadeFire - idadeAtual;

  // Status
  const statusColor = metaAtingida ? EC.green : aporteMinimo > aporte * 2 ? EC.red : EC.yellow;
  const statusText = metaAtingida
    ? '✅ Meta atingida'
    : aporteMinimo <= 0
      ? '✅ Patrimônio já suficiente'
      : `⚠️ Precisa mais R$${Math.round((aporteMinimo - aporte) / 1000)}k/mês`;

  // Gráfico
  const growthData = useMemo(
    () => buildGrowthData(patrimonioAtual, idadeAtual, idadeFire, aporte, retornoAnual),
    [patrimonioAtual, idadeAtual, idadeFire, aporte, retornoAnual],
  );

  const chartOption: EChartsOption = useMemo(() => ({
    tooltip: {
      ...EC_TOOLTIP,
      trigger: 'axis',
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const age = params[0].axisValue;
        return params.map((p: any) => {
          const v = typeof p.value === 'number' ? p.value : 0;
          const label = privacyMode ? pvLabel(v) : fmtM(v);
          return `${p.marker}${p.seriesName}: ${label}`;
        }).join('<br/>') + `<br/><span style="color:var(--muted);font-size:11px">Idade ${age}</span>`;
      },
    },
    xAxis: {
      type: 'category',
      data: growthData.map(d => `${d.idade}`),
      axisLabel: { color: EC.muted, fontSize: 10 },
      axisLine: EC_AXIS_LINE,
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: EC.muted,
        fontSize: 10,
        formatter: (v: number) => privacyMode ? pvLabel(v) : `R$${(v / 1e6).toFixed(1)}M`,
      },
      axisLine: EC_AXIS_LINE,
      splitLine: EC_SPLIT_LINE,
    },
    grid: { left: 58, right: 16, top: 16, bottom: 28 },
    series: [
      {
        name: 'Patrimônio',
        type: 'line',
        data: growthData.map(d => pv(d.patrimonio)),
        smooth: false,
        areaStyle: { color: EC.accent + '28' },
        lineStyle: { color: EC.accent, width: 2 },
        itemStyle: { color: EC.accent },
        markPoint: {
          data: [
            {
              name: 'FIRE Day',
              xAxis: growthData.length - 1,
              yAxis: pv(growthData[growthData.length - 1]?.patrimonio ?? 0),
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: { color: metaAtingida ? EC.green : EC.red },
              label: {
                formatter: () => `FIRE ${idadeFire}a`,
                position: 'top',
                distance: 8,
                fontSize: 10,
                color: metaAtingida ? EC.green : EC.red,
                fontWeight: 'bold',
              },
            },
          ],
        },
      },
      {
        name: 'Meta FIRE',
        type: 'line',
        data: Array(growthData.length).fill(pv(metaFire)),
        lineStyle: { color: EC.green, width: 1.5, type: 'dashed' },
        itemStyle: { color: EC.green },
        symbol: 'none',
      },
    ],
  }), [growthData, metaFire, metaAtingida, idadeFire, privacyMode, pv, pvLabel]);

  // Aspiracional handler
  const setAspiracional = () => {
    setMkt('aspiracional');
    const aspiracionalAporte = premissas.aporte_mensal;
    if (aspiracionalAporte != null) setAporte(aspiracionalAporte);
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '20px',
        }}
      >
        {/* Condição + Mercado — padrão seg-group */}
        <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: '58px' }}>Condição:</span>
            <div className="seg-group">
              {(['solteiro', 'casado', 'filho'] as Cond[]).map(c => (
                <button key={c} className={`seg-btn${cond === c ? ' active' : ''}`} onClick={() => setCond(c)}>
                  {COND_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: '58px' }}>Mercado:</span>
            <div className="seg-group">
              {(['stress', 'base', 'fav'] as Exclude<Mkt, 'aspiracional'>[]).map(m => (
                <button key={m} className={`seg-btn${mkt === m ? ' active' : ''}`} onClick={() => setMkt(m)}>
                  {MKT_LABELS[m]}
                </button>
              ))}
            </div>
            <button
              className="seg-btn"
              style={{ borderRadius: '6px', border: `1px dashed var(--border)`, background: mkt === 'aspiracional' ? 'var(--accent-muted, rgba(88,166,255,0.1))' : 'transparent' }}
              onClick={setAspiracional}
            >
              🎯 Aspiracional
            </button>
          </div>
        </div>

        {/* Grid: sliders | resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Coluna esquerda: dados fixos + sliders */}
          <div>
            {/* Dados fixos do sistema */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              <span>
                Patrimônio atual:{' '}
                <strong style={{ color: 'var(--text)' }}>{fmtBRL(patrimonioAtual, privacyMode)}</strong>
              </span>
              <span>
                Idade atual:{' '}
                <strong style={{ color: 'var(--text)' }}>{idadeAtual} anos</strong>
              </span>
            </div>

            {/* Slider: Idade FIRE */}
            <div className="slider-row" style={{ marginBottom: '12px' }}>
              <label>
                <span>Idade FIRE</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{idadeFire} anos</span>
              </label>
              <input
                type="range"
                min={idadeAtual + 1}
                max={65}
                step={1}
                value={idadeFire}
                onChange={e => setIdadeFire(+e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                <span>{idadeAtual + 1}</span><span>65</span>
              </div>
            </div>

            {/* Slider: Aporte Mensal */}
            <div className="slider-row">
              <label>
                <span>Aporte Mensal</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmtBRL(aporte, privacyMode)}</span>
              </label>
              <input
                type="range"
                min={5000}
                max={100000}
                step={1000}
                value={aporte}
                onChange={e => setAporte(+e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                <span>R$5k</span><span>R$100k</span>
              </div>
            </div>

            {/* Nota SWR */}
            <div style={{ marginTop: '10px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              SWR fixo: {(swrGatilho * 100).toFixed(1)}% · Retorno real: {(retornoAnual * 100).toFixed(2)}%/ano · Horizonte: {anos} anos
            </div>
          </div>

          {/* Coluna direita: resumo de outputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Patrimônio FIRE Day */}
            <div style={{ background: 'var(--surface, var(--card))', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '3px' }}>Patrimônio no FIRE Day</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--accent)' }}>
                {fmtBRL(patrimonioFire, privacyMode)}
              </div>
            </div>

            {/* Meta FIRE */}
            <div style={{ background: 'var(--surface, var(--card))', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '3px' }}>
                Meta FIRE ({COND_LABELS[cond]})
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)' }}>
                {fmtBRL(metaFire, privacyMode)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                R${Math.round(custo / 1000)}k/ano ÷ {(swrGatilho * 100).toFixed(1)}% SWR
              </div>
            </div>

            {/* Gap */}
            <div style={{ background: 'var(--surface, var(--card))', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '3px' }}>Gap</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: gap > 0 ? EC.red : EC.green }}>
                {gap > 0 ? '-' : '+'}{fmtBRL(Math.abs(gap), privacyMode)}
              </div>
              {!metaAtingida && aporteMinimo > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                  Aporte mínimo: {fmtBRL(Math.max(0, aporteMinimo), privacyMode)}/mês
                  {excedente < 0 && ` (faltam R$${Math.round(Math.abs(excedente) / 1000)}k/mês)`}
                </div>
              )}
              {metaAtingida && excedente > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: EC.green, marginTop: '2px' }}>
                  Você aporta R${Math.round(excedente / 1000)}k/mês a mais que o necessário
                </div>
              )}
            </div>

            {/* Status */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: `1px solid ${statusColor}40`,
                background: `${statusColor}14`,
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: statusColor,
              }}
            >
              {statusText}
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div style={{ marginTop: '20px', width: '100%', height: '220px' }}>
          <EChart option={chartOption} />
        </div>
      </div>
    </div>
  );
}
