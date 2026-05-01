'use client';
import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LABEL, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import type { DashboardData } from '@/types/dashboard';

interface Props { data: DashboardData }

// Computes year-by-year bond pool saldo (real BRL) given:
// pool0: initial pool value, taxa_real: annual real return, spending: annual withdrawal,
// inss: [{ano, valor}] — INSS income reducing the draw from pool
function computeDepletion(pool0: number, taxa_real: number, spending: number,
  inss: { ano: number; valor: number }[], anos: number): { ano: number; saldo: number }[] {
  const result: { ano: number; saldo: number }[] = [];
  let saldo = pool0;
  const FIRE_YEAR = 2040;
  for (let i = 0; i <= anos; i++) {
    result.push({ ano: FIRE_YEAR + i, saldo: Math.max(0, saldo) });
    const inssYear = inss.filter(x => x.ano === FIRE_YEAR + i).reduce((s, x) => s + x.valor, 0);
    const draw = Math.max(0, spending - inssYear);
    saldo = saldo * (1 + taxa_real) - draw;
  }
  return result;
}

export function BondPoolDepletionChart({ data }: Props) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const { option, poolDepletedYear, coberturaAnos } = useMemo(() => {
    const bpr = (data as any)?.bond_pool_runway ?? {};
    const prem = (data as any)?.premissas ?? {};

    const poolTotalArr: number[] = bpr.pool_total_brl ?? [];
    const poolAtFire = poolTotalArr.length > 0 ? poolTotalArr[poolTotalArr.length - 1] : 0;
    const poolMeta: number = bpr.alvo_pool_brl_2040 ?? prem.meta_pool_brl ?? 1_750_000;
    const spending: number = prem.custo_vida_base ?? 250_000;
    const taxaReal: number = prem.retorno_rf_real_bond_pool ?? 0.0534;

    // INSS income reducing pool draw: Katia year 9 (2049), Diego year 12 (2052)
    const inssKatia: number = prem.inss_katia_anual ?? 93_600;
    const inssDiego: number = prem.inss_anual ?? 18_000;
    const inssAnos: { ano: number; valor: number }[] = [];
    for (let i = 9; i <= 15; i++) inssAnos.push({ ano: 2040 + i, valor: inssKatia });
    for (let i = 12; i <= 15; i++) inssAnos.push({ ano: 2040 + i, valor: inssDiego });

    const N_ANOS = 15;
    const meta = computeDepletion(poolMeta, taxaReal, spending, inssAnos, N_ANOS);
    const atual = computeDepletion(poolAtFire, taxaReal, spending, inssAnos, N_ANOS);

    const anos = meta.map(x => String(x.ano));
    const metaData = meta.map(x => x.saldo);
    const atualData = atual.map(x => x.saldo);

    const fmtM = (v: number) => privacyMode ? '••M' : `R$${(v / 1e6).toFixed(2)}M`;
    const gastoLinha = anos.map(() => spending);
    const poolDepletedYear = atual.find(x => x.saldo === 0)?.ano;
    const coberturaAnos = spending > 0 ? (poolAtFire / spending) : 0;

    const chartOption = {
      tooltip: {
        ...EC_TOOLTIP,
        trigger: 'axis',
        formatter: (params: any[]) => {
          const ps = Array.isArray(params) ? params : [params];
          const ano = ps[0]?.axisValue ?? '';
          const lines = ps.map((p: any) => `${p.marker}${p.seriesName}: ${privacyMode ? '••' : `R$${(p.value / 1e6).toFixed(2)}M`}`);
          return `<b>${ano}</b><br/>${lines.join('<br/>')}`;
        },
      },
      legend: { data: ['Meta atingida', 'Trajetória atual', 'Gasto anual'], textStyle: { color: EC.muted, fontSize: 10 }, bottom: 0 },
      grid: { left: 60, right: 24, top: 20, bottom: 48 },
      xAxis: { type: 'category', data: anos, axisLabel: EC_AXIS_LABEL, axisLine: EC_AXIS_LINE },
      yAxis: {
        type: 'value',
        axisLabel: { ...EC_AXIS_LABEL, formatter: (v: number) => fmtM(v) },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Meta atingida',
          type: 'line',
          data: metaData,
          lineStyle: { color: EC.green, width: 2 },
          itemStyle: { color: EC.green },
          areaStyle: { color: EC.green, opacity: 0.08 },
          smooth: true,
        },
        {
          name: 'Trajetória atual',
          type: 'line',
          data: atualData,
          lineStyle: { color: EC.yellow, width: 2, type: 'dashed' },
          itemStyle: { color: EC.yellow },
          smooth: true,
        },
        {
          name: 'Gasto anual',
          type: 'line',
          data: gastoLinha,
          lineStyle: { color: EC.red, width: 1, type: 'dotted' },
          itemStyle: { color: EC.red },
          symbol: 'none',
        },
      ],
      graphic: poolDepletedYear ? [{
        type: 'text',
        left: '5%', top: 10,
        style: { text: `⚠ Pool esgota ~${poolDepletedYear} (traj. atual)`, fill: EC.yellow, font: '11px sans-serif' },
      }] : [],
    };
    return { option: chartOption, poolDepletedYear, coberturaAnos };
  }, [data, privacyMode, theme]);

  return (
    <div>
      <EChart
        ref={chartRef}
        option={option}
        style={{ height: 260 }}
        data-testid="bond-pool-depletion-chart"
      />
      <span data-testid="bond-pool-esgotamento" style={{ display: 'none' }}>
        {poolDepletedYear ?? 'N/A'}
      </span>
      <span data-testid="bond-pool-cobertura-anos" style={{ display: 'none' }}>
        {coberturaAnos.toFixed(1)}
      </span>
    </div>
  );
}
