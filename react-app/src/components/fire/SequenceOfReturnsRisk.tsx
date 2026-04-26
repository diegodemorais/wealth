'use client';

/**
 * SequenceOfReturnsRisk — SoRR Narrative + P(FIRE) ↔ Guardrails Interaction
 *
 * Exibe:
 * 1. Narrative explicando SoRR e como P(FIRE) gate anual interage com guardrails de drawdown
 * 2. Heatmap visual: P(FIRE) scenario (95%→80%) × banda de drawdown → retirada resultante
 * 3. Nota sobre INSS floors Katia como piso adicional a partir de 2049
 *
 * Referências:
 * - FR-guardrails-p-fire-integração (carteira.md §Bold Budget Integration)
 * - FR-guardrails-categoria-elasticidade (carteira.md §Bold Budget Integration)
 * - Kitces & Fitzpatrick (2024): risk-based guardrails
 * - ERN/Karsten Part 28: sequence of returns risk em horizontes longos
 * - Pfau (2018): rising equity glidepath como atenuante de SoRR
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { pfireColor } from '@/utils/fire';

interface SequenceOfReturnsRiskProps {
  pfire: { base: number; fav: number; stress: number } | null;
  premissas: Record<string, any>;
  gastoPiso: number;
  privacyMode: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Given P(FIRE), returns the guardrail tier label and spending reduction. */
function pfireToGuardrailTier(pfire: number): {
  tier: string;
  action: string;
  color: string;
} {
  if (pfire > 90) return { tier: 'Expansão', action: 'R$250k → R$300k permanente', color: EC.green };
  if (pfire >= 80) return { tier: 'Manter', action: 'Guardrails atuais — nenhuma ação', color: EC.accent };
  return { tier: 'Revisão', action: 'Apertar limiares drawdown — abrir issue', color: EC.red };
}

/** Returns spending given drawdown depth and custo_vida_base. */
function drawdownToSpending(
  drawdownPct: number,
  custoVidaBase: number,
  discrecionario: number,
  pisoEssencial: number,
): number {
  if (drawdownPct < 0.15) return custoVidaBase;
  if (drawdownPct < 0.25) return custoVidaBase * 0.9; // corte 10%
  if (drawdownPct < 0.35) return custoVidaBase * 0.8; // corte 20%
  // >35%: corta até 50% do discricionário → piso essencial
  return pisoEssencial + discrecionario * 0.1; // mínimo operacional R$0-10k no discricionário
}

// ── Main component ───────────────────────────────────────────────────────────

export function SequenceOfReturnsRisk({
  pfire,
  premissas,
  gastoPiso,
  privacyMode,
}: SequenceOfReturnsRiskProps) {
  const { theme } = useEChartsPrivacy();

  const custoVida: number = premissas?.custo_vida_base ?? 250000;
  const pfireBase: number = pfire?.base ?? 0;
  const pfireFav: number = pfire?.fav ?? 0;
  const pfireStress: number = pfire?.stress ?? 0;

  // Elasticidade aprovada FR-guardrails-categoria-elasticidade 2026-04-25
  const pisoEssencial: number = 184000; // hipoteca R$60k + saúde R$24k + essencial R$100k
  const discrecionario: number = custoVida - pisoEssencial; // R$66k (solteiro/FIRE Day)

  // INSS floors (piso adicional a partir de 2049)
  const inssKatiaAnual: number = premissas?.inss_katia_anual ?? 93600;
  const pgblKatia: number = premissas?.pgbl_katia_saldo_fire ?? 490000;
  const inssKatiaInicio: number = premissas?.inss_katia_inicio_ano ?? 2049;
  const floorKatia2049: number = inssKatiaAnual + pgblKatia * 0.04; // SWR 4% no PGBL

  // P(FIRE) gate tier
  const gateTier = pfireToGuardrailTier(pfireBase);

  // ── Scenario example: P(FIRE) 95% → 80%, drawdown bands ────────────────
  // Cenário hipotético para narrar a interação
  const scenarioPfireStart = 95;
  const scenarioPfireEnd = 80;
  const scenarioBandas = [0, 0.1, 0.2, 0.3, 0.4];
  const scenarioLabels = ['0–15%', '15–25%', '25–35%', '>35%', 'P(FIRE)<80%\nrevisão'];

  // ── Heatmap: drawdown banda × P(FIRE) state → spending ──────────────────
  // 5 drawdown bands × 3 pfire states
  const pfireStates = [
    { label: 'P(FIRE) >90%', value: 95, expanded: true },
    { label: 'P(FIRE) 80–90%', value: 85, expanded: false },
    { label: 'P(FIRE) <80%', value: 75, expanded: false },
  ];
  const drawdownBands = [
    { label: '0–15%', dd: 0.05 },
    { label: '15–25%', dd: 0.20 },
    { label: '25–35%', dd: 0.30 },
    { label: '>35%', dd: 0.40 },
  ];

  // Build heatmap: [pfireIdx][bandIdx] = spending
  const heatmapData: { pfire: string; band: string; spending: number; pct: number }[] = useMemo(() => {
    const out: { pfire: string; band: string; spending: number; pct: number }[] = [];
    pfireStates.forEach(ps => {
      const baseSpend = ps.expanded ? 300000 : custoVida; // P(FIRE)>90%: expandir para R$300k
      drawdownBands.forEach(db => {
        const s = drawdownToSpending(db.dd, baseSpend, discrecionario, pisoEssencial);
        out.push({
          pfire: ps.label,
          band: db.label,
          spending: s,
          pct: s / custoVida,
        });
      });
    });
    return out;
  }, [custoVida, discrecionario, pisoEssencial]);

  // ── ECharts heatmap option ───────────────────────────────────────────────
  const heatmapOption = useMemo(() => {
    const xData = drawdownBands.map(d => d.label);
    const yData = pfireStates.map(p => p.label);

    // value array: [xIdx, yIdx, spending]
    const values = heatmapData.map(item => {
      const xi = xData.indexOf(item.band);
      const yi = yData.indexOf(item.pfire);
      return [xi, yi, item.spending];
    });

    const fmt = (v: number) => fmtPrivacy(v, privacyMode);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          const v = params.value[2];
          const xi = params.value[0];
          const yi = params.value[1];
          const pfireLabel = yData[yi];
          const bandLabel = xData[xi];
          const pct = ((v / custoVida) * 100).toFixed(0);
          return `
            <div style="padding:8px 10px">
              <strong>${pfireLabel}</strong><br/>
              Drawdown ${bandLabel}<br/>
              Retirada: <strong>${fmt(Math.round(v / 1000) * 1000)}/ano</strong><br/>
              <span style="color:var(--muted)">${pct}% do custo base</span>
            </div>`;
        },
      },
      grid: { left: 120, right: 12, top: 20, bottom: 40 },
      xAxis: {
        type: 'category' as const,
        data: xData,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: { color: EC.muted, fontSize: 11 },
        name: 'Banda de Drawdown',
        nameLocation: 'middle' as const,
        nameGap: 28,
        nameTextStyle: { color: EC.muted, fontSize: 11 },
      },
      yAxis: {
        type: 'category' as const,
        data: yData,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: { color: EC.muted, fontSize: 10 },
        splitLine: EC_SPLIT_LINE,
      },
      visualMap: {
        min: pisoEssencial,
        max: 320000,
        calculable: true,
        orient: 'horizontal' as const,
        show: false,
        inRange: {
          color: ['#ef4444', '#eab308', '#22c55e'],
        },
      },
      series: [
        {
          type: 'heatmap' as const,
          data: values,
          label: {
            show: true,
            formatter: (params: any) => {
              const v = params.value[2];
              if (privacyMode) return '••••';
              return `R$${Math.round(v / 1000)}k`;
            },
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
          },
          itemStyle: { borderWidth: 2, borderColor: 'var(--card)' },
          emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.4)' } },
        },
      ],
    };
  }, [heatmapData, custoVida, pisoEssencial, privacyMode, theme]);

  const fmtBrl = (v: number) => fmtPrivacy(v, privacyMode);

  return (
    <div style={{ padding: '0 16px 16px' }}>

      {/* ── 1. Narrative SoRR + P(FIRE) ↔ Guardrails ─────────────────────── */}
      <div style={{
        background: 'var(--card2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px',
        fontSize: 'var(--text-sm)',
        lineHeight: 1.6,
        color: 'var(--text)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 8 }}>
          Sequence of Returns Risk — Como o risco se propaga
        </div>
        <p style={{ margin: '0 0 10px' }}>
          SoRR (Sequence of Returns Risk) descreve o perigo de mercados adversos
          nos <strong>primeiros anos do FIRE</strong>. Karsten (ERN Part 28, 2016) demonstra
          que retiradas durante queda forçam liquidação a preços deprimidos, reduzindo
          permanentemente o capital produtivo — mesmo que o mercado se recupere depois.
          Um bear market de &minus;30% no ano 1 reduz P(FIRE) em &minus;15,6pp (FR-spending-smile, 2026-03-27).
        </p>
        <p style={{ margin: '0 0 10px' }}>
          A defesa primária é o <strong>bond pool</strong>: TD 2040 vence exatamente no FIRE
          Day (&sim;R$1,9M BRL) + IPCA+ curto 3% comprado aos 50 (&sim;2 anos duration).
          Saques vêm <em>do pool primeiro</em> — equity só é tocado quando o pool esgota
          (FR-fire2040, 2026-03-27). Isso cria um período de imunização de 7 anos
          enquanto o equity se recupera.
        </p>
        <p style={{ margin: 0 }}>
          A defesa secundária é a <strong>interação P(FIRE) ↔ guardrails de drawdown</strong>
          (FR-guardrails-p-fire-integração, 2026-04-25). As duas camadas são complementares:
          guardrails reagem a quedas <em>observadas</em>; P(FIRE) gate anual
          (janeiro) avalia a <em>trajetória prospectiva</em>. P(FIRE) {"<"} 80% é o sinal
          de que os thresholds dos guardrails precisam ser apertados — não um gatilho
          de corte automático.
        </p>
      </div>

      {/* ── 2. Guardrails Visualization — Drawdown vs Spending Cut ─────────── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 4 }}>
          Mecanismo de Guardrails — Como Drawdown Ajusta Spending
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 12 }}>
          Curva mostra: 0–15% queda = nenhum corte · 15–25% = 10% redução · 25–35% = 20% redução · 35%+ = piso essencial (R${Math.round(pisoEssencial / 1000)}k)
        </div>
        <EChart option={useMemo(() => {
          const fmt = (v: number) => fmtPrivacy(v, privacyMode);
          const drawdownPcts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
          const spendingCuts: number[] = drawdownPcts.map(dd => {
            const ddFrac = dd / 100;
            if (ddFrac < 0.15) return 0;
            if (ddFrac < 0.25) return 10;
            if (ddFrac < 0.35) return 20;
            return Math.min(50, 20 + (ddFrac - 0.35) * 300); // ~1.5pp per 1% dd above 35%
          });

          return {
            backgroundColor: 'transparent',
            grid: { left: 50, right: 16, top: 20, bottom: 32 },
            tooltip: {
              trigger: 'axis' as const,
              backgroundColor: theme.tooltip.backgroundColor,
              borderColor: theme.tooltip.borderColor,
              textStyle: theme.tooltip.textStyle,
              formatter: (params: any) => {
                if (!params.length) return '';
                const p = params[0];
                const dd = p.value[0];
                const cut = p.value[1];
                const spendingResult = custoVida * (1 - cut / 100);
                return `
                  <div style="padding:8px 10px">
                    <strong>Drawdown ${dd.toFixed(0)}%</strong><br/>
                    Corte de Spending: <strong>${cut.toFixed(0)}%</strong><br/>
                    Retirada: <strong>${fmt(Math.round(spendingResult / 1000) * 1000)}/ano</strong>
                  </div>`;
              },
            },
            xAxis: {
              type: 'value',
              name: 'Drawdown %',
              min: 0,
              max: 50,
              axisLine: EC_AXIS_LINE,
              axisLabel: { color: EC.muted, fontSize: 11, formatter: (v: any) => `${v}%` },
              splitLine: EC_SPLIT_LINE,
            },
            yAxis: {
              type: 'value',
              name: 'Spending Redução %',
              min: 0,
              max: 60,
              axisLine: EC_AXIS_LINE,
              axisLabel: { color: EC.muted, fontSize: 11, formatter: (v: any) => `${v}%` },
              splitLine: EC_SPLIT_LINE,
            },
            series: [
              {
                type: 'line',
                name: 'Spending Cut',
                data: drawdownPcts.map((dd, i) => [dd, spendingCuts[i]]),
                smooth: 0.4,
                lineStyle: { color: EC.accent, width: 3 },
                itemStyle: { color: EC.accent, borderColor: 'var(--card)', borderWidth: 2 },
                areaStyle: { color: `color-mix(in srgb, ${EC.accent} 15%, transparent)` },
                emphasis: { itemStyle: { borderWidth: 3 } },
              },
              // Annotate guardrail thresholds
              {
                type: 'scatter',
                name: 'Guardrail Trigger',
                data: [
                  [15, 0],
                  [25, 10],
                  [35, 20],
                ],
                symbolSize: 8,
                itemStyle: { color: EC.yellow, borderColor: 'var(--card)', borderWidth: 2 },
              },
            ],
          };
        }, [custoVida, pisoEssencial, privacyMode, theme])}
        style={{ height: 200 }} />
        <div className="src">
          Guardrails são reativos: acionam quando drawdown observado cruza threshold (15%, 25%, 35%).
          Permitem que carteira se adapte sem falhar total. P(FIRE) gate anual (janeiro) recalibra esses thresholds.
        </div>
      </div>

      {/* ── 3. P(FIRE) Gate Status atual ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* P(FIRE) current */}
        <div style={{
          flex: '1 1 160px',
          background: 'var(--card)',
          border: `1px solid ${pfireColor(pfireBase)}44`,
          borderLeft: `3px solid ${pfireColor(pfireBase)}`,
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>P(FIRE 2040) — Base</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pfireColor(pfireBase), lineHeight: 1 }}>
            {pfireBase > 0 ? `${pfireBase.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
            fav {pfireFav.toFixed(0)}% · stress {pfireStress.toFixed(0)}%
          </div>
        </div>

        {/* Gate ação */}
        <div style={{
          flex: '2 1 240px',
          background: 'var(--card)',
          border: `1px solid ${gateTier.color}44`,
          borderLeft: `3px solid ${gateTier.color}`,
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>
            Gate P(FIRE) — Ação Anual (Janeiro)
          </div>
          <div style={{ fontWeight: 700, color: gateTier.color, marginBottom: 4 }}>
            {gateTier.tier}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
            {gateTier.action}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
            Regra: {'>'}90% → expandir · 80–90% → manter · {'<'}80% → revisar guardrails
          </div>
        </div>

        {/* Piso essencial */}
        <div style={{
          flex: '1 1 160px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderLeft: `3px solid ${EC.accent}`,
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Piso Essencial</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: EC.accent, lineHeight: 1 }}>
            {fmtBrl(pisoEssencial)}<span style={{ fontSize: 'var(--text-xs)', fontWeight: 400, marginLeft: 2 }}>/ano</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
            Hipoteca R$60k + Saúde R$24k + Essencial R$100k
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Discricionário: {fmtBrl(discrecionario)}/ano (compressível até 50%)
          </div>
        </div>
      </div>

      {/* ── 4. Cenário exemplo: P(FIRE) 95% → 80% ─────────────────────────── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          Cenário Ilustrativo — P(FIRE) cai de {scenarioPfireStart}% para {scenarioPfireEnd}%
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
          Quando P(FIRE) base cai de {scenarioPfireStart}% para {scenarioPfireEnd}% (gate anual de janeiro),
          a ação NÃO é cortar retiradas automaticamente — é <strong>revisar os thresholds dos guardrails
          de drawdown</strong>. Por exemplo, a banda 0–15% pode passar para 0–10%,
          tornando os gatilhos de corte mais sensíveis. Os guardrails de drawdown continuam
          governando o dia a dia; o P(FIRE) gate governa a calibração desses guardrails.
        </div>

        {/* Tabela de transição */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--muted)', fontWeight: 600 }}>Condição</th>
                <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--muted)', fontWeight: 600 }}>Banda Drawdown</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--muted)', fontWeight: 600 }}>Retirada (P{'>'}90%)</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--muted)', fontWeight: 600 }}>Retirada (P 80–90%)</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--muted)', fontWeight: 600 }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { band: '0–15% drawdown', dd: 0.05, expanded: 300000, normal: 250000 },
                { band: '15–25% drawdown', dd: 0.20, expanded: 270000, normal: 225000 },
                { band: '25–35% drawdown', dd: 0.30, expanded: 240000, normal: 200000 },
                { band: '>35% drawdown', dd: 0.40, expanded: pisoEssencial, normal: pisoEssencial },
              ].map(row => {
                const delta = row.normal - row.expanded;
                const deltaColor = delta < 0 ? EC.green : delta > 0 ? EC.red : EC.muted;
                return (
                  <tr key={row.band} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 10px', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
                      {pfireBase > 90 ? 'Atual (expansão)' : pfireBase >= 80 ? 'Atual (normal)' : 'Atual (revisão)'}
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>{row.band}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: EC.green }}>
                      {fmtBrl(row.expanded)}/ano
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: EC.yellow }}>
                      {fmtBrl(row.normal)}/ano
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: deltaColor, fontFamily: 'monospace' }}>
                      {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${fmtBrl(Math.abs(delta))}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="src" style={{ marginTop: 8 }}>
          P{'>'}90%: guardrail expandido (R$300k base) · P 80–90%: guardrails padrão (R$250k base) · Piso essencial: R$184k (inelástico)
        </div>
      </div>

      {/* ── 4. Heatmap: P(FIRE) state × Drawdown band → Spending ───────────── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 4 }}>
          Mapa de Retirada — P(FIRE) Gate × Banda de Drawdown
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 12 }}>
          Verde = retirada alta / Vermelho = retirada no piso. Hover para valores exatos.
        </div>
        <EChart option={heatmapOption} style={{ height: 180 }} />
        <div className="src">
          Piso essencial R$184k: hipoteca + saúde + alimentação/moradia (inelástico).
          Discricionário (R$66k) = primeira linha de corte nos guardrails.
        </div>
      </div>

      {/* ── 6. Nota INSS Floors Katia — Piso Adicional 2049 ─────────────── */}
      <div style={{
        background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '8px',
      }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 8, color: EC.accent }}>
          Piso Adicional — INSS + PGBL Katia a partir de 2049 (ano 9 pós-FIRE)
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.6, marginBottom: 10 }}>
          A partir de novembro de 2049 (62 anos de Katia, Regra Definitiva EC 103/2019),
          o plano recebe um <strong>floor income familiar adicional</strong> que reduz a
          dependência do equity na fase slow-go:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ marginBottom: 10 }}>
          <div style={{ background: 'var(--card)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>INSS Katia</div>
            <div style={{ fontWeight: 800, color: EC.accent, fontSize: '1.1rem' }}>
              {fmtBrl(inssKatiaAnual)}<span style={{ fontSize: 'var(--text-xs)', fontWeight: 400 }}>/ano</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              R$7.800/mês bruto (100% do SB, 39a contr.)
            </div>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>PGBL Katia (SWR 4%)</div>
            <div style={{ fontWeight: 800, color: EC.accent, fontSize: '1.1rem' }}>
              {fmtBrl(Math.round(pgblKatia * 0.04))}<span style={{ fontSize: 'var(--text-xs)', fontWeight: 400 }}>/ano</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Saldo projetado {fmtBrl(pgblKatia)} em 2040
            </div>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 8, padding: '10px 12px', border: `1px solid ${EC.green}44` }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Floor Total 2049+</div>
            <div style={{ fontWeight: 800, color: EC.green, fontSize: '1.1rem' }}>
              {fmtBrl(Math.round(floorKatia2049))}<span style={{ fontSize: 'var(--text-xs)', fontWeight: 400 }}>/ano</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              INSS + renda PGBL (4% SWR estimado)
            </div>
          </div>
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>
          Impacto no SoRR: com floor de {fmtBrl(Math.round(floorKatia2049))}/ano cobrindo
          {' '}{((floorKatia2049 / custoVida) * 100).toFixed(0)}% do custo de vida base,
          a exposição ao sequence risk cai substancialmente no slow-go.
          O portfolio precisa cobrir apenas o gap de {fmtBrl(Math.max(0, custoVida - floorKatia2049))}/ano
          a partir de 2049 — reduzindo a SWR efetiva para {((Math.max(0, custoVida - floorKatia2049) / (premissas?.patrimonio_gatilho ?? 8333333)) * 100).toFixed(1)}%
          sobre o patrimônio-alvo.
        </div>
        <div className="src" style={{ marginTop: 8 }}>
          Fonte: INSS Katia (TX-inss-katia, extrato 22/01/2025) · PGBL Icatu Seguros — Novus do Brasil (TX-pgbl-katia) ·
          Projeção real 4,5%/ano até FIRE Day 2040, 8 anos adicionais sem aportes até 2049
        </div>
      </div>

    </div>
  );
}
