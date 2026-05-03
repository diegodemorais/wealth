'use client';

/**
 * NowRebalancingWrapper — extraído de page.tsx em DEV-now-refactor.
 * CollapsibleSection que envolve <RebalancingStatus /> e calcula bucket %
 * a partir de posicoes/pesosTarget/cambio.
 */
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import RebalancingStatus from '@/components/dashboard/RebalancingStatus';

interface NowRebalancingWrapperProps {
  data: any;
  derived: any;
}

export function NowRebalancingWrapper({ data, derived }: NowRebalancingWrapperProps) {
  return (
    <CollapsibleSection
      id="section-rebalancing-status"
      title={secTitle('now', 'rebalancing-status', 'Rebalancing Status — Drift por Classe')}
      defaultOpen={secOpen('now', 'rebalancing-status', false)}
    >
      <div style={{ padding: '0 16px 16px' }}>
        {(() => {
          const posicoes = data?.posicoes ?? {};
          const patrimonioAtual = data?.premissas?.patrimonio_atual ?? derived.networth ?? 1;
          const pesosTarget = data?.pesosTarget ?? {};
          const cambio = derived.CAMBIO ?? 5.15;
          const bucketPct = (bucketName: string) => {
            const total = Object.values(posicoes as Record<string, any>)
              .filter((pos: any) => pos?.bucket === bucketName && pos?.qty && pos?.price)
              .reduce((sum: number, pos: any) => sum + pos.qty * pos.price * cambio, 0);
            return patrimonioAtual > 0 ? (total / patrimonioAtual) * 100 : 0;
          };
          return (
            <RebalancingStatus
              swrdTarget={(pesosTarget.SWRD ?? 0.50) * 100}
              swrdCurrent={bucketPct('SWRD')}
              avgsTarget={(pesosTarget.AVGS ?? 0.30) * 100}
              avgsCurrent={bucketPct('AVGS')}
              avemTarget={(pesosTarget.AVEM ?? 0.20) * 100}
              avemCurrent={bucketPct('AVEM')}
              ipcaTarget={data?.drift?.IPCA?.alvo ?? 15}
              ipcaCurrent={patrimonioAtual > 0 ? ((data?.rf?.ipca2040?.valor ?? data?.rf?.ipca2040?.valor_brl ?? 0) + (data?.rf?.ipca2050?.valor ?? data?.rf?.ipca2050?.valor_brl ?? 0)) / patrimonioAtual * 100 : 0}
              hodl11Target={data?.drift?.HODL11?.alvo ?? 3}
              hodl11Current={patrimonioAtual > 0 ? ((data?.hodl11?.valor ?? 0) + (data?.concentracao_brasil?.composicao?.crypto_legado_brl ?? 0)) / patrimonioAtual * 100 : 0}
              lastRebalanceDate={data?.premissas?.ultima_revisao}
              driftThresholdPp={5}
            />
          );
        })()}
        <div className="src">
          Drift vs target por classe de ativo. Threshold: ±5pp.
        </div>
      </div>
    </CollapsibleSection>
  );
}
