'use client';

/**
 * Discovery — componentes órfãos com valor potencial.
 * Portados do HTML mas nunca integrados às páginas React.
 * Diego decide: integrar a uma aba permanente ou deletar.
 */

const DISCOVERY_ITEMS: {
  category: string;
  items: { name: string; path: string; desc: string; targetTab?: string }[];
}[] = [
  {
    category: 'Charts — Visualizações ECharts prontas',
    items: [
      { name: 'TornadoChart', path: 'charts/TornadoChart', desc: 'Análise de sensibilidade (tornado) — impacto de cada variável no resultado FIRE', targetTab: 'FIRE' },
      { name: 'FanChart', path: 'charts/FanChart', desc: 'Projeção probabilística em leque (P10–P90) — timeline de patrimônio', targetTab: 'FIRE / Withdraw' },
      { name: 'HeatmapChart', path: 'charts/HeatmapChart', desc: 'Heatmap de retornos mensais — correlação temporal de performance', targetTab: 'Performance' },
      { name: 'ShadowChart', path: 'charts/ShadowChart', desc: 'Shadow portfolio — comparação do portfólio real vs. benchmark passivo', targetTab: 'Performance' },
      { name: 'RollingSharpChart', path: 'charts/RollingSharpChart', desc: 'Rolling Sharpe ratio — eficiência risk-adjusted ao longo do tempo', targetTab: 'Backtest' },
      { name: 'StackedAllocChart', path: 'charts/StackedAllocChart', desc: 'Evolução da alocação em área empilhada — drift ao longo do tempo', targetTab: 'Portfolio' },
      { name: 'IncomeChart', path: 'charts/IncomeChart', desc: 'Projeção de renda na aposentadoria — fontes de income breakdown', targetTab: 'Withdraw' },
      { name: 'DrawdownHistChart', path: 'charts/DrawdownHistChart', desc: 'Drawdown histórico em ECharts — versão alternativa ao componente no Backtest', targetTab: 'Backtest' },
      { name: 'BucketAllocationChart', path: 'charts/BucketAllocationChart', desc: 'Alocação por bucket strategy (curto/médio/longo prazo)', targetTab: 'Withdraw' },
      { name: 'TerChart', path: 'charts/TerChart', desc: 'Comparação de TER (Total Expense Ratio) entre ETFs', targetTab: 'Portfolio' },
    ],
  },
  {
    category: 'Bond Strategy — RF e Bond Pool',
    items: [
      { name: 'BondLadderTimeline', path: 'dashboard/BondLadderTimeline', desc: 'Timeline visual da escada de bonds — vencimentos no tempo', targetTab: 'Withdraw' },
      { name: 'BondMaturityLadder', path: 'dashboard/BondMaturityLadder', desc: 'Escada de maturidade de títulos RF — detalhamento por vencimento', targetTab: 'Withdraw' },
      { name: 'BondPoolComposition', path: 'dashboard/BondPoolComposition', desc: 'Composição do bond pool — breakdown por tipo de título', targetTab: 'Withdraw' },
    ],
  },
  {
    category: 'Tax & TLH — Tributação e Tax Loss Harvesting',
    items: [
      { name: 'IRShield', path: 'dashboard/IRShield', desc: 'Oportunidades de TLH — lotes com prejuízo realizável para compensar ganhos', targetTab: 'Portfolio' },
      { name: 'TLHMonitor', path: 'dashboard/TLHMonitor', desc: 'Monitor de Tax Loss Harvesting — tracking de lotes e wash sale', targetTab: 'Portfolio' },
      { name: 'TaxDeferralClock', path: 'dashboard/TaxDeferralClock', desc: 'Relógio de diferimento fiscal — quanto economiza por não vender', targetTab: 'Assumptions' },
      { name: 'TaxAnalysisGrid', path: 'portfolio/TaxAnalysisGrid', desc: 'Grid de análise tributária por posição — IR, custo, base', targetTab: 'Portfolio' },
    ],
  },
  {
    category: 'FIRE & Aposentadoria',
    items: [
      { name: 'BtcFIREProjectionCard', path: 'dashboard/BtcFIREProjectionCard', desc: 'Projeção FIRE considerando posição em BTC/HODL11', targetTab: 'FIRE' },
      { name: 'SoRRBondTentTrigger', path: 'dashboard/SoRRBondTentTrigger', desc: 'Trigger de Sequence of Returns Risk — quando ativar bond tent', targetTab: 'Withdraw' },
      { name: 'LifeEventsTable', path: 'dashboard/LifeEventsTable', desc: 'Tabela de eventos de vida — marcos e impactos financeiros', targetTab: 'FIRE' },
    ],
  },
  {
    category: 'Factor & Performance',
    items: [
      { name: 'AttributionAnalysis', path: 'dashboard/AttributionAnalysis', desc: 'Atribuição fatorial de retornos — decomposição por factor premium', targetTab: 'Performance' },
      { name: 'FactorLoadingsTable', path: 'dashboard/FactorLoadingsTable', desc: 'Exposição fatorial da carteira — loadings FF5 por ETF', targetTab: 'Performance' },
      { name: 'NetWorthTable', path: 'performance/NetWorthTable', desc: 'Tabela de patrimônio líquido — breakdown por classe de ativo', targetTab: 'Performance' },
    ],
  },
  {
    category: 'Aporte & Monitoramento',
    items: [
      { name: 'CAPEAportePriority', path: 'dashboard/CAPEAportePriority', desc: 'Prioridade de aporte baseada em CAPE ratio por região — valuation-driven', targetTab: 'NOW' },
      { name: 'BrasilMonitorCard', path: 'portfolio/BrasilMonitorCard', desc: 'Monitor de concentração Brasil — exposição ao risco-país', targetTab: 'Portfolio' },
    ],
  },
];

export default function DiscoveryPage() {
  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Discovery</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Componentes órfãos com valor potencial — portados do HTML mas nunca integrados ao React.
          Decida: integrar a uma aba permanente ou deletar.
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          Anteriores já integrados:
          IR Shield → Portfolio · Bond Strategy → Withdraw · Próximo Aporte → NOW ·
          Carry Differential → NOW · Expected Return Waterfall → Performance ·
          BTC Indicators → Backtest · HODL11 FIRE Projection → Backtest
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {DISCOVERY_ITEMS.map((group) => (
          <div key={group.category} style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
              {group.category}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.items.map((item) => (
                <div key={item.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {item.name}
                      </span>
                      {item.targetTab && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 4,
                          backgroundColor: 'var(--card2)',
                          color: 'var(--muted)',
                          border: '1px solid var(--border)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}>
                          → {item.targetTab}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                    paddingTop: 2,
                  }}>
                    {item.path}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24,
        padding: '12px 16px',
        backgroundColor: 'var(--bg)',
        borderRadius: 8,
        border: '1px solid var(--border)',
        fontSize: 12,
        color: 'var(--muted)',
      }}>
        <strong>Total:</strong> {DISCOVERY_ITEMS.reduce((acc, g) => acc + g.items.length, 0)} componentes órfãos ·
        Quando integrado, mover para a aba target e remover desta lista ·
        Se descartado, deletar o arquivo e remover desta lista
      </div>
    </div>
  );
}
