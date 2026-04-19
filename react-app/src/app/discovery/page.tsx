'use client';

import { useEffect, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// ─── Extracted Section A component imports ───────────────────────────────────
import TLHMonitor from '@/components/dashboard/TLHMonitor';
import SoRRBondTentTrigger from '@/components/dashboard/SoRRBondTentTrigger';
import CAPEAportePriority from '@/components/dashboard/CAPEAportePriority';
import RealYieldGauge from '@/components/dashboard/RealYieldGauge';
import TaxDeferralClock from '@/components/dashboard/TaxDeferralClock';
import PatrimonioLiquidoIR from '@/components/dashboard/PatrimonioLiquidoIR';
import SequenceOfReturnsHeatmap from '@/components/dashboard/SequenceOfReturnsHeatmap';
import BRLPurchasingPowerTimeline from '@/components/dashboard/BRLPurchasingPowerTimeline';
import DrawdownRecoveryTable from '@/components/dashboard/DrawdownRecoveryTable';
import BondLadderTimeline from '@/components/dashboard/BondLadderTimeline';

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

function Card({ title, badge, verdict, votes, children }: { title: string; badge?: React.ReactNode; verdict?: React.ReactNode; votes?: AgentVote[]; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {badge}
          {verdict}
        </div>
      </div>
      {votes && votes.length > 0 && <AgentVoteRow votes={votes} />}
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

// Agent vote tags — shows per-agent votes as compact colored badges
type AgentVote = { agent: string; verdict: 'sim' | 'nao' | 'condicional'; conviction?: number };

function AgentVoteRow({ votes }: { votes: AgentVote[] }) {
  const colors: Record<AgentVote['verdict'], { bg: string; label: string }> = {
    sim:        { bg: '#16a34a', label: 'integrar' },
    nao:        { bg: '#dc2626', label: 'remover' },
    condicional:{ bg: '#ca8a04', label: 'condicional' },
  };
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6, marginBottom: 2 }}>
      {votes.map(v => {
        const c = colors[v.verdict];
        return (
          <span key={v.agent} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: c.bg + '22', color: c.bg, border: `1px solid ${c.bg}55`, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {v.agent}: {c.label}{v.conviction ? ` ${v.conviction}/5` : ''}
          </span>
        );
      })}
    </div>
  );
}

// Wrapper for each orphan — shows label + file path + Head verdict
function OrphanWrapper({ name, file, integrate, tab, votes, children }: {
  name: string; file: string; integrate: boolean; tab?: string; votes?: AgentVote[]; children: React.ReactNode
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
      {votes && votes.length > 0 && (
        <div style={{ padding: '4px 12px 0', borderBottom: `1px solid ${footerBorder}` }}>
          <AgentVoteRow votes={votes} />
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
      <div style={{ borderTop: `1px solid ${footerBorder}`, padding: '4px 12px' }}>
        <code style={{ fontSize: 10, color: 'var(--muted)' }}>{file}</code>
      </div>
    </div>
  );
}

// ─── Section A: Discovery wrappers (components extracted to src/components/dashboard/) ─────────

function TLHMonitorDisc({ data }: { data: any }) {
  const lotes = data?.tlh ?? [];
  const gatilho = data?.tlhGatilho ?? 0.05;
  const cambio = data?.cambio ?? 5.15;
  return (
    <Card
      title="TLH Monitor — Tax-Loss Harvesting Sistemático"
      badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 600 }}>Science · Novo</span>}
      verdict={<VerdictBadge integrate tab="Portfolio" />}
      votes={[
        { agent: 'Tax', verdict: 'sim', conviction: 5 },
        { agent: 'Advocate', verdict: 'sim', conviction: 4 },
        { agent: 'Science', verdict: 'sim', conviction: 5 },
      ]}
    >
      <TLHMonitor lotes={lotes} gatilho={gatilho} cambio={cambio} />
    </Card>
  );
}

function SoRRBondTentTriggerDisc({ data }: { data: any }) {
  const premissas = data?.premissas ?? {};
  const drift = data?.drift ?? {};
  // RF% = IPCA drift atual (única entrada RF no drift map)
  const rfPctAtual = drift.IPCA?.atual ?? 5.9;
  return (
    <Card
      title="SoRR Bond Tent Trigger"
      badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 600 }}>Science · Novo</span>}
      verdict={<VerdictBadge integrate tab="FIRE" />}
      votes={[
        { agent: 'FIRE', verdict: 'sim', conviction: 5 },
        { agent: 'RF', verdict: 'sim', conviction: 4 },
        { agent: 'Science', verdict: 'sim', conviction: 5 },
      ]}
    >
      <SoRRBondTentTrigger
        idadeAtual={premissas.idade_atual ?? 39}
        idadeFire={premissas.idade_cenario_base ?? 53}
        rfPctAtual={rfPctAtual}
        patrimonioAtual={premissas.patrimonio_atual ?? 0}
      />
    </Card>
  );
}

function CAPEAportePriorityDisc({ data }: { data: any }) {
  const drift = data?.drift ?? {};
  // Expected returns Research Affiliates (CAPE-based, atualização mensal)
  const etfs = [
    { ticker: 'SWRD', atual: drift.SWRD?.atual ?? 36.3, alvo: drift.SWRD?.alvo ?? 39.5, expectedReturn: 3.4 },
    { ticker: 'AVGS', atual: drift.AVGS?.atual ?? 28.1, alvo: drift.AVGS?.alvo ?? 23.7, expectedReturn: 9.5 },
    { ticker: 'AVEM', atual: drift.AVEM?.atual ?? 23.2, alvo: drift.AVEM?.alvo ?? 15.8, expectedReturn: 9.0 },
  ];
  return (
    <Card
      title="CAPE-Based Aporte Priority"
      badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 600 }}>Science · Novo</span>}
      verdict={<VerdictBadge integrate tab="Now" />}
      votes={[
        { agent: 'Factor', verdict: 'sim', conviction: 4 },
        { agent: 'FIRE', verdict: 'sim', conviction: 4 },
        { agent: 'Science', verdict: 'sim', conviction: 5 },
      ]}
    >
      <CAPEAportePriority etfs={etfs} />
    </Card>
  );
}

function RealYieldGaugeDisc({ data }: { data: any }) {
  const rf = data?.rf ?? {};
  const ipca12m = data?.macro?.ipca_12m ?? 4.14;
  const selicMeta = data?.macro?.selic_meta ?? 14.75;
  return (
    <Card title="Real Yield Gauge" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--accent,#2563eb)', color: '#fff' }}>RF · Novo</span>} verdict={<VerdictBadge integrate tab="Portfolio" />}>
      <RealYieldGauge
        ipca2029={rf.ipca2029}
        ipca2040={rf.ipca2040}
        ipca2050={rf.ipca2050}
        renda2065={rf.renda2065}
        ipca12m={ipca12m}
        selicMeta={selicMeta}
      />
    </Card>
  );
}

function TaxDeferralClockDisc({ data }: { data: any }) {
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patrimonioTotal = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  return (
    <Card title="Tax Deferral Clock" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#ea580c', color: '#fff' }}>Tax · Novo</span>} verdict={<VerdictBadge integrate tab="Portfolio" />}>
      <TaxDeferralClock irDiferidoTotal={irDiferido} patrimonioTotal={patrimonioTotal} />
    </Card>
  );
}

function SequenceOfReturnsHeatmapDisc({ data }: { data: any }) {
  const ft = data?.fire_trilha ?? {};
  return (
    <Card title="Sequence of Returns Heatmap" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>FIRE · Novo</span>} verdict={<VerdictBadge integrate={false} />} votes={[{agent:'FIRE',verdict:'sim'},{agent:'Risco',verdict:'sim'},{agent:'Advocate',verdict:'nao',conviction:5}]}>
      <SequenceOfReturnsHeatmap
        dates={ft.dates ?? []}
        trilhaBrl={ft.trilha_brl ?? []}
        spending={data?.premissas?.custo_vida_base ?? 250000}
      />
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
    <Card title="Carry Differential Monitor" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>Macro · Novo</span>} verdict={<VerdictBadge integrate tab="Now" />} votes={[{agent:'FX',verdict:'sim',conviction:4},{agent:'Advocate',verdict:'sim',conviction:4},{agent:'Macro',verdict:'nao'}]}>
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

function BRLPurchasingPowerTimelineDisc({ data }: { data: any }) {
  const cambio = data?.macro?.cambio ?? data?.cambio ?? 5.15;
  const equityPctUsd = (data?.macro?.exposicao_cambial_pct ?? 87.9) / 100;
  const patTotal = data?.premissas?.patrimonio_atual ?? 3570565;
  return (
    <Card title="Equity USD em BRL — Sensibilidade Cambial" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#0891b2', color: '#fff' }}>FX · Novo</span>} verdict={<VerdictBadge integrate tab="FIRE" />}>
      <BRLPurchasingPowerTimeline cambio={cambio} equityPctUsd={equityPctUsd} patrimonioAtual={patTotal} />
    </Card>
  );
}

function DrawdownRecoveryTableDisc({ data }: { data: any }) {
  const events = data?.drawdown_history?.events ?? [];
  return (
    <Card title="Drawdown Recovery Table" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dc2626', color: '#fff' }}>Risco · Novo</span>} verdict={<VerdictBadge integrate tab="Backtest" />}>
      <DrawdownRecoveryTable events={events} />
    </Card>
  );
}

function PatrimonioLiquidoIRDisc({ data }: { data: any }) {
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patrimonioFinanceiro = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  return (
    <Card title="Patrimônio Líquido de IR" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#7c3aed', color: '#fff' }}>Tax · Novo</span>} verdict={<VerdictBadge integrate={false} />} votes={[{agent:'RF',verdict:'condicional'},{agent:'Tax',verdict:'condicional'},{agent:'Advocate',verdict:'nao',conviction:4}]}>
      <PatrimonioLiquidoIR irDiferido={irDiferido} patrimonioFinanceiro={patrimonioFinanceiro} />
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

function BondLadderTimelineDisc({ data }: { data: any }) {
  const rf = data?.rf ?? {};
  const custoVidaMensal = (data?.premissas?.custo_vida_base ?? 250000) / 12;
  return (
    <Card title="Bond Ladder Timeline" badge={<span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#16a34a', color: '#fff' }}>RF · Novo</span>} verdict={<VerdictBadge integrate tab="Retirada" />}>
      <BondLadderTimeline
        ipca2029={rf.ipca2029}
        ipca2040={rf.ipca2040}
        ipca2050={rf.ipca2050}
        renda2065={rf.renda2065}
        custoVidaMensal={custoVidaMensal}
      />
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
      pisoCompra: renda.piso_compra ?? null,
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
          <TLHMonitorDisc data={data} />
          <SoRRBondTentTriggerDisc data={data} />
          <CAPEAportePriorityDisc data={data} />
          <RealYieldGaugeDisc data={data} />
          <TaxDeferralClockDisc data={data} />
          <SequenceOfReturnsHeatmapDisc data={data} />
          <CarryDifferentialMonitor data={data} />
          <BRLPurchasingPowerTimelineDisc data={data} />
          <DrawdownRecoveryTableDisc data={data} />
          <PatrimonioLiquidoIRDisc data={data} />
          <FactorExposureHeatmap data={data} />
          <BondLadderTimelineDisc data={data} />
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
              runwayAnosPosFire={
                Array.isArray(data?.bond_pool_runway?.anos_cobertura_pos_fire)
                  ? (data.bond_pool_runway.anos_cobertura_pos_fire[4] ?? 5)  // P50 (índice 4 de 10)
                  : (data?.bond_pool_runway?.anos_cobertura_pos_fire ?? 0)
              }
              poolTotal={fireBondPool.valor_atual_brl ?? 0}
            />
          </OrphanWrapper>

          <OrphanWrapper name="BondPoolRunway" file="src/components/dashboard/BondPoolRunway.tsx" integrate tab="Retirada">
            <BondPoolRunway
              poolCurrentValue={fireBondPool.valor_atual_brl ?? 0}
              fireAnnualExpense={premissas.custo_vida_base ?? 250000}
              expectedReturn={(data?.bond_pool_runway?.taxas?.td2040_real_pct ?? 7.1) / 100}
              projectedYears={5}
              yearsToFire={(data?.premissas?.idade_cenario_base ?? 53) - (premissas.idade_atual ?? 39)}
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
              ipca2050AtualPercent={premissas.patrimonio_atual && rf.ipca2050?.valor
  ? (rf.ipca2050.valor / premissas.patrimonio_atual) * 100
  : 0}
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
                // "since2020" ≈ 6 anos (período mais curto disponível)
                targetReturn: backtest.metrics_by_period?.since2020?.target?.cagr ?? backtest.metrics_by_period?.['5y']?.target?.cagr ?? 14.89,
                swrdReturn: backtest.metrics_by_period?.since2020?.shadowA?.cagr ?? backtest.metrics_by_period?.['5y']?.shadowA?.cagr ?? 13.7,
              }}
              threeYear={{
                // "since2013" ≈ 13 anos
                targetReturn: backtest.metrics_by_period?.since2013?.target?.cagr ?? 14.89,
                swrdReturn: backtest.metrics_by_period?.since2013?.shadowA?.cagr ?? 13.7,
              }}
              fiveYear={{
                // "since2009" ≈ 17 anos
                targetReturn: backtest.metrics_by_period?.since2009?.target?.cagr ?? 14.89,
                swrdReturn: backtest.metrics_by_period?.since2009?.shadowA?.cagr ?? 13.7,
              }}
              tenYear={{
                // "all" ≈ 21 anos (período mais longo)
                targetReturn: backtest.metrics_by_period?.all?.target?.cagr ?? backtest.metrics?.target?.cagr ?? 14.14,
                swrdReturn: backtest.metrics_by_period?.all?.shadowA?.cagr ?? backtest.metrics?.shadowA?.cagr ?? 12.96,
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

          <OrphanWrapper name="RebalancingStatus" file="src/components/dashboard/RebalancingStatus.tsx" integrate={false} votes={[{agent:'Factor',verdict:'sim'},{agent:'Risco',verdict:'sim'},{agent:'Advocate',verdict:'nao',conviction:4}]}>
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
              retirementRfPercent={(glide.ipca_curto?.[2] ?? 3) + (glide.renda_plus?.[2] ?? 0)}
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
