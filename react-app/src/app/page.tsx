'use client';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🚀 Fase 1: Setup Completo</h1>
      <p>✅ Next.js 14 + TypeScript + Zustand + Chart.js pronto para Fase 2</p>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Status da Fase 1</h2>
        <ul>
          <li>✅ next.config.ts configurado</li>
          <li>✅ Types & Interfaces (dashboard.ts)</li>
          <li>✅ Utils: formatters, dataWiring, wellness, filterByPeriod</li>
          <li>✅ Zustand stores: dashboardStore, uiStore</li>
          <li>✅ Chart.js setup</li>
          <li>✅ Vitest configured (15/15 tests passing)</li>
          <li>✅ TypeScript: zero errors</li>
          <li>✅ npm run build: functional</li>
        </ul>
      </div>
    </div>
  );
}
