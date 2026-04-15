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
    </div>
  );
}
