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
  warn?: boolean;
  separator?: boolean; // renders a visual section divider
}

function Table({ rows }: { rows: Row[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <tbody>
        {rows.map((row, i) => {
          if (row.separator) {
            return (
              <tr key={i}>
                <td colSpan={2} style={{ padding: '6px 4px 2px', color: 'var(--muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderTop: '1px solid var(--border)', opacity: 0.7 }}>
                  {row.label}
                </td>
              </tr>
            );
          }
          return (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', opacity: row.muted ? 0.55 : 1 }}>
              <td style={{ padding: '6px 4px', color: 'var(--muted)', width: '58%', lineHeight: 1.3 }}>{row.label}</td>
              <td style={{
                padding: '6px 4px',
                fontWeight: 600,
                color: row.accent ? 'var(--green)' : row.warn ? 'var(--yellow)' : 'var(--text)',
                textAlign: 'right',
                fontFamily: 'monospace',
              }}>
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Compact two-column badge row (label left / value right, no full table chrome)
function KVBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  );
}

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '14px 18px',
    }}>
      {title && (
        <h2 style={{
          margin: '0 0 10px',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </h2>
      )}
      {children}
      {note && (
        <p style={{ margin: '10px 0 0', padding: '7px 9px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          {note}
        </p>
      )}
    </div>
  );
}

// A colored status badge pill
function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 10,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      background: `color-mix(in srgb, ${color} 15%, transparent)`,
      color,
      border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
    }}>
      {label}
    </span>
  );
}

// A big KPI metric used in the status strip
function StripKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ background: 'var(--card)', padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color ?? 'var(--text)', fontFamily: 'monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
        {sub}
      </div>
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

  const swrCurrent = p.patrimonio_atual > 0
    ? (p.custo_vida_base / p.patrimonio_atual) * 100
    : 0;

  const pfireBase = pfire.base ?? 0;
  const status = fire.plano_status?.status ?? '—';
  const statusColor = status === 'OK' ? 'var(--green)' : status === 'MONITORAR' ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 1, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <StripKpi
        label="FIRE Status"
        value={status}
        sub={status === 'MONITORAR'
          ? `Bond Pool: ${(fire.bond_pool_readiness?.anos_gastos ?? 0).toFixed(1)} de ${fire.bond_pool_readiness?.meta_anos ?? 7} anos`
          : (fire.plano_status?.gatilho_ativo ?? '')}
        color={statusColor}
      />
      <StripKpi
        label="Patrimônio / Gatilho"
        value={priv ? '••••' : `${pct}%`}
        sub={priv ? '••••' : `${fmtBrl(p.patrimonio_atual)} de ${fmtBrl(p.patrimonio_gatilho)}`}
      />
      <StripKpi
        label="P(FIRE) @53 — Base"
        value={`${pfireBase.toFixed(1)}%`}
        sub={`Stress ${(pfire.stress ?? 0).toFixed(1)}% · Fav ${(pfire.fav ?? 0).toFixed(1)}%`}
        color={pfireColor(pfireBase)}
      />
      <StripKpi
        label="Spending Rate"
        value={`${swrCurrent.toFixed(2)}%`}
        sub={`Gatilho: ${fmtPct(p.swr_gatilho ?? 0.03)} · meta: spending/patrimônio`}
      />
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
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {prof.label}
              </div>
              <StatusPill label={`P${pBase.toFixed(0)}%`} color={color} />
            </div>
            {(prof.label?.toLowerCase().includes('filho') || prof.label?.toLowerCase().includes('kids')) && (
              <div style={{ fontSize: 10, color: 'var(--yellow)', marginBottom: 4 }}>→ mais provável 2028+</div>
            )}
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Gasto:</span>{' '}
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {priv ? '••••' : `${fmtBrl(prof.gasto_anual)}/ano`}
              </span>
            </div>
            <div className="grid grid-cols-3" style={{ gap: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>P @50</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                  {(prof.p_fire_50 ?? 0).toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>P @53</div>
                <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'monospace' }}>
                  {pBase.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>SWR</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
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

// ─── Section Divider ──────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 8px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
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
  const rf = d?.rf ?? {};
  const tax = d?.tax ?? {};
  const ph = d?.patrimonio_holistico ?? {};
  const pt = d?.pesosTarget ?? {};
  const pisos = d?.pisos ?? {};
  const pfire = d?.pfire_base ?? {};
  const pfireA = d?.pfire_aspiracional ?? {};
  const profiles = fire?.by_profile ?? [];
  const guardrails = d?.guardrails ?? [];
  const sm = d?.spendingSmile ?? {};
  const sc = d?.scenario_comparison ?? {};
  const sg = d?.spending_guardrails ?? {};
  const bondPool = fire?.bond_pool_readiness ?? {};
  const bpr = d?.bond_pool_runway ?? {};
  const pvr = d?.premissas_vs_realizado ?? {};
  const guardrailsRetirada = d?.guardrails_retirada ?? [];
  const le = d?.lumpy_events ?? {};
  const sb = d?.spending_breakdown ?? {};
  const dca = d?.dca_status ?? {};
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
  // Split into 2 groups: critical targets + secondary metrics
  const fireTargetsRows: Row[] = [
    { label: 'Patrimônio Gatilho (SWR 3%)', value: mask(p.patrimonio_gatilho ?? 0, privacyMode) },
    { label: 'Progresso', value: privacyMode ? '••••' : p.patrimonio_gatilho ? `${((p.patrimonio_atual / p.patrimonio_gatilho) * 100).toFixed(1)}%` : '—', accent: true },
    { label: 'Cenários', value: '', separator: true } as Row,
    { label: 'FIRE Base — 2040, idade 53', value: `P ${(pfire.base ?? 0).toFixed(1)}%`, accent: (pfire.base ?? 0) >= 90 },
    { label: `FIRE Aspiracional — 2035, idade 48`, value: `P ${(pfireA.base ?? 0).toFixed(1)}%`, accent: (pfireA.base ?? 0) >= 90 },
    { label: `  → requer aporte extra`, value: fmtBrl((p.aporte_mensal_aspiracional ?? 0) - (p.aporte_mensal ?? 0)) + '/mês', muted: true },
    { label: `FIRE Possível @${d.earliest_fire?.idade ?? 49} (${d.earliest_fire?.ano ?? 2036})`, value: `P ${(d.earliest_fire?.pfire ?? 0).toFixed(1)}%`, accent: (d.earliest_fire?.pfire ?? 0) >= 85 },
    { label: 'Projeções P50', value: '', separator: true } as Row,
    { label: 'Pat. Mediano @48 (P50)', value: mask(sc.aspiracional?.pat_mediano ?? fire.pat_mediano_fire50 ?? 0, privacyMode) },
    { label: 'Pat. Mediano @53 (P50)', value: mask(sc.base?.pat_mediano ?? fire.pat_mediano_fire ?? 0, privacyMode) },
    { label: 'Gasto Piso (SWR 4.5%)', value: mask(d.gasto_piso ?? 0, privacyMode) + '/ano', muted: true },
  ];

  // ── Personal rows ──
  const personalRows: Row[] = [
    { label: 'Idade Atual', value: `${p.idade_atual ?? '—'} anos` },
    { label: 'Patrimônio Atual', value: mask(p.patrimonio_atual ?? 0, privacyMode) },
    { label: 'Fluxo Mensal', value: '', separator: true } as Row,
    { label: 'Renda Estimada', value: mask(p.renda_estimada ?? 0, privacyMode) + '/mês' },
    { label: 'Renda Líquida', value: mask(p.renda_mensal_liquida ?? 0, privacyMode) + '/mês' },
    { label: 'Aporte Mensal', value: mask(p.aporte_mensal ?? 0, privacyMode) + '/mês', accent: true },
    { label: 'Spending Target', value: mask(p.custo_vida_base ?? 0, privacyMode) + '/ano' },
    { label: 'INSS Diego', value: mask(p.inss_anual ?? 0, privacyMode) + '/ano', muted: true },
  ];

  // ── Katia rows ──
  const katiaRows: Row[] = [
    { label: 'INSS Katia', value: mask(p.inss_katia_anual ?? 0, privacyMode) + '/ano' },
    { label: 'PGBL (FIRE Day 2040)', value: mask(p.pgbl_katia_saldo_fire ?? 0, privacyMode) },
    { label: 'Gasto Solo', value: mask(p.gasto_katia_solo ?? 0, privacyMode) + '/ano', muted: true },
  ];

  // ── Model Assumptions rows — split into fundamental vs contextual ──
  const modelFundamentalRows: Row[] = [
    { label: 'Retorno Real — Equity', value: fmtPct(p.retorno_equity_base ?? 0) + '/ano' },
    { label: 'Volatilidade — Equity', value: fmtPct(p.volatilidade_equity ?? 0) + '/ano' },
    { label: 'SWR Gatilho FIRE', value: fmtPct(p.swr_gatilho ?? 0) },
    { label: 'IPCA Premissa (MC)', value: fmtPct(p.ipca_anual ?? 0) + '/ano' },
    { label: 'Taxa IPCA+ Longa (Renda+)', value: fmtPctRaw(p.taxa_ipca_plus_longa ?? 0) + '/ano' },
    { label: 'Horizonte de Vida', value: `${p.horizonte_vida ?? 90} anos` },
    { label: 'Contexto Macro', value: '', separator: true } as Row,
    ...(macro.ipca_12m != null ? [{ label: 'IPCA 12m Realizado', value: fmtPctRaw(macro.ipca_12m) + '/ano', muted: true }] : []),
    { label: 'Depreciação BRL (base)', value: `${((macro.depreciacao_brl_premissa ?? 0.5)).toFixed(1)}%/ano`, muted: true },
    ...(macro.selic_meta != null ? [{ label: 'Selic Meta (BCB)', value: fmtPct(macro.selic_meta / 100) + '/ano', muted: true }] : []),
    ...(d?.cambio != null ? [{ label: 'Câmbio BRL/USD', value: privacyMode ? '••••' : `R$${Number(d.cambio).toFixed(4)}`, muted: true }] : []),
    ...(macro.fed_funds != null ? [{ label: 'Fed Funds', value: fmtPctRaw(macro.fed_funds) + '/ano', muted: true }] : []),
    ...(macro.spread_selic_ff != null ? [{ label: 'Spread Selic–FF', value: `${macro.spread_selic_ff.toFixed(1)}pp`, muted: true }] : []),
  ];

  // ── Strategic Allocation rows ──
  const allocationRows: Row[] = [
    { label: 'Equity (Internacional)', value: '', separator: true } as Row,
    { label: 'SWRD — Global Market Cap', value: `${((pt.SWRD ?? 0) * 100).toFixed(1)}%` },
    { label: 'AVGS — Small Cap Value', value: `${((pt.AVGS ?? 0) * 100).toFixed(1)}%` },
    { label: 'AVEM — EM Value', value: `${((pt.AVEM ?? 0) * 100).toFixed(1)}%` },
    { label: 'Outros', value: '', separator: true } as Row,
    { label: 'IPCA+ — Renda Fixa BR', value: `${((pt.IPCA ?? 0) * 100).toFixed(1)}%` },
    { label: 'HODL11 — Bitcoin', value: `${((pt.HODL11 ?? 0) * 100).toFixed(1)}%` },
    { label: 'Info', value: '', separator: true } as Row,
    { label: 'Exposição Cambial', value: `${(macro.exposicao_cambial_pct ?? 0).toFixed(1)}%`, muted: true },
    { label: 'Hedge Cambial', value: 'Nenhum (intencional)', muted: true },
    { label: 'Concentração Brasil', value: `${(d.concentracao_brasil?.brasil_pct ?? 0).toFixed(1)}%`, muted: true },
  ];

  // ── Rate Floors rows — split IPCA / Renda+ / HODL11 ──
  const pisosRows: Row[] = [
    { label: 'IPCA+', value: '', separator: true } as Row,
    { label: 'DCA IPCA+ ativo se taxa ≥', value: `${pisos.pisoTaxaIpcaLongo ?? '—'}%` },
    { label: 'Renda+', value: '', separator: true } as Row,
    { label: 'DCA Renda+ ativo se taxa ≥', value: `${pisos.pisoTaxaRendaPlus ?? '—'}%` },
    { label: 'Vender Renda+ se taxa <', value: `${pisos.pisoVendaRendaPlus ?? '—'}%` },
    { label: 'Bitcoin (HODL11)', value: '', separator: true } as Row,
    ...(pisos.hodl11PisoPct != null ? [
      { label: 'Piso', value: `${pisos.hodl11PisoPct}%`, muted: true },
      { label: 'Alvo', value: `${pisos.hodl11AlvoPct}%`, muted: true },
      { label: 'Teto', value: `${pisos.hodl11TetoPct}%`, muted: true },
    ] : []),
    { label: 'Outros', value: '', separator: true } as Row,
    { label: 'IR alíquota ETF exterior', value: fmtPct(pisos.ir_aliquota ?? 0), muted: true },
    { label: 'TLH Gatilho', value: `${((d.tlhGatilho ?? 0) * 100).toFixed(0)}%`, muted: true },
  ];

  // ── Spending Smile rows ──
  const smileRows: Row[] = [
    ...(sm.go_go ? [{ label: `Go-Go (até ${sm.go_go.fim ?? '?'})`, value: mask(sm.go_go.gasto ?? 0, privacyMode) + '/ano' }] : []),
    ...(sm.slow_go ? [{ label: `Slow-Go (${sm.slow_go.inicio ?? '?'}–${sm.slow_go.fim ?? '?'})`, value: mask(sm.slow_go.gasto ?? 0, privacyMode) + '/ano', muted: true }] : []),
    ...(sm.no_go ? [{ label: `No-Go (${sm.no_go.inicio ?? '?'}+)`, value: mask(sm.no_go.gasto ?? 0, privacyMode) + '/ano', muted: true }] : []),
    ...(p.saude_base ? [{ label: '+ Saúde (ex-smile, fixo)', value: mask(p.saude_base, privacyMode) + '/ano', muted: true }] : []),
  ];

  // ── Holistic Balance rows ──
  const holisticRows: Row[] = [
    { label: 'Patrimônio Financeiro', value: mask(ph.financeiro_brl ?? 0, privacyMode), accent: true },
    { label: 'Capital Humano (VP renda futura)', value: mask(ph.capital_humano_vp ?? 0, privacyMode) },
    { label: 'Ativos Físicos', value: '', separator: true } as Row,
    { label: 'Imóvel — Equity líquido¹', value: mask(ph.imovel_equity_brl ?? 0, privacyMode), muted: true },
    { label: 'Terreno', value: mask(ph.terreno_brl ?? 0, privacyMode), muted: true },
    { label: 'INSS Diego (VP)', value: mask(ph.inss_pv_brl ?? 0, privacyMode), muted: true },
    { label: 'Total', value: '', separator: true } as Row,
    { label: 'Total Holístico', value: mask(ph.total_brl ?? 0, privacyMode), accent: true },
  ];

  // ── Bond Pool Readiness rows ──
  const bondPoolRows: Row[] = bondPool.valor_atual_brl != null ? [
    { label: 'Valor Atual', value: mask(bondPool.valor_atual_brl ?? 0, privacyMode) },
    { label: 'Cobertura', value: `${(bondPool.anos_gastos ?? 0).toFixed(1)} de ${bondPool.meta_anos ?? 7} anos`, warn: (bondPool.anos_gastos ?? 0) < (bondPool.meta_anos ?? 7) },
    { label: 'Status', value: bondPool.status ?? '—', warn: bondPool.status === 'early' },
    { label: 'Composição', value: '', separator: true } as Row,
    { label: 'IPCA+ 2029 (reserva líquida)', value: mask(bondPool.composicao?.ipca2029 ?? 0, privacyMode), muted: true },
    { label: 'IPCA+ 2040 (estrutural)', value: mask(bondPool.composicao?.ipca2040 ?? 0, privacyMode), muted: true },
    { label: 'IPCA+ 2050 (estrutural)', value: mask(bondPool.composicao?.ipca2050 ?? 0, privacyMode), muted: true },
    ...(bpr.alvo_pool_brl_2040 != null ? [{ label: 'Alvo Pool (15%)', value: mask(bpr.alvo_pool_brl_2040, privacyMode), muted: true }] : []),
    ...(bpr.taxas?.td2040_real_pct != null ? [{ label: 'Taxa 2040 real', value: `${bpr.taxas.td2040_real_pct}%`, muted: true }] : []),
    ...(bpr.taxas?.td2050_real_pct != null ? [{ label: 'Taxa 2050 real', value: `${bpr.taxas.td2050_real_pct}%`, muted: true }] : []),
    ...(bpr.pool_disponivel_pos_fire != null ? (() => {
      const firstNeg = bpr.pool_disponivel_pos_fire.findIndex((v: number) => v < 0);
      const anos = firstNeg === -1 ? bpr.pool_disponivel_pos_fire.length : firstNeg;
      return [{ label: 'Cobertura pós-FIRE', value: `${anos} anos`, warn: anos < 5 }];
    })() : []),
  ] : [];

  // ── Spending Guardrails rows ──
  const spendingGuardrailRows: Row[] = sg.upper_guardrail_spending != null ? [
    { label: 'Zona Atual', value: sg.zona ?? '—', accent: sg.zona === 'verde', warn: sg.zona === 'amarelo' },
    { label: 'Upper Guardrail', value: mask(sg.upper_guardrail_spending ?? 0, privacyMode) + '/ano', muted: true },
    { label: 'Safe Target', value: mask(sg.safe_target_spending ?? 0, privacyMode) + '/ano' },
    { label: 'Lower Guardrail', value: mask(sg.lower_guardrail_spending ?? 0, privacyMode) + '/ano' },
  ] : [];

  // ── RF Positions rows — grouped by instrument ──
  const rfRows: Row[] = [
    { label: 'IPCA+ Estrutural', value: '', separator: true } as Row,
    ...(rf.ipca2029?.valor != null ? [{
      label: 'IPCA+ 2029',
      value: privacyMode ? '••••' : `${fmtBrl(rf.ipca2029.valor)} @ ${rf.ipca2029.taxa?.toFixed(2)}%`,
    }] : []),
    ...(rf.ipca2040?.valor != null ? [{
      label: 'IPCA+ 2040',
      value: privacyMode ? '••••' : `${fmtBrl(rf.ipca2040.valor)} @ ${rf.ipca2040.taxa?.toFixed(2)}%`,
    }] : []),
    ...(rf.ipca2050?.valor != null ? [{
      label: 'IPCA+ 2050',
      value: privacyMode ? '••••' : `${fmtBrl(rf.ipca2050.valor)} @ ${rf.ipca2050.taxa?.toFixed(2)}%`,
    }] : []),
    { label: 'Renda+ 2065 — Tático', value: '', separator: true } as Row,
    ...(rf.renda2065?.valor != null ? [{
      label: 'Posição',
      value: privacyMode ? '••••' : `${fmtBrl(rf.renda2065.valor)} @ ${rf.renda2065.taxa?.toFixed(2)}%`,
      accent: true,
    }] : []),
    ...(rf.renda2065?.distancia_gatilho?.gap_pp != null ? [{
      label: 'Taxa atual / piso / gap',
      value: `${rf.renda2065.distancia_gatilho.taxa_atual?.toFixed(1)}% · ${rf.renda2065.distancia_gatilho.piso_venda?.toFixed(1)}% · +${rf.renda2065.distancia_gatilho.gap_pp?.toFixed(2)}pp`,
      accent: (rf.renda2065.distancia_gatilho.status ?? '') === 'verde',
      warn: (rf.renda2065.distancia_gatilho.status ?? '') === 'amarelo',
      muted: true,
    }] : []),
    ...(rf.renda2065?.duration?.modificada_anos != null ? [{
      label: 'Duration modificada',
      value: `${rf.renda2065.duration.modificada_anos?.toFixed(1)} anos`,
      muted: true,
    }] : []),
  ];

  // ── Tax & Fiscal rows ──
  const taxRows: Row[] = [
    { label: 'IR Diferido (ETF exterior)', value: mask(tax.ir_diferido_total_brl ?? 0, privacyMode), warn: true },
    { label: 'Regime Fiscal', value: 'ACC UCITS — Lei 14.754/2023', muted: true },
    { label: 'Alíquota (alienação)', value: '15% flat sobre ganho nominal BRL', muted: true },
    ...(tax.estate_tax?.us_situs_total_usd != null ? [
      { label: 'Estate Tax (US-situs)', value: '', separator: true } as Row,
      { label: 'Exposição US-situs', value: privacyMode ? '••••' : `$${(tax.estate_tax.us_situs_total_usd / 1000).toFixed(0)}k (lim. $60k)`, warn: true },
      { label: 'Imposto Estimado', value: mask(tax.estate_tax.imposto_estimado_brl ?? 0, privacyMode), warn: true },
    ] : []),
    ...(tax.ptax_atual != null ? [{ label: 'PTAX Atual', value: `R$${tax.ptax_atual?.toFixed(4)}`, muted: true }] : []),
  ];

  // ── Withdrawal Guardrails rows ──
  const withdrawalRows: Row[] = guardrails.map((g: any) => ({
    label: g.desc ?? `DD ${Math.round((g.ddMin ?? 0) * 100)}–${Math.round((g.ddMax ?? 1) * 100)}%`,
    value: g.retirada != null ? mask(g.retirada, privacyMode) + '/ano' : (g.regra ?? g.acao ?? '—'),
    muted: (g.ddMin ?? 0) > 0,
  }));

  // ── Last aporte ──
  const ultimoAporteRows: Row[] = [
    ...(p.ultimo_aporte_data ? [{ label: 'Data', value: p.ultimo_aporte_data }] : []),
    ...(p.ultimo_aporte_brl ? [{ label: 'Valor', value: mask(p.ultimo_aporte_brl, privacyMode) }] : []),
  ];

  // ── DCA Status ── (inline badges for quick scanning)
  const dcaItems = [
    {
      label: 'IPCA+ Longo',
      active: dca.ipca_longo?.ativo,
      taxa: dca.ipca_longo?.taxa_atual,
      piso: dca.ipca_longo?.piso,
      pctAtual: dca.ipca_longo?.pct_carteira_atual,
      alvo: dca.ipca_longo?.alvo_pct,
      gap: dca.ipca_longo?.gap_alvo_pp,
    },
    {
      label: 'IPCA+ 2040',
      active: dca.ipca2040?.ativo,
      taxa: null,
      piso: null,
      pctAtual: dca.ipca2040?.pct_carteira_atual,
      alvo: dca.ipca2040?.alvo_pct,
      gap: dca.ipca2040?.gap_alvo_pp,
    },
    {
      label: 'IPCA+ 2050',
      active: dca.ipca2050?.ativo,
      taxa: null,
      piso: null,
      pctAtual: dca.ipca2050?.pct_carteira_atual,
      alvo: dca.ipca2050?.alvo_pct,
      gap: dca.ipca2050?.gap_alvo_pp,
    },
    {
      label: 'Renda+ 2065',
      active: dca.renda_plus?.ativo,
      taxa: null,
      piso: null,
      pctAtual: dca.renda_plus?.pct_carteira_atual,
      alvo: dca.renda_plus?.alvo_pct,
      gap: null,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Assumptions</h1>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Fonte de verdade do plano FIRE · read-only</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
          {generatedLabel}
        </span>
      </div>

      {/* ── BLOCO 1: Status Strip (4 KPIs críticos) ── */}
      <div style={{ marginBottom: 14 }}>
        <StatusStrip p={p} fire={fire} pfire={pfire} priv={privacyMode} />
      </div>

      {/* ── BLOCO 2: DCA Status — quick scan com badges ── */}
      {dcaItems.some(i => i.pctAtual != null) && (
        <div style={{ marginBottom: 14 }}>
          <SectionDivider label="DCA Status" />
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 8 }}>
            {dcaItems.map((item, idx) => {
              const color = item.active ? 'var(--green)' : 'var(--yellow)';
              return (
                <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: `2px solid ${color}`, borderRadius: 7, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{item.label}</span>
                    <StatusPill label={item.active ? 'ATIVO' : 'PAUSADO'} color={color} />
                  </div>
                  {item.taxa != null && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      taxa <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.taxa.toFixed(2)}%</span>
                      {item.piso != null && <span> · piso {item.piso}%</span>}
                    </div>
                  )}
                  {item.pctAtual != null && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {item.pctAtual.toFixed(1)}% → {item.alvo}%
                      {item.gap != null && <span style={{ color: 'var(--accent)' }}> (gap {item.gap.toFixed(1)}pp)</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BLOCO 3: Family Scenarios ── */}
      {profiles.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionDivider label="Cenários Familiares" />
          <FamilyScenarios profiles={profiles} priv={privacyMode} />
        </div>
      )}

      {/* ── BLOCO 4: FIRE Targets + Personal Diego + Personal Katia ── */}
      <SectionDivider label="Plano FIRE" />
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 10 }}>
        <Block title="FIRE Targets">
          <Table rows={fireTargetsRows} />
        </Block>

        <Block title="Personal — Diego">
          <Table rows={personalRows} />
        </Block>

        <Block title="Personal — Katia" note="PGBL projeção: R$490k (2040) → R$728–948k (2049)">
          <Table rows={katiaRows} />
          {ultimoAporteRows.length > 0 && (
            <>
              <h3 style={{ margin: '10px 0 5px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Último Aporte
              </h3>
              <Table rows={ultimoAporteRows} />
            </>
          )}
        </Block>
      </div>

      {/* ── BLOCO 5: Model + Allocation + Rate Floors ── */}
      <SectionDivider label="Modelo & Alocação" />
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 10 }}>
        <Block title="Model Assumptions">
          <Table rows={modelFundamentalRows} />
          {p.retornos_por_etf && (
            <>
              <h3 style={{ margin: '10px 0 5px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Retornos por ETF (USD real/ano)
              </h3>
              <Table rows={[
                { label: 'SWRD', value: `${((p.retornos_por_etf.SWRD?.retorno_usd_real ?? 0) * 100).toFixed(1)}%`, muted: true },
                { label: 'AVGS', value: `${((p.retornos_por_etf.AVGS?.retorno_usd_real ?? 0) * 100).toFixed(1)}%`, muted: true },
                { label: 'AVEM', value: `${((p.retornos_por_etf.AVEM?.retorno_usd_real ?? 0) * 100).toFixed(1)}%`, muted: true },
              ]} />
            </>
          )}
        </Block>

        <Block title="Strategic Allocation — Target" note="Regra: 1 classe/vez · maior gap primeiro · exceção: janela de taxa">
          <Table rows={allocationRows} />
        </Block>

        <Block title="Rate Floors & Regras RF">
          <Table rows={pisosRows} />
          {smileRows.length > 0 && (
            <>
              <h3 style={{ margin: '10px 0 5px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Spending Smile
              </h3>
              <Table rows={smileRows} />
            </>
          )}
        </Block>
      </div>

      {/* ── BLOCO 6: Holistic Balance + Bond Pool + Spending Guardrails ── */}
      <SectionDivider label="Balanço & Proteção" />
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 10 }}>
        <Block title="Holistic Balance">
          <Table rows={holisticRows} />
          <p style={{ margin: '8px 0 0', padding: '7px 9px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            ¹ Imóvel equity = valor de mercado − saldo devedor hipoteca. Capital Humano = VP renda futura.
          </p>
        </Block>

        {bondPoolRows.length > 0 && (
          <Block title="Bond Pool Readiness" note={`Meta: ${bondPool.meta_anos ?? 7} anos de gastos em RF. Construção gradual via DCA até ~2039.`}>
            <Table rows={bondPoolRows} />
          </Block>
        )}

        {spendingGuardrailRows.length > 0 && (
          <Block title="Spending Guardrails" note="Upper = teto aspiracional · Safe = alvo · Lower = piso de segurança.">
            <Table rows={spendingGuardrailRows} />
          </Block>
        )}
      </div>

      {/* ── BLOCO 7: RF Positions + Tax + Withdrawal Guardrails ── */}
      <SectionDivider label="RF, Fiscal & Retirada" />
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 10 }}>
        {rfRows.length > 1 && (
          <Block title="RF Positions">
            <Table rows={rfRows} />
          </Block>
        )}

        {taxRows.length > 0 && (
          <Block title="Tax & Fiscal" note="Novos aportes em UCITS (fora US-situs). IR diferido cresce com depreciação BRL.">
            <Table rows={taxRows} />
          </Block>
        )}

        <Block title="Withdrawal Guardrails">
          {withdrawalRows.length > 0 ? (
            <Table rows={withdrawalRows} />
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>—</p>
          )}
          {guardrailsRetirada.length > 0 && (
            <>
              <h3 style={{ margin: '10px 0 5px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                P(FIRE) Guardrails
              </h3>
              <Table rows={guardrailsRetirada.map((g: any) => ({
                label: g.condicao ?? g.guardrail,
                value: g.acao ?? '—',
                accent: g.prioridade === 'EXPANSIVO',
                warn: g.prioridade === 'DEFESA',
                muted: g.prioridade === 'MANTÉM',
              }))} />
            </>
          )}
        </Block>
      </div>

      {/* ── BLOCO 8: Passivos + Premissas vs Realizado + DCA Detail ── */}
      <SectionDivider label="Histórico & Passivos" />
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 10 }}>
        <Block title="Passivos" note="Fonte: hipoteca_sac.json + tax_snapshot.json">
          <Table rows={[
            { label: 'Hipoteca (saldo devedor)', value: mask(d.passivos?.hipoteca_brl ?? 0, privacyMode), warn: true },
            { label: 'Vencimento hipoteca', value: d.passivos?.hipoteca_vencimento ?? '—', muted: true },
            { label: 'IR Diferido (ETFs)', value: mask(d.passivos?.ir_diferido_brl ?? 0, privacyMode), warn: true },
            { label: 'Total Passivos', value: mask(d.passivos?.total_brl ?? 0, privacyMode), warn: true },
          ]} />
        </Block>

        <Block title="Premissas vs Realizado" note="Comparação premissa do modelo vs realizado histórico">
          <Table rows={[
            { label: 'Retorno Equity — premissa', value: `${pvr.retorno_equity?.premissa_real_brl_pct ?? 0}% real BRL/ano`, muted: true },
            { label: 'Retorno Equity — realizado', value: `${pvr.retorno_equity?.twr_real_brl_pct ?? 0}% real BRL/ano`, accent: (pvr.retorno_equity?.twr_real_brl_pct ?? 0) > (pvr.retorno_equity?.premissa_real_brl_pct ?? 0) },
            { label: 'Backtest nominal USD', value: `${pvr.retorno_equity?.backtest_nominal_usd_pct ?? 0}%/ano`, muted: true },
            { label: 'vs VWRA benchmark', value: `${pvr.retorno_equity?.benchmark_vwra_nominal_usd_pct ?? 0}%/ano`, muted: true },
            { label: 'Período', value: `${pvr.retorno_equity?.periodo_anos ?? 5} anos`, muted: true },
            { label: 'Aportes', value: '', separator: true } as Row,
            { label: 'Premissa mensal', value: mask(pvr.aporte_mensal?.premissa_brl ?? 0, privacyMode) + '/mês', muted: true },
            { label: 'Média realizado', value: mask(pvr.aporte_mensal?.realizado_media_brl ?? 0, privacyMode) + '/mês', accent: true },
            { label: 'Delta', value: `+${(pvr.aporte_mensal?.delta_pct ?? 0).toFixed(0)}%`, accent: true },
          ]} />
          {pvr.aporte_mensal?.por_ano_brl && (
            <>
              <h3 style={{ margin: '10px 0 5px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Aportes por Ano
              </h3>
              <Table rows={Object.entries(pvr.aporte_mensal.por_ano_brl).sort(([a], [b]) => Number(b) - Number(a)).map(([ano, val]) => ({
                label: ano,
                value: mask(val as number, privacyMode),
                muted: true,
              }))} />
            </>
          )}
        </Block>

        {/* Spending Breakdown */}
        {sb.total_anual != null && (
          <Block title="Spending Breakdown" note={`Período: ${sb.periodo ?? '—'} (${sb.meses ?? 0} meses)`}>
            <Table rows={[
              { label: 'Must (essenciais)', value: mask(sb.must_spend_anual ?? 0, privacyMode) + '/ano' },
              { label: 'Like (opcionais)', value: mask(sb.like_spend_anual ?? 0, privacyMode) + '/ano', muted: true },
              { label: 'Imprevistos', value: mask(sb.imprevistos_mensal ?? 0, privacyMode) + '/mês', muted: true },
              { label: 'Total Realizado', value: mask(sb.total_anual ?? 0, privacyMode) + '/ano', accent: true },
              { label: 'Modelo FIRE', value: mask(sb.modelo_fire_anual ?? 0, privacyMode) + '/ano', muted: true },
              { label: 'Buffer vs Modelo', value: mask((sb.modelo_fire_anual ?? 0) - (sb.total_anual ?? 0), privacyMode), accent: (sb.modelo_fire_anual ?? 0) > (sb.total_anual ?? 0) },
            ]} />
          </Block>
        )}
      </div>

      {/* ── BLOCO 9: Eventos de Vida ── */}
      {le.eventos?.length > 0 && (
        <>
          <SectionDivider label="Eventos de Vida" />
          <div style={{ marginBottom: 10 }}>
            <Block title="Eventos de Vida — Impacto FIRE" note={`Base sem eventos: spending R$${((le.base?.spending_brl ?? 0) / 1000).toFixed(0)}k/ano, P(FIRE) ${((le.base?.pfire_2040 ?? 0) * 100).toFixed(1)}%`}>
              <Table rows={le.eventos.map((ev: any) => [
                {
                  label: ev.label + (ev.confirmado ? ' ✓' : ' (planej.)'),
                  value: `P ${(ev.pfire_2040 * 100).toFixed(1)}% (${ev.delta_pp > 0 ? '+' : ''}${ev.delta_pp}pp)`,
                  warn: Math.abs(ev.delta_pp) > 3,
                  accent: ev.confirmado && ev.delta_pp > 0,
                },
                {
                  label: '  → spending',
                  value: mask(ev.spending_novo, privacyMode) + '/ano',
                  muted: true,
                },
                {
                  label: '  → pat. necessário',
                  value: mask(ev.patrimonio_necessario, privacyMode),
                  muted: true,
                },
              ]).flat()} />
            </Block>
          </div>
        </>
      )}

      {/* Footer */}
      <p style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
        Fonte: <code>carteira_params.json</code> via pipeline Python.
        Para alterar: edite <code>agentes/contexto/carteira.md</code> → <code>parse_carteira.py</code> → <code>generate_data.py</code>.
      </p>
    </div>
  );
}
