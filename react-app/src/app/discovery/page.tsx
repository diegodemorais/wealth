'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

// ─── Section A component imports ─────────────────────────────────────────────
import TLHMonitor from '@/components/dashboard/TLHMonitor';
import SoRRBondTentTrigger from '@/components/dashboard/SoRRBondTentTrigger';
import CAPEAportePriority from '@/components/dashboard/CAPEAportePriority';

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

// ─── Section A: Discovery wrappers ───────────────────────────────────────────

function TLHMonitorDisc({ data }: { data: any }) {
  const lotes = data?.tlh ?? [];
  const gatilho = data?.tlhGatilho ?? 0.05;
  const cambio = data?.mercado?.cambio_brl_usd ?? data?.patrimonio?.cambio ?? 5.15;
  return (
    <Card title="Seletividade de Lotes — IR Otimizado na Venda">
      <TLHMonitor lotes={lotes} gatilho={gatilho} cambio={cambio} />
    </Card>
  );
}

function SoRRBondTentTriggerDisc({ data }: { data: any }) {
  const premissas = data?.premissas ?? {};
  const drift = data?.drift ?? {};
  const rfPctAtual = drift.IPCA?.atual ?? 5.9;
  return (
    <Card title="Bond Tent — Estrutura e Próximo Gatilho">
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
  // E[R] = premissas aprovadas 2026-04-01 (mediana 5 fontes, haircut 58%)
  // Alvo = % no portfolio total (SWRD 39.5% = 50% intra-equity × 79% equity block)
  const etfs = [
    { ticker: 'SWRD', atual: drift.SWRD?.atual ?? 36.3, alvo: drift.SWRD?.alvo ?? 39.5, expectedReturn: 3.7 },
    { ticker: 'AVGS', atual: drift.AVGS?.atual ?? 28.1, alvo: drift.AVGS?.alvo ?? 23.7, expectedReturn: 5.0 },
    { ticker: 'AVEM', atual: drift.AVEM?.atual ?? 23.2, alvo: drift.AVEM?.alvo ?? 15.8, expectedReturn: 5.0 },
  ];
  return (
    <Card title="Prioridade de Aporte — Equity">
      <CAPEAportePriority etfs={etfs} />
    </Card>
  );
}

function CarryDifferentialMonitor({ data }: { data: any }) {
  const macro = data?.macro ?? {};
  const selic = macro.selic_meta ?? 14.75;
  const ff = macro.fed_funds ?? 3.64;
  const spread = macro.spread_selic_ff ?? (selic - ff);
  // câmbio: macro.cambio não existe → usar mercado.cambio_brl_usd ou patrimonio.cambio
  const cambio = macro.cambio ?? data?.mercado?.cambio_brl_usd ?? data?.patrimonio?.cambio;
  // exposição cambial: ~89% do portfolio em USD/EUR via ETFs UCITS
  const exposicaoCambial = macro.exposicao_cambial_pct ?? 89;
  const spreadColor = spread >= 10 ? '#16a34a' : spread >= 6 ? '#ca8a04' : '#dc2626';

  return (
    <Card title="Carry Differential — Selic vs Fed Funds">
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 10 }}>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Spread Selic–FF</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: spreadColor }}>
            {`${spread.toFixed(2)}pp`}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>Selic {selic}% · FF {ff}%</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 6, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Câmbio BRL/USD</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
            {cambio != null ? `R$${cambio.toFixed(3)}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
            Exp. cambial ~{exposicaoCambial}% (equity UCITS)
          </div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        Spread alto ({'>'}10pp) favorece carry mas BRL apreciado reduz retorno em BRL do equity internacional.
        Próx. COPOM: 28-29/abr · Próx. FOMC: mai/2026.
      </div>
    </Card>
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

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#dc2626', color: '#fff', fontWeight: 600 }}>Temporário</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Novos componentes sugeridos pelos agentes · aprovados entram nas abas permanentes
        </p>
      </div>

      {/* ── Section A: New Components ──────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="A — Novos Componentes Sugeridos"
          sub="Mockups com dados reais. Aprovados entram nas abas permanentes; rejeitados são arquivados."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TLHMonitorDisc data={data} />
          <SoRRBondTentTriggerDisc data={data} />
          <CAPEAportePriorityDisc data={data} />
          <CarryDifferentialMonitor data={data} />
        </div>
      </div>
    </div>
  );
}
