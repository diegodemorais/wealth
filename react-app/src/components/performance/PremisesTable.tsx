'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function PremisesTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const pvr = data?.premissas_vs_realizado;

  const fmt = (n: number | null | undefined, suffix = '') => {
    if (n == null) return '—';
    if (privacyMode) return '••••';
    return `${n.toFixed(2)}${suffix}`;
  };

  const fmtCurrency = (n: number | null | undefined) => {
    if (n == null) return '—';
    if (privacyMode) return '••••';
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `R$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `R$${Math.round(abs / 1_000)}k`;
    return `R$${n.toLocaleString('pt-BR')}`;
  };

  const aporteData = useMemo(() => {
    if (!pvr?.aporte_mensal?.por_ano_brl) return [];
    return Object.entries(pvr.aporte_mensal.por_ano_brl)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, total]) => ({
        year,
        total: total as number,
        media: (total as number) / 12,
      }));
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>

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
                  {privacyMode ? '••••' : `${(am.realizado_media_brl / am.premissa_brl).toFixed(1)}×`}
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

      {/* Annual breakdown with monthly avg */}
      {aporteData.length > 0 && (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '8px' }}>
            Aportes por Ano
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
            {aporteData.map(({ year, total, media }) => (
              <div key={year} style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '10px 10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>{year}</div>
                <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '2px' }}>
                  {fmtCurrency(total)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  {fmtCurrency(media)}/mês
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
