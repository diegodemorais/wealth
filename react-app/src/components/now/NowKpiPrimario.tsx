'use client';

/**
 * NowKpiPrimario — extraído de page.tsx em DEV-now-refactor.
 * Renderiza:
 *   - SectionLabel "Indicadores Primários"
 *   - Grid 4 KPIs: P(Aspiracional), Drift Máximo, Retorno Real CAGR, Aporte do Mês (+ Taxa Poupança opcional)
 *   - Mini card "Cap. Humano Katia" (C8)
 */
import { SectionLabel } from '@/components/primitives/SectionLabel';
import { MetricCard } from '@/components/primitives/MetricCard';
import { KpiCard } from '@/components/primitives/KpiCard';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface NowKpiPrimarioProps {
  data: any;
  derived: any;
  privacyMode: boolean;
  maxDrift: number;
}

export function NowKpiPrimario({ data, derived, privacyMode, maxDrift }: NowKpiPrimarioProps) {
  const d = derived;
  return (
    <>
      <SectionLabel>Indicadores Primários</SectionLabel>
      <div data-testid="kpi-grid-primario" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <MetricCard
          accent
          accentLeftBorder
          label="P(Cenário Aspiracional)"
          data-testid="pfire-aspiracional"
          tooltip={
            <>
              <strong>P(FIRE) cenário aspiracional</strong> — probabilidade Monte Carlo de
              atingir o gatilho FIRE aos 49 anos (cenário mais ambicioso de Diego).
              Sub-valores: <em>fav</em> (premissas otimistas) e <em>stress</em> (Bengen-equivalente).
              <br /><br />
              <strong>P(qualidade)</strong> mede meta gasto sustentável (não só sobrevivência).
              ≥70% verde · 50–70% amarelo · &lt;50% vermelho.
            </>
          }
          value={d.pfireAspiracional != null ? `${d.pfireAspiracional.toFixed(1)}%` : '—'}
          sub={(() => {
            const fireSub = d.pfireAspirFav != null && d.pfireAspirStress != null
              ? `fav ${d.pfireAspirFav.toFixed(1)}% · stress ${d.pfireAspirStress.toFixed(1)}%`
              : 'cenário aspiracional (FIRE 49 anos)';
            const pQualityAspiracionalRaw: number | null = data?.fire?.p_quality_aspiracional ?? null;
            const pQualityColor = pQualityAspiracionalRaw == null ? 'var(--muted)'
              : pQualityAspiracionalRaw >= 70 ? 'var(--green)'
              : pQualityAspiracionalRaw >= 50 ? 'var(--yellow)'
              : 'var(--red)';
            return (
              <>
                <span>{fireSub}</span>
                {pQualityAspiracionalRaw != null && (
                  <span style={{ display: 'block', marginTop: '3px', fontWeight: 600, color: pQualityColor }} data-testid="pquality-aspiracional">
                    P(qualidade) {privacyMode ? '••%' : `${pQualityAspiracionalRaw.toFixed(1)}%`}
                  </span>
                )}
              </>
            );
          })()}
        />
        <MetricCard
          accent
          accentLeftBorder
          label="Drift Máximo"
          data-testid="drift-maximo-kpi"
          tooltip={
            <>
              <strong>Drift Máximo</strong> — maior desvio absoluto (em pontos percentuais)
              entre peso atual e alvo IPS, considerando todas as classes/ETFs.
              <br /><br />
              Regra de rebalance: aporte direciona ao gap; venda só dispara em drift &gt;10pp
              ou evento de vida (decisão Mar/26 — IR pós-Lei 14.754 aniquila ganho de Sharpe).
            </>
          }
          value={`${maxDrift.toFixed(2)}pp`}
          valueColor="text-text"
          sub="vs alvo IPS"
        />
        {(() => {
          const twrReal: number | null = data?.retornos_mensais?.twr_real_brl_pct ?? null;
          const premissa: number = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;
          const periodoAnos: number | null = data?.retornos_mensais?.periodo_anos ?? null;
          const accent = twrReal == null ? 'var(--muted)'
            : twrReal >= 4.5 ? 'var(--green)'
            : twrReal >= 3 ? 'var(--yellow)'
            : 'var(--red)';
          const delta = twrReal != null ? twrReal - premissa : null;
          return (
            <KpiCard
              label="Retorno Real (CAGR)"
              value={twrReal != null ? (privacyMode ? '••%' : `${twrReal.toFixed(1)}%`) : '—'}
              accent={accent}
              tooltip={
                <>
                  <strong>Retorno Real (TWR)</strong> — Time-Weighted Return ajustado pela
                  inflação BRL (IPCA), neutro a aportes/resgates. Janela desde abr/2021
                  (início série IBKR; XP pré-2021 não comparável).
                  <br /><br />
                  Premissa real BRL: {premissa.toFixed(1)}%/ano. Bandas:
                  ≥4.5% verde · 3.0–4.5% amarelo · &lt;3.0% vermelho.
                </>
              }
              delta={delta != null && !privacyMode ? {
                text: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp vs ${premissa.toFixed(1)}%`,
                positive: delta >= 0,
              } : undefined}
              progress={twrReal != null ? twrReal / (premissa * 1.5) : undefined}
              sub={`TWR · desde abr/2021${periodoAnos != null ? ` · ${periodoAnos.toFixed(1)} anos` : ''}`}
            />
          );
        })()}
        <MetricCard
          label="Aporte do Mês"
          tooltip={
            <>
              <strong>Aporte do Mês</strong> — última entrada de capital registrada na
              cascata RF / Equity / BTC. Diego aporta no evento de entrada de caixa
              (sem dinheiro parado).
              <br /><br />
              Sub mostra mês do aporte e <em>média histórica</em> dos últimos 12 meses
              de aportes não-zero (referência para fluxo esperado).
            </>
          }
          value={d.ultimoAporte ? fmtPrivacy(d.ultimoAporte, privacyMode) : '—'}
          sub={d.aporteMediaHistorica ? `${d.ultimoAporteData || 'último'} · média ${fmtPrivacy(d.aporteMediaHistorica, privacyMode)}/mês` : (d.ultimoAporteData || 'último aporte')}
        />
        {d.taxaPoupanca != null && (
          <MetricCard
            data-testid="taxa-poupanca"
            label="Taxa de Poupança"
            tooltip={
              <>
                <strong>Taxa de Poupança</strong> — aporte / renda bruta. Métrica-chave FIRE
                (Trinity / Bengen): determina o tempo até FIRE muito mais que o retorno do
                portfolio.
                <br /><br />
                Meta ≥30% para FIRE-50. ~25% típico classe média alta. &gt;50% FIRE agressivo.
              </>
            }
            value={privacyMode ? '••%' : `${d.taxaPoupanca.toFixed(1)}%`}
            sub={`aporte / renda · meta FIRE ≥ 30%`}
          />
        )}
      </div>

      <CapitalHumanoKatiaCard data={data} privacyMode={privacyMode} />
    </>
  );
}

function CapitalHumanoKatiaCard({ data, privacyMode }: { data: any; privacyMode: boolean }) {
  const prem = data?.premissas as {
    inss_katia_anual?: number;
    inss_katia_inicio_ano?: number | null;
    pgbl_katia_saldo_fire?: number;
    gasto_katia_solo?: number;
    nome_conjuge?: string;
  } | undefined;
  const inssAnual = prem?.inss_katia_anual ?? 0;
  if (inssAnual <= 0) return null;
  const nomeKatia = prem?.nome_conjuge ?? 'Katia';
  const inicioAno = prem?.inss_katia_inicio_ano ?? 2049;
  const pgblFire = prem?.pgbl_katia_saldo_fire ?? 0;
  const gastoSolo = prem?.gasto_katia_solo ?? 0;
  return (
    <div
      data-testid="c8-capital-humano-katia"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        padding: '8px 14px',
        marginBottom: 10,
        background: 'var(--card2)',
        borderRadius: 6,
        border: '1px solid var(--border)',
        fontSize: 'var(--text-xs)',
      }}
    >
      <span style={{ fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', flexShrink: 0 }}>
        Cap. Humano {nomeKatia}
      </span>
      <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
      <span data-testid="c8-inss-katia-anual" style={{ color: 'var(--text)' }}>
        INSS:{' '}
        <span style={{ fontWeight: 700 }}>{fmtPrivacy(inssAnual, privacyMode)}/ano</span>
        {inicioAno != null && (
          <span style={{ color: 'var(--muted)', marginLeft: 4 }}>a partir de {inicioAno}</span>
        )}
      </span>
      {pgblFire > 0 && (
        <>
          <span style={{ color: 'var(--border)', userSelect: 'none' }}>·</span>
          <span data-testid="c8-pgbl-katia" style={{ color: 'var(--text)' }}>
            PGBL FIRE:{' '}
            <span style={{ fontWeight: 700 }}>{fmtPrivacy(pgblFire, privacyMode)}</span>
          </span>
        </>
      )}
      {gastoSolo > 0 && (
        <>
          <span style={{ color: 'var(--border)', userSelect: 'none' }}>·</span>
          <span data-testid="c8-gasto-katia-solo" style={{ color: 'var(--muted)' }}>
            Custo solo:{' '}
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmtPrivacy(gastoSolo, privacyMode)}/ano</span>
          </span>
        </>
      )}
    </div>
  );
}
