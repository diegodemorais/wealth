'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtBRL(val: number | undefined | null, pm: boolean): string {
  if (pm) return '••••';
  if (val == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

function fmtPct(val: number | undefined | null): string {
  if (val == null) return '—';
  return val.toFixed(2) + '%';
}

function colorBadge(color: 'green' | 'yellow' | 'red' | 'orange' | 'blue') {
  const map = {
    green: 'background:var(--green,#16a34a);color:#fff',
    yellow: 'background:var(--yellow,#ca8a04);color:#fff',
    red: 'background:var(--red,#dc2626);color:#fff',
    orange: 'background:#ea580c;color:#fff',
    blue: 'background:var(--accent,#2563eb);color:#fff',
  };
  return map[color];
}

// ─── Card wrapper ────────────────────────────────────────────────────────────

function Card({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  );
}

// ─── Section A: New Components ───────────────────────────────────────────────

// 1. RealYieldGauge
function RealYieldGauge({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const rf = data?.rf ?? {};
  const ipca12m = data?.macro?.ipca_12m ?? 4.14;

  const bonds = [
    { key: 'ipca2029', label: 'IPCA+2029', d: rf.ipca2029 },
    { key: 'ipca2040', label: 'IPCA+2040', d: rf.ipca2040 },
    { key: 'ipca2050', label: 'IPCA+2050', d: rf.ipca2050 },
    { key: 'renda2065', label: 'Renda+2065', d: rf.renda2065 },
  ];

  const selic = data?.macro?.selic_meta ?? 14.75;
  const selicReal = selic - ipca12m;

  return (
    <Card title="Real Yield Gauge" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--accent,#2563eb)', color: '#fff' }}>RF</span>}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        IPCA 12M: {ipca12m}% · Selic Real: {selicReal.toFixed(2)}%
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bonds.map(({ key, label, d }) => {
          if (!d) return null;
          const yieldReal = (d.taxa ?? 0) - ipca12m;
          const yieldRealLiq = yieldReal * 0.85;
          const color = yieldRealLiq > 6 ? 'green' : yieldRealLiq >= 5 ? 'yellow' : 'red';
          const barPct = Math.min(100, Math.max(0, (yieldRealLiq / 8) * 100));
          const barColor = color === 'green' ? '#16a34a' : color === 'yellow' ? '#ca8a04' : '#dc2626';
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Nominal {fmtPct(d.taxa)} · Real Liq {fmtPct(yieldRealLiq)}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${barPct}%`, height: '100%', background: barColor, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                {fmtBRL(d.valor, privacyMode)} · Carry vs Selic real: {(yieldRealLiq - selicReal).toFixed(2)}pp
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// 2. TaxDeferralClock
function TaxDeferralClock({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patrimonioTotal = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  const liqPct = patrimonioTotal > 0 ? ((patrimonioTotal - irDiferido) / patrimonioTotal) * 100 : 0;

  return (
    <Card title="Tax Deferral Clock" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ea580c', color: '#fff' }}>Tax</span>}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }} className="pv">
          {privacyMode ? '••••' : fmtBRL(irDiferido, false)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>IR diferido total</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontStyle: 'italic' }}>
          Cada dia sem vender = empréstimo gratuito do governo
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
          Patrimônio líquido de IR vs IR latente
        </div>
        <div style={{ display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${liqPct}%`, background: 'var(--accent,#2563eb)' }} title={`Líquido: ${liqPct.toFixed(1)}%`} />
          <div style={{ flex: 1, background: '#dc2626' }} title="IR latente" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
          <span>Líquido {liqPct.toFixed(1)}%</span>
          <span>IR latente {(100 - liqPct).toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
}

// 3. SequenceOfReturnsHeatmap
function SequenceOfReturnsHeatmap({ data }: { data: any }) {
  const ft = data?.fire_trilha ?? {};
  const dates: string[] = ft.dates ?? [];
  const trilha: number[] = ft.trilha_brl ?? [];
  const spending = data?.premissas?.custo_vida_base ?? 250000;

  const years = [2035, 2036, 2037, 2038, 2039, 2040];
  const returns = [-0.30, -0.20, -0.10, 0, 0.10, 0.20];
  const returnLabels = ['-30%', '-20%', '-10%', '0%', '+10%', '+20%'];

  // Get projected patrimony for each year from trilha
  function getPatForYear(yr: number): number {
    const key = `${yr}-12`;
    const idx = dates.indexOf(key);
    if (idx >= 0) return trilha[idx] ?? 0;
    const altKey = `${yr}-01`;
    const altIdx = dates.indexOf(altKey);
    return altIdx >= 0 ? trilha[altIdx] ?? 0 : 0;
  }

  // Simplified P(FIRE) from SWR
  function pFireFromSWR(swr: number): number {
    if (swr <= 0.025) return 100;
    if (swr <= 0.030) return 85 + (0.030 - swr) / 0.005 * 15;
    if (swr <= 0.035) return 70 + (0.035 - swr) / 0.005 * 15;
    if (swr <= 0.040) return 55 + (0.040 - swr) / 0.005 * 15;
    return Math.max(30, 55 - (swr - 0.040) / 0.005 * 15);
  }

  function cellColor(p: number) {
    if (p >= 85) return '#16a34a';
    if (p >= 75) return '#ca8a04';
    return '#dc2626';
  }

  return (
    <Card title="Sequence of Returns Heatmap">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Ano FIRE</th>
              {returnLabels.map(r => (
                <th key={r} style={{ padding: '4px 6px', color: 'var(--muted)', fontWeight: 500 }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(yr => {
              const basePat = getPatForYear(yr);
              return (
                <tr key={yr}>
                  <td style={{ padding: '4px 6px', fontWeight: 600, color: 'var(--text)' }}>{yr}</td>
                  {returns.map((r, ri) => {
                    const adjPat = basePat * (1 + r);
                    const swr = adjPat > 0 ? spending / adjPat : 0.1;
                    const p = pFireFromSWR(swr);
                    const bg = cellColor(p);
                    return (
                      <td key={ri} style={{ padding: '4px 6px', textAlign: 'center', background: bg, color: '#fff', borderRadius: 3 }}>
                        {p.toFixed(0)}%
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        Modelo simplificado para ilustração — aba FIRE usa MC completo
      </div>
    </Card>
  );
}

// 4. CarryDifferentialMonitor
function CarryDifferentialMonitor({ data }: { data: any }) {
  const macro = data?.macro ?? {};
  const spread = macro.spread_selic_ff ?? (macro.selic_meta - (macro.fed_funds ?? 3.64));
  const cambio = macro.cambio ?? data?.cambio;
  const selic = macro.selic_meta ?? 14.75;
  const ff = macro.fed_funds ?? 3.64;

  const spreadColor = spread >= 8 ? 'green' : spread >= 5 ? 'yellow' : 'red';
  const spreadBgMap = { green: '#16a34a', yellow: '#ca8a04', red: '#dc2626' };

  return (
    <Card title="Carry Differential Monitor" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>Macro</span>}>
      <div className="grid grid-cols-2 gap-3">
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Spread Selic–FF</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: spreadBgMap[spreadColor] }}>
            {spread != null ? `${spread.toFixed(2)}pp` : '—'}
          </div>
          <div style={{ display: 'inline-block', marginTop: 6, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: spreadBgMap[spreadColor], color: '#fff' }}>
            {spreadColor === 'green' ? 'Carry alto' : spreadColor === 'yellow' ? 'Carry moderado' : 'Carry baixo'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
            Selic {selic}% · FF {ff}%
          </div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Câmbio BRL/USD</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
            {cambio != null ? `R$${cambio.toFixed(3)}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
            Exposição cambial {macro.exposicao_cambial_pct ?? '—'}%
          </div>
        </div>
      </div>
    </Card>
  );
}

// 5. BRLPurchasingPowerTimeline
function BRLPurchasingPowerTimeline({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const cambio = data?.macro?.cambio ?? data?.cambio ?? 5.15;
  const equityPctUsd = (data?.macro?.exposicao_cambial_pct ?? 87.9) / 100;
  const patTotal = data?.premissas?.patrimonio_atual ?? 3570565;
  const patUsd = (patTotal / cambio) * equityPctUsd;
  const retornoUsd = data?.premissas?.retorno_equity_base ?? 0.0485;

  const scenarios = [
    { label: 'BRL aprecia', depBRL: -0.03, color: '#16a34a' },
    { label: 'Base', depBRL: 0.005, color: '#2563eb' },
    { label: 'BRL deprecia', depBRL: 0.04, color: '#dc2626' },
  ];

  const checkYears = [2030, 2035, 2040];
  const currentYear = 2026;

  function patBRLat(yr: number, dep: number): number {
    const t = yr - currentYear;
    return patUsd * Math.pow(1 + retornoUsd, t) * cambio * Math.pow(1 + dep, t);
  }

  return (
    <Card title="BRL Purchasing Power Timeline" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#0891b2', color: '#fff' }}>FX</span>}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 300 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Cenário</th>
              {checkYears.map(yr => (
                <th key={yr} style={{ padding: '4px 6px', color: 'var(--muted)', fontWeight: 500 }}>{yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(sc => (
              <tr key={sc.label}>
                <td style={{ padding: '4px 6px', fontWeight: 500, color: sc.color }}>{sc.label}</td>
                {checkYears.map(yr => (
                  <td key={yr} style={{ padding: '4px 6px', fontWeight: 600, color: 'var(--text)' }} className="pv">
                    {privacyMode ? '••••' : fmtBRL(patBRLat(yr, sc.depBRL), false)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        Equity {(equityPctUsd * 100).toFixed(0)}% USD · Retorno {(retornoUsd * 100).toFixed(2)}%/a · Câmbio atual R${cambio.toFixed(3)}
      </div>
    </Card>
  );
}

// 6. DrawdownRecoveryTable
function DrawdownRecoveryTable({ data }: { data: any }) {
  const dd = data?.drawdown_history ?? {};
  const events = dd.events ?? [];

  function depthColor(d: number) {
    if (d <= -20) return '#dc2626';
    if (d <= -10) return '#ca8a04';
    return '#16a34a';
  }

  return (
    <Card title="Drawdown Recovery Table" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff' }}>Risco</span>}>
      {events.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sem eventos de drawdown registrados</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Evento', 'Queda', 'Meses queda', 'Meses rec.', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 500, color: 'var(--text)' }}>{ev.name ?? '—'}</td>
                  <td style={{ padding: '4px 6px', fontWeight: 700, color: depthColor(ev.depth_pct ?? 0) }}>
                    {ev.depth_pct != null ? `${ev.depth_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{ev.duration_months ?? '—'}</td>
                  <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{ev.recovery_months ?? '—'}</td>
                  <td style={{ padding: '4px 6px', color: 'var(--muted)' }}>{ev.total_months ?? '—'}</td>
                  <td style={{ padding: '4px 6px' }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: ev.recovered ? '#16a34a' : '#ca8a04', color: '#fff' }}>
                      {ev.recovered ? 'Recuperado' : 'Em curso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// 7. PatrimonioLiquidoIR
function PatrimonioLiquidoIR({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patBruto = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  const patLiq = patBruto - irDiferido;
  const irPct = patBruto > 0 ? (irDiferido / patBruto) * 100 : 0;

  return (
    <Card title="Patrimônio Líquido de IR" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>Advocate</span>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Patrimônio bruto</span>
          <span style={{ fontSize: 12, fontWeight: 600 }} className="pv">{fmtBRL(patBruto, privacyMode)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#dc2626' }}>IR diferido</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }} className="pv">- {fmtBRL(irDiferido, privacyMode)}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Patrimônio líquido</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }} className="pv">{fmtBRL(patLiq, privacyMode)}</span>
        </div>
      </div>
      <div style={{ marginTop: 10, height: 20, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: patLiq, background: 'var(--accent,#2563eb)' }} title="Líquido" />
        <div style={{ flex: irDiferido, background: '#dc2626' }} title="IR latente" />
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
        P(FIRE) é calculado sobre patrimônio bruto. Patrimônio disponível no FIRE Day é aprox. {fmtBRL(irDiferido, false)} menor.
        · IR representa {irPct.toFixed(1)}% do bruto.
      </div>
    </Card>
  );
}

// 8. FactorExposureHeatmap
function FactorExposureHeatmap({ data }: { data: any }) {
  const fl = data?.factor_loadings ?? {};
  const etfs = Object.keys(fl).filter(k => k !== '_generated' && k !== '_source');
  const factors = ['mkt_rf', 'smb', 'hml', 'rmw', 'cma', 'mom'];
  const factorLabels = ['Mkt-RF', 'SMB', 'HML', 'RMW', 'CMA', 'MOM'];

  function heatColor(val: number): string {
    const abs = Math.abs(val);
    if (abs < 0.05) return 'var(--border)';
    const intensity = Math.min(abs / 0.7, 1);
    if (val > 0) {
      const r = Math.round(22 + (37 - 22) * (1 - intensity));
      const g = Math.round(163 + (99 - 163) * (1 - intensity));
      const b = Math.round(74 + (235 - 74) * (1 - intensity));
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(220 + (239 - 220) * (1 - intensity));
      const g = Math.round(38 + (68 - 38) * (1 - intensity));
      const b = Math.round(38 + (68 - 38) * (1 - intensity));
      return `rgb(${r},${g},${b})`;
    }
  }

  return (
    <Card title="Factor Exposure Heatmap" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#16a34a', color: '#fff' }}>Factor</span>}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%', minWidth: 320 }}>
          <thead>
            <tr>
              <th style={{ padding: '3px 5px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>ETF</th>
              {factorLabels.map(f => (
                <th key={f} style={{ padding: '3px 5px', color: 'var(--muted)', fontWeight: 500 }}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {etfs.map(etf => (
              <tr key={etf}>
                <td style={{ padding: '3px 5px', fontWeight: 600, color: 'var(--text)' }}>{etf}</td>
                {factors.map(f => {
                  const val = fl[etf]?.[f] ?? 0;
                  return (
                    <td
                      key={f}
                      style={{
                        padding: '3px 5px',
                        textAlign: 'center',
                        background: heatColor(val),
                        color: Math.abs(val) > 0.15 ? '#fff' : 'var(--text)',
                        borderRadius: 2,
                      }}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
        Verde = loading positivo · Vermelho = loading negativo · Magnitude pelo sombreado
      </div>
    </Card>
  );
}

// 9. BondLadderTimeline
function BondLadderTimeline({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const rf = data?.rf ?? {};
  const custoVidaMensal = (data?.premissas?.custo_vida_base ?? 250000) / 12;

  const bonds = [
    { key: 'ipca2029', label: 'IPCA+2029', year: 2029, d: rf.ipca2029 },
    { key: 'ipca2040', label: 'IPCA+2040', year: 2040, d: rf.ipca2040 },
    { key: 'ipca2050', label: 'IPCA+2050', year: 2050, d: rf.ipca2050 },
    { key: 'renda2065', label: 'Renda+2065', year: 2065, d: rf.renda2065, vitalicio: true },
  ].filter(b => b.d);

  const maxVal = Math.max(...bonds.map(b => b.d?.valor ?? 0));

  return (
    <Card title="Bond Ladder Timeline" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#16a34a', color: '#fff' }}>RF</span>}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, paddingBottom: 4, position: 'relative' }}>
        {bonds.map(({ key, label, year, d, vitalicio }) => {
          const val = d?.valor ?? 0;
          const meses = custoVidaMensal > 0 ? val / custoVidaMensal : 0;
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const barColor = vitalicio ? '#7c3aed' : '#2563eb';
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>
                {meses.toFixed(1)}m
              </div>
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: barColor,
                  borderRadius: '3px 3px 0 0',
                  minHeight: 8,
                }}
                title={`${label}: ${fmtBRL(val, false)}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {bonds.map(({ key, label, year, d }) => (
          <div key={key} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
            <div style={{ fontSize: 10, fontWeight: 600 }} className="pv">
              {fmtBRL(d?.valor, privacyMode)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{year}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Section B: Orphan Components ───────────────────────────────────────────

const ORPHANS = [
  { name: 'AlphaVsSWRDChart', file: 'src/components/dashboard/AlphaVsSWRDChart.tsx', lines: 234, desc: 'Gráfico de alpha do AVGS vs benchmark SWRD ao longo do tempo' },
  { name: 'AttributionAnalysis', file: 'src/components/dashboard/AttributionAnalysis.tsx', lines: 224, desc: 'Decomposição da performance por fator / ETF (atribuição de retorno)' },
  { name: 'BondMaturityLadder', file: 'src/components/dashboard/BondMaturityLadder.tsx', lines: 183, desc: 'Escada de vencimentos dos títulos de renda fixa por ano' },
  { name: 'BondPoolComposition', file: 'src/components/dashboard/BondPoolComposition.tsx', lines: 176, desc: 'Composição do bond pool de reserva por tipo de título' },
  { name: 'BondPoolRunway', file: 'src/components/dashboard/BondPoolRunway.tsx', lines: 224, desc: 'Projeção de autonomia do bond pool em anos de gasto' },
  { name: 'BrasilConcentrationCard', file: 'src/components/dashboard/BrasilConcentrationCard.tsx', lines: 132, desc: 'Concentração do patrimônio no Brasil vs exterior (risco de jurisdição)' },
  { name: 'CryptoBandChart', file: 'src/components/dashboard/CryptoBandChart.tsx', lines: 133, desc: 'Gráfico de bandas para alocação em cripto/HODL11' },
  { name: 'DCAStatusGrid', file: 'src/components/dashboard/DCAStatusGrid.tsx', lines: 119, desc: 'Grid de status das ordens DCA ativas por ativo' },
  { name: 'DrawdownHistoryChart', file: 'src/components/dashboard/DrawdownHistoryChart.tsx', lines: 153, desc: 'Histórico de drawdowns ao longo do tempo em gráfico de área' },
  { name: 'EtfsPositionsTable', file: 'src/components/dashboard/EtfsPositionsTable.tsx', lines: 158, desc: 'Tabela detalhada de posições por ETF com P&L e peso atual' },
  { name: 'FactorLoadingsTable', file: 'src/components/dashboard/FactorLoadingsTable.tsx', lines: 146, desc: 'Tabela de loadings fatoriais (FF5+MOM) por ETF' },
  { name: 'FamilyScenarioCards', file: 'src/components/dashboard/FamilyScenarioCards.tsx', lines: 129, desc: 'Cards de P(FIRE) por perfil familiar (solteiro, casado, filho)' },
  { name: 'FinancialWellnessActions', file: 'src/components/dashboard/FinancialWellnessActions.tsx', lines: 153, desc: 'Checklist de ações pendentes de wellness financeiro' },
  { name: 'FireSimulator', file: 'src/components/dashboard/FireSimulator.tsx', lines: 250, desc: 'Simulador interativo de data FIRE com sliders de parâmetros' },
  { name: 'GeographicExposureChart', file: 'src/components/dashboard/GeographicExposureChart.tsx', lines: 149, desc: 'Exposição geográfica do portfólio por região (EUA, Europa, EM, etc.)' },
  { name: 'GlidePath', file: 'src/components/dashboard/GlidePath.tsx', lines: 236, desc: 'Trajetória de alocação equity/bonds ao longo do ciclo de vida até FIRE' },
  { name: 'IpcaTaxaProgress', file: 'src/components/dashboard/IpcaTaxaProgress.tsx', lines: 172, desc: 'Progresso da taxa IPCA+ vs piso de DCA e gatilhos' },
  { name: 'LifeEventsTable', file: 'src/components/dashboard/LifeEventsTable.tsx', lines: 141, desc: 'Tabela de eventos de vida planejados com impacto financeiro' },
  { name: 'RebalancingStatus', file: 'src/components/dashboard/RebalancingStatus.tsx', lines: 246, desc: 'Status de rebalanceamento: drift atual vs bandas e ação necessária' },
  { name: 'RollingMetricsChart', file: 'src/components/dashboard/RollingMetricsChart.tsx', lines: 222, desc: 'Métricas rolling (Sharpe, Sortino) em janela de 12 meses' },
  { name: 'ScenarioCompare', file: 'src/components/dashboard/ScenarioCompare.tsx', lines: 172, desc: 'Comparativo de cenários FIRE (Base 53a vs Aspiracional 49a)' },
  { name: 'SemaforoTriggers', file: 'src/components/dashboard/SemaforoTriggers.tsx', lines: 162, desc: 'Semáforo de gatilhos de ação (DCA, rebalanceamento, saída)' },
  { name: 'SpendingBreakdown', file: 'src/components/dashboard/SpendingBreakdown.tsx', lines: 258, desc: 'Breakdown de gastos por categoria com guardrails de retirada' },
  { name: 'StatusDot', file: 'src/components/dashboard/StatusDot.tsx', lines: 40, desc: 'Primitivo utilitário: dot de status colorido (verde/amarelo/vermelho)' },
  { name: 'TrackingFireChart', file: 'src/components/dashboard/TrackingFireChart.tsx', lines: 206, desc: 'Gráfico de tracking da trilha FIRE (realizado vs projetado)' },
];

function OrphanCard({ name, file, lines, desc }: { name: string; file: string; lines: number; desc: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>{name}</h4>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ea580c', color: '#fff', whiteSpace: 'nowrap', marginLeft: 8 }}>
          Órfão
        </span>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <code style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--card2)', padding: '2px 5px', borderRadius: 3 }}>
          {file}
        </code>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{lines} linhas</span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DiscoveryPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => {
      console.error('Discovery page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data: derived,
    loadingText: 'Carregando dados...',
    errorPrefix: 'Erro ao carregar Discovery:',
    warningText: 'Dados carregados mas valores derivados não computados',
  });
  if (stateEl) return stateEl;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            Discovery
          </h1>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 600 }}>
            Temporário
          </span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Componentes sugeridos pelos agentes + inativos aguardando avaliação de Diego
        </p>
      </div>

      {/* Section A */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader
          title="A — Novos Componentes Sugeridos"
          sub="Mockups com dados reais. Aprovados entram nas abas permanentes; rejeitados são arquivados."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RealYieldGauge data={data} />
          <TaxDeferralClock data={data} />
          <SequenceOfReturnsHeatmap data={data} />
          <CarryDifferentialMonitor data={data} />
          <BRLPurchasingPowerTimeline data={data} />
          <DrawdownRecoveryTable data={data} />
          <PatrimonioLiquidoIR data={data} />
          <FactorExposureHeatmap data={data} />
          <BondLadderTimeline data={data} />
        </div>
      </div>

      {/* Section B */}
      <div>
        <SectionHeader
          title="B — Componentes Inativos (Órfãos)"
          sub={`${ORPHANS.length} componentes existem no codebase mas não são importados em nenhuma página. Revisar: manter, integrar ou remover.`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ORPHANS.map(o => (
            <OrphanCard key={o.name} {...o} />
          ))}
        </div>
      </div>
    </div>
  );
}
