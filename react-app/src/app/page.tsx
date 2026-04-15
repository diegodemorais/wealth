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
      <div style={styles.sectionLabel}>Indicadores Primários</div>
      <div className="kpi-grid" style={{ marginBottom: '8px' }}>
        {/* P(Cenário Aspiracional) */}
        <div className="kpi kpi-fire" style={{ borderWidth: '2px' }}>
          <div className="kpi-label">P(Cenário Aspiracional)</div>
          <div className="kpi-value pv">{derived.pfireAspiracional != null ? `${derived.pfireAspiracional.toFixed(1)}%` : '—'}</div>
          <div className="kpi-sub pv">cenário base</div>
        </div>
        {/* Drift Máximo */}
        <div className="kpi kpi-fire" style={{ borderWidth: '2px' }}>
          <div className="kpi-label">Drift Máximo</div>
          <div className="kpi-value">{maxDrift.toFixed(2)}pp</div>
          <div className="kpi-sub">vs alvo IPS</div>
        </div>
        {/* Aporte do Mês */}
        <div className="kpi">
          <div className="kpi-label">Aporte do Mês</div>
          <div className="kpi-value pv">
            {derived.aporteMensal
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(derived.aporteMensal)
              : '—'}
          </div>
          <div className="kpi-sub pv">{derived.ultimoAporteData || '—'}</div>
        </div>
      </div>

      {/* 3. KPI GRID: Contexto de Mercado — Dólar, Bitcoin, IPCA+ 2040, Renda+ 2065 */}
      <div style={styles.sectionLabel}>Contexto de Mercado</div>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '12px' }}>
        {/* Dólar */}
        <div className="kpi" style={{ opacity: 0.85 }}>
          <div className="kpi-label">Dólar</div>
          <div className="kpi-value">{derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—'}</div>
          <div className="kpi-sub">BRL/USD · PTAX BCB</div>
        </div>
        {/* Bitcoin */}
        <div className="kpi" style={{ opacity: 0.85 }}>
          <div className="kpi-label">Bitcoin</div>
          <div className="kpi-value">
            {data?.hodl11?.btc_usd
              ? `$${Number(data.hodl11.btc_usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              : '—'}
          </div>
          <div className="kpi-sub">BTC/USD</div>
        </div>
        {/* IPCA+ 2040 */}
        <div className="kpi" style={{ opacity: 0.85 }}>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            IPCA+ 2040 — Taxa
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              display: 'inline-block',
              backgroundColor: getIpcaSemaforoColor(ipcaTaxa),
              flexShrink: 0,
            }} />
          </div>
          <div className="kpi-value">{ipcaTaxa ? `${ipcaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="kpi-sub">
            {data?.rf?.ipca2040?.descricao || 'Tesouro IPCA+ 2040'}
          </div>
        </div>
        {/* Renda+ 2065 */}
        <div className="kpi" style={{ opacity: 0.85 }}>
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Renda+ 2065 — Taxa
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              display: 'inline-block',
              backgroundColor: getRendaSemaforoColor(rendaTaxa),
              flexShrink: 0,
            }} />
          </div>
          <div className="kpi-value">{rendaTaxa ? `${rendaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="kpi-sub">
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          {data.fire_matrix.by_profile.map((profile: any, i: number) => {
            const labels = ['👤 Solteiro', '💍 Casado', '👶 C+Filho'];
            const pfire50 = profile.p_fire_50 ?? null;
            const year50 = profile.fire_age_50 ?? '2037';
            return (
              <div key={i} style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', textAlign: 'center', borderTop: '2px solid var(--accent)' }}>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
                  {labels[i]}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>FIRE 50</div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--green)' }}>
                  P = {pfire50 != null ? `${pfire50.toFixed(1)}%` : '—'}
                </div>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{year50}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. SEÇÃO: Semáforos de Gatilhos [COLLAPSIBLE, CRITICAL] */}
      {derived && derived.gatilhos && (
        <SemaforoGatilhos
          gatilhos={derived.gatilhos}
          resumo={derived.resumoGatilhos}
          statusIpca={derived.statusIpca}
        />
      )}

      {/* 6. GRID 2-COL: Progresso FIRE + Aporte do Mês */}
      <div className="grid-2">
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
        <section className="section" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* Score grande */}
            <div style={{ minWidth: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
                Financial Wellness Score <span style={{ fontStyle: 'italic' }}>(indicador secundário)</span>
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
                {Math.round(derived.wellnessScore * 100)}
              </div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>/100 · Progressivo</div>
            </div>
            {/* Barras de métricas */}
            <div style={{ flex: 1 }}>
              {derived.wellnessMetrics.slice(0, 8).map((m: any, i: number) => (
                <div key={i} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', width: '160px', flexShrink: 0 }}>{m.label}</div>
                  <div style={{ flex: 1, background: 'var(--card2)', borderRadius: '3px', height: '6px', position: 'relative' }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(0, (m.value / m.max) * 100))}%`,
                      height: '100%',
                      borderRadius: '3px',
                      background: (m.value / m.max) > 0.8 ? 'var(--green)' : (m.value / m.max) > 0.5 ? 'var(--yellow)' : 'var(--red)',
                    }} />
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', width: '50px', textAlign: 'right', flexShrink: 0 }}>
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
        <div style={{ padding: '0 16px 16px' }}>
          {/* 8a. Exposição Brasil — Tabela detalhada */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Exposição Brasil
            </div>
            <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>Total Brasil</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>
                    {derived.concentrationBrazil != null ? `${(derived.concentrationBrazil * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', textAlign: 'right' }}>
                  <div>HODL11: R${((data?.hodl11?.valor_brl ?? 0) / 1000).toFixed(0)}k</div>
                  <div>RF Total: R${((derived.rfBrl ?? 0) / 1000).toFixed(0)}k</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8b. DCA Status — 3 cards separados */}
          {data?.dca_status && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                DCA Status
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {/* IPCA+ 2040 */}
                {data.dca_status.ipca_longo && (
                  <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginBottom: '4px' }}>IPCA+ 2040</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: '2px' }}>Taxa: {data.dca_status.ipca_longo.taxa_atual?.toFixed(2)}%</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                      Piso: {data.dca_status.ipca_longo.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_longo.gap_alvo_pp?.toFixed(1)}pp
                    </div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                      Posição: R${((data.rf?.ipca2040?.valor ?? 0) / 1000).toFixed(0)}k ({data.dca_status.ipca_longo.pct_carteira_atual?.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {/* IPCA+ 2060 (2050) */}
                {data.dca_status.ipca_medio && (
                  <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginBottom: '4px' }}>IPCA+ 2050</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: '2px' }}>Taxa: {data.dca_status.ipca_medio.taxa_atual?.toFixed(2)}%</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                      Piso: {data.dca_status.ipca_medio.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_medio.gap_alvo_pp?.toFixed(1)}pp
                    </div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                      Posição: R${((data.rf?.ipca2050?.valor ?? 0) / 1000).toFixed(0)}k ({data.dca_status.ipca_medio.pct_carteira_atual?.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {/* Renda+ 2065 */}
                {data.rf?.renda2065?.distancia_gatilho && (
                  <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginBottom: '4px' }}>Renda+ 2065</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: '2px' }}>Taxa: {data.rf.renda2065.distancia_gatilho.taxa_atual?.toFixed(2)}%</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                      Piso venda: {data.rf.renda2065.distancia_gatilho.piso_venda?.toFixed(1)}% | Gap: {data.rf.renda2065.distancia_gatilho.gap_pp?.toFixed(2)}pp
                    </div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                      Posição: R${((data.rf?.renda2065?.valor ?? 0) / 1000).toFixed(0)}k
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Macro strip */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '6px' }}>
              Indicadores Macro
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              <div style={styles.macroKpi}>
                <div style={styles.macroVal}>{data?.premissas?.taxa_selic ? `${data.premissas.taxa_selic.toFixed(1)}%` : '—'}</div>
                <div style={styles.macroLbl}>Selic</div>
              </div>
              <div style={styles.macroKpi}>
                <div style={styles.macroVal}>{data?.premissas?.ipca_corrente ? `${data.premissas.ipca_corrente.toFixed(1)}%` : '—'}</div>
                <div style={styles.macroLbl}>IPCA YTD</div>
              </div>
              <div style={styles.macroKpi}>
                <div style={styles.macroVal}>{derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—'}</div>
                <div style={styles.macroLbl}>USD/BRL</div>
              </div>
            </div>
          </div>

          <div className="src" style={{ marginBottom: '0px' }}>
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

const styles: Record<string, React.CSSProperties> = {
  sectionLabel: {
    fontSize: '0.6rem',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    marginTop: '2px',
  },
  grid2col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '14px',
  },
  macroKpi: {
    backgroundColor: 'var(--card2)',
    borderRadius: '8px',
    padding: '10px 12px',
    textAlign: 'center' as const,
  },
  macroVal: {
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  macroLbl: {
    fontSize: '0.65rem',
    color: 'var(--muted)',
    marginTop: '2px',
  },
};
