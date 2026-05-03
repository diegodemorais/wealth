'use client';

/**
 * NowIpsSummary — extraído de page.tsx em DEV-now-refactor.
 * Card "IPS — 30-Second Rules": equity alvo, SWR, gatilho FIRE, pisos DCA,
 * guardrail, CDS threshold, drift threshold.
 */
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface NowIpsSummaryProps {
  data: any;
  privacyMode: boolean;
}

export function NowIpsSummary({ data, privacyMode }: NowIpsSummaryProps) {
  const prem = data?.premissas ?? {};
  const pisos = data?.pisos ?? {};
  const guardrails = data?.guardrails ?? [];
  const swr = prem.swr_gatilho ?? 0.03;
  const equityAlvo = (data?.pesosTarget?.SWRD ?? 0) + (data?.pesosTarget?.AVGS ?? 0) + (data?.pesosTarget?.AVEM ?? 0);
  const guardrailPiso = Array.isArray(guardrails) && guardrails.length > 0 ? guardrails[guardrails.length - 1] : null;
  const pisoGasto: number = data?.gasto_piso ?? guardrailPiso?.retirada ?? 180000;
  const cdsThresh = 400;
  const ipca_piso = pisos.pisoTaxaIpcaLongo ?? 6.0;
  const renda_gatilho = pisos.pisoTaxaRendaPlus ?? 6.5;
  const patrimonioGatilho: number | null = data?.premissas?.patrimonio_gatilho ?? null;
  const rules: Array<{ label: string; value: string }> = [
    { label: 'Equity alvo', value: `${(equityAlvo * 100).toFixed(0)}%` },
    { label: 'SWR', value: `${(swr * 100).toFixed(1)}%` },
    ...(patrimonioGatilho != null ? [{ label: 'Gatilho FIRE', value: fmtPrivacy(patrimonioGatilho, privacyMode) }] : []),
    { label: 'IPCA+ piso DCA', value: `≥${ipca_piso.toFixed(1)}%` },
    { label: 'Renda+ gatilho', value: `≥${renda_gatilho.toFixed(1)}%` },
    { label: 'Guardrail piso (retirada)', value: fmtPrivacy(pisoGasto, privacyMode) + '/ano' },
    { label: 'CDS revisar RF Brasil', value: `>${cdsThresh}bps` },
    { label: 'Drift threshold', value: '±5pp por classe' },
  ];
  return (
    <div data-testid="ips-summary">
      <CollapsibleSection
        id="section-ips-summary"
        title={secTitle('now', 'ips-summary', 'IPS — 30-Second Rules')}
        defaultOpen={secOpen('now', 'ips-summary', false)}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {rules.map(r => (
              <div key={r.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div className="src" style={{ marginTop: 8 }}>
            Read-only · Regras derivadas de data.json (swr_gatilho, pisos, pesosTarget, guardrails)
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
