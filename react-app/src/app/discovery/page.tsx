'use client';

import { useEffect, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// ─── Orphan component imports ────────────────────────────────────────────────
import DrawdownHistoryChart from '@/components/dashboard/DrawdownHistoryChart';
import BondMaturityLadder from '@/components/dashboard/BondMaturityLadder';
import RebalancingStatus from '@/components/dashboard/RebalancingStatus';
import { EtfsPositionsTable } from '@/components/dashboard/EtfsPositionsTable';
import { FactorLoadingsTable } from '@/components/dashboard/FactorLoadingsTable';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import ScenarioCompare from '@/components/dashboard/ScenarioCompare';
import TrackingFireChart from '@/components/dashboard/TrackingFireChart';
import GlidePath from '@/components/dashboard/GlidePath';
import GeographicExposureChart from '@/components/dashboard/GeographicExposureChart';
import AlphaVsSWRDChart from '@/components/dashboard/AlphaVsSWRDChart';
import AttributionAnalysis from '@/components/dashboard/AttributionAnalysis';
import RollingMetricsChart from '@/components/dashboard/RollingMetricsChart';
import { CryptoBandChart } from '@/components/dashboard/CryptoBandChart';
import { BondPoolComposition } from '@/components/dashboard/BondPoolComposition';
import BondPoolRunway from '@/components/dashboard/BondPoolRunway';
import BrasilConcentrationCard from '@/components/dashboard/BrasilConcentrationCard';
import { DCAStatusGrid } from '@/components/dashboard/DCAStatusGrid';
import { SemaforoTriggers } from '@/components/dashboard/SemaforoTriggers';
import { FamilyScenarioCards } from '@/components/dashboard/FamilyScenarioCards';
import FinancialWellnessActions from '@/components/dashboard/FinancialWellnessActions';
import { FireSimulator } from '@/components/dashboard/FireSimulator';
import IpcaTaxaProgress from '@/components/dashboard/IpcaTaxaProgress';
import { LifeEventsTable } from '@/components/dashboard/LifeEventsTable';
import { StatusDot } from '@/components/dashboard/StatusDot';

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

// ─── Card wrapper ────────────────────────────────────────────────────────────

function Card({ title, badge, verdict, children }: { title: string; badge?: React.ReactNode; verdict?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {badge}
          {verdict}
        </div>
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

// Verdict badge helper
function VerdictBadge({ integrate, tab }: { integrate: boolean; tab?: string }) {
  if (integrate) {
    return (
      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#16a34a', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
        🟢 {tab ?? 'Integrar'}
      </span>
    );
  }
  return (
    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 700 }}>
      🔴 Não integrar
    </span>
  );
}

// Wrapper for each orphan — shows label + file path + Head verdict
function OrphanWrapper({ name, file, integrate, tab, children }: {
  name: string; file: string; integrate: boolean; tab?: string; children: React.ReactNode
}) {
  const borderColor = integrate ? '#16a34a44' : '#dc262644';
  const headerBg = integrate ? '#16a34a18' : '#dc262618';
  const headerBorder = integrate ? '#16a34a33' : '#dc262633';
  const footerBorder = integrate ? '#16a34a22' : '#dc262622';
  return (
    <div style={{ border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}`, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace', flexShrink: 0 }}>{name}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ea580c', color: '#fff' }}>Órfão</span>
          <VerdictBadge integrate={integrate} tab={tab} />
        </div>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
      <div style={{ borderTop: `1px solid ${footerBorder}`, padding: '4px 12px' }}>
        <code style={{ fontSize: 10, color: 'var(--muted)' }}>{file}</code>
      </div>
    </div>
  );
}

// ─── Section A: New Component Mockups ────────────────────────────────────────

function RealYieldGauge({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const rf = data?.rf ?? {};
  const ipca12m = data?.macro?.ipca_12m ?? 4.14;
  const selic = data?.macro?.selic_meta ?? 14.75;
  const selicReal = selic - ipca12m;

  const bonds = [
    { key: 'ipca2029', label: 'IPCA+2029', d: rf.ipca2029 },
    { key: 'ipca2040', label: 'IPCA+2040', d: rf.ipca2040 },
    { key: 'ipca2050', label: 'IPCA+2050', d: rf.ipca2050 },
    { key: 'renda2065', label: 'Renda+2065', d: rf.renda2065 },
  ];

  return (
    <Card title="Real Yield Gauge" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--accent,#2563eb)', color: '#fff' }}>RF · Novo</span>} verdict={<VerdictBadge integrate tab="Portfolio" />}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        IPCA 12M: {ipca12m}% · Selic Real: {selicReal.toFixed(2)}%
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bonds.map(({ key, label, d }) => {
          if (!d) return null;
          const yieldReal = (d.taxa ?? 0) - ipca12m;
          const yieldRealLiq = yieldReal * 0.85;
          const color = yieldRealLiq > 6 ? '#16a34a' : yieldRealLiq >= 5 ? '#ca8a04' : '#dc2626';
          const barPct = Math.min(100, Math.max(0, (yieldRealLiq / 8) * 100));
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Nominal {fmtPct(d.taxa)} · Real Liq {fmtPct(yieldRealLiq)}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${barPct}%`, height: '100%', background: color, borderRadius: 3 }} />
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

function TaxDeferralClock({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patrimonioTotal = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  const liqPct = patrimonioTotal > 0 ? ((patrimonioTotal - irDiferido) / patrimonioTotal) * 100 : 0;

  return (
    <Card title="Tax Deferral Clock" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ea580c', color: '#fff' }}>Tax · Novo</span>} verdict={<VerdictBadge integrate tab="Portfolio" />}>
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
        <div style={{ display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${liqPct}%`, background: 'var(--accent,#2563eb)' }} />
          <div style={{ flex: 1, background: '#dc2626' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
          <span>Líquido {liqPct.toFixed(1)}%</span>
          <span>IR latente {(100 - liqPct).toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
}

function SequenceOfReturnsHeatmap({ data }: { data: any }) {
  const ft = data?.fire_trilha ?? {};
  const dates: string[] = ft.dates ?? [];
  const trilha: number[] = ft.trilha_brl ?? [];
  const spending = data?.premissas?.custo_vida_base ?? 250000;

  const years = [2035, 2036, 2037, 2038, 2039, 2040];
  const returns = [-0.30, -0.20, -0.10, 0, 0.10, 0.20];
  const returnLabels = ['-30%', '-20%', '-10%', '0%', '+10%', '+20%'];

  function getPatForYear(yr: number): number {
    const idx = dates.indexOf(`${yr}-12`);
    if (idx >= 0) return trilha[idx] ?? 0;
    const altIdx = dates.indexOf(`${yr}-01`);
    return altIdx >= 0 ? trilha[altIdx] ?? 0 : 0;
  }

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
    <Card title="Sequence of Returns Heatmap" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>FIRE · Novo</span>} verdict={<VerdictBadge integrate tab="FIRE" />}>
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
                    return (
                      <td key={ri} style={{ padding: '4px 6px', textAlign: 'center', background: cellColor(p), color: '#fff', borderRadius: 3 }}>
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
        Modelo simplificado · aba FIRE usa MC completo
      </div>
    </Card>
  );
}

function CarryDifferentialMonitor({ data }: { data: any }) {
  const macro = data?.macro ?? {};
  const spread = macro.spread_selic_ff ?? (macro.selic_meta - (macro.fed_funds ?? 3.64));
  const cambio = macro.cambio ?? data?.cambio;
  const selic = macro.selic_meta ?? 14.75;
  const ff = macro.fed_funds ?? 3.64;
  const spreadColor = spread >= 8 ? '#16a34a' : spread >= 5 ? '#ca8a04' : '#dc2626';

  return (
    <Card title="Carry Differential Monitor" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>Macro · Novo</span>} verdict={<VerdictBadge integrate={false} />}>
      <div className="grid grid-cols-2 gap-3">
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Spread Selic–FF</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: spreadColor }}>
            {spread != null ? `${spread.toFixed(2)}pp` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>Selic {selic}% · FF {ff}%</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Câmbio BRL/USD</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
            {cambio != null ? `R$${cambio.toFixed(3)}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
            Exp. cambial {macro.exposicao_cambial_pct ?? '—'}%
          </div>
        </div>
      </div>
    </Card>
  );
}

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

  function patBRLat(yr: number, dep: number): number {
    const t = yr - 2026;
    return patUsd * Math.pow(1 + retornoUsd, t) * cambio * Math.pow(1 + dep, t);
  }

  return (
    <Card title="BRL Purchasing Power Timeline" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#0891b2', color: '#fff' }}>FX · Novo</span>} verdict={<VerdictBadge integrate tab="FIRE" />}>
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
        Equity {(equityPctUsd * 100).toFixed(0)}% USD · Câmbio atual R${cambio.toFixed(3)}
      </div>
    </Card>
  );
}

function DrawdownRecoveryTable({ data }: { data: any }) {
  const dd = data?.drawdown_history ?? {};
  const events = dd.events ?? [];

  return (
    <Card title="Drawdown Recovery Table" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff' }}>Risco · Novo</span>} verdict={<VerdictBadge integrate tab="Backtest" />}>
      {events.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sem eventos registrados</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Evento', 'Queda', 'Meses↓', 'Meses rec.', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 500, color: 'var(--text)' }}>{ev.name ?? '—'}</td>
                  <td style={{ padding: '4px 6px', fontWeight: 700, color: (ev.depth_pct ?? 0) <= -20 ? '#dc2626' : '#ca8a04' }}>
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

function PatrimonioLiquidoIR({ data }: { data: any }) {
  const { privacyMode } = useUiStore();
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patBruto = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  const patLiq = patBruto - irDiferido;
  const irPct = patBruto > 0 ? (irDiferido / patBruto) * 100 : 0;

  return (
    <Card title="Patrimônio Líquido de IR" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>Advocate · Novo</span>} verdict={<VerdictBadge integrate tab="Now" />}>
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
        <div style={{ flex: patLiq, background: 'var(--accent,#2563eb)' }} />
        <div style={{ flex: irDiferido, background: '#dc2626' }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
        IR representa {irPct.toFixed(1)}% do bruto · P(FIRE) calculado sobre bruto (erro de framing)
      </div>
    </Card>
  );
}

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
    <Card title="Factor Exposure Heatmap" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#16a34a', color: '#fff' }}>Factor · Novo</span>} verdict={<VerdictBadge integrate={false} />}>
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
                    <td key={f} style={{ padding: '3px 5px', textAlign: 'center', background: heatColor(val), color: Math.abs(val) > 0.15 ? '#fff' : 'var(--text)', borderRadius: 2 }}>
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>Verde = loading positivo · Vermelho = loading negativo</div>
    </Card>
  );
}

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
    <Card title="Bond Ladder Timeline" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#16a34a', color: '#fff' }}>RF · Novo</span>} verdict={<VerdictBadge integrate tab="Retirada" />}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, paddingBottom: 4 }}>
        {bonds.map(({ key, label, year, d, vitalicio }) => {
          const val = d?.valor ?? 0;
          const meses = custoVidaMensal > 0 ? val / custoVidaMensal : 0;
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{meses.toFixed(1)}m</div>
              <div style={{ width: '100%', height: `${heightPct}%`, background: vitalicio ? '#7c3aed' : '#2563eb', borderRadius: '3px 3px 0 0', minHeight: 8 }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {bonds.map(({ key, label, year, d }) => (
          <div key={key} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
            <div style={{ fontSize: 10, fontWeight: 600 }} className="pv">{fmtBRL(d?.valor, privacyMode)}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{year}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── DcaItem builder (shared between DCAStatusGrid & SemaforoTriggers) ────────
function buildDcaItems(data: any): any[] {
  const dca = data?.dca_status ?? {};
  const items: any[] = [];

  const ipca2040 = dca.ipca2040;
  if (ipca2040) {
    items.push({
      id: 'ipca2040',
      nome: 'IPCA+ 2040',
      categoria: 'rf_ipca',
      taxa: ipca2040.taxa_atual ?? null,
      pisoCompra: ipca2040.piso ?? null,
      pisoVenda: null,
      gapPiso: ipca2040.gap_pp ?? null,
      status: ipca2040.ativo ? 'verde' : 'amarelo',
      dcaAtivo: ipca2040.ativo ?? false,
      posicaoBrl: data?.rf?.ipca2040?.valor ?? 0,
      pctCarteira: ipca2040.pct_carteira_atual ?? null,
      alvoPct: ipca2040.alvo_pct ?? null,
      gapAlvoPp: ipca2040.gap_alvo_pp ?? null,
      proxAcao: ipca2040.ativo ? 'DCA ativo' : 'DCA pausado',
    });
  }

  const ipca2050 = dca.ipca2050;
  if (ipca2050) {
    items.push({
      id: 'ipca2050',
      nome: 'IPCA+ 2050',
      categoria: 'rf_ipca',
      taxa: ipca2050.taxa_atual ?? null,
      pisoCompra: ipca2050.piso ?? null,
      pisoVenda: null,
      gapPiso: ipca2050.gap_pp ?? null,
      status: ipca2050.ativo ? 'verde' : 'amarelo',
      dcaAtivo: ipca2050.ativo ?? false,
      posicaoBrl: data?.rf?.ipca2050?.valor ?? 0,
      pctCarteira: ipca2050.pct_carteira_atual ?? null,
      alvoPct: ipca2050.alvo_pct ?? null,
      gapAlvoPp: ipca2050.gap_alvo_pp ?? null,
      proxAcao: ipca2050.ativo ? 'DCA ativo' : 'DCA pausado',
    });
  }

  const renda = dca.renda_plus;
  if (renda) {
    items.push({
      id: 'renda2065',
      nome: 'Renda+ 2065',
      categoria: 'rf_renda',
      taxa: renda.taxa_atual ?? null,
      pisoCompra: renda.piso ?? null,
      pisoVenda: null,
      gapPiso: renda.gap_pp ?? null,
      status: renda.ativo ? 'verde' : 'amarelo',
      dcaAtivo: renda.ativo ?? false,
      posicaoBrl: data?.rf?.renda2065?.valor ?? 0,
      pctCarteira: renda.pct_carteira_atual ?? null,
      alvoPct: renda.alvo_pct ?? null,
      gapAlvoPp: renda.gap_alvo_pp ?? null,
      proxAcao: renda.ativo ? 'DCA ativo' : 'DCA pausado',
    });
  }

  const hodl = data?.hodl11;
  if (hodl) {
    items.push({
      id: 'hodl11',
      nome: 'HODL11',
      categoria: 'crypto',
      taxa: hodl.pnl_pct ?? null,
      pisoCompra: null,
      pisoVenda: null,
      gapPiso: null,
      status: hodl.banda?.status ?? 'verde',
      dcaAtivo: false,
      posicaoBrl: hodl.valor ?? 0,
      pctCarteira: hodl.banda?.atual_pct ?? null,
      alvoPct: hodl.banda?.alvo_pct ?? null,
      gapAlvoPp: null,
      proxAcao: 'Manter banda',
      bandaMin: hodl.banda?.min_pct,
      bandaMax: hodl.banda?.max_pct,
      bandaAtual: hodl.banda?.atual_pct,
    });
  }

  return items;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DiscoveryPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Discovery page: Failed to load data:', e));
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

  // ── Derived props for orphan components ────────────────────────────────────
  const drift = data?.drift ?? {};
  const pesosTarget = data?.pesosTarget ?? {};
  const premissas = data?.premissas ?? {};
  const posicoes = data?.posicoes ?? {};
  const rf = data?.rf ?? {};
  const attribution = data?.attribution ?? {};
  const rollingSharpe = data?.rolling_sharpe ?? {};
  const backtest = data?.backtest ?? {};
  const scenarioCmp = data?.scenario_comparison ?? {};
  const spendingBD = data?.spending_breakdown ?? {};
  const glide = data?.glide ?? {};
  const fireBondPool = data?.fire?.bond_pool_readiness ?? {};
  const concentracao = data?.concentracao_brasil ?? {};
  const fireByProfile: any[] = Array.isArray(data?.fire?.by_profile) ? data.fire.by_profile : [];
  const dcaItems = useMemo(() => buildDcaItems(data), [data]);

  // Geo exposure aggregated from etf_composition × drift weights
  const etfComp = data?.etf_composition?.etfs ?? {};
  const equityTotal = (drift.SWRD?.atual ?? 0) + (drift.AVGS?.atual ?? 0) + (drift.AVEM?.atual ?? 0);
  const swrdW = equityTotal > 0 ? (drift.SWRD?.atual ?? 0) / equityTotal : 0.5;
  const avgsW = equityTotal > 0 ? (drift.AVGS?.atual ?? 0) / equityTotal : 0.3;
  const avemW = equityTotal > 0 ? (drift.AVEM?.atual ?? 0) / equityTotal : 0.2;
  const swrdR = etfComp.SWRD?.regioes ?? { EUA: 0.65, Europa: 0.22, Japão: 0.06, 'Outros DM': 0.07 };
  const avgsR = etfComp.AVGS?.regioes ?? { Europa: 0.45, Japão: 0.25, EUA: 0.15, Outros: 0.15 };
  const geoUsa = swrdW * (swrdR.EUA ?? 0) + avgsW * (avgsR.EUA ?? 0);
  const geoEurope = swrdW * (swrdR.Europa ?? 0) + avgsW * (avgsR.Europa ?? 0);
  const geoJapan = swrdW * (swrdR.Japão ?? 0) + avgsW * (avgsR.Japão ?? 0);
  const geoOtherDm = swrdW * (swrdR['Outros DM'] ?? 0) + avgsW * ((avgsR.Outros ?? 0));
  const geoEm = avemW * 1.0;
  const totalUsd = premissas.patrimonio_atual ? premissas.patrimonio_atual / (data?.cambio ?? 5.15) * (equityTotal / 100) : 0;

  // Attribution analysis props
  const attrBucket = attribution.por_bucket ?? {};
  const totalAttrBRL = Object.values(attrBucket).reduce((s: number, v: any) => s + (v ?? 0), 0) as number;
  const attrSwrdPct = totalAttrBRL > 0 ? (attrBucket.SWRD ?? 0) / totalAttrBRL * 100 : 0;
  const attrAvgsPct = totalAttrBRL > 0 ? (attrBucket.AVGS ?? 0) / totalAttrBRL * 100 : 0;
  const attrAvemPct = totalAttrBRL > 0 ? (attrBucket.AVEM ?? 0) / totalAttrBRL * 100 : 0;

  // Family scenario cards — convert list to expected format
  const familyPerfis: Record<string, any> = {};
  const familyCenarios: Record<string, Record<string, number>> = {
    base: {}, fav: {}, stress: {},
  };
  fireByProfile.forEach((p: any) => {
    familyPerfis[p.profile] = {
      label: p.label,
      gasto_anual: p.gasto_anual,
      descricao: p.label,
    };
    familyCenarios.base[p.profile] = p.p_fire_53 ?? p.p_at_threshold ?? 0;
    familyCenarios.fav[p.profile] = p.p_fire_53_fav ?? 0;
    familyCenarios.stress[p.profile] = p.p_fire_53_stress ?? 0;
  });

  // Wellness actions from wellness_config metrics
  const wellnessMetrics: any[] = Array.isArray(data?.wellness_config?.metrics)
    ? data.wellness_config.metrics : [];
  const pfire = (data?.pfire_base as any)?.base ?? 90.8;
  const wellnessScore = Math.min(100, pfire * 0.8 + 20);
  const topAcoes = wellnessMetrics.slice(0, 5).map((m: any, i: number) => ({
    rank: i + 1,
    metric: m.label ?? m.id,
    potential_pts: m.max ?? 10,
    current_pts: m.max ?? 10,
    action: m.description ?? '—',
    priority: (i === 0 ? 'alta' : i <= 2 ? 'media' : 'baixa') as 'alta' | 'media' | 'baixa',
  }));

  // LifeEventsTable — build compatible format from fire_matrix and eventos_vida
  const lifeEventsCompatible = {
    eventos: fireByProfile.slice(1).map((p: any, i: number) => ({
      id: p.profile,
      label: p.label ?? p.profile,
      spending_novo: p.gasto_anual,
      ano_inicio: 2028 + i,
      confirmado: true,
      pfire_2040: p.p_fire_53 ?? 0,
      delta_pp: (p.p_fire_53 ?? 0) - ((fireByProfile[0] as any)?.p_fire_53 ?? 0),
      patrimonio_necessario: (p.gasto_anual ?? 250000) / 0.03,
    })),
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 600 }}>Temporário</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Novos componentes sugeridos pelos agentes + inativos para reavaliação
        </p>
      </div>

      {/* ── Section A: New Components ──────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
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

      {/* ── Section B: Orphan Components (rendered) ────────────────────────── */}
      <div>
        <SectionHeader
          title="B — Componentes Inativos (Órfãos)"
          sub="25 componentes existem no codebase mas não são importados em nenhuma página — renderizados aqui com dados reais."
        />

        {/* Renda Fixa */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Renda Fixa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <OrphanWrapper name="BondMaturityLadder" file="src/components/dashboard/BondMaturityLadder.tsx" integrate tab="Retirada">
            <BondMaturityLadder
              bonds1y={0}
              bonds2y={0}
              bonds3y={rf.ipca2029?.valor ?? 0}
              bonds5y={0}
              bonds10y={rf.ipca2040?.valor ?? 0}
              bondsOver10y={(rf.ipca2050?.valor ?? 0) + (rf.renda2065?.valor ?? 0)}
              totalBonds={
                (rf.ipca2029?.valor ?? 0) + (rf.ipca2040?.valor ?? 0) +
                (rf.ipca2050?.valor ?? 0) + (rf.renda2065?.valor ?? 0)
              }
            />
          </OrphanWrapper>

          <OrphanWrapper name="BondPoolComposition" file="src/components/dashboard/BondPoolComposition.tsx" integrate tab="Retirada">
            <BondPoolComposition
              data={{
                valor_atual_brl: fireBondPool.valor_atual_brl ?? 0,
                anos_gastos: fireBondPool.anos_gastos ?? 0,
                meta_anos: fireBondPool.meta_anos ?? 7,
                status: fireBondPool.status ?? 'early',
                composicao: fireBondPool.composicao ?? {},
              }}
              runwayAnosPosFire={data?.bond_pool_runway?.anos_cobertura_pos_fire ?? 0}
              poolTotal={fireBondPool.valor_atual_brl ?? 0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="BondPoolRunway" file="src/components/dashboard/BondPoolRunway.tsx" integrate tab="Retirada">
            <BondPoolRunway
              poolCurrentValue={fireBondPool.valor_atual_brl ?? 0}
              fireAnnualExpense={premissas.custo_vida_base ?? 250000}
              expectedReturn={data?.bond_pool_runway?.taxas?.ipca2040 ?? 0.0707}
              projectedYears={5}
              yearsToFire={premissas.anos_para_fire ?? 14}
              swrPercent={data?.fire?.swr_current ?? 3.0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="IpcaTaxaProgress" file="src/components/dashboard/IpcaTaxaProgress.tsx" integrate tab="Now">
            <IpcaTaxaProgress
              taxaAtual={rf.ipca2040?.taxa ?? 7.07}
              ipca2040Valor={rf.ipca2040?.valor ?? 0}
              ipca2040AlvoPercent={data?.dca_status?.ipca2040?.alvo_pct ?? 12}
              ipca2040AtualPercent={drift.IPCA?.atual ?? 3.5}
              ipca2050Valor={rf.ipca2050?.valor ?? 0}
              ipca2050AlvoPercent={3}
              ipca2050AtualPercent={rf.ipca2050 ? drift.IPCA?.atual ? drift.IPCA.atual * 0.3 : 0.3 : 0}
              ipcaTotalBrl={(rf.ipca2040?.valor ?? 0) + (rf.ipca2050?.valor ?? 0) + (rf.ipca2029?.valor ?? 0)}
              totalPortfolio={premissas.patrimonio_atual ?? 0}
            />
          </OrphanWrapper>
        </div>

        {/* Equity & Factor */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Equity & Factor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <OrphanWrapper name="EtfsPositionsTable" file="src/components/dashboard/EtfsPositionsTable.tsx" integrate tab="Portfolio">
            <EtfsPositionsTable data={posicoes} />
          </OrphanWrapper>

          <OrphanWrapper name="FactorLoadingsTable" file="src/components/dashboard/FactorLoadingsTable.tsx" integrate={false}>
            <FactorLoadingsTable data={data?.factor_loadings ?? {}} />
          </OrphanWrapper>

          <OrphanWrapper name="GeographicExposureChart" file="src/components/dashboard/GeographicExposureChart.tsx" integrate={false}>
            <GeographicExposureChart
              usa={geoUsa * 100}
              europe={geoEurope * 100}
              japan={geoJapan * 100}
              otherDm={geoOtherDm * 100}
              em={geoEm * 100}
              totalUsd={totalUsd}
            />
          </OrphanWrapper>

          <OrphanWrapper name="AlphaVsSWRDChart" file="src/components/dashboard/AlphaVsSWRDChart.tsx" integrate tab="Performance">
            <AlphaVsSWRDChart
              oneYear={{
                targetReturn: backtest.metrics_by_period?.all?.target?.cagr ?? 14.89,
                swrdReturn: backtest.metrics_by_period?.all?.shadowA?.cagr ?? 13.7,
              }}
              threeYear={{
                targetReturn: backtest.metrics_by_period?.since2013?.target?.cagr ?? 14.89,
                swrdReturn: backtest.metrics_by_period?.since2013?.shadowA?.cagr ?? 13.7,
              }}
              fiveYear={{
                targetReturn: backtest.metrics_by_period?.since2009?.target?.cagr ?? 14.89,
                swrdReturn: backtest.metrics_by_period?.since2009?.shadowA?.cagr ?? 13.7,
              }}
              tenYear={{
                targetReturn: backtest.metrics?.target?.cagr ?? 14.14,
                swrdReturn: backtest.metrics?.shadowA?.cagr ?? 12.96,
              }}
              alphaLiquidoPctYear={0.16}
            />
          </OrphanWrapper>

          <OrphanWrapper name="AttributionAnalysis" file="src/components/dashboard/AttributionAnalysis.tsx" integrate={false}>
            <AttributionAnalysis
              swrdAllocation={drift.SWRD?.atual ?? 36.3}
              swrdReturn={attrSwrdPct}
              avgsAllocation={drift.AVGS?.atual ?? 28.1}
              avgsReturn={attrAvgsPct}
              avemAllocation={drift.AVEM?.atual ?? 23.2}
              avemReturn={attrAvemPct}
              rfAllocation={drift.IPCA?.atual ?? 5.9}
              rfReturn={attribution.rf ? attribution.rf / (premissas.patrimonio_atual ?? 1) * 100 : 0}
              totalReturn={attribution.cagr_total ?? 8.19}
              periodLabel={`Desde ${attribution._inicio ?? '2021-04'}`}
            />
          </OrphanWrapper>

          <OrphanWrapper name="RollingMetricsChart" file="src/components/dashboard/RollingMetricsChart.tsx" integrate tab="Performance">
            <RollingMetricsChart
              dates={rollingSharpe.dates ?? []}
              sharpeBRL={rollingSharpe.values ?? []}
              sharpeUSD={rollingSharpe.values_usd ?? []}
              sortino={rollingSharpe.sortino ?? []}
              volatilidade={rollingSharpe.volatilidade ?? []}
            />
          </OrphanWrapper>
        </div>

        {/* Portfolio & Risco */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Portfolio & Risco</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <OrphanWrapper name="DrawdownHistoryChart" file="src/components/dashboard/DrawdownHistoryChart.tsx" integrate tab="Backtest">
            <DrawdownHistoryChart
              dates={data?.drawdown_history?.dates ?? []}
              drawdownPct={data?.drawdown_history?.drawdown_pct ?? []}
              maxDrawdown={data?.drawdown_history?.max_drawdown ?? 0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="RebalancingStatus" file="src/components/dashboard/RebalancingStatus.tsx" integrate tab="Now">
            <RebalancingStatus
              swrdTarget={(pesosTarget.SWRD ?? 0.395) * 100}
              swrdCurrent={drift.SWRD?.atual ?? 36.3}
              avgsTarget={(pesosTarget.AVGS ?? 0.237) * 100}
              avgsCurrent={drift.AVGS?.atual ?? 28.1}
              avemTarget={(pesosTarget.AVEM ?? 0.158) * 100}
              avemCurrent={drift.AVEM?.atual ?? 23.2}
              ipcaTarget={(pesosTarget.IPCA ?? 0.15) * 100}
              ipcaCurrent={drift.IPCA?.atual ?? 5.9}
              hodl11Target={(pesosTarget.HODL11 ?? 0.03) * 100}
              hodl11Current={drift.HODL11?.atual ?? 2.8}
              driftThresholdPp={5}
            />
          </OrphanWrapper>

          <OrphanWrapper name="BrasilConcentrationCard" file="src/components/dashboard/BrasilConcentrationCard.tsx" integrate tab="Portfolio">
            <BrasilConcentrationCard
              hodl11={concentracao.composicao?.hodl11_brl ?? 0}
              ipcaTotal={concentracao.composicao?.rf_total_brl ?? 0}
              rendaPlus={concentracao.composicao?.rf_detalhe?.renda2065 ?? 0}
              cryptoLegado={concentracao.composicao?.crypto_legado_brl ?? 0}
              totalBrl={concentracao.total_brasil_brl ?? 0}
              concentrationBrazil={concentracao.brasil_pct ?? 0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="CryptoBandChart" file="src/components/dashboard/CryptoBandChart.tsx" integrate tab="Portfolio">
            <CryptoBandChart
              banda={data?.hodl11?.banda ?? { min_pct: 1.5, alvo_pct: 3.0, max_pct: 5.0, atual_pct: 2.81, status: 'verde' }}
              label="HODL11 — BTC Wrapper — B3"
              valor={data?.hodl11?.valor}
              pnl_pct={data?.hodl11?.pnl_pct}
            />
          </OrphanWrapper>
        </div>

        {/* DCA & Gatilhos */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>DCA & Gatilhos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <OrphanWrapper name="DCAStatusGrid" file="src/components/dashboard/DCAStatusGrid.tsx" integrate tab="Now">
            <DCAStatusGrid items={dcaItems} />
          </OrphanWrapper>

          <OrphanWrapper name="SemaforoTriggers" file="src/components/dashboard/SemaforoTriggers.tsx" integrate tab="Now">
            <SemaforoTriggers items={dcaItems} />
          </OrphanWrapper>
        </div>

        {/* FIRE & Planejamento */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>FIRE & Planejamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <OrphanWrapper name="TrackingFireChart" file="src/components/dashboard/TrackingFireChart.tsx" integrate tab="FIRE">
            <TrackingFireChart
              realizadoBrl={premissas.patrimonio_atual ?? 0}
              projetadoP50Brl={data?.fire?.pat_mediano_fire ?? 0}
              fireGatilhoBrl={premissas.patrimonio_gatilho ?? 8330000}
              patrimonioAtualBrl={premissas.patrimonio_atual ?? 0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="ScenarioCompare" file="src/components/dashboard/ScenarioCompare.tsx" integrate tab="FIRE">
            <ScenarioCompare
              baseScenario={{
                patrimonio50anos: scenarioCmp.base?.pat_mediano ?? 0,
                pfirePercentual: scenarioCmp.base?.base ?? 0,
                swrPercent: scenarioCmp.base?.swr ?? 0,
                mesesParaFire: ((scenarioCmp.base?.idade ?? 53) - (premissas.idade_atual ?? 39)) * 12,
              }}
              aspirationalScenario={{
                patrimonio50anos: scenarioCmp.aspiracional?.pat_mediano ?? 0,
                pfirePercentual: scenarioCmp.aspiracional?.base ?? 0,
                swrPercent: scenarioCmp.aspiracional?.swr ?? 0,
                mesesParaFire: ((scenarioCmp.aspiracional?.idade ?? 49) - (premissas.idade_atual ?? 39)) * 12,
              }}
              currentPatrimonio={premissas.patrimonio_atual ?? 0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="GlidePath" file="src/components/dashboard/GlidePath.tsx" integrate tab="FIRE">
            <GlidePath
              currentAge={premissas.idade_atual ?? 39}
              retirementAge={premissas.idade_aposentadoria ?? 53}
              currentEquityPercent={glide.equity?.[0] ?? 79}
              currentRfPercent={(glide.ipca_longo?.[0] ?? 15) + (glide.renda_plus?.[0] ?? 0)}
              retirementEquityPercent={glide.equity?.[2] ?? 79}
              retirementRfPercent={(glide.ipca_curto?.[3] ?? 3) + (glide.renda_plus?.[3] ?? 6)}
            />
          </OrphanWrapper>

          <OrphanWrapper name="FamilyScenarioCards" file="src/components/dashboard/FamilyScenarioCards.tsx" integrate tab="FIRE">
            <FamilyScenarioCards
              data={{ perfis: familyPerfis, cenarios: familyCenarios }}
              pfireBase={(data?.pfire_base as any)?.base ?? 90.8}
              pfireFav={(data?.pfire_base as any)?.fav ?? 94.7}
              pfireStress={(data?.pfire_base as any)?.stress ?? 87.6}
            />
          </OrphanWrapper>

          <OrphanWrapper name="FireSimulator" file="src/components/dashboard/FireSimulator.tsx" integrate tab="Simuladores">
            <FireSimulator
              patrimonioAtual={premissas.patrimonio_atual ?? 0}
              patrimonioGatilho={premissas.patrimonio_gatilho ?? 8330000}
              aporteMensalBase={premissas.aporte_mensal ?? 25000}
              custoVidaBase={premissas.custo_vida_base ?? 250000}
              retornoEquityBase={premissas.retorno_equity_base ?? 0.0485}
              idadeAtual={premissas.idade_atual ?? 39}
              idadeAposentadoria={premissas.idade_aposentadoria ?? 53}
              swrGatilho={0.03}
            />
          </OrphanWrapper>

          <OrphanWrapper name="LifeEventsTable" file="src/components/dashboard/LifeEventsTable.tsx" integrate tab="FIRE">
            <LifeEventsTable data={lifeEventsCompatible} />
          </OrphanWrapper>
        </div>

        {/* Spending & Wellness */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Spending & Wellness</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <OrphanWrapper name="SpendingBreakdown" file="src/components/dashboard/SpendingBreakdown.tsx" integrate tab="Retirada">
            <SpendingBreakdown
              musthave={spendingBD.must_spend_anual ?? 180887}
              likes={spendingBD.like_spend_anual ?? 51403}
              imprevistos={spendingBD.imprevistos_anual ?? 4357}
              totalAnual={spendingBD.total_anual ?? 236647}
            />
          </OrphanWrapper>

          <OrphanWrapper name="FinancialWellnessActions" file="src/components/dashboard/FinancialWellnessActions.tsx" integrate={false}>
            <FinancialWellnessActions
              wellnessScore={wellnessScore}
              wellnessLabel={wellnessScore >= 80 ? 'Excellent' : wellnessScore >= 65 ? 'Good' : 'Fair'}
              topAcoes={topAcoes}
            />
          </OrphanWrapper>
        </div>

        {/* Primitivos */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Primitivos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OrphanWrapper name="StatusDot" file="src/components/dashboard/StatusDot.tsx" integrate={false}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <StatusDot status="verde" /> Verde
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <StatusDot status="amarelo" /> Amarelo
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <StatusDot status="vermelho" /> Vermelho
              </div>
            </div>
          </OrphanWrapper>
        </div>
      </div>
    </div>
  );
}
