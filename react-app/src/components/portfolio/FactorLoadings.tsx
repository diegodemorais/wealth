'use client';

// Factor Loadings FF5 per-ETF — bar chart com t-stat * marker
// Extraído do bloco inline B6 em portfolio/page.tsx (DEV-factor-views-tab-toggle 2026-05-02)
// Lógica preservada bit-a-bit; apenas extraído para reuso dentro do FactorAnalysisPanel.

interface FactorLoading {
  smb?: number;
  hml?: number;
  rmw?: number;
  cma?: number;
  r2?: number;
  n_months?: number;
  t_stats?: { smb?: number; hml?: number; rmw?: number; cma?: number };
}

interface FactorLoadingsProps {
  data: Record<string, FactorLoading | undefined>;
}

const FACTORS = ['smb', 'hml', 'rmw', 'cma'] as const;
// Hex literals (não CSS vars) — preciso concatenar alpha hex (ex: #58a6ffcc)
// pra modular opacidade por significância. `var(--accent)cc` é CSS inválido
// e renderizava barra invisível (bug pré-extração 9e748774).
const FACTOR_COLORS: Record<string, string> = {
  smb: '#58a6ff', // --accent
  hml: '#3ed381', // --green
  rmw: '#d97706', // --yellow
  cma: '#a855f7', // --purple
};
const FACTOR_LABELS: Record<string, string> = {
  smb: 'SMB (Size)',
  hml: 'HML (Value)',
  rmw: 'RMW (Profitability)',
  cma: 'CMA (Investment)',
};

export function FactorLoadings({ data }: FactorLoadingsProps) {
  const etfKeys = ['SWRD', 'AVUV', 'AVDV', 'DGS'].filter((k) => data?.[k] != null);
  if (!etfKeys.length) return null;

  return (
    <div data-testid="factor-loadings-panel">
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 12 }}>
          Loadings FF5 (Fama-French 5-factor) por regressão mensal. Barra acima de 0 = tilt positivo (desejável para SMB/HML/RMW). Abaixo = tilt negativo vs mercado.
        </div>
        {etfKeys.map((etfKey) => {
          const fl = data[etfKey];
          if (!fl) return null;
          const n: number = fl.n_months ?? 0;
          return (
            <div key={etfKey} style={{ marginBottom: 14, background: 'var(--card2)', borderRadius: 6, padding: '10px 12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>{etfKey}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 400 }}>R²={fl.r2?.toFixed(2)} · {n}m</span>
              </div>
              {FACTORS.map((fk) => {
                const loading: number = (fl as Record<string, number | undefined>)[fk] ?? 0;
                const tStat: number = fl.t_stats?.[fk] ?? 0;
                const isSignificant = Math.abs(tStat) >= 1.96;
                const color = FACTOR_COLORS[fk];
                const maxRange = 0.8;
                const clipped = Math.max(-maxRange, Math.min(maxRange, loading));
                const pct50 = 50;
                const barPct = (Math.abs(clipped) / maxRange) * 50;
                const isPositive = clipped >= 0;
                return (
                  <div key={fk} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <div style={{ flexShrink: 0, width: 120, fontSize: 9, color: 'var(--muted)' }}>
                      {FACTOR_LABELS[fk]}
                    </div>
                    <div style={{ flex: 1, height: 14, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)', opacity: 0.7 }} />
                      <div style={{
                        position: 'absolute',
                        top: 0, bottom: 0,
                        left: isPositive ? `${pct50}%` : `${pct50 - barPct}%`,
                        width: `${barPct}%`,
                        background: `${color}${isSignificant ? 'cc' : '66'}`,
                        borderRadius: 2,
                      }} />
                    </div>
                    <div style={{
                      flexShrink: 0, width: 48, textAlign: 'right',
                      fontSize: 9, fontWeight: isSignificant ? 700 : 400,
                      color: isSignificant ? color : 'var(--muted)',
                      fontFamily: 'monospace',
                    }}>
                      {loading >= 0 ? '+' : ''}{loading.toFixed(3)}
                      {isSignificant && <span style={{ color: 'var(--green)', fontSize: 7 }}>*</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>
          * = t-stat ≥ 1.96 (95% conf.) · Barras mais opacas = significativo · Neutro = 0 (linha central)
        </div>
      </div>
    </div>
  );
}
