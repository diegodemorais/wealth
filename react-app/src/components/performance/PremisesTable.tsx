'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

export function PremisesTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const pvr = data?.premissas_vs_realizado;

  const fmt = (n: number | null | undefined, suffix = '') => {
    if (n == null) return '—';
    return `${n.toFixed(2)}${suffix}`;
  };

  const fmtCurrency = (n: number | null | undefined) => {
    if (n == null) return '—';
    return fmtPrivacy(n, privacyMode);
  };

  const aporteData = useMemo(() => {
    if (!pvr?.aporte_mensal?.por_ano_brl) return [];
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return Object.entries(pvr.aporte_mensal.por_ano_brl)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, total]) => {
        const divisor = year === currentYear ? currentMonth : 12;
        return {
          year,
          total: total as number,
          media: (total as number) / divisor,
          isCurrentYear: year === currentYear,
          mesesYtd: year === currentYear ? currentMonth : 12,
        };
      });
  }, [pvr?.aporte_mensal?.por_ano_brl]);

  if (!pvr) {
    return (
      <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', padding: '8px 0' }}>
        Sem dados de premissas vs realizado
      </div>
    );
  }

  const eq = pvr.retorno_equity;
  const am = pvr.aporte_mensal;
  const delta = eq?.twr_real_brl_pct != null && eq?.premissa_real_brl_pct != null
    ? eq.twr_real_brl_pct - eq.premissa_real_brl_pct
    : null;
  const deltaColor = delta == null ? 'var(--text)' : delta >= 0 ? 'var(--green)' : 'var(--red)';

  return (
    <div>
      {/* 2-card row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">

        {/* Card 1: Retorno Equity */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>
            Retorno Equity — TWR real BRL CAGR
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '2px' }}>Premissa IPS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--muted)' }}>
                {fmt(eq?.premissa_real_brl_pct, '%')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '2px' }}>Realizado</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>
                {fmt(eq?.twr_real_brl_pct, '%')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '2px' }}>Delta</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: deltaColor }}>
                {delta != null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}pp` : '—'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
            {eq?.periodo_anos != null && `Período: ${pvr.aporte_mensal?.periodo ?? ''} (${Math.round(eq.periodo_anos * 12)} meses / ${eq.periodo_anos.toFixed(0)} anos)`}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>
            TWR reconstruído · Retornos pós-IPCA real BRL
          </div>
        </div>

        {/* Card 2: Aporte Mensal */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>
            Aporte Mensal — Média {eq?.periodo_anos?.toFixed(0) ?? '5'} anos
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>
            {fmtCurrency(am?.realizado_media_brl)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <div>
              Realizado vs Premissa:{' '}
              <strong style={{ color: 'var(--text)' }}>{fmtCurrency(am?.realizado_media_brl)}</strong>
              {' '}vs{' '}
              <strong style={{ color: 'var(--muted)' }}>{fmtCurrency(am?.premissa_brl)}</strong>
            </div>
            {am?.delta_pct != null && (
              <div>
                Execução:{' '}
                <strong style={{ color: 'var(--green)' }}>
                  {`${(am.realizado_media_brl / am.premissa_brl).toFixed(1)}×`}
                </strong>
                {' '}premissa
              </div>
            )}
            {am?.total_aporte_brl != null && (
              <div>
                Total est: <strong style={{ color: 'var(--text)' }}>{fmtCurrency(am.total_aporte_brl)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* B4: Statistical significance caveat */}
      {eq?.periodo_anos != null && (
        <div style={{
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '6px',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: 'var(--yellow)' }}>⚠ N = {Math.round(eq.periodo_anos)} anos</strong> — período insuficiente para inferir significância estatística de alpha (mínimo ~10 anos). Comparar premissa vs realizado com cautela interpretativa.
        </div>
      )}

      {/* Annual breakdown with monthly avg */}
      {aporteData.length > 0 && (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '8px' }}>
            Aportes por Ano
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {aporteData.map(({ year, total, media, isCurrentYear, mesesYtd }) => (
              <div key={year} style={{
                background: 'var(--bg)',
                border: `1px solid ${isCurrentYear ? 'rgba(99,179,237,.4)' : 'var(--border)'}`,
                borderRadius: '6px',
                padding: '10px 10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: isCurrentYear ? 'var(--accent)' : 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>
                  {year}{isCurrentYear ? ' YTD' : ''}
                </div>
                <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '2px' }}>
                  {fmtCurrency(total)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  {fmtCurrency(media)}/mês{isCurrentYear ? ` (${mesesYtd}m)` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
