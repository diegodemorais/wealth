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
          <div className="grid-2" style={{ marginBottom: '14px' }}>
            {/* Brasil Concentração placeholder */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '6px' }}>
                Concentração Brasil
              </div>
              <div className="brasil-card">
                <div className="brasil-header">
                  <span className="brasil-pct">{derived.brasilPct ? `${derived.brasilPct.toFixed(1)}%` : '—'}</span>
                  <span className="brasil-lbl">do total financeiro</span>
                </div>
              </div>
            </div>
            {/* Macro strip */}
            <div>
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
          </div>
          <div className="src" style={{ marginBottom: '14px' }}>
            Fonte: BCB / FRED · Premissa de depreciação BRL usada em projeções FIRE
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
