'use client';

import { useMemo } from 'react';
import { BondPoolReadiness } from '@/components/dashboard/BondPoolReadiness';
import { BondPoolRunwayChart } from '@/components/charts/BondPoolRunwayChart';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import { fmtPrivacy } from '@/utils/privacyTransform';

export interface BondStrategyPanelProps {
  // Pré-FIRE (SoRR)
  idadeAtual: number;
  idadeFire: number;
  rfPctAtual: number | undefined;

  // Pós-FIRE (Bond Pool)
  bondPoolReadiness: any;
  bondPoolRunway: any;
  bondPoolRunwayByProfile: any;
  withdrawScenario: string;
  withdrawCenarios: Record<string, { label: string; custo_vida_base: number }>;
  custo_vida_base: number;
  rf: any;
  privacyMode: boolean;
  /** Alvos de alocação vindos de data.drift (substituem hardcodes) */
  ipcaAlvo?: number;
  hodl11Alvo?: number;
}

export default function BondStrategyPanel({
  idadeAtual,
  idadeFire,
  rfPctAtual,
  bondPoolReadiness,
  bondPoolRunway,
  bondPoolRunwayByProfile,
  withdrawScenario,
  withdrawCenarios,
  custo_vida_base,
  rf,
  privacyMode,
  ipcaAlvo,
  hodl11Alvo,
}: BondStrategyPanelProps) {
  const { config } = useConfig();
  const anoAtual = new Date().getFullYear();
  const anosAteFire = idadeFire - idadeAtual;
  const anoFire = anoAtual + anosAteFire;
  const idadeCompraIPCAcurto = 50;
  const anoCompraIPCAcurto = anoAtual + (idadeCompraIPCAcurto - idadeAtual);
  const anosAteCompra = anoCompraIPCAcurto - anoAtual;

  const TIMELINE_START = anoAtual;
  const TIMELINE_END = config.ui?.bondStrategy?.timelineEnd ?? 2042;
  const span = TIMELINE_END - TIMELINE_START;
  const toLeft = (ano: number) => Math.min(98, Math.max(2, ((ano - TIMELINE_START) / span) * 100));

  const bondTent = [
    {
      id: 'ipca_longo',
      label: 'IPCA+ Longo (TD2040)',
      nota: 'Hold to maturity · vence FIRE Day',
      pctAtual: rfPctAtual,
      pctAlvo: ipcaAlvo ?? 15,
      status: 'ATIVO' as const,
    },
    {
      id: 'ipca_curto',
      label: 'IPCA+ Curto (~2036/37)',
      nota: `SoRR buffer · Comprar em ${anoCompraIPCAcurto} (idade ${idadeCompraIPCAcurto}) · duration ~2 anos`,
      pctAtual: 0,
      pctAlvo: hodl11Alvo ?? 3,
      status: 'AGUARDANDO' as const,
    },
    {
      id: 'renda',
      label: 'Renda+ 2065',
      nota: 'Posição tática · Vender se taxa ≤ 6.0% (gatilho definido)',
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

  // Bond pool composition from rf data
  const composicaoItems = useMemo(() => {
    const items = [];
    const metaBrl = custo_vida_base * (bondPoolReadiness?.meta_anos ?? 7);
    if (rf?.ipca2029?.valor_brl > 0) items.push({ ativo: 'IPCA+2029', valor: rf.ipca2029.valor_brl, pct_meta: metaBrl > 0 ? (rf.ipca2029.valor_brl / metaBrl) * 100 : 0 });
    if (rf?.ipca2040?.valor_brl > 0) items.push({ ativo: 'IPCA+2040', valor: rf.ipca2040.valor_brl, pct_meta: metaBrl > 0 ? (rf.ipca2040.valor_brl / metaBrl) * 100 : 0 });
    if (rf?.ipca2050?.valor_brl > 0) items.push({ ativo: 'IPCA+2050', valor: rf.ipca2050.valor_brl, pct_meta: metaBrl > 0 ? (rf.ipca2050.valor_brl / metaBrl) * 100 : 0 });
    return items;
  }, [rf, custo_vida_base, bondPoolReadiness]);

  const activeRunway = bondPoolRunwayByProfile?.[withdrawScenario];

  return (
    <div>
      {/* BLOCO A — PRÉ-FIRE */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
          Estrutura SoRR — Bond Tent
        </div>

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

        {/* Bond tent positions */}
        <div style={{ marginBottom: 12 }}>
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
                    {bt.pctAtual != null ? bt.pctAtual.toFixed(1) + '%' : '—'}
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
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>Timeline</div>
          <div style={{ position: 'relative', height: 28 }}>
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 3, background: 'var(--border)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: 7, left: `${toLeft(anoAtual)}%`, transform: 'translateX(-50%)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed', border: '2px solid #fff' }} />
            </div>
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
      </div>

      {/* DIVIDER — FIRE DAY */}
      <div style={{
        background: 'rgba(99,179,237,0.08)',
        borderTop: '1px solid rgba(99,179,237,0.25)',
        borderBottom: '1px solid rgba(99,179,237,0.25)',
        padding: '10px 0',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 11,
        color: 'var(--accent)',
        fontWeight: 700,
        letterSpacing: '0.03em',
      }}>
        ━━━━━━━━  FIRE DAY {anoFire}  ━━━━━━━━
        <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)', marginTop: 4 }}>
          TD {anoFire} vence → início do usufruto
        </div>
      </div>

      {/* BLOCO B — PÓS-FIRE */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
          Bond Pool Readiness — Pós-FIRE
        </div>

        {bondPoolReadiness && (
          <BondPoolReadiness data={bondPoolReadiness} custo_vida_base={custo_vida_base} />
        )}

        {/* Runway por perfil */}
        {bondPoolRunwayByProfile && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
              Runway do Bond Pool pós-FIRE — por perfil
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {(Object.entries(withdrawCenarios) as [string, { label: string; custo_vida_base: number }][]).map(([key, cfg]) => {
                const runway = bondPoolRunwayByProfile[key]?.runway_anos;
                const isActive = key === withdrawScenario;
                return (
                  <div key={key} style={{
                    flex: '1 1 100px',
                    background: isActive ? 'rgba(99,179,237,.12)' : 'var(--card2)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: isActive ? 'var(--accent)' : 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: runway != null && runway >= 7 ? 'var(--green)' : runway != null && runway >= 5 ? 'var(--yellow)' : 'var(--red)' }}>
                      {runway != null ? `${runway.toFixed(1)}a` : '—'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
                      {runway != null ? (runway >= 7 ? <><CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> meta</> : runway >= 5 ? <><AlertCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> ok</> : <><XCircle size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> curto</>) : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active profile depletion chart */}
            {activeRunway && Array.isArray(activeRunway.pool_disponivel) && (
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6 }}>
                  Trajetória — <strong>{withdrawCenarios[withdrawScenario]?.label}</strong> · pool inicial: {fmtPrivacy((activeRunway.pool_inicial ?? 0) / 1000, privacyMode)}
                </div>
                <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', height: 60, borderBottom: '1px solid var(--border)' }}>
                  {(activeRunway.pool_disponivel as number[]).map((v: number, i: number) => {
                    const maxVal = (activeRunway.pool_disponivel as number[])[0] || 1;
                    const heightPct = Math.max(0, Math.min(100, (v / maxVal) * 100));
                    const isZero = v <= 0;
                    return (
                      <div key={i}
                        title={`Ano ${(activeRunway.anos_pos_fire as number[])[i]}: ${fmtPrivacy(v / 1000, privacyMode)}`}
                        style={{
                          flex: 1,
                          height: `${heightPct}%`,
                          background: isZero ? 'var(--red)' : 'var(--accent)',
                          opacity: isZero ? .4 : .75,
                          borderRadius: '2px 2px 0 0',
                          minHeight: isZero ? 3 : 2,
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
                  <span>Ano 1</span>
                  <span>Ano {(activeRunway.anos_pos_fire as number[]).length}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acumulação pré-FIRE */}
        {bondPoolRunway && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
              Trajetória de Acumulação — pré-FIRE (2026→{anoFire})
            </div>
            <BondPoolRunwayChart
              data={bondPoolRunway}
              alvoOverride={bondPoolReadiness ? custo_vida_base * (bondPoolReadiness.meta_anos ?? 7) : undefined}
            />
          </div>
        )}
      </div>

      {/* BLOCO C — Composição do Bond Pool */}
      {composicaoItems.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
            Composição do Bond Pool
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {composicaoItems.map(item => (
              <div key={item.ativo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{item.ativo}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text)' }}>
                      {fmtPrivacy(item.valor, privacyMode)}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: 'var(--muted)' }}>
                      {item.pct_meta.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(item.pct_meta, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        Bond pool = ativos RF que provêm liquidez nos primeiros anos FIRE sem vender equity em drawdown. Meta: 7 anos × gasto do perfil selecionado.
        Bond tent via vencimento do TD{anoFire} no FIRE Day — não via glidepath de RF%.
      </div>
    </div>
  );
}
