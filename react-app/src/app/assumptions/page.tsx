'use client';

import { usePageData } from '@/hooks/usePageData';
import { useUiStore } from '@/store/uiStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { pfireColor } from '@/utils/fire';

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtBrl(v: number): string {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function fmtPctRaw(v: number): string {
  return `${v.toFixed(2)}%`;
}

function mask(v: number, priv: boolean): string {
  return priv ? '••••' : fmtBrl(v);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface Row {
  label: string;
  value: string;
  muted?: boolean;
  accent?: boolean;
}

function Table({ rows }: { rows: Row[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)', opacity: row.muted ? 0.6 : 1 }}>
            <td style={{ padding: '7px 4px', color: 'var(--muted)', width: '58%' }}>{row.label}</td>
            <td style={{
              padding: '7px 4px',
              fontWeight: 600,
              color: row.accent ? 'var(--green)' : 'var(--text)',
              textAlign: 'right',
              fontFamily: 'monospace',
            }}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '16px 20px',
    }}>
      {title && (
        <h2 style={{
          margin: '0 0 12px',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

// ─── Status Strip ─────────────────────────────────────────────────────────────

function StatusStrip({ p, fire, pfire, priv }: {
  p: Record<string, any>;
  fire: Record<string, any>;
  pfire: Record<string, any>;
  priv: boolean;
}) {
  const pct = p.patrimonio_gatilho > 0
    ? ((p.patrimonio_atual / p.patrimonio_gatilho) * 100).toFixed(1)
    : '—';

  const swrCurrent = fire.swr_current ?? 0;
  const pfireBase = pfire.base ?? 0;
  const status = fire.plano_status?.status ?? '—';
  const statusColor = status === 'OK' ? 'var(--green)' : status === 'MONITORAR' ? 'var(--yellow)' : 'var(--red)';

  const kpis = [
    {
      label: 'FIRE Status',
      value: status,
      sub: fire.plano_status?.gatilho_ativo ?? '',
      color: statusColor,
    },
    {
      label: 'Patrimônio / Gatilho',
      value: priv ? '••••' : `${pct}%`,
      sub: priv ? '••••' : `${fmtBrl(p.patrimonio_atual)} de ${fmtBrl(p.patrimonio_gatilho)}`,
      color: 'var(--text)',
    },
    {
      label: 'P(FIRE) @53 — Base',
      value: `${pfireBase.toFixed(1)}%`,
      sub: `Stress ${(pfire.stress ?? 0).toFixed(1)}% · Fav ${(pfire.fav ?? 0).toFixed(1)}%`,
      color: pfireColor(pfireBase),
    },
    {
      label: 'SWR Atual',
      value: `${swrCurrent.toFixed(2)}%`,
      sub: `Gatilho: ${fmtPct(p.swr_gatilho ?? 0.03)}`,
      color: 'var(--text)',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 1, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      {kpis.map((kpi, i) => (
        <div key={i} style={{ background: 'var(--card)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {kpi.label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: kpi.color, fontFamily: 'monospace' }}>
            {kpi.value}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>
            {kpi.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Family Scenarios ─────────────────────────────────────────────────────────

function FamilyScenarios({ profiles, priv }: { profiles: any[]; priv: boolean }) {
  if (!profiles?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
      {profiles.map((prof: any, i: number) => {
        const pBase = prof.p_fire_53 ?? 0;
        const color = pfireColor(pBase);
        return (
          <div key={i} style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderTop: `3px solid ${color}`,
            borderRadius: 8,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {prof.label}
            </div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Gasto:</span>{' '}
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {priv ? '••••' : `${fmtBrl(prof.gasto_anual)}/ano`}
              </span>
            </div>
            <div className="grid grid-cols-3" style={{ gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>P @50</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                  {(prof.p_fire_50 ?? 0).toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>P @53</div>
                <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: 'monospace' }}>
                  {pBase.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>SWR</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                  {((prof.swr_at_fire ?? 0) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssumptionsPage() {
  const { data, isLoading, dataError } = usePageData();
  const privacyMode = useUiStore(s => s.privacyMode);

  const guard = pageStateElement({ isLoading, dataError, data });
  if (guard) return guard;

  const d = data as any;
  const p = d?.premissas ?? {};
  const macro = d?.macro ?? {};
  const fire = d?.fire ?? {};
  const ph = d?.patrimonio_holistico ?? {};
  const pt = d?.pesosTarget ?? {};
  const pisos = d?.pisos ?? {};
  const pfire = d?.pfire_base ?? {};
  const pfireA = d?.pfire_aspiracional ?? {};
  const profiles = fire?.by_profile ?? [];
  const guardrails = d?.guardrails ?? [];
  const sm = d?.spendingSmile ?? {};
  const sc = d?.scenario_comparison ?? {};
  const generated = d?._generated ?? '';

  const generatedLabel = generated ? (() => {
    try {
      return new Date(generated).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }) + ' BRT';
    } catch { return generated; }
  })() : '—';

  // ── FIRE Targets rows ──
  const fireTargetsRows: Row[] = [
    { label: 'Patrimônio Gatilho (SWR 3%)', value: mask(p.patrimonio_gatilho ?? 0, privacyMode) },
    { label: 'Progresso Acumulação', value: privacyMode ? '••••' : p.patrimonio_gatilho ? `${((p.patrimonio_atual / p.patrimonio_gatilho) * 100).toFixed(1)}%` : '—' },
    { label: 'FIRE Base — 2040, idade 53', value: `P ${(pfire.base ?? 0).toFixed(1)}%`, accent: (pfire.base ?? 0) >= 85 },
    { label: 'FIRE Aspiracional — 2036, idade 49', value: `P ${(pfireA.base ?? 0).toFixed(1)}%`, accent: (pfireA.base ?? 0) >= 85 },
    { label: 'Pat. Mediano @53 (P50)', value: mask(sc.base?.pat_mediano ?? fire.pat_mediano_fire ?? 0, privacyMode) },
    { label: 'Pat. Mediano @49 (P50)', value: mask(sc.aspiracional?.pat_mediano ?? fire.pat_mediano_fire50 ?? 0, privacyMode) },
  ];

  // ── Personal rows ──
  const personalRows: Row[] = [
    { label: 'Idade Atual', value: `${p.idade_atual ?? '—'} anos` },
    { label: 'Patrimônio Atual', value: mask(p.patrimonio_atual ?? 0, privacyMode) },
    { label: 'Aporte Mensal', value: mask(p.aporte_mensal ?? 0, privacyMode) + '/mês' },
    { label: 'Renda Estimada', value: mask(p.renda_estimada ?? 0, privacyMode) + '/mês' },
    { label: 'Spending Target', value: mask(p.custo_vida_base ?? 0, privacyMode) + '/ano' },
    { label: 'INSS Diego', value: mask(p.inss_anual ?? 0, privacyMode) + '/ano', muted: true },
  ];

  // ── Katia rows ──
  const katiaRows: Row[] = [
    { label: 'INSS Katia', value: mask(p.inss_katia_anual ?? 0, privacyMode) + '/ano' },
    { label: 'PGBL Katia (FIRE Day 2040)', value: mask(p.pgbl_katia_saldo_fire ?? 0, privacyMode) },
    { label: 'Gasto Katia (Solo)', value: mask(p.gasto_katia_solo ?? 0, privacyMode) + '/ano', muted: true },
  ];

  // ── Model Assumptions rows ──
  const modelRows: Row[] = [
    { label: 'Retorno Real Esperado (Equity)', value: fmtPct(p.retorno_equity_base ?? 0) + '/ano' },
    { label: 'Volatilidade (Equity)', value: fmtPct(p.volatilidade_equity ?? 0) + '/ano' },
    { label: 'Safe Withdrawal Rate (SWR)', value: fmtPct(p.swr_gatilho ?? 0) },
    { label: 'IPCA Assumido', value: fmtPct(p.ipca_anual ?? 0) + '/ano' },
    { label: 'Taxa IPCA+ Longa (Renda+ 2065)', value: fmtPctRaw(p.taxa_ipca_plus_longa ?? 0) + '/ano' },
    { label: 'Horizonte de Vida', value: `${p.horizonte_vida ?? 90} anos` },
    ...(macro.selic_meta != null ? [{ label: 'Selic Meta (BCB)', value: fmtPct(macro.selic_meta / 100) + '/ano', muted: true }] : []),
    ...(macro.ipca_12m != null ? [{ label: 'IPCA 12m Realizado', value: fmtPctRaw(macro.ipca_12m) + '/ano', muted: true }] : []),
    ...(d?.cambio != null ? [{ label: 'Câmbio BRL/USD', value: privacyMode ? '••••' : `R$${Number(d.cambio).toFixed(4)}`, muted: true }] : []),
  ];

  // ── Strategic Allocation rows ──
  const allocationRows: Row[] = [
    { label: 'SWRD (Global Market Cap)', value: `${((pt.SWRD ?? 0) * 100).toFixed(1)}%` },
    { label: 'AVGS (Small Cap Value)', value: `${((pt.AVGS ?? 0) * 100).toFixed(1)}%` },
    { label: 'AVEM (EM Value)', value: `${((pt.AVEM ?? 0) * 100).toFixed(1)}%` },
    { label: 'IPCA+ (Renda Fixa BR)', value: `${((pt.IPCA ?? 0) * 100).toFixed(1)}%` },
    { label: 'HODL11 (Bitcoin)', value: `${((pt.HODL11 ?? 0) * 100).toFixed(1)}%` },
  ];

  // ── Rate Floors rows ──
  const pisosRows: Row[] = [
    { label: 'DCA IPCA+ ativo se taxa ≥', value: `${pisos.pisoTaxaIpcaLongo ?? '—'}%` },
    { label: 'DCA Renda+ ativo se taxa ≥', value: `${pisos.pisoTaxaRendaPlus ?? '—'}%` },
    { label: 'Vender Renda+ se taxa <', value: `${pisos.pisoVendaRendaPlus ?? '—'}%` },
    { label: 'IR (alíquota ETF exterior)', value: fmtPct(pisos.ir_aliquota ?? 0) },
  ];

  // ── Holistic Balance rows ──
  const holisticRows: Row[] = [
    { label: 'Patrimônio Financeiro', value: mask(ph.financeiro_brl ?? 0, privacyMode) },
    { label: 'Imóvel — Equity', value: mask(ph.imovel_equity_brl ?? 0, privacyMode), muted: true },
    { label: 'Terreno', value: mask(ph.terreno_brl ?? 0, privacyMode), muted: true },
    { label: 'Capital Humano (VP)', value: mask(ph.capital_humano_vp ?? 0, privacyMode) },
    { label: 'INSS Diego (VP)', value: mask(ph.inss_pv_brl ?? 0, privacyMode), muted: true },
    { label: 'Saldo Devedor (Hipoteca)', value: privacyMode ? '••••' : `–${fmtBrl(ph.saldo_devedor_brl ?? 0)}`, muted: true },
    { label: 'Total Holístico', value: mask(ph.total_brl ?? 0, privacyMode), accent: true },
  ];

  // ── Guardrails rows ──
  const guardrailRows: Row[] = guardrails.map((g: any) => ({
    label: g.banda ?? g.min_dd ?? '?',
    value: g.regra ?? g.acao ?? '—',
  }));

  // ── Spending Smile rows ──
  const smileRows: Row[] = [
    ...(sm.go_go ? [{ label: `Go-Go (até ${sm.go_go.fim ?? '?'})`, value: mask(sm.go_go.gasto ?? 0, privacyMode) + '/ano' }] : []),
    ...(sm.slow_go ? [{ label: `Slow-Go (${sm.slow_go.inicio ?? '?'}–${sm.slow_go.fim ?? '?'})`, value: mask(sm.slow_go.gasto ?? 0, privacyMode) + '/ano', muted: true }] : []),
    ...(sm.no_go ? [{ label: `No-Go (${sm.no_go.inicio ?? '?'}+)`, value: mask(sm.no_go.gasto ?? 0, privacyMode) + '/ano', muted: true }] : []),
  ];

  // ── Last aporte ──
  const ultimoAporteRows: Row[] = [
    ...(p.ultimo_aporte_data ? [{ label: 'Data', value: p.ultimo_aporte_data }] : []),
    ...(p.ultimo_aporte_brl ? [{ label: 'Valor', value: mask(p.ultimo_aporte_brl, privacyMode) }] : []),
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Assumptions</h1>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Fonte de verdade do plano FIRE · read-only</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
          {generatedLabel}
        </span>
      </div>

      {/* Status Strip */}
      <div style={{ marginBottom: 16 }}>
        <StatusStrip p={p} fire={fire} pfire={pfire} priv={privacyMode} />
      </div>

      {/* Family Scenarios */}
      {profiles.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Family Scenarios
          </div>
          <FamilyScenarios profiles={profiles} priv={privacyMode} />
        </div>
      )}

      {/* Row 1: FIRE Targets + Personal + Katia */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12, marginBottom: 12 }}>
        <Block title="FIRE Targets">
          <Table rows={fireTargetsRows} />
        </Block>

        <Block title="Personal — Diego">
          <Table rows={personalRows} />
        </Block>

        <Block title="Personal — Katia">
          <Table rows={katiaRows} />
          <p style={{ margin: '10px 0 0', padding: '8px', background: 'var(--card2, var(--border))', borderRadius: 6, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            PGBL projeção: R$490k (2040) → R$728–948k (2049)
          </p>
        </Block>
      </div>

      {/* Row 2: Model Assumptions + Allocation + Pisos + Smile */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12, marginBottom: 12 }}>
        <Block title="Model Assumptions">
          <Table rows={modelRows} />
          {ultimoAporteRows.length > 0 && (
            <>
              <h3 style={{ margin: '12px 0 6px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Último Aporte
              </h3>
              <Table rows={ultimoAporteRows} />
            </>
          )}
        </Block>

        <Block title="Strategic Allocation — Target">
          <Table rows={allocationRows} />
          <p style={{ margin: '10px 0 0', padding: '8px', background: 'var(--card2, var(--border))', borderRadius: 6, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            Regra: 1 classe/vez · maior gap primeiro · exceção: janela de taxa
          </p>
        </Block>

        <Block title="Rate Floors & Spending Smile">
          <Table rows={pisosRows} />
          {smileRows.length > 0 && (
            <>
              <h3 style={{ margin: '12px 0 6px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Spending Smile
              </h3>
              <Table rows={smileRows} />
            </>
          )}
        </Block>
      </div>

      {/* Row 3: Holistic Balance + Guardrails */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, marginBottom: 12 }}>
        <Block title="Holistic Balance">
          <Table rows={holisticRows} />
        </Block>

        <Block title="Withdrawal Guardrails">
          {guardrailRows.length > 0 ? (
            <Table rows={guardrailRows} />
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>—</p>
          )}
        </Block>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
        Fonte: <code>carteira_params.json</code> via pipeline Python.
        Para alterar: edite <code>agentes/contexto/carteira.md</code> → <code>parse_carteira.py</code> → <code>generate_data.py</code>.
      </p>
    </div>
  );
}
