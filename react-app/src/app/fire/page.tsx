'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDashboardStore } from '@/store/dashboardStore';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TrackingFireChart } from '@/components/charts/TrackingFireChart';
import { NetWorthProjectionChart } from '@/components/charts/NetWorthProjectionChart';
import { GlidePathChart } from '@/components/charts/GlidePathChart';
import { FireScenariosTable } from '@/components/fire/FireScenariosTable';
import { FireMatrixTable } from '@/components/dashboard/FireMatrixTable';
import { EventosVidaChart } from '@/components/charts/EventosVidaChart';

export default function FirePage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados FIRE...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>Erro ao carregar FIRE:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">Dados carregados mas seção FIRE não disponível</div>;
  }

  // Compute approximate retirement age for each fire_matrix patrimônio row
  // Uses fire_trilha P50 projection; extrapolates beyond its end with recent monthly growth
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fireMatrixIdades = useMemo(() => {
    const ft = (data as any)?.fire_trilha;
    const pats: number[] = (data as any)?.fire_matrix?.patrimonios ?? [];
    if (!ft?.dates || !ft?.trilha_brl || !pats.length) return undefined;
    const idadeAtual: number = (data as any)?.premissas?.idade_atual ?? 39;
    const anoAtual: number = (data as any)?.premissas?.ano_atual ?? 2026;
    const dates: string[] = ft.dates;
    const values: (number | null)[] = ft.trilha_brl;
    const nonNull = dates.map((dt: string, i: number) => ({ dt, v: values[i] })).filter(x => x.v != null) as { dt: string; v: number }[];
    if (!nonNull.length) return undefined;
    // Monthly growth rate from last 12 available months for extrapolation
    const last = nonNull[nonNull.length - 1];
    const prev12 = nonNull[Math.max(0, nonNull.length - 12)];
    const monthlyGrowth = nonNull.length >= 12 ? (last.v / prev12.v) ** (1 / 11) - 1 : 0.006;
    const toIdade = (year: number, month: number) => idadeAtual + (year - anoAtual) + (month - 4) / 12;
    return pats.map((pat: number) => {
      for (const { dt, v } of nonNull) {
        if (v >= pat) {
          return Math.round(toIdade(parseInt(dt.slice(0, 4)), parseInt(dt.slice(5, 7))));
        }
      }
      // Extrapolate beyond trajectory end
      let v = last.v;
      let year = parseInt(last.dt.slice(0, 4));
      let month = parseInt(last.dt.slice(5, 7));
      for (let i = 0; i < 120; i++) {
        v *= (1 + monthlyGrowth);
        month++;
        if (month > 12) { month = 1; year++; }
        if (v >= pat) return Math.round(toIdade(year, month));
      }
      return null;
    });
  }, [data]);

  return (
    <div>
      {/* 1. Tracking FIRE — Realizado vs Projeção */}
      <section className="section" id="trackingFireSection">
        <h2>Tracking FIRE — Realizado vs Projeção</h2>
        <TrackingFireChart data={data} />
        <div className="src">
          Patrimônio realizado vs projeção FIRE · Meta FIRE
        </div>
      </section>

      {/* 2. FIRE Aspiracional — horizonte imediato (moved from last: ancora o "quando posso chegar antes?") */}
      {derived && (
        <section className="section" id="fireAspirationalSection">
          <div style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent), color-mix(in srgb, var(--green) 8%, transparent))',
            border: '2px dashed var(--accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>
              FIRE Aspiracional
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
              {data.fire_matrix?.ano_aspiracional ?? 2036}
            </div>
            <div style={{ fontSize: '.9rem', color: 'var(--muted)', marginTop: '4px' }}>
              idade {data.premissas?.idade_cenario_aspiracional ?? 49}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)', marginTop: '12px' }}>
              P = {derived.pfireAspiracional != null ? `${derived.pfireAspiracional.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '4px' }}>
              {data.premissas?.idade_cenario_aspiracional ? (data.premissas.idade_cenario_aspiracional - data.premissas.idade_atual) : 10} anos a partir de hoje
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', maxWidth: '300px', margin: '16px auto 0' }}>
              <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Aspiracional</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {derived.pfireAspiracional != null ? `${derived.pfireAspiracional.toFixed(1)}%` : '—'}
                </div>
              </div>
              <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Base (conservador)</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green)' }}>
                  {derived.pfireBase != null ? `${derived.pfireBase.toFixed(1)}%` : '—'}
                </div>
              </div>
            </div>
            <div className="src" style={{ marginTop: '12px' }}>
              Threshold: P(FIRE) &gt; 86% · baseado em MC 10k simulações
            </div>
            <div style={{ marginTop: '16px' }}>
              <Link
                href="/simulators?preset=aspiracional"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  textDecoration: 'none',
                  transition: 'opacity .2s',
                }}
              >
                Simular Cenário Aspiracional →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. Projeção de Patrimônio — P10 / P50 / P90 (moved up: trajetória após horizonte) */}
      <section className="section" id="netWorthProjectionSection">
        <h2>Projeção de Patrimônio — P10 / P50 / P90 (portfólio financeiro)</h2>
        <NetWorthProjectionChart data={data} />
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'color-mix(in srgb, var(--yellow) 8%, transparent)', borderRadius: 6, borderLeft: '3px solid var(--yellow)', fontSize: 'var(--text-sm)' }}>
          ⚠️ Portfólio financeiro apenas. Imóvel (apreciação não modelada), INSS (taxa de desconto não aprovada) e capital humano: excluídos.{' '}
          Pré-FIRE: interpolação exponencial entre hoje e endpoints MC. Pós-FIRE: r=4.85% real com spending smile (Go-Go/Slow-Go/No-Go) em R$ reais (constante 2026). INSS R$18k/ano real a partir de age 65.
        </div>
        <div className="src">
          Base: Monte Carlo 10k simulações · R$ reais constante 2026
        </div>
      </section>

      {/* 4. FIRE Matrix — P(Sucesso 30 anos) */}
      {data.fire_matrix && (
        <CollapsibleSection id="section-fire-matrix" title={secTitle('fire', 'fire-matrix')} defaultOpen={secOpen('fire', 'fire-matrix')}>
          <div style={{ padding: '0 16px 16px' }}>
            <FireMatrixTable data={data.fire_matrix} idades={fireMatrixIdades} />
            <div className="src">
              Verde &gt;95%, Amarelo 88–95%, Vermelho &lt;88%. Eixo: Patrimônio no FIRE Day (linha) × Gasto Anual BRL (coluna). ★ = gasto típico do perfil · → = patrimônio-alvo do perfil.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 5. P(FIRE) — Cenários de Família (moved up: sensibilidade ao custo de vida) */}
      {derived && (
        <section className="section" id="familyScenariosFireSection">
          <h2>P(FIRE) — Cenários de Família <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--muted)' }}>(impacto no custo de vida)</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const profiles = (data as any)?.fire_matrix?.by_profile ?? [];
              const casado = profiles.find((p: any) => p.profile === 'casado');
              const filho = profiles.find((p: any) => p.profile === 'filho');
              const pfireSolteiro = derived.pfireBase;
              const pfireCasado = casado?.p_fire_53 ?? null;
              const pfireFilho = filho?.p_fire_53 ?? null;
              const gastoCasado = casado?.gasto_anual ?? 270000;
              const gastoFilho = filho?.gasto_anual ?? 300000;
              const deltaCasado = pfireSolteiro != null && pfireCasado != null ? (pfireCasado - pfireSolteiro).toFixed(1) : null;
              const deltaFilho = pfireSolteiro != null && pfireFilho != null ? (pfireFilho - pfireSolteiro).toFixed(1) : null;
              return [
                { label: '👤 Solteiro / FIRE Day', pfire: pfireSolteiro, gastoAnual: 250000, gastoLabel: 'R$250k/ano', delta: null },
                { label: '💍 Pós-casamento', pfire: pfireCasado, gastoAnual: gastoCasado, gastoLabel: `R$${(gastoCasado/1000).toFixed(0)}k/ano`, delta: deltaCasado ? `${parseFloat(deltaCasado) > 0 ? '+' : ''}${deltaCasado}pp` : null },
                { label: '👶 Casamento + filho', pfire: pfireFilho, gastoAnual: gastoFilho, gastoLabel: `R$${(gastoFilho/1000).toFixed(0)}k/ano`, delta: deltaFilho ? `${parseFloat(deltaFilho) > 0 ? '+' : ''}${deltaFilho}pp` : null },
              ];
            })().map((scenario, i) => (
              <div key={i} style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 600 }}>{scenario.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{scenario.gastoLabel}</div>
                  {scenario.delta && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{scenario.delta}</div>}
                </div>
                <div style={{ flex: 1, background: 'var(--card)', borderRadius: 'var(--radius-xs)', height: '8px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    width: `${scenario.pfire != null ? Math.min(100, scenario.pfire) : 0}%`,
                    height: '100%',
                    background: scenario.pfire != null && scenario.pfire >= 90 ? 'var(--green)' : 'var(--yellow)',
                    borderRadius: 'var(--radius-xs)',
                  }} />
                </div>
                <div style={{ minWidth: '80px', textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: scenario.pfire && scenario.pfire >= 90 ? 'var(--green)' : 'var(--yellow)' }}>
                    {scenario.pfire != null ? `${scenario.pfire.toFixed(1)}%` : '—'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>9m</div>
                </div>
              </div>
            ))}
          </div>
          <div className="src">Base: Monte Carlo 10k simulações · custo de vida base R$250k/ano · Sensibilidade ao custo de vida</div>
        </section>
      )}

      {/* 6. Eventos de Vida — collapsed (detalhe de sensibilidade) */}
      <CollapsibleSection id="section-eventos-vida" title={secTitle('fire', 'eventos-vida')} defaultOpen={secOpen('fire', 'eventos-vida')}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
            (gatilhos de recalibração)
          </div>
          <EventosVidaChart data={data} />
          <div className="src">
            Ao ativar qualquer evento: recalibrar custo de vida, FIRE date, seguro de vida e estrutura patrimonial imediatamente. Impacto de eventos permanentes no custo de vida.
          </div>
        </div>
      </CollapsibleSection>

      {/* 7. Cenário Base vs Aspiracional — collapsed (referência técnica) */}
      <CollapsibleSection id="section-scenario-compare" title={secTitle('fire', 'scenario-compare')} defaultOpen={secOpen('fire', 'scenario-compare')}>
        <div style={{ padding: '0 16px 16px' }}>
          <FireScenariosTable />
          <div className="src">
            Base: Monte Carlo 10k simulações
          </div>
        </div>
      </CollapsibleSection>

      {/* 8. Glide Path — collapsed (mecanismo de execução) */}
      <CollapsibleSection id="section-glide-path" title={secTitle('fire', 'glide-path')} defaultOpen={secOpen('fire', 'glide-path')}>
        <div style={{ padding: '0 16px 16px' }}>
          <GlidePathChart data={data} />
          <div className="src">
            Crypto: 3% pré e pós-FIRE. Alocações somam 100% por idade.
          </div>
        </div>
      </CollapsibleSection>

    </div>
  );
}
