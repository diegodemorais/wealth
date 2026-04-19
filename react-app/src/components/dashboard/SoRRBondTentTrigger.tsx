'use client';

export interface SoRRBondTentTriggerProps {
  idadeAtual: number;
  idadeFire: number;
  rfPctAtual: number;    // % do portfolio em RF
  patrimonioAtual: number;
}

type BondTentStatus = 'SAFE' | 'MONITOR' | 'ACTION';

interface Phase {
  label: string;
  rfMin: number;
  rfMax: number;
  status: BondTentStatus;
  descricao: string;
}

function getPhase(anosAte: number): Phase {
  if (anosAte > 10) return {
    label: '>10 anos',
    rfMin: 20, rfMax: 25,
    status: 'SAFE',
    descricao: 'Acumulação — manter equity-heavy',
  };
  if (anosAte > 5) return {
    label: '5–10 anos',
    rfMin: 30, rfMax: 35,
    status: 'MONITOR',
    descricao: 'Aproximando — monitorar rotação para RF',
  };
  if (anosAte > 2) return {
    label: '3–5 anos (SoRR window)',
    rfMin: 40, rfMax: 50,
    status: 'ACTION',
    descricao: 'Comprar IPCA+ curto — proteger sequence of returns',
  };
  return {
    label: '≤2 anos',
    rfMin: 50, rfMax: 60,
    status: 'ACTION',
    descricao: 'Bond tent máximo — reduzir equity antes do FIRE',
  };
}

const statusConfig: Record<BondTentStatus, { color: string; bg: string; border: string }> = {
  SAFE:    { color: '#16a34a', bg: '#16a34a18', border: '#16a34a44' },
  MONITOR: { color: '#ca8a04', bg: '#ca8a0418', border: '#ca8a0444' },
  ACTION:  { color: '#dc2626', bg: '#dc262618', border: '#dc262644' },
};

const TIMELINE_START = 2026;
const TIMELINE_END = 2041;

// Marcos relevantes
const MARKERS = [
  { ano: 2031, label: 'MONITOR', color: '#ca8a04' },
  { ano: 2036, label: 'ACTION', color: '#dc2626' },
  { ano: 2040, label: 'FIRE', color: '#7c3aed' },
];

export default function SoRRBondTentTrigger({
  idadeAtual,
  idadeFire,
  rfPctAtual,
  patrimonioAtual: _patrimonioAtual,
}: SoRRBondTentTriggerProps) {
  const anoAtual = 2026;
  const anosAte = idadeFire - idadeAtual;
  const anoFire = anoAtual + anosAte;
  const phase = getPhase(anosAte);
  const sc = statusConfig[phase.status];

  // Timeline progress bar (0–100%)
  const totalSpan = TIMELINE_END - TIMELINE_START;
  const currentProgress = Math.min(100, Math.max(0, ((anoAtual - TIMELINE_START) / totalSpan) * 100));

  // RF gauge
  const rfTarget = (phase.rfMin + phase.rfMax) / 2;
  const rfGap = rfPctAtual - rfTarget;
  const rfBarActual = Math.min(100, (rfPctAtual / 60) * 100);
  const rfBarTarget = Math.min(100, (rfTarget / 60) * 100);
  const rfStatusColor = Math.abs(rfGap) < 3 ? '#16a34a' : Math.abs(rfGap) < 8 ? '#ca8a04' : '#dc2626';

  return (
    <div>
      {/* Estado atual */}
      <div style={{
        background: sc.bg,
        border: `1px solid ${sc.border}`,
        borderRadius: 6, padding: '8px 12px',
        marginBottom: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Fase atual</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{phase.status}</div>
          <div style={{ fontSize: 10, color: sc.color, marginTop: 1 }}>{phase.label}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Anos até FIRE</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{anosAte}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>FIRE em {anoFire} · Idade {idadeFire}</div>
        </div>
      </div>

      {/* Timeline horizontal */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>Timeline até FIRE</div>
        <div style={{ position: 'relative', height: 24 }}>
          {/* Trilha base */}
          <div style={{
            position: 'absolute', top: 10, left: 0, right: 0, height: 4,
            background: 'var(--border)', borderRadius: 2,
          }} />
          {/* Progresso até hoje */}
          <div style={{
            position: 'absolute', top: 10, left: 0, height: 4,
            width: `${currentProgress}%`,
            background: '#7c3aed', borderRadius: 2,
          }} />
          {/* Indicador posição atual */}
          <div style={{
            position: 'absolute', top: 5, left: `${currentProgress}%`,
            transform: 'translateX(-50%)',
            width: 14, height: 14, borderRadius: '50%',
            background: '#7c3aed', border: '2px solid #fff',
          }} title={`Hoje (${anoAtual})`} />
          {/* Marcadores */}
          {MARKERS.map(m => {
            const pct = ((m.ano - TIMELINE_START) / totalSpan) * 100;
            return (
              <div key={m.ano} style={{
                position: 'absolute', top: 0, left: `${pct}%`,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <div style={{ fontSize: 8, color: m.color, fontWeight: 700, whiteSpace: 'nowrap', marginBottom: 2 }}>
                  {m.label}
                </div>
                <div style={{ width: 2, height: 12, background: m.color, opacity: 0.7 }} />
              </div>
            );
          })}
        </div>
        {/* Rótulos início/fim */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--muted)' }}>{TIMELINE_START}</span>
          <span style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600 }}>{anoFire} FIRE</span>
          <span style={{ fontSize: 9, color: 'var(--muted)' }}>{TIMELINE_END}</span>
        </div>
      </div>

      {/* Gauge duplo: RF atual vs target */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>RF Atual vs Target</span>
          <span style={{ fontSize: 10, color: rfStatusColor, fontWeight: 600 }}>
            Gap: {rfGap >= 0 ? '+' : ''}{rfGap.toFixed(1)}pp
          </span>
        </div>
        {/* Barra RF atual */}
        <div style={{ marginBottom: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>
            <span>Atual</span>
            <span style={{ fontWeight: 600, color: rfStatusColor }}>{rfPctAtual.toFixed(1)}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${rfBarActual}%`, height: '100%', background: rfStatusColor, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
        {/* Barra RF target */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>
            <span>Target fase ({phase.label})</span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{phase.rfMin}–{phase.rfMax}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            {/* Range target */}
            <div style={{
              position: 'absolute', top: 0, height: '100%',
              left: `${(phase.rfMin / 60) * 100}%`,
              width: `${((phase.rfMax - phase.rfMin) / 60) * 100}%`,
              background: '#7c3aed44', borderRadius: 2,
            }} />
            {/* Centro target */}
            <div style={{ width: `${rfBarTarget}%`, height: '100%', background: '#7c3aed', borderRadius: 4, opacity: 0.6, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Ação recomendada */}
      {phase.status !== 'SAFE' && (
        <div style={{
          background: sc.bg, border: `1px solid ${sc.border}`,
          borderRadius: 4, padding: '6px 10px',
          fontSize: 10, color: sc.color, fontWeight: 600,
        }}>
          ⚡ {phase.descricao}
        </div>
      )}

      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        Bond Tent = sobrepeso em RF nos anos pré-FIRE para proteger sequence of returns risk.
        Ref: Kitces (2017), ERN (2019 SWR series).
      </div>
    </div>
  );
}
