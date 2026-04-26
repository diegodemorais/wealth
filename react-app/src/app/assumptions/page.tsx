'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePageData } from '@/hooks/usePageData';
import { useUiStore } from '@/store/uiStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { pfireColor } from '@/utils/fire';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { CheckCircle, AlertTriangle, Clock, Shield, ArrowRight } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';

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
  return fmtPrivacy(v, priv);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface Row {
  label: React.ReactNode;
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

// A decision/action card with status indicator
function DecisionCard({ title, status, statusColor, detail, icon, muted }: {
  title: string;
  status: string;
  statusColor: string;
  detail?: string;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 7,
      padding: '10px 14px',
      opacity: muted ? 0.6 : 1,
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <div style={{ color: statusColor, flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{title}</span>
          <StatusPill label={status} color={statusColor} />
        </div>
        {detail && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{detail}</div>
        )}
      </div>
    </div>
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
        value={`${pct}%`}
        sub={`${fmtPrivacy(p.patrimonio_atual, priv)} de ${fmtPrivacy(p.patrimonio_gatilho, priv)}`}
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
                {`${fmtPrivacy(prof.gasto_anual, priv)}/ano`}
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
  const guardrailsRetirada = d?.guardrails_retirada ?? [];
  const le = d?.lumpy_events ?? {};
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
    { label: 'Progresso', value: p.patrimonio_gatilho ? `${((p.patrimonio_atual / p.patrimonio_gatilho) * 100).toFixed(1)}%` : '—', accent: true },
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

  // ── Model Assumptions rows — split into fundamental vs contextual ──
  const modelFundamentalRows: Row[] = [
    { label: 'Retorno Real — Equity', value: fmtPct(p.retorno_equity_base ?? 0) + '/ano' },
    { label: 'Volatilidade — Equity', value: fmtPct(p.volatilidade_equity ?? 0) + '/ano' },
    { label: 'SWR Gatilho FIRE', value: fmtPct(p.swr_gatilho ?? 0) },
    { label: 'IPCA Premissa (MC)', value: fmtPct(p.ipca_anual ?? 0) + '/ano' },
    { label: 'Taxa IPCA+ Longa (Renda+)', value: fmtPctRaw(p.taxa_ipca_plus_longa ?? 0) + '/ano' },
    { label: 'Horizonte de Vida', value: `${p.horizonte_vida ?? 90} anos` },
    { label: 'Long-Term Care (70+)', value: 'R$100k/ano', warn: true },
    { label: 'Contexto Macro', value: '', separator: true } as Row,
    ...(macro.ipca_12m != null ? [{ label: 'IPCA 12m Realizado', value: fmtPctRaw(macro.ipca_12m) + '/ano', muted: true }] : []),
    { label: 'Depreciação BRL (base)', value: `${((macro.depreciacao_brl_premissa ?? 0.5)).toFixed(1)}%/ano`, muted: true },
    ...(macro.selic_meta != null ? [{ label: 'Selic Meta (BCB)', value: fmtPct(macro.selic_meta / 100) + '/ano', muted: true }] : []),
    ...(d?.cambio != null ? [{ label: 'Câmbio BRL/USD', value: `R$${Number(d.cambio).toFixed(4)}`, muted: true }] : []),
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

  // ── Tax & Fiscal rows ──
  const taxRows: Row[] = [
    { label: 'IR Diferido (ETF exterior)', value: mask(tax.ir_diferido_total_brl ?? 0, privacyMode), warn: true },
    { label: 'Regime Fiscal', value: 'ACC UCITS — Lei 14.754/2023', muted: true },
    { label: 'Alíquota (alienação)', value: '15% flat sobre ganho nominal BRL', muted: true },
    ...(tax.estate_tax?.us_situs_total_usd != null ? [
      { label: 'Estate Tax (US-situs)', value: '', separator: true } as Row,
      { label: 'Exposição US-situs', value: fmtPrivacy(tax.estate_tax.us_situs_total_usd * 1000, privacyMode, { prefix: '$', compact: true }) + ' (lim. $60k)', warn: true },
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

  // ── Build decision cards data ──
  const decisionCards: {
    title: string;
    status: string;
    statusColor: string;
    detail?: string;
    icon: React.ReactNode;
    muted?: boolean;
  }[] = [
    {
      title: 'IPCA+ longo até 15%',
      status: dca.ipca_longo?.ativo ? 'DCA ATIVO' : 'PAUSADO',
      statusColor: dca.ipca_longo?.ativo ? 'var(--green)' : 'var(--yellow)',
      detail: dca.ipca_longo?.ativo
        ? `taxa ${dca.ipca_longo?.taxa_atual?.toFixed(2) ?? '—'}% · gap ${dca.ipca_longo?.gap_alvo_pp?.toFixed(1) ?? '—'}pp`
        : undefined,
      icon: dca.ipca_longo?.ativo ? <CheckCircle size={16} /> : <Clock size={16} />,
    },
    {
      title: 'Renda+ 2065 até 5%',
      status: dca.renda_plus?.ativo ? 'DCA ATIVO' : 'PAUSADO',
      statusColor: dca.renda_plus?.ativo ? 'var(--green)' : 'var(--yellow)',
      detail: dca.renda_plus?.ativo
        ? `posição ${dca.renda_plus?.pct_carteira_atual?.toFixed(1) ?? '—'}% → alvo ${dca.renda_plus?.alvo_pct ?? '—'}%`
        : undefined,
      icon: dca.renda_plus?.ativo ? <CheckCircle size={16} /> : <Clock size={16} />,
    },
    {
      title: 'Renda+ vender se taxa < 6.0%',
      // Usa distancia_gatilho.status do schema quando disponível (verde/amarelo/vermelho)
      status: rf.renda2065?.distancia_gatilho?.status === 'verde' ? 'SEGURO'
            : rf.renda2065?.distancia_gatilho?.status === 'amarelo' ? 'ATENÇÃO'
            : rf.renda2065?.distancia_gatilho?.status === 'vermelho' ? 'VENDER'
            // fallback: recalcula com thresholds definidos na regra de negócio
            : (rf.renda2065?.taxa ?? 7) >= 6.5 ? 'SEGURO' : (rf.renda2065?.taxa ?? 7) >= 6.0 ? 'ATENÇÃO' : 'VENDER',
      statusColor: rf.renda2065?.distancia_gatilho?.status === 'verde' ? 'var(--green)'
                 : rf.renda2065?.distancia_gatilho?.status === 'amarelo' ? 'var(--yellow)'
                 : rf.renda2065?.distancia_gatilho?.status === 'vermelho' ? 'var(--red)'
                 : (rf.renda2065?.taxa ?? 7) >= 6.5 ? 'var(--green)' : (rf.renda2065?.taxa ?? 7) >= 6.0 ? 'var(--yellow)' : 'var(--red)',
      detail: `taxa atual: ${rf.renda2065?.taxa?.toFixed(2) ?? '—'}% (gap: ${rf.renda2065?.distancia_gatilho?.gap_pp?.toFixed(1) ?? '—'}pp)`,
      icon: <Shield size={16} />,
    },
    {
      title: 'Seguro de vida',
      status: 'PENDENTE',
      statusColor: 'var(--yellow)',
      detail: 'Pendente casamento',
      icon: <AlertTriangle size={16} />,
    },
    {
      title: 'IPCA+ curto 3% (SoRR buffer)',
      status: 'FUTURO',
      statusColor: 'var(--muted)',
      detail: 'Comprar perto dos 50',
      icon: <Clock size={16} />,
      muted: true,
    },
    {
      title: 'Reserva IPCA+ 2029 no vencimento',
      status: 'FUTURO',
      statusColor: 'var(--muted)',
      detail: 'Aguardando 2029 — converter para Selic',
      icon: <Clock size={16} />,
      muted: true,
    },
    {
      title: 'RF pós-2040 (TD 2050 >= 3%?)',
      status: 'FUTURO',
      statusColor: 'var(--muted)',
      detail: 'Verificar em 2040',
      icon: <Clock size={16} />,
      muted: true,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Checklist do Plano</h1>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Visão geral e ações pendentes</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
          {generatedLabel}
        </span>
      </div>

      {/* ── Status Strip (4 KPIs) — always visible ── */}
      <div style={{ marginBottom: 14 }}>
        <StatusStrip p={p} fire={fire} pfire={pfire} priv={privacyMode} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: DECISÕES & AÇÕES (most actionable — top of page)            */}
      {/* ════════════════════════════════════════════════════════════════════════ */}

      <CollapsibleSection
        id="assumptions-decisions"
        title={secTitle('assumptions', 'assumptions-decisions', 'Decisões & Ações')}
        defaultOpen={secOpen('assumptions', 'assumptions-decisions', true)}
        icon={<AlertTriangle size={16} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {/* Decision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8, marginBottom: 14 }}>
            {decisionCards.map((card, idx) => (
              <DecisionCard key={idx} {...card} />
            ))}
          </div>

          {/* Life Events — part of decisions, not buried at bottom */}
          {le.eventos?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Eventos de Vida — Impacto FIRE
              </h3>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                Base sem eventos: spending {mask(le.base?.spending_brl ?? 0, privacyMode)}/ano, P(FIRE) {((le.base?.pfire_2040 ?? 0) * 100).toFixed(1)}%
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
                {le.eventos.map((ev: any, idx: number) => {
                  const isNeg = ev.delta_pp < 0;
                  const statusColor = ev.confirmado ? 'var(--green)' : isNeg ? 'var(--yellow)' : 'var(--muted)';
                  return (
                    <div key={idx} style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${statusColor}`,
                      borderRadius: 7,
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {ev.label}
                          {ev.confirmado && <CheckCircle size={12} style={{ color: 'var(--green)' }} />}
                          {!ev.confirmado && <span style={{ fontSize: 10, color: 'var(--muted)' }}>(planej.)</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          spending {mask(ev.spending_novo, privacyMode)}/ano
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: isNeg ? 'var(--yellow)' : 'var(--green)' }}>
                          {ev.delta_pp > 0 ? '+' : ''}{ev.delta_pp}pp
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                          P {(ev.pfire_2040 * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: ONDE ESTOU                                                   */}
      {/* ════════════════════════════════════════════════════════════════════════ */}

      <CollapsibleSection
        id="assumptions-onde-estou"
        title={secTitle('assumptions', 'assumptions-onde-estou', 'Onde Estou')}
        defaultOpen={secOpen('assumptions', 'assumptions-onde-estou', true)}
        icon={<ArrowRight size={16} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {/* DCA Status badges */}
          {dcaItems.some(i => i.pctAtual != null) && (
            <div style={{ marginBottom: 14 }}>
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

          {/* FIRE Targets */}
          <div style={{ marginBottom: 14 }}>
            <Block title="FIRE Targets">
              <Table rows={fireTargetsRows} />
            </Block>
          </div>

          {/* Capital Humano Disclosure */}
          <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ℹ️ Capital Humano — EXCLUÍDO do MC
            </div>
            <div style={{ color: 'var(--text)', lineHeight: 1.5, marginBottom: 6 }}>
              P(FIRE) = {(pfire.base ?? 0).toFixed(1)}% assume <strong>patrimônio financeiro isolado</strong> sem renda futura.
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
              <strong>Renda Garantida (não incluída):</strong> Katia R$113.8k/ano de INSS + PGBL a partir de 2049 (idade 62).
              <br />
              <strong>Por quê?</strong> Conservadorismo deliberado. P(FIRE) real é estimado 4-7pp maior com renda garantida.
              <br />
              <strong>Impacto prático:</strong> Após 9 anos pós-FIRE, margem de segurança ativada. Permite recuperação de drawdowns severos. Torna SWR pré-2049 mais rigoroso por design.
            </div>
          </div>

          {/* Guardrails vs MC Methodology */}
          <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚙️ Metodologia: P(FIRE) vs Qualidade de Vida
            </div>
            <div style={{ color: 'var(--text)', lineHeight: 1.5, marginBottom: 6 }}>
              <strong>Definição Atual:</strong> P(FIRE) = probabilidade de <strong>patrimônio não zerar</strong> em 40 anos com guardrails ativos.
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
              <strong>Nuance:</strong> Guardrails reduzem gasto de R$250k para R$180k em drawdowns >35% (28% degradação de vida). MC reporta como "sucesso".
              <br />
              <strong>Realidade:</strong> P(FIRE) {(pfire.base ?? 0).toFixed(1)}% é <strong>conservador</strong>. Com restrição gasto ≥ R$220k: ~82% (vs 78.8%).
              <br />
              <strong>Implicação:</strong> Margem de segurança implícita. Sem guardrails seria ~72%. Com guardrails = proteção contra falha catastrófica.
            </div>
          </div>

          {/* FIRE Scenarios Comparison */}
          <div style={{ marginBottom: 14 }}>
            <Block title="FIRE Scenarios — Trade-offs">
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 4px', textAlign: 'left', color: 'var(--muted)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cenário</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right', color: 'var(--muted)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Idade FIRE</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right', color: 'var(--muted)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>P(FIRE)</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right', color: 'var(--muted)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aporte/mês</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 4px', color: 'var(--text)', fontWeight: 600 }}>Base</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace' }}>53</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--green)', fontWeight: 600 }}>{(pfire.base ?? 0).toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--muted)' }}>{fmtBrl(p.aporte_mensal ?? 0)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 4px', color: 'var(--text)', fontWeight: 600 }}>Aspiracional</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace' }}>48</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace', color: (pfireA.base ?? 0) >= 90 ? 'var(--green)' : 'var(--yellow)', fontWeight: 600 }}>{(pfireA.base ?? 0).toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{fmtBrl(p.aporte_mensal_aspiracional ?? 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ padding: '8px 4px', fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
                      Diferença: 5 anos antes, +{fmtBrl((p.aporte_mensal_aspiracional ?? 0) - (p.aporte_mensal ?? 0))}/mês, -7.6pp P(FIRE). Trade-off entre tempo-para-FIRE e risco.
                    </td>
                  </tr>
                </tbody>
              </table>
            </Block>
          </div>

          {/* Family Scenarios */}
          {profiles.length > 0 && (
            <FamilyScenarios profiles={profiles} priv={privacyMode} />
          )}
        </div>
      </CollapsibleSection>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: O QUE COMBINAMOS — collapsed by default (reference)         */}
      {/* ════════════════════════════════════════════════════════════════════════ */}

      <CollapsibleSection
        id="assumptions-alocacao-regras"
        title={secTitle('assumptions', 'assumptions-alocacao-regras', 'Alocação & Regras')}
        defaultOpen={secOpen('assumptions', 'assumptions-alocacao-regras', false)}
        icon={<Shield size={16} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 10 }}>
            <Block title="Alocação Estratégica" note="Regra: 1 classe/vez · maior gap primeiro · exceção: janela de taxa">
              <Table rows={allocationRows} />
            </Block>

            <Block title="Pisos & Regras RF">
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {spendingGuardrailRows.length > 0 && (
                <Block title="Spending Guardrails" note="Upper = teto aspiracional · Safe = alvo · Lower = piso.">
                  <Table rows={spendingGuardrailRows} />
                </Block>
              )}

              <Block title="Guardrails de Retirada">
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
          </div>

          {taxRows.length > 0 && (
            <Block title="Fiscal" note="UCITS (fora US-situs). IR diferido cresce com depreciação BRL.">
              <Table rows={taxRows} />
            </Block>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="assumptions-modelo-referencia"
        title={secTitle('assumptions', 'assumptions-modelo-referencia', 'Modelo & Referência')}
        defaultOpen={secOpen('assumptions', 'assumptions-modelo-referencia', false)}
        icon={<Clock size={16} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10 }}>
            <Block title="Premissas do Modelo">
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

            <Block title="Balanço Holístico">
              <Table rows={holisticRows} />
              <p style={{ margin: '8px 0 0', padding: '7px 9px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                ¹ Imóvel equity = mercado − hipoteca. Capital Humano = VP renda futura.
              </p>
            </Block>

            <Block title="Focus Expectations (BCB)" note="Projeções de mercado sincronizadas com Banco Central.">
              <Table rows={[
                { label: 'Selic Terminal', value: `${((macro.selic_terminal ?? macro.selic_meta ?? 0) / 100).toFixed(2)}%/ano`, muted: macro.selic_terminal == null },
                { label: 'IPCA Projeção (2026)', value: `${fmtPctRaw(macro.ipca_focus ?? 4.8)}/ano`, muted: macro.ipca_focus == null },
                { label: 'Status Ciclo', value: 'Cortes em curso', muted: true },
                { label: 'Última Sincronização', value: macro.focus_update ?? '—', muted: true },
              ]} />
              <p style={{ margin: '8px 0 0', padding: '7px 9px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>
                Informações derivadas do Focus da Secretaria de Política Econômica. Atualizado periodicamente com projeções de mercado do BCB.
              </p>
            </Block>

            {bondPoolRows.length > 0 && (
              <Block title="Bond Pool" note={`Meta: ${bondPool.meta_anos ?? 7} anos de gastos em RF. DCA até ~2039.`}>
                <Table rows={bondPoolRows} />
              </Block>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Dashboard Updates / Changelog */}
      <CollapsibleSection
        id="dashboard-updates"
        title={secTitle('assumptions', 'dashboard-updates', '📊 Dashboard Updates')}
        defaultOpen={secOpen('assumptions', 'dashboard-updates')}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 12 }}>
            <strong>2026-04-26:</strong> Phase 3 Launch — Auditoria de Gaps (7.8→10.0) + 5 Melhorias Medium-Priority
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)' }}>Melhoria</th>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)' }}>Componente</th>
                <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 600, color: 'var(--muted)' }}>Mudança</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Phase 3 Roadmap</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                  Auditoria Completa
                </td>
                <td style={{ padding: '8px 6px' }}>Documentado 8 gaps + 2 blockers = +2.2 score (atingível 8.5-10/10)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Alpha Drought Caveat</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                  <Link href="/performance#section-expected-return-waterfall"
                        style={{ color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>
                    Factor Waterfall ↗
                  </Link>
                </td>
                <td style={{ padding: '8px 6px' }}>⚠️ Aviso factor droughts 8-10a comuns + impacto no alpha</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Renda+ Duration</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                  <Link href="/assumptions#assumptions-modelo-referencia"
                        style={{ color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>
                    Renda+ Metodologia ↗
                  </Link>
                </td>
                <td style={{ padding: '8px 6px' }}>Reconciliado Macaulay (21.79y) vs full product (43.6y) vs MtM impact</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>BTC/SWRD Correlation</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                  <Link href="/portfolio#section-crypto-band"
                        style={{ color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>
                    HODL11 Position ↗
                  </Link>
                </td>
                <td style={{ padding: '8px 6px' }}>Métrica 90-dia rolling correlation (diversificador &lt;40%, risco &gt;60%)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Focus Expectations</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                  <Link href="/assumptions#assumptions-modelo-referencia"
                        style={{ color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>
                    Macro Expectations ↗
                  </Link>
                </td>
                <td style={{ padding: '8px 6px' }}>Card com Selic terminal + IPCA 2026 Focus + cycle phase</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>SoRR Heatmap Refactor</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                  <Link href="/withdraw"
                        style={{ color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>
                    Sequence of Returns ↗
                  </Link>
                </td>
                <td style={{ padding: '8px 6px' }}>Interface para p10/p25/p50/p75/p90 (pronto para MC real)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Data Symlink Fix</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--green)' }}>
                  Sistema
                </td>
                <td style={{ padding: '8px 6px' }}>✓ Restaurado symlink data.json (dashboard carrega novamente)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Backtest Fallback</td>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--green)' }}>
                  <Link href="/backtest"
                        style={{ color: 'var(--green)', textDecoration: 'none', cursor: 'pointer' }}>
                    Backtest Page ↗
                  </Link>
                </td>
                <td style={{ padding: '8px 6px' }}>Mensagem informativa quando R7 data não carregado (aguardando IBKR)</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <strong>Commits:</strong> <code>7b85e060</code> (alpha drought) · <code>de4a2b15</code> (duration) · <code>c4293897</code> (correlation) · <code>650b1b57</code> (focus) · <code>36f427f5</code> (sorr) · <code>c0474723</code> (backtest fallback)
          </div>
          <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--muted)', fontStyle: 'italic' }}>
            <strong>Phase 3 Status:</strong> Auditoria completa. Roadmap: 8.5/10 (code-ready) → 9.2/10 (com IBKR) → 10.0/10 (stress scenarios + capital humano). Aguardando aprovação para implementação.
          </div>
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <p style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
        Fonte: <code>carteira_params.json</code> · Para alterar: <code>carteira.md</code> → <code>parse_carteira.py</code> → <code>generate_data.py</code>
      </p>
    </div>
  );
}
