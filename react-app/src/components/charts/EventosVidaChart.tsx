'use client';

import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { DashboardData } from '@/types/dashboard';
import { EC } from '@/utils/echarts-theme';
import { ChartCard } from '@/components/primitives/ChartCard';

export interface EventosVidaChartProps {
  data: DashboardData;
}

export function EventosVidaChart({ data }: EventosVidaChartProps) {
  const { privacyMode } = useEChartsPrivacy();

  // Use real eventos_vida from data.json
  const eventosVida: any[] = (data as any)?.eventos_vida ?? [];
  const premissas = (data as any)?.premissas ?? {};
  const idadeAtual: number = premissas.idade_atual ?? 39;
  const anoAtual: number = premissas.ano_atual ?? new Date().getFullYear();

  // Build milestones: fixed FIRE milestones + real life events
  const idadeFire: number = premissas.idade_cenario_base ?? 53;
  const anoFire = anoAtual + (idadeFire - idadeAtual);
  const idadeInss: number = premissas.inss_inicio_idade ?? 65;
  const anoInss = anoAtual + (idadeInss - idadeAtual);

  const fixedMilestones = [
    { year: anoAtual, event: `Idade Atual (${idadeAtual} anos)`, age: idadeAtual, icon: '👤', color: EC.accent },
    { year: anoFire, event: `Meta FIRE (${idadeFire} anos)`, age: idadeFire, icon: '🔥', color: EC.yellow },
    { year: anoInss, event: `INSS (${idadeInss} anos)`, age: idadeInss, icon: '🏛️', color: '#a78bfa' },
  ];

  // Life events from data
  const lifeEventMilestones = eventosVida.map((ev: any) => {
    const dataEst: string = ev.data_est ?? '';
    // Extract year from '~2026-2027' or '~2028'
    const match = dataEst.match(/\d{4}/);
    const year = match ? parseInt(match[0], 10) : anoAtual + 2;
    const age = idadeAtual + (year - anoAtual);
    return {
      year,
      event: ev.evento ?? 'Evento',
      age,
      icon: ev.evento?.includes('Casamento') ? '💍' : ev.evento?.includes('Filho') ? '👶' : '📅',
      color: EC.green,
      impacto: ev.impacto,
      acoes: ev.acoes,
    };
  });

  // Merge and sort all milestones by year
  const allMilestones = [...fixedMilestones, ...lifeEventMilestones].sort((a, b) => a.year - b.year);

  // Privacy mode v2: values are transformed, not hidden — chart renders normally

  return (
    <ChartCard title="Eventos de Vida — Timeline FIRE">
      <div className="relative pl-10">
        {allMilestones.map((milestone, idx) => {
          const isCasamento = milestone.event?.toLowerCase().includes('casamento');
          const tooltipText = isCasamento
            ? 'Revisar: regime de bens (comunhão/separação), ITCMD, seguro de vida, PGBL cônjuge'
            : undefined;
          return (
          <div key={idx} className="mb-6 relative" title={tooltipText}>
            <div
              className="absolute -left-14 w-9 h-9 rounded-full flex items-center justify-center border-2 border-card"
              style={{ background: (milestone as any).color + '33', borderColor: (milestone as any).color + '66' }}
            >
              <span className="text-lg">{milestone.icon}</span>
            </div>
            <div className="pb-3">
              <div className="font-bold text-sm" style={{ color: (milestone as any).color }}>{milestone.year}</div>
              <div className="text-gray-300 font-semibold text-sm mt-1">
                {milestone.event}
                {isCasamento && (
                  <span
                    title={tooltipText}
                    className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] cursor-help"
                    style={{ background: 'rgba(148,163,184,.2)', color: 'var(--muted)' }}
                  >
                    ⓘ
                  </span>
                )}
              </div>
              <div className="text-muted-foreground text-xs mt-0.5">Idade {milestone.age}</div>
              {(milestone as any).impacto && (
                <div className="text-xs mt-1" style={{ color: EC.yellow }}>
                  Impacto: {(milestone as any).impacto}
                </div>
              )}
              {(milestone as any).acoes && (milestone as any).acoes.length > 0 && (
                <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                  {(milestone as any).acoes.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
            {idx < allMilestones.length - 1 && (
              <div className="absolute -left-11 top-9 w-0.5 h-8 bg-muted" />
            )}
          </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
