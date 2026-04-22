'use client';

import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

export interface MonthlyBreakdownEntry {
  mes: string;            // "2025-08"
  essenciais: number;
  opcionais: number;
  imprevistos: number;
  total: number;
}

interface SpendingBreakdownProps {
  musthave: number;        // anual
  likes: number;           // anual
  imprevistos: number;     // anual
  totalAnual: number;
  monthlyBreakdown?: MonthlyBreakdownEntry[];
}

const fmtK = (v: number) => `R$${(v / 1000).toFixed(0)}k`;
const fmtMes = (m: string) => {
  const [y, mo] = m.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${months[parseInt(mo, 10) - 1]}/${y.slice(2)}`;
};

const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  musthave,
  likes,
  imprevistos,
  totalAnual,
  monthlyBreakdown,
}) => {
  const { privacyMode } = useUiStore();

  const totalMensal = totalAnual / 12;
  const mustPct = totalAnual > 0 ? (musthave / totalAnual) * 100 : 0;
  const likesPct = totalAnual > 0 ? (likes / totalAnual) * 100 : 0;
  const impPct = totalAnual > 0 ? (imprevistos / totalAnual) * 100 : 0;

  const flexLabel = mustPct <= 60
    ? (mustPct < 50
      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)', flexShrink: 0 }} />Muito flexível</span>
      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={13} />Balanceado</span>)
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={13} />Rígido</span>;
  const flexColor = mustPct <= 60 ? (mustPct < 50 ? 'var(--accent)' : 'var(--green)') : 'var(--yellow)';

  // Monthly chart — se disponível
  const hasMonthly = monthlyBreakdown && monthlyBreakdown.length > 0;
  const maxTotal = hasMonthly ? Math.max(...monthlyBreakdown!.map(m => m.total), 1) : 1;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginBottom: 14 }}>
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Essencial</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--red)' }} className="pv">
            {privacyMode ? '••••' : fmtK(musthave / 12)}<span style={{ fontSize: 10, fontWeight: 400 }}>/mês</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{mustPct.toFixed(0)}% do total</div>
        </div>
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Conforto</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--yellow)' }} className="pv">
            {privacyMode ? '••••' : fmtK(likes / 12)}<span style={{ fontSize: 10, fontWeight: 400 }}>/mês</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{likesPct.toFixed(0)}% do total</div>
        </div>
        <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Imprevistos</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--purple)' }} className="pv">
            {privacyMode ? '••••' : fmtK(imprevistos / 12)}<span style={{ fontSize: 10, fontWeight: 400 }}>/mês</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{impPct.toFixed(0)}% do total</div>
        </div>
        <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Total médio</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }} className="pv">
            {privacyMode ? '••••' : fmtK(totalMensal)}<span style={{ fontSize: 10, fontWeight: 400 }}>/mês</span>
          </div>
          <div style={{ fontSize: 10, color: flexColor, fontWeight: 600, marginTop: 2 }}>{flexLabel}</div>
        </div>
      </div>

      {/* ── Distribuição empilhada ── */}
      <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', gap: 2, marginBottom: 6 }}>
        <div style={{ flex: mustPct, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {mustPct > 15 && <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{mustPct.toFixed(0)}%</span>}
        </div>
        <div style={{ flex: likesPct, background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {likesPct > 10 && <span style={{ fontSize: 10, color: '#000', fontWeight: 600 }}>{likesPct.toFixed(0)}%</span>}
        </div>
        <div style={{ flex: impPct, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {impPct > 5 && <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{impPct.toFixed(0)}%</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'Essencial', color: 'var(--red)' },
          { label: 'Conforto', color: 'var(--yellow)' },
          { label: 'Imprevistos', color: 'var(--purple)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* ── Histórico mensal (últimos 12 meses) ── */}
      {hasMonthly ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>
            Histórico — últimos {monthlyBreakdown!.length} meses
          </div>
          {/* Stacked bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, marginBottom: 4 }}>
            {monthlyBreakdown!.map(m => {
              const totalH = Math.max(m.total, 1);
              const heightPct = (totalH / maxTotal) * 100;
              const essPct = (m.essenciais / totalH) * 100;
              const optPct = (m.opcionais / totalH) * 100;
              return (
                <div
                  key={m.mes}
                  style={{ flex: 1, height: `${heightPct}%`, display: 'flex', flexDirection: 'column-reverse', borderRadius: '2px 2px 0 0', overflow: 'hidden', cursor: 'default' }}
                  title={`${fmtMes(m.mes)}: ${privacyMode ? '••••' : fmtK(m.total)}/mês\nEss: ${fmtK(m.essenciais)} · Opt: ${fmtK(m.opcionais)} · Imp: ${fmtK(m.imprevistos)}`}
                >
                  <div style={{ flex: essPct, background: 'var(--red)', opacity: .85 }} />
                  <div style={{ flex: optPct, background: 'var(--yellow)', opacity: .85 }} />
                  <div style={{ flex: Math.max(0, 100 - essPct - optPct), background: 'var(--purple)', opacity: .85 }} />
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div style={{ display: 'flex', gap: 4 }}>
            {monthlyBreakdown!.map(m => (
              <div key={m.mes} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--muted)' }}>
                {fmtMes(m.mes)}
              </div>
            ))}
          </div>
          {/* Table */}
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Mês', 'Essencial', 'Conforto', 'Imprevistos', 'Total'].map(h => (
                    <th key={h} style={{ padding: '4px 6px', textAlign: h === 'Mês' ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown!.map(m => (
                  <tr key={m.mes} style={{ borderBottom: '1px solid rgba(148,163,184,.1)' }}>
                    <td style={{ padding: '4px 6px', fontWeight: 500 }}>{fmtMes(m.mes)}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--red)' }} className="pv">{privacyMode ? '••••' : fmtK(m.essenciais)}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--yellow)' }} className="pv">{privacyMode ? '••••' : fmtK(m.opcionais)}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: 'var(--purple)' }} className="pv">{privacyMode ? '••••' : fmtK(m.imprevistos)}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 600 }} className="pv">{privacyMode ? '••••' : fmtK(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '8px 0' }}>
          Histórico mensal disponível após rodar <code>python scripts/spending_analysis.py --json-output</code>
        </div>
      )}
    </div>
  );
};

export default SpendingBreakdown;
