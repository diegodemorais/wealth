'use client';

import { usePageData } from '@/hooks/usePageData';
import { useUiStore } from '@/store/uiStore';
import { pageStateElement } from '@/components/primitives/PageStateGuard';

function fmtBrl(v: number): string {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function fmtPctRaw(v: number): string {
  // Already in percent form (e.g. 7.08)
  return `${v.toFixed(2)}%`;
}

function maskBrl(v: number, priv: boolean): string {
  return priv ? '••••' : fmtBrl(v);
}

function maskNum(s: string, priv: boolean): string {
  return priv ? '••••' : s;
}

interface Row {
  label: string;
  value: string;
  private?: boolean;
  muted?: boolean;
}

function Table({ rows }: { rows: Row[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{
              borderBottom: '1px solid var(--border)',
              opacity: row.muted ? 0.6 : 1,
            }}
          >
            <td style={{ padding: '8px 4px', color: 'var(--muted)', width: '55%' }}>{row.label}</td>
            <td style={{ padding: '8px 4px', fontWeight: 600, color: 'var(--text)', textAlign: 'right', fontFamily: 'monospace' }}>
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
      <h2 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function PremissasPage() {
  const { data, isLoading, dataError } = usePageData();
  const privacyMode = useUiStore(s => s.privacyMode);

  const guard = pageStateElement({ isLoading, dataError, data });
  if (guard) return guard;

  const p = (data as any)?.premissas ?? {};
  const macro = (data as any)?.macro ?? {};
  const generated = (data as any)?._generated ?? '';

  // Bloco A — Premissas Pessoais
  const pessoais: Row[] = [
    { label: 'Patrimônio Atual', value: maskBrl(p.patrimonio_atual ?? 0, privacyMode) },
    { label: 'Patrimônio Gatilho (SWR 3%)', value: maskBrl(p.patrimonio_gatilho ?? 0, privacyMode) },
    { label: 'Spending Target', value: maskBrl(p.custo_vida_base ?? 0, privacyMode) + '/ano' },
    { label: 'Aporte Mensal', value: maskBrl(p.aporte_mensal ?? 0, privacyMode) + '/mês' },
    { label: 'Renda Mensal Estimada', value: maskBrl(p.renda_estimada ?? 0, privacyMode) + '/mês' },
    { label: 'Idade Atual', value: `${p.idade_atual ?? '—'} anos` },
    { label: 'FIRE Date (Base)', value: `${2026 + ((p.idade_cenario_base ?? 53) - (p.idade_atual ?? 39))} — ${p.idade_cenario_base ?? 53} anos` },
    { label: 'FIRE Date (Aspiracional)', value: `${2026 + ((p.idade_cenario_aspiracional ?? 49) - (p.idade_atual ?? 39))} — ${p.idade_cenario_aspiracional ?? 49} anos` },
    { label: 'Estado Civil', value: p.tem_conjuge ? `Casado (${p.nome_conjuge ?? ''})` : 'Solteiro' },
    { label: 'INSS Diego', value: maskBrl(p.inss_anual ?? 0, privacyMode) + '/ano (a partir dos ' + (p.inss_inicio_ano ?? 67) + ' anos)' },
    ...(p.tem_conjuge ? [
      { label: `INSS ${p.nome_conjuge ?? 'Cônjuge'}`, value: maskBrl(p.inss_katia_anual ?? 0, privacyMode) + '/ano' },
      { label: `PGBL ${p.nome_conjuge ?? 'Cônjuge'} (FIRE Day)`, value: maskBrl(p.pgbl_katia_saldo_fire ?? 0, privacyMode) },
    ] : []),
  ];

  // Bloco B — Premissas do Modelo
  const modelo: Row[] = [
    { label: 'Retorno Real Esperado (Equity)', value: fmtPct(p.retorno_equity_base ?? 0) + '/ano' },
    { label: 'Volatilidade (Equity)', value: fmtPct(p.volatilidade_equity ?? 0) + '/ano' },
    { label: 'Safe Withdrawal Rate (SWR)', value: fmtPct(p.swr_gatilho ?? 0) },
    { label: 'IPCA Assumido', value: fmtPct(p.ipca_anual ?? 0) + '/ano' },
    { label: 'Horizonte de Vida', value: `${p.horizonte_vida ?? 90} anos` },
    { label: 'Taxa IPCA+ Longa (Renda+ 2065)', value: fmtPctRaw(p.taxa_ipca_plus_longa ?? 0) + '/ano' },
    ...(macro.selic_meta != null ? [{ label: 'Selic Meta (BCB)', value: fmtPct(macro.selic_meta / 100) + '/ano', muted: true }] : []),
    ...(macro.ipca_12m != null ? [{ label: 'IPCA 12m (Realizado)', value: fmtPctRaw(macro.ipca_12m) + '/ano', muted: true }] : []),
    ...(macro.cambio != null ? [{ label: 'Câmbio BRL/USD', value: maskNum(`R$${Number(macro.cambio).toFixed(4)}`, privacyMode), muted: true }] : []),
  ];

  // Último aporte
  const ultimoAporte: Row[] = [
    ...(p.ultimo_aporte_data ? [{ label: 'Data', value: p.ultimo_aporte_data }] : []),
    ...(p.ultimo_aporte_brl ? [{ label: 'Valor', value: maskBrl(p.ultimo_aporte_brl, privacyMode) }] : []),
  ];

  const generatedLabel = generated
    ? (() => {
        try {
          return new Date(generated).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit',
          }) + ' BRT';
        } catch { return generated; }
      })()
    : '—';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Premissas</h1>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Fonte de verdade do plano FIRE · read-only</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
          Dados de: {generatedLabel}
        </span>
      </div>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
        <Block title="Premissas Pessoais">
          <Table rows={pessoais} />
        </Block>

        <Block title="Premissas do Modelo">
          <Table rows={modelo} />
          {ultimoAporte.length > 0 && (
            <>
              <h3 style={{ margin: '16px 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Último Aporte
              </h3>
              <Table rows={ultimoAporte} />
            </>
          )}
        </Block>
      </div>

      {/* Nota de rodapé */}
      <p style={{ marginTop: 20, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
        Premissas derivadas de <code>carteira_params.json</code> via pipeline. Atualizadas automaticamente a cada build.
        Para alterar um valor, edite <code>agentes/contexto/carteira.md</code> → rode <code>parse_carteira.py</code> → <code>generate_data.py</code>.
      </p>
    </div>
  );
}
