'use client';

/**
 * NowPatrimonioLiquidoWrapper — extraído de page.tsx em DEV-now-refactor.
 * CollapsibleSection com summary inline e PatrimonioLiquidoIR.
 */
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import PatrimonioLiquidoIR from '@/components/dashboard/PatrimonioLiquidoIR';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface NowPatrimonioLiquidoWrapperProps {
  data: any;
  privacyMode: boolean;
}

export function NowPatrimonioLiquidoWrapper({ data, privacyMode }: NowPatrimonioLiquidoWrapperProps) {
  const irDiferido = data?.tax?.ir_diferido_total_brl ?? 0;
  const patrimonioFin = data?.patrimonio_holistico?.financeiro_brl ?? data?.premissas?.patrimonio_atual ?? 0;
  return (
    <CollapsibleSection
      id="section-patrimonio-liquido-ir"
      title={secTitle('now', 'patrimonio-liquido-ir', 'Patrimônio Líquido de IR')}
      defaultOpen={secOpen('now', 'patrimonio-liquido-ir', false)}
      summary={(() => {
        if (!patrimonioFin) return undefined;
        const liquido = patrimonioFin - irDiferido;
        const pct = (irDiferido / patrimonioFin * 100).toFixed(1);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-xs)' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace', color: 'var(--text)' }}>
              {fmtPrivacy(liquido, privacyMode)}
            </span>
            <span style={{ color: 'var(--muted)' }}>líq.</span>
            <span style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, padding: '1px 7px', fontWeight: 600 }}>
              IR {fmtPrivacy(irDiferido, privacyMode)} ({pct}%)
            </span>
          </div>
        );
      })()}
    >
      <div style={{ padding: '0 16px 16px' }}>
        <PatrimonioLiquidoIR
          irDiferido={irDiferido}
          patrimonioFinanceiro={patrimonioFin}
          pfireLiquidoPct={data?.fire_montecarlo_liquido?.pfire_liquido ?? null}
          pfireBrutoPct={data?.fire_montecarlo_liquido?.pfire_bruto ?? null}
        />
        <div className="src">
          IR diferido = imposto latente sobre ganho de capital não realizado (equity internacional).
        </div>
      </div>
    </CollapsibleSection>
  );
}
