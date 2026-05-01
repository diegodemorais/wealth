'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { fmtBrlM } from '@/utils/formatters';

// fmtBRL: local alias for compact BRL (M/k suffix) — delegates to canonical fmtBrlM
function fmtBRL(v: number) { return fmtBrlM(v); }

export function RendaVsIpcaDuracaoSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useUiStore();

  const renda2065 = (data as any)?.rf?.renda2065 ?? {};
  const ipca2050  = (data as any)?.rf?.ipca2050  ?? {};
  const ipca2040  = (data as any)?.rf?.ipca2040  ?? {};
  const bondPool  = (data as any)?.bond_pool      ?? {};

  // Duration estimada (anos até vencimento a partir de 2026)
  const durRenda  = 39; // 2065 − 2026
  const durIpca50 = 24; // 2050 − 2026

  const taxaRenda:  number | undefined = renda2065.taxa  as number | undefined;  // e.g. 6.93
  const taxaIpca50: number | undefined = ipca2050.taxa   as number | undefined;  // e.g. 6.85
  const valorRenda:  number | undefined = renda2065.valor as number | undefined; // e.g. 117832
  const valorIpca50: number | undefined = ipca2050.valor  as number | undefined; // e.g. 11660
  const valorIpca40: number | undefined = ipca2040.valor  as number | undefined; // e.g. 113015

  const diffPp = taxaRenda != null && taxaIpca50 != null ? taxaRenda - taxaIpca50 : null;

  // Bond pool combinado (renda2065 + ipca2050) se realocar
  const totalCombinado = (valorRenda ?? 0) + (valorIpca50 ?? 0);

  // Cobertura em anos vs custo_vida_base
  const custoAnual: number = (data as any)?.premissas?.custo_vida_base ?? 250000;
  const coberturaBondAtual  = bondPool.cobertura_anos as number | undefined;
  const coberturaCombinada  = custoAnual > 0 ? totalCombinado / custoAnual : null;

  // bond_pool "total" hipotético se renda2065 fosse incluído
  const bondPoolAtual = bondPool.atual_brl as number | undefined;
  const bondPoolHipotetico = (bondPoolAtual ?? 0) + (valorRenda ?? 0);
  const coberturaHipotetica = custoAnual > 0 ? bondPoolHipotetico / custoAnual : null;

  // fmtPrivacy expects number; pass raw value and let it apply privacy mask, then format
  const fmtM = (v: number | undefined) => v == null ? '—' : privacyMode ? '••••' : fmtBRL(v);
  const fmtTaxa = (v: number | undefined) => v == null ? '—' : `IPCA+${v.toFixed(2)}%`;
  const fmtAnos = (v: number | null | undefined) => v == null ? '—' : `${v.toFixed(1)} anos`;

  const diffColor = diffPp == null ? 'var(--muted)' : diffPp > 0 ? 'var(--green)' : 'var(--red)';

  return (
    <CollapsibleSection
      id="sim-renda-vs-ipca-duracao"
      title={secTitle('assumptions', 'renda-vs-ipca-duracao', 'Renda+ 2065 vs IPCA+2050 — Análise de Duração')}
      defaultOpen={secOpen('assumptions', 'renda-vs-ipca-duracao', false)}
    >
      {/* Intro */}
      <div style={{ padding: '0 16px 12px', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
        Comparação de duração e taxa entre os dois títulos longos. Renda+ 2065 é tático (gatilho venda ≤6.0%);
        IPCA+2050 é o bloco estrutural do bond pool longo.
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3" style={{ padding: '0 16px 12px' }}>
        {/* Renda+ 2065 */}
        <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>
            Renda+ 2065 (tático)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--muted)' }}>Taxa</span>
              <span data-testid="b13-taxa-renda2065" style={{ fontWeight: 700 }}>{fmtTaxa(taxaRenda)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--muted)' }}>Valor</span>
              <span data-testid="b13-valor-renda2065">{fmtM(valorRenda)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--muted)' }}>Duration (venc.)</span>
              <span style={{ fontWeight: 600 }}>~{durRenda} anos</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
              Proteção longevidade máxima; menor liquidez
            </div>
          </div>
        </div>

        {/* IPCA+2050 */}
        <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>
            IPCA+2050 (estrutural)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--muted)' }}>Taxa</span>
              <span data-testid="b13-taxa-ipca2050" style={{ fontWeight: 700 }}>{fmtTaxa(taxaIpca50)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--muted)' }}>Valor</span>
              <span data-testid="b13-valor-ipca2050">{fmtM(valorIpca50)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--muted)' }}>Duration (venc.)</span>
              <span style={{ fontWeight: 600 }}>~{durIpca50} anos</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
              Bond pool longo; mais flexibilidade de saída
            </div>
          </div>
        </div>
      </div>

      {/* Delta taxa */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '10px 14px', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Spread Renda+ vs IPCA+2050</div>
            <div data-testid="b13-spread-pp" style={{ fontSize: '1.2rem', fontWeight: 800, color: diffColor }}>
              {diffPp != null ? `${diffPp >= 0 ? '+' : ''}${diffPp.toFixed(2)}pp` : '—'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Renda+ paga {Math.abs(diffPp ?? 0).toFixed(2)}pp {(diffPp ?? 0) >= 0 ? 'acima' : 'abaixo'} do IPCA+2050
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Ganho de duration (manter Renda+)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>+{durRenda - durIpca50} anos</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Renda+ {durRenda}a vs IPCA+2050 {durIpca50}a</div>
          </div>
        </div>
      </div>

      {/* Tradeoff analysis */}
      <div style={{ padding: '0 16px 12px', fontSize: 'var(--text-sm)' }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Tradeoff: Duração vs Flexibilidade</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>+</span>
            <span>Renda+ 2065 protege <strong>longevidade</strong> além do FIRE (vencimento pós-85 anos). Adequado para horizonte FIRE 85-90+.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>−</span>
            <span>Menor <strong>flexibilidade</strong>: MTM mais sensível a juros (duration ~20a modificada). Venda antecipada pode gerar perda.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--yellow)', fontWeight: 700, flexShrink: 0 }}>~</span>
            <span>IPCA+2050 cobre até ~2050: suficiente se FIRE aos 50 com desacumulação conservadora (25-26 anos cobertos).</span>
          </div>
        </div>
      </div>

      {/* Bond pool impact */}
      <div style={{ padding: '0 16px 14px', fontSize: 'var(--text-sm)' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Impacto no Bond Pool</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Cenário</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Valor BRL</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Cobertura</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px' }}>Bond Pool atual (IPCA+2040+2050)</td>
                <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtM(bondPoolAtual)}</td>
                <td data-testid="b13-cobertura-atual" style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>{fmtAnos(coberturaBondAtual)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px' }}>Renda+2065 + IPCA+2050 (combinado)</td>
                <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtM(totalCombinado)}</td>
                <td data-testid="b13-cobertura-combinada" style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtAnos(coberturaCombinada)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px' }}>Hipotético: Bond Pool + Renda+2065</td>
                <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtM(bondPoolHipotetico)}</td>
                <td data-testid="b13-cobertura-hipotetica" style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--green)' }}>{fmtAnos(coberturaHipotetica)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
            Cobertura = valor / custo vida anual ({fmtM(custoAnual)}/ano). Renda+ 2065 é tático — não integra bond pool estrutural até decisão formal.
          </div>
        </div>
      </div>

      {/* IPCA+2040 context */}
      <div style={{ padding: '10px 14px', fontSize: 'var(--text-xs)', color: 'var(--muted)', background: 'rgba(88,166,255,.04)', margin: '0 16px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <strong>Contexto:</strong> IPCA+2040 (principal posição do bond pool, {fmtM(valorIpca40)}, taxa{' '}
        {ipca2040.taxa != null ? `IPCA+${(ipca2040.taxa as number).toFixed(2)}%` : '—'}) não está nesta análise — é HTM estrutural sem mudança de estratégia.
        A decisão aqui é se o bloco tático Renda+2065 migra para IPCA+2050 (−{Math.abs(durRenda - durIpca50)} anos de duration,{' '}
        −{diffPp != null ? Math.abs(diffPp).toFixed(2) : '?'}pp de taxa).
      </div>

      <div className="src">
        Dados: rf.renda2065 · rf.ipca2050 · bond_pool · Duration estimada = anos até vencimento (2026)
      </div>
    </CollapsibleSection>
  );
}
