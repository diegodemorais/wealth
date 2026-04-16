'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import SemaforoGatilhos from '@/components/dashboard/SemaforoGatilhos';
import FireProgressWellness from '@/components/dashboard/FireProgressWellness';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => {
      console.error('NOW page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Erro ao carregar dashboard:</strong> {dataError}
      </div>
    );
  }

  if (!derived) {
    return <div className="warning-state">⚠️ Dados carregados mas valores derivados não computados</div>;
  }

  // Compute max drift
  const maxDrift = data?.drift
    ? Math.max(0, ...Object.values(data.drift as Record<string, any>).map(d => Math.abs((d?.atual || 0) - (d?.alvo || 0))))
    : 0;

  // Get IPCA and Renda+ semaforo status from derived
  const ipcaTaxa = data?.rf?.ipca2040?.taxa;
  const rendaTaxa = data?.rf?.renda2065?.taxa;

  // Determine semaforo colors based on taxa levels
  const getIpcaSemaforoColor = (taxa: number | undefined) => {
    if (!taxa) return 'var(--muted)';
    if (taxa >= 7.5) return 'var(--green)';
    if (taxa >= 6.5) return 'var(--yellow)';
    return 'var(--red)';
  };

  const getRendaSemaforoColor = (taxa: number | undefined) => {
    if (!taxa) return 'var(--muted)';
    if (taxa >= 7.5) return 'var(--green)';
    if (taxa >= 6.5) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <div>
      {/* 1. HERO STRIP — Patrimônio Total | Anos até FIRE | Progresso FIRE */}
      <KpiHero
        networth={derived.networth}
        networthUsd={derived.networthUsd}
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
        pfire={derived.pfire}
        cambio={derived.CAMBIO}
      />

      {/* 2. KPI GRID: Indicadores Primários — P(Aspiracional), Drift Máx, Aporte Mês */}
      <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">Indicadores Primários</div>
      <div className="grid grid-cols-3 gap-2.5 mb-2">
        {/* P(Cenário Aspiracional) */}
        <div className="bg-card border-2 border-accent/40 rounded-lg p-4 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">P(Cenário Aspiracional)</div>
          <div className="text-2xl font-black text-accent">{derived.pfireAspiracional != null ? `${derived.pfireAspiracional.toFixed(1)}%` : '—'}</div>
          <div className="text-xs text-muted mt-1">cenário base</div>
        </div>
        {/* Drift Máximo */}
        <div className="bg-card border-2 border-accent/40 rounded-lg p-4 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">Drift Máximo</div>
          <div className="text-2xl font-black text-text">{maxDrift.toFixed(2)}pp</div>
          <div className="text-xs text-muted mt-1">vs alvo IPS</div>
        </div>
        {/* Aporte do Mês */}
        <div className="bg-card border border-border/50 rounded-lg p-4 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">Aporte do Mês</div>
          <div className="text-2xl font-black text-text">
            {derived.aporteMensal
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(derived.aporteMensal)
              : '—'}
          </div>
          <div className="text-xs text-muted mt-1">{derived.ultimoAporteData || '—'}</div>
        </div>
      </div>

      {/* 3. KPI GRID: Contexto de Mercado — Dólar, Bitcoin, IPCA+ 2040, Renda+ 2065 */}
      <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">Contexto de Mercado</div>
      <div className="grid grid-cols-4 gap-2.5 mb-3 opacity-85">
        {/* Dólar */}
        <div className="bg-card border border-border/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">Dólar</div>
          <div className="text-xl font-black text-text">{derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—'}</div>
          <div className="text-xs text-muted mt-1">BRL/USD · PTAX BCB</div>
        </div>
        {/* Bitcoin */}
        <div className="bg-card border border-border/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">Bitcoin</div>
          <div className="text-xl font-black text-text">
            {data?.hodl11?.btc_usd
              ? `$${Number(data.hodl11.btc_usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              : '—'}
          </div>
          <div className="text-xs text-muted mt-1">BTC/USD</div>
        </div>
        {/* IPCA+ 2040 */}
        <div className="bg-card border border-border/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest flex items-center justify-center gap-1">
            IPCA+ 2040 — Taxa
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: getIpcaSemaforoColor(ipcaTaxa),
              }}
            />
          </div>
          <div className="text-xl font-black text-text">{ipcaTaxa ? `${ipcaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="text-xs text-muted mt-1">
            {data?.rf?.ipca2040?.descricao || 'Tesouro IPCA+ 2040'}
          </div>
        </div>
        {/* Renda+ 2065 */}
        <div className="bg-card border border-border/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest flex items-center justify-center gap-1">
            Renda+ 2065 — Taxa
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: getRendaSemaforoColor(rendaTaxa),
              }}
            />
          </div>
          <div className="text-xl font-black text-text">{rendaTaxa ? `${rendaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="text-xs text-muted mt-1">
            {data?.rf?.renda2065?.descricao || 'Tesouro Renda+ 2065'}
          </div>
        </div>
      </div>

      {/* 4. SEÇÃO: Time to FIRE — Big number + Progresso */}
      <TimeToFireProgressBar
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
      />

      {/* 4a. Family Scenarios row abaixo do Time to FIRE */}
      {data?.fire_matrix?.by_profile && Array.isArray(data.fire_matrix.by_profile) && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {data.fire_matrix.by_profile.map((profile: any, i: number) => {
            const labels = ['👤 Solteiro', '💍 Casado', '👶 C+Filho'];
            const pfire50 = profile.p_fire_50 ?? null;
            const year50 = profile.fire_age_50 ?? '2037';
            return (
              <div key={i} className="bg-slate-700/30 border-t-2 border-accent/40 rounded-lg p-2.5 text-center">
                <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">
                  {labels[i]}
                </div>
                <div className="text-sm font-bold text-accent">FIRE 50</div>
                <div className="text-sm font-bold text-green mt-0.5">
                  P = {pfire50 != null ? `${pfire50.toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs text-muted mt-1">{year50}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. SEÇÃO: Semáforos de Gatilhos [COLLAPSIBLE, CRITICAL] */}
      {derived && Array.isArray(derived.gatilhos) && derived.gatilhos.length > 0 && (
        <SemaforoGatilhos
          gatilhos={derived.gatilhos}
          resumo={derived.resumoGatilhos}
          statusIpca={derived.statusIpca}
        />
      )}

      {/* 6. GRID 2-COL: Progresso FIRE + Aporte do Mês */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FireProgressWellness
          firePercentage={derived.firePercentage}
          firePatrimonioAtual={derived.firePatrimonioAtual}
          firePatrimonioGatilho={derived.firePatrimonioGatilho}
          swrFireDay={derived.swrFireDay}
          wellnessScore={derived.wellnessScore * 100}
          wellnessLabel={derived.wellnessLabel}
          wellnessMetrics={derived.wellnessMetrics}
        />
        {derived && (
          <AporteDoMes
            aporteMensal={derived.aporteMensal}
            ultimoAporte={derived.ultimoAporte}
            ultimoAporteData={derived.ultimoAporteData}
            acumuladoMes={derived.acumuladoMes}
            acumuladoAno={derived.acumuladoAno}
          />
        )}
      </div>

      {/* 6a. Financial Wellness Score — full width */}
      {derived?.wellnessScore != null && derived?.wellnessMetrics && (
        <section className="bg-card border border-border/50 rounded-lg p-4 mb-3.5">
          <div className="flex gap-5 items-start">
            {/* Score grande */}
            <div className="min-w-32 text-center">
              <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">
                Financial Wellness Score <span className="italic text-xs">(indicador secundário)</span>
              </div>
              <div className="text-5xl font-black text-green leading-none">
                {Math.round(derived.wellnessScore * 100)}
              </div>
              <div className="text-xs text-muted mt-1">/100 · Progressivo</div>
            </div>
            {/* Barras de métricas */}
            <div className="flex-1">
              {derived.wellnessMetrics.slice(0, 8).map((m: any, i: number) => (
                <div key={i} className="mb-1.5 flex items-center gap-2">
                  <div className="text-xs text-muted w-40 flex-shrink-0">{m.label}</div>
                  <div className="flex-1 bg-slate-700/40 rounded-sm h-1.5 relative overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${Math.min(100, Math.max(0, (m.value / m.max) * 100))}%`,
                        background: (m.value / m.max) > 0.8 ? 'var(--green)' : (m.value / m.max) > 0.5 ? 'var(--yellow)' : 'var(--red)',
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted w-12 text-right flex-shrink-0">
                    {m.value != null ? `${m.value}%` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. SEÇÃO: P(FIRE) — Monte Carlo + Tornado */}
      {derived && (
        <PFireMonteCarloTornado
          pfireBase={derived.pfireBase}
          pfireFav={derived.pfireFav}
          pfireStress={derived.pfireStress}
          tornadoData={derived.tornadoData}
        />
      )}

      {/* 8. SEÇÃO: Contexto Macro & DCA Status [COLLAPSIBLE, OPEN] */}
      <CollapsibleSection id="section-macro" title="Contexto Macro & DCA Status" defaultOpen={true} icon="📊">
        <div className="px-4 pb-4">
          {/* 8a. Exposição Brasil — Tabela detalhada */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">
              Exposição Brasil
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3 mb-2">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="text-xs text-muted">Total Brasil</div>
                  <div className="text-lg font-bold text-green mt-0.5">
                    {derived.concentrationBrazil != null ? `${(derived.concentrationBrazil * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
                <div className="text-sm text-muted text-right">
                  <div>HODL11: R${((data?.hodl11?.valor_brl ?? 0) / 1000).toFixed(0)}k</div>
                  <div>RF Total: R${((derived.rfBrl ?? 0) / 1000).toFixed(0)}k</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8b. DCA Status — 3 cards separados */}
          {data?.dca_status && (
            <div className="mb-3.5">
              <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">
                DCA Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* IPCA+ 2040 */}
                {data.dca_status.ipca_longo && (
                  <div className="bg-slate-700/40 rounded-lg p-2.5 border-l-3 border-accent/40">
                    <div className="text-xs text-muted mb-1">IPCA+ 2040</div>
                    <div className="text-sm font-bold mb-0.5">Taxa: {data.dca_status.ipca_longo.taxa_atual?.toFixed(2)}%</div>
                    <div className="text-xs text-muted">
                      Piso: {data.dca_status.ipca_longo.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_longo.gap_alvo_pp?.toFixed(1)}pp
                    </div>
                    <div className="text-xs text-muted">
                      Posição: R${((data.rf?.ipca2040?.valor ?? 0) / 1000).toFixed(0)}k ({data.dca_status.ipca_longo.pct_carteira_atual?.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {/* IPCA+ 2060 (2050) */}
                {data.dca_status.ipca_medio && (
                  <div className="bg-slate-700/40 rounded-lg p-2.5 border-l-3 border-accent/40">
                    <div className="text-xs text-muted mb-1">IPCA+ 2050</div>
                    <div className="text-sm font-bold mb-0.5">Taxa: {data.dca_status.ipca_medio.taxa_atual?.toFixed(2)}%</div>
                    <div className="text-xs text-muted">
                      Piso: {data.dca_status.ipca_medio.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_medio.gap_alvo_pp?.toFixed(1)}pp
                    </div>
                    <div className="text-xs text-muted">
                      Posição: R${((data.rf?.ipca2050?.valor ?? 0) / 1000).toFixed(0)}k ({data.dca_status.ipca_medio.pct_carteira_atual?.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {/* Renda+ 2065 */}
                {data.rf?.renda2065?.distancia_gatilho && (
                  <div className="bg-slate-700/40 rounded-lg p-2.5 border-l-3 border-accent/40">
                    <div className="text-xs text-muted mb-1">Renda+ 2065</div>
                    <div className="text-sm font-bold mb-0.5">Taxa: {data.rf.renda2065.distancia_gatilho.taxa_atual?.toFixed(2)}%</div>
                    <div className="text-xs text-muted">
                      Piso venda: {data.rf.renda2065.distancia_gatilho.piso_venda?.toFixed(1)}% | Gap: {data.rf.renda2065.distancia_gatilho.gap_pp?.toFixed(2)}pp
                    </div>
                    <div className="text-xs text-muted">
                      Posição: R${((data.rf?.renda2065?.valor ?? 0) / 1000).toFixed(0)}k
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Macro strip */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">
              Indicadores Macro
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-700/40 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.premissas?.taxa_selic ? `${data.premissas.taxa_selic.toFixed(1)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Selic</div>
              </div>
              <div className="bg-slate-700/40 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.premissas?.ipca_corrente ? `${data.premissas.ipca_corrente.toFixed(1)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">IPCA YTD</div>
              </div>
              <div className="bg-slate-700/40 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-text">{derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—'}</div>
                <div className="text-xs text-muted mt-1">USD/BRL</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 mb-0">
            Fonte: BCB / FRED · Nubank · IBKR · Premissa de depreciação BRL usada em projeções FIRE
          </div>
        </div>
      </CollapsibleSection>

      {/* 9. SEÇÃO: Sankey — Fluxo de Caixa [COLLAPSIBLE, OPEN] */}
      {derived && (
        <CollapsibleSection id="section-sankey" title="Sankey — Fluxo de Caixa Anual (estimado)" defaultOpen={true} icon="💸">
          <div style={{ padding: '0 16px 16px' }}>
            <CashFlowSankey
              aporteMensal={derived.aporteMensal}
              ipcaFlow={derived.ipcaFlowMonthly}
              equityFlow={derived.equityFlowMonthly}
              rendaPlusFlow={derived.rendaPlusFlowMonthly}
              cryptoFlow={derived.cryptoFlowMonthly}
            />
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
