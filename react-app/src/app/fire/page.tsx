'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
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

      {/* 2. Cenário Base vs Cenário Aspiracional — Comparação Detalhada */}
      <section className="section" id="scenarioCompareSection">
        <h2>Cenário Base vs Cenário Aspiracional — Comparação Detalhada</h2>
        <FireScenariosTable />
        <div className="src">
          Base: Monte Carlo 10k simulações
        </div>
      </section>

      {/* 3. Glide Path — Alocação por Idade (collapsible) */}
      <CollapsibleSection id="section-glide-path" title="Glide Path — Alocação por Idade" defaultOpen={false}>
        <div style={{ padding: '0 16px 16px' }}>
          <GlidePathChart data={data} />
          <div className="src">
            Crypto: 3% pré e pós-FIRE. Alocações somam 100% por idade.
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Projeção de Patrimônio — P10 / P50 / P90 */}
      <section className="section" id="netWorthProjectionSection">
        <h2>Projeção de Patrimônio — P10 / P50 / P90 (portfólio financeiro)</h2>
        <NetWorthProjectionChart data={data} />
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(234,179,8,.08)', borderRadius: 6, borderLeft: '3px solid var(--yellow)', fontSize: '.72rem' }}>
          ⚠️ Portfólio financeiro apenas. Imóvel (apreciação não modelada), INSS (taxa de desconto não aprovada) e capital humano: excluídos.{' '}
          Pré-FIRE: interpolação exponencial entre hoje e endpoints MC. Pós-FIRE: r=4.85% real com spending smile (Go-Go/Slow-Go/No-Go) em R$ reais (constante 2026). INSS R$18k/ano real a partir de age 65.
        </div>
        <div className="src">
          Base: Monte Carlo 10k simulações · R$ reais constante 2026
        </div>
      </section>

      {/* 5. FIRE Matrix — P(Sucesso 30 anos) (collapsible) */}
      {data.fire_matrix && (
        <CollapsibleSection id="section-fire-matrix" title="FIRE Matrix — P(Sucesso 30 anos)" defaultOpen={false}>
          <div style={{ padding: '0 16px 16px' }}>
            <FireMatrixTable data={data.fire_matrix} />
            <div className="src">
              Verde &gt;95%, Amarelo 88–95%, Vermelho &lt;88%. Eixo: Patrimônio no FIRE Day (linha) × Gasto Anual BRL (coluna). ★ = gasto típico do perfil · → = patrimônio-alvo do perfil.
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 6. Eventos de Vida — Impacto no Plano FIRE (collapsible, border yellow) */}
      <CollapsibleSection id="section-eventos-vida" title="Eventos de Vida — Impacto no Plano FIRE" defaultOpen={false}>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: 8 }}>
            (gatilhos de recalibração)
          </div>
          <EventosVidaChart data={data} />
          <div className="src">
            Ao ativar qualquer evento: recalibrar custo de vida, FIRE date, seguro de vida e estrutura patrimonial imediatamente. Impacto de eventos permanentes no custo de vida.
          </div>
        </div>
      </CollapsibleSection>

      {/* 7. P(FIRE) — Cenários de Família (impact no custo de vida) */}
      {derived && (
        <section className="section" id="familyScenariosFireSection">
          <h2>P(FIRE) — Cenários de Família <span style={{ fontSize: '.7rem', fontWeight: 400, color: 'var(--muted)' }}>(impacto no custo de vida)</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: '👤 Solteiro / FIRE Day', pfire: derived.pfireBase, gastoAnual: 250000, gastoLabel: 'R$250k/ano', delta: null },
              { label: '💍 Pós-casamento', pfire: derived.pfireBase ? derived.pfireBase - 1.6 : null, gastoAnual: 300000, gastoLabel: 'R$300k/ano', delta: '-1.6pp' },
              { label: '👶 Casamento + filho', pfire: derived.pfireBase ? derived.pfireBase - 4.8 : null, gastoAnual: 360000, gastoLabel: 'R$360k/ano', delta: '-4.8pp' },
            ].map((scenario, i) => (
              <div key={i} style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 600 }}>{scenario.label}</div>
                  <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{scenario.gastoLabel}</div>
                  {scenario.delta && <div style={{ fontSize: '.65rem', color: 'var(--red)' }}>{scenario.delta}</div>}
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
                  <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>9m</div>
                </div>
              </div>
            ))}
          </div>
          <div className="src">Base: Monte Carlo 10k simulações · custo de vida base R$250k/ano · Sensibilidade ao custo de vida</div>
        </section>
      )}

      {/* 8. FIRE Aspiracional */}
      {derived && (
        <section className="section" id="fireAspirationalSection">
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(16,185,129,.08))',
            border: '2px dashed var(--accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>
              FIRE Aspiracional
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
              {data.fire_matrix?.ano_aspiracional ?? 2036}
            </div>
            <div style={{ fontSize: '.9rem', color: 'var(--muted)', marginTop: '4px' }}>
              idade {data.premissas?.idade_cenario_aspiracional ?? 49}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)', marginTop: '12px' }}>
              P = {derived.pfireBase != null ? `${(derived.pfireBase - 3.5).toFixed(1)}%` : '86.5%'}
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '4px' }}>
              {data.premissas?.idade_cenario_aspiracional ? (data.premissas.idade_cenario_aspiracional - data.premissas.idade_atual) : 10} anos a partir de hoje
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', maxWidth: '300px', margin: '16px auto 0' }}>
              <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Cenário Aspiracional</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {derived.pfireBase != null ? `${(derived.pfireBase - 3.5).toFixed(1)}%` : '86.5%'}
                </div>
              </div>
              <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Cenário Base</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green)' }}>
                  {derived.pfireBase != null ? `${derived.pfireBase.toFixed(1)}%` : '86.5%'}
                </div>
              </div>
            </div>
            <div className="src" style={{ marginTop: '12px' }}>
              Threshold: P(FIRE) &gt; 86% · baseado em MC 10k simulações
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
