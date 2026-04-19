'use client';

export interface CAPEEtf {
  ticker: string;
  atual: number;      // % atual no portfolio
  alvo: number;       // % target
  expectedReturn: number;  // % real/ano esperado (ex: 9.5)
}

export interface CAPEAportePriorityProps {
  etfs: CAPEEtf[];
}

interface EtfWithScore extends CAPEEtf {
  gap: number;
  priorityScore: number;
}

export default function CAPEAportePriority({ etfs }: CAPEAportePriorityProps) {
  // Calcular score e ordenar
  const scored: EtfWithScore[] = etfs
    .map(e => ({
      ...e,
      gap: e.alvo - e.atual,
      priorityScore: (e.alvo - e.atual) * e.expectedReturn,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const maxScore = Math.max(...scored.map(e => Math.abs(e.priorityScore)), 0.01);
  const top = scored.find(e => e.priorityScore > 0);

  const gapColor = (gap: number) => (gap > 0 ? '#16a34a' : gap < 0 ? '#dc2626' : 'var(--muted)');

  const rankBg = (i: number) => {
    if (i === 0) return '#ca8a0418';
    if (i === 1) return '#6b728018';
    return 'transparent';
  };

  return (
    <div>
      {/* Recomendação automática */}
      {top && (
        <div style={{
          background: '#16a34a18', border: '1px solid #16a34a44',
          borderRadius: 6, padding: '7px 10px',
          marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
              Prioridade #1 no próximo aporte: {top.ticker}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>
              Subpeso {top.gap.toFixed(1)}pp · Expected return {top.expectedReturn}%/ano real
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%', minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>#</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>ETF</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Drift Gap</th>
              <th style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>E[R] 10a</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((e, i) => {
              const barPct = Math.min(100, (Math.abs(e.priorityScore) / maxScore) * 100);
              const barColor = e.priorityScore > 0 ? '#16a34a' : '#dc2626';
              return (
                <tr key={e.ticker} style={{ borderBottom: '1px solid var(--border)', background: rankBg(i) }}>
                  <td style={{ padding: '5px 6px', fontWeight: 700, color: i === 0 ? '#ca8a04' : 'var(--muted)', fontSize: 11 }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '5px 6px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>{e.ticker}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                      Atual {e.atual.toFixed(1)}% → Alvo {e.alvo.toFixed(1)}%
                    </div>
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 600, color: gapColor(e.gap) }}>
                    {e.gap >= 0 ? '+' : ''}{e.gap.toFixed(1)}pp
                  </td>
                  <td style={{ padding: '5px 6px', textAlign: 'right', color: 'var(--text)', fontFamily: 'monospace' }}>
                    {e.expectedReturn.toFixed(1)}%
                  </td>
                  <td style={{ padding: '5px 6px', minWidth: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${barPct}%`, height: '100%',
                          background: barColor, borderRadius: 3,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ fontSize: 9, color: barColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {e.priorityScore >= 0 ? '+' : ''}{e.priorityScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nota de fonte */}
      <div style={{ marginTop: 10, padding: '6px 8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>
          <strong style={{ color: 'var(--text)' }}>Metodologia:</strong>{' '}
          Priority Score = Drift Gap × Expected Return 10a
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)' }}>
          Combina drift com valuation — evita aportar em ativos caros mesmo que subpesos.
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
          📊 Expected Returns: Research Affiliates (CAPE-based, atualização mensal) ·
          US 3.4% · DM ex-US 9.5% · EM 9.0% real/ano
        </div>
      </div>
    </div>
  );
}
