'use client';

export interface SoRRBondTentTriggerProps {
  idadeAtual: number;
  idadeFire: number;
  rfPctAtual: number;    // % IPCA+ longo atual no portfolio
  patrimonioAtual: number;
}

export default function SoRRBondTentTrigger({
  idadeAtual,
  idadeFire,
  rfPctAtual,
}: SoRRBondTentTriggerProps) {
  const anoAtual = 2026;
  const anosAteFire = idadeFire - idadeAtual;        // 14
  const anoFire = anoAtual + anosAteFire;             // 2040
  const idadeCompraIPCAcurto = 50;
  const anoCompraIPCAcurto = anoAtual + (idadeCompraIPCAcurto - idadeAtual); // 2037
  const anosAteCompra = anoCompraIPCAcurto - anoAtual;  // 11

  const TIMELINE_START = 2026;
  const TIMELINE_END = 2042;
  const span = TIMELINE_END - TIMELINE_START;
  const toLeft = (ano: number) => Math.min(98, Math.max(2, ((ano - TIMELINE_START) / span) * 100));

  // Estrutura real do bond tent (HD-006 · 2026-03-22)
  const bondTent = [
    {
      id: 'ipca_longo',
      label: 'IPCA+ Longo (TD2040)',
      detalhe: 'Hold to maturity · vence FIRE Day',
      nota: 'R$~2.3M líquido no vencimento 2040',
      pctAtual: rfPctAtual,
      pctAlvo: 15,
      status: 'ATIVO' as const,
    },
    {
      id: 'ipca_curto',
      label: 'IPCA+ Curto (~2036/37)',
      detalhe: 'SoRR buffer · ainda não comprado',
      nota: `Comprar em ${anoCompraIPCAcurto} (idade ${idadeCompraIPCAcurto}) · duration ~2 anos`,
      pctAtual: 0,
      pctAlvo: 3,
      status: 'AGUARDANDO' as const,
    },
    {
      id: 'renda',
      label: 'Renda+ 2065',
      detalhe: 'Posição tática · monitorar taxa',
      nota: 'Vender se taxa ≤ 6.0% (gatilho definido)',
      pctAtual: 3.0,
      pctAlvo: null,
      status: 'TÁTICO' as const,
    },
  ];

  const statusConfig = {
    ATIVO:      { color: '#16a34a', bg: '#16a34a18', border: '#16a34a33' },
    AGUARDANDO: { color: '#ca8a04', bg: '#ca8a0418', border: '#ca8a0433' },
    TÁTICO:     { color: '#2563eb', bg: '#2563eb18', border: '#2563eb33' },
  };

  return (
    <div>
      {/* Status header */}
      <div style={{
        background: '#16a34a18', border: '1px solid #16a34a44',
        borderRadius: 6, padding: '8px 12px', marginBottom: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 1 }}>Fase SoRR</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>SAFE</div>
          <div style={{ fontSize: 10, color: '#16a34a' }}>{anosAteFire} anos até o FIRE — nenhuma ação necessária agora</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 1 }}>FIRE Day</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{anoFire}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>Idade {idadeFire}</div>
        </div>
      </div>

      {/* Bond tent structure */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Estrutura do Bond Tent (HD-006)
        </div>
        {bondTent.map(bt => {
          const sc = statusConfig[bt.status];
          return (
            <div key={bt.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{bt.label}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{bt.nota}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  {bt.pctAtual.toFixed(1)}%
                  {bt.pctAlvo != null && (
                    <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 400 }}> / {bt.pctAlvo}%</span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                fontWeight: 700, whiteSpace: 'nowrap', minWidth: 70, textAlign: 'center',
              }}>
                {bt.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Próximo gatilho */}
      <div style={{
        background: '#ca8a0418', border: '1px solid #ca8a0444',
        borderRadius: 6, padding: '8px 10px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>Próximo Gatilho</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ca8a04' }}>
          {anoCompraIPCAcurto} · Comprar IPCA+ Curto 3%
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
          Em {anosAteCompra} anos · Idade {idadeCompraIPCAcurto} · Duration ~2a · Protege anos 1–3 do FIRE de SoRR
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>Timeline</div>
        <div style={{ position: 'relative', height: 28 }}>
          <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 3, background: 'var(--border)', borderRadius: 2 }} />
          {/* Hoje */}
          <div style={{ position: 'absolute', top: 7, left: `${toLeft(anoAtual)}%`, transform: 'translateX(-50%)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed', border: '2px solid #fff' }} />
          </div>
          {/* Marcadores */}
          {[
            { ano: anoCompraIPCAcurto, label: `${anoCompraIPCAcurto} · IPCA+ curto`, color: '#ca8a04' },
            { ano: anoFire, label: `${anoFire} FIRE`, color: '#7c3aed' },
          ].map(m => (
            <div key={m.ano} style={{
              position: 'absolute', top: 0, left: `${toLeft(m.ano)}%`,
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ fontSize: 8, color: m.color, fontWeight: 700, whiteSpace: 'nowrap', marginBottom: 3 }}>{m.label}</div>
              <div style={{ width: 2, height: 10, background: m.color, opacity: 0.8 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600 }}>Hoje ({anoAtual})</span>
          <span style={{ fontSize: 9, color: 'var(--muted)' }}>{TIMELINE_END}</span>
        </div>
      </div>

      <div style={{ fontSize: 9, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        Bond tent via vencimento do TD2040 no FIRE Day — não via glidepath de RF%.
        Equity mantém ~79% até o FIRE Day; sobe a 94% pós-60 (consumo do bond pool).
      </div>
    </div>
  );
}
