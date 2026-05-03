'use client';

/**
 * NowRiskPanel — extraído de page.tsx em DEV-now-refactor.
 * Renderiza:
 *   - Risk Score Gauge (R1)
 *   - Risk Semáforos (R2): Drift Equity, BTC%, Renda+ taxa, CDS Brasil 5Y
 */
import { EChart } from '@/components/primitives/EChart';
import { EC } from '@/utils/echarts-theme';

interface NowRiskPanelProps {
  data: any;
  privacyMode: boolean;
}

export function NowRiskPanel({ data, privacyMode }: NowRiskPanelProps) {
  const risk = data?.risk;
  const score: number | null = risk?.score ?? null;
  const label: string = risk?.label ?? '—';
  const gaugeColor = score == null ? EC.muted
    : score < 5 ? EC.green
    : score < 7.5 ? EC.warning
    : EC.red;
  const gaugeOption = {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      min: 0,
      max: 10,
      splitNumber: 5,
      radius: '85%',
      axisLine: {
        lineStyle: {
          width: 14,
          color: [
            [0.50, EC.green],
            [0.75, EC.warning],
            [1.00, EC.red],
          ],
        },
      },
      pointer: { itemStyle: { color: gaugeColor } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: EC.muted, fontSize: 10 },
      detail: {
        fontSize: 22,
        fontWeight: 800,
        color: gaugeColor,
        formatter: privacyMode ? () => '••' : (v: number) => v.toFixed(1),
      },
      title: {
        offsetCenter: [0, '65%'],
        fontSize: 11,
        color: EC.muted,
        formatter: label,
      },
      data: [{ value: score ?? 0, name: label }],
    }],
  };

  const sem = risk?.semaforos ?? {};
  const cdsBps: number | null = data?.macro?.cds_brazil_5y_bps ?? null;
  const cdsStatus = cdsBps == null ? 'verde' : cdsBps >= 400 ? 'vermelho' : cdsBps >= 250 ? 'amarelo' : 'verde';
  const cdsDisplay = cdsBps != null ? `${cdsBps}bps` : '—';
  const icon = (status: string) => status === 'verde' ? '🟢' : status === 'amarelo' ? '🟡' : '🔴';
  const rows: Array<{ label: string; display: string; status: string; testid?: string }> = [
    {
      label: 'Drift Equity',
      display: sem.equity_drift?.label ?? sem.equity_drift?.status ?? '—',
      status: sem.equity_drift?.status ?? 'verde',
    },
    {
      label: 'BTC%',
      display: sem.btc_pct?.value != null ? `${(sem.btc_pct.value * 100).toFixed(1)}%` : '—',
      status: sem.btc_pct?.status ?? 'verde',
    },
    {
      label: 'Renda+ Taxa',
      display: sem.renda_plus_taxa?.label ?? sem.renda_plus_taxa?.status ?? '—',
      status: sem.renda_plus_taxa?.status ?? 'verde',
    },
    {
      label: 'CDS Brasil 5Y',
      display: cdsDisplay,
      status: cdsStatus,
      testid: 'cds-brasil-semaforo',
    },
  ];

  return (
    <div data-testid="risk-score-gauge" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
          Risk Score — Perfil de Risco
        </div>
        <EChart option={gaugeOption} style={{ height: 180 }} />
        {risk?.score_breakdown && !privacyMode && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <span>Base equity: {risk.score_breakdown.base_equity?.toFixed(2)}</span>
            <span>BTC addon: {risk.score_breakdown.addon_btc?.toFixed(2)}</span>
            <span>Duration: {risk.score_breakdown.addon_duration?.toFixed(2)}</span>
            <span>Diversif: {risk.score_breakdown.discount_diversificacao?.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div data-testid="risk-semaforos" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
          Alertas de Risco
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            <div key={r.label} data-testid={r.testid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{icon(r.status)}</span>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 700 }}>{r.display}</div>
              </div>
            </div>
          ))}
          {risk?.vol_portfolio != null && (
            <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Vol portfolio: {privacyMode ? '••%' : `${(risk.vol_portfolio * 100).toFixed(1)}%`} · VaR 95%: {risk.var_95_pct != null ? (privacyMode ? '••%' : `${(risk.var_95_pct * 100).toFixed(1)}%`) : '—'}
            </div>
          )}
          <div style={{ marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
            CDS: 🟢 &lt;250bps · 🟡 250–400 · 🔴 &gt;400 (revisar RF Brasil)
          </div>
        </div>
      </div>
    </div>
  );
}
