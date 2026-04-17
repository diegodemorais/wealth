/**
 * cross-source.test.ts — Valida que dados derivados (Camada 2) batem com fontes primárias (Camada 1)
 *
 * Camada 1 (fontes primárias):
 *   - dados/dashboard_state.json  → patrimônio, posições, câmbio, RF
 *   - dados/tax_snapshot.json     → IR diferido
 *   - dados/hipoteca_sac.json     → saldo devedor hipoteca
 *   - dados/historico_carteira.csv → série histórica de patrimônio
 *
 * Camada 2 (derivadas — geradas pelos scripts Python):
 *   - dashboard/data.json         → input do React
 *   - dados/fire_trilha.json      → trilha FIRE
 *   - dados/portfolio_summary.json → métricas de performance
 *
 * Estes testes detectam dessincronização no pipeline:
 *   "script foi rodado mas sem propagar para data.json" ou vice-versa.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../');

function loadJson(relPath: string): any {
  const fullPath = resolve(ROOT, relPath);
  if (!existsSync(fullPath)) return null;
  return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

function parseCsvFirstAndLast(relPath: string): { first: string; last: string; count: number } | null {
  const fullPath = resolve(ROOT, relPath);
  if (!existsSync(fullPath)) return null;
  const lines = readFileSync(fullPath, 'utf-8').trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return null;
  const dataLines = lines.slice(1); // skip header
  return {
    first: dataLines[0].split(',')[0].trim(),
    last: dataLines[dataLines.length - 1].split(',')[0].trim(),
    count: dataLines.length,
  };
}

let dataJson: any;
let dashboardState: any;
let taxSnapshot: any;
let hipotecaSac: any;
let fireTrilhaJson: any;
let portfolioSummary: any;
let historico: ReturnType<typeof parseCsvFirstAndLast>;

beforeAll(() => {
  dataJson        = loadJson('dashboard/data.json');
  dashboardState  = loadJson('dados/dashboard_state.json');
  taxSnapshot     = loadJson('dados/tax_snapshot.json');
  hipotecaSac     = loadJson('dados/hipoteca_sac.json');
  fireTrilhaJson  = loadJson('dados/fire_trilha.json');
  portfolioSummary = loadJson('dados/portfolio_summary.json');
  historico       = parseCsvFirstAndLast('dados/historico_carteira.csv');
});

// ─────────────────────────────────────────────────────────────
// 1. dashboard_state.json (L1) → data.json (L2)
// ─────────────────────────────────────────────────────────────
describe('L1 dashboard_state → L2 data.json', () => {
  it('dashboard_state.json deve existir', () => {
    expect(dashboardState).not.toBeNull();
  });

  it('data.json deve existir', () => {
    expect(dataJson).not.toBeNull();
  });

  it('patrimônio_atual em data.json deve ser próximo do dashboard_state (±10%)', () => {
    const fromState = dashboardState?.patrimonio?.total_brl;
    const fromData  = dataJson?.premissas?.patrimonio_atual;
    if (!fromState || !fromData) return;

    const diff = Math.abs(fromData - fromState) / fromState;
    expect(diff).toBeLessThan(0.10); // tolerância 10% — câmbio e timing divergem
  });

  it('câmbio em data.json deve ser positivo e razoável (entre 3 e 10)', () => {
    const cambio = dataJson?.cambio;
    expect(cambio).toBeGreaterThan(3);
    expect(cambio).toBeLessThan(10);
  });

  it('câmbio do dashboard_state deve ser positivo e razoável', () => {
    const cambio = dashboardState?.patrimonio?.cambio;
    expect(cambio).toBeGreaterThan(3);
    expect(cambio).toBeLessThan(10);
  });

  it('tickers do dashboard_state devem estar em data.json.posicoes', () => {
    const statePositions = Object.keys(dashboardState?.posicoes ?? {});
    const dataPositions  = Object.keys(dataJson?.posicoes ?? {});
    if (!statePositions.length) return;

    for (const ticker of statePositions) {
      expect(dataPositions).toContain(ticker);
    }
  });

  it('RF core products do dashboard_state devem estar em data.json.rf', () => {
    // hodl11 fica em dashboard_state.rf por razões históricas mas é cripto — não está em data.json.rf
    const NON_RF_IN_STATE = new Set(['hodl11', 'HODL11']);
    const stateRf = Object.keys(dashboardState?.rf ?? {}).filter(k => !NON_RF_IN_STATE.has(k));
    const dataRf  = Object.keys(dataJson?.rf ?? {});
    if (!stateRf.length) return;

    for (const product of stateRf) {
      expect(dataRf).toContain(product);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 2. tax_snapshot.json (L1) → data.json passivos (L2)
// ─────────────────────────────────────────────────────────────
describe('L1 tax_snapshot → L2 data.json passivos', () => {
  it('tax_snapshot.json deve existir', () => {
    expect(taxSnapshot).not.toBeNull();
  });

  it('passivos.ir_diferido_brl deve ser idêntico ao tax_snapshot', () => {
    const fromTax  = taxSnapshot?.ir_diferido_total_brl;
    const fromData = dataJson?.passivos?.ir_diferido_brl;
    if (fromTax === undefined || fromData === undefined) return;

    expect(fromData).toBeCloseTo(fromTax, 2); // centavos de precisão
  });

  it('tax_snapshot deve ter ir_diferido_total_brl positivo', () => {
    expect(taxSnapshot?.ir_diferido_total_brl).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// 3. hipoteca_sac.json (L1) → data.json passivos (L2)
// ─────────────────────────────────────────────────────────────
describe('L1 hipoteca_sac → L2 data.json passivos', () => {
  it('hipoteca_sac.json deve existir', () => {
    expect(hipotecaSac).not.toBeNull();
  });

  it('passivos.hipoteca_brl deve bater com hipoteca_sac.estado_atual.saldo_devedor (±1%)', () => {
    const fromSac  = hipotecaSac?.estado_atual?.saldo_devedor;
    const fromData = dataJson?.passivos?.hipoteca_brl;
    if (!fromSac || !fromData) return;

    const diff = Math.abs(fromData - fromSac) / fromSac;
    expect(diff).toBeLessThan(0.01); // ±1% — gerado da mesma fonte
  });

  it('hipoteca_vencimento deve coincidir entre fontes', () => {
    const fromSac  = hipotecaSac?.contrato?.data_fim_prevista;
    const fromData = dataJson?.passivos?.hipoteca_vencimento;
    if (!fromSac || !fromData) return;

    expect(fromData).toBe(fromSac);
  });
});

// ─────────────────────────────────────────────────────────────
// 4. dados/fire_trilha.json (L2) → data.json.fire_trilha (L2)
//    Pipeline sync: fire_trilha.json é a fonte que gera data.json
// ─────────────────────────────────────────────────────────────
describe('L2 fire_trilha.json → L2 data.json.fire_trilha (pipeline sync)', () => {
  it('fire_trilha.json deve existir', () => {
    expect(fireTrilhaJson).not.toBeNull();
  });

  it('dates array deve ser idêntico entre fire_trilha.json e data.json', () => {
    const fromFile = fireTrilhaJson?.dates;
    const fromData = dataJson?.fire_trilha?.dates;
    if (!fromFile || !fromData) return;

    expect(fromData.length).toBe(fromFile.length);
    expect(fromData[0]).toBe(fromFile[0]);
    expect(fromData[fromData.length - 1]).toBe(fromFile[fromFile.length - 1]);
  });

  it('trilha_brl array deve ter mesmo comprimento em ambas as fontes', () => {
    const fromFile = fireTrilhaJson?.trilha_brl;
    const fromData = dataJson?.fire_trilha?.trilha_brl;
    if (!fromFile || !fromData) return;

    expect(fromData.length).toBe(fromFile.length);
  });

  it('meta_fire_date deve coincidir entre fire_trilha.json e data.json', () => {
    const fromFile = fireTrilhaJson?.meta_fire_date;
    const fromData = dataJson?.fire_trilha?.meta_fire_date;
    if (!fromFile || !fromData) return;

    expect(fromData).toBe(fromFile);
  });

  it('n_historico deve coincidir entre fire_trilha.json e data.json', () => {
    const fromFile = fireTrilhaJson?.n_historico;
    const fromData = dataJson?.fire_trilha?.n_historico;
    if (fromFile === undefined || fromData === undefined) return;

    expect(fromData).toBe(fromFile);
  });
});

// ─────────────────────────────────────────────────────────────
// 5. historico_carteira.csv (L1) → fire_trilha (L2)
//    Série histórica real deve alimentar a trilha
// ─────────────────────────────────────────────────────────────
describe('L1 historico_carteira.csv → L2 fire_trilha', () => {
  it('historico_carteira.csv deve existir e ter dados', () => {
    expect(historico).not.toBeNull();
    expect(historico!.count).toBeGreaterThan(12); // ao menos 1 ano de histórico
  });

  it('data inicial do histórico deve bater com fire_trilha.dates[0]', () => {
    if (!historico || !fireTrilhaJson?.dates?.length) return;
    // historico CSV starts from a date, fire_trilha.dates[0] should match or be close
    const csvFirst  = historico.first.substring(0, 7); // YYYY-MM
    const trailFirst = fireTrilhaJson.dates[0].substring(0, 7);
    expect(trailFirst).toBe(csvFirst);
  });

  it('número de meses no histórico deve corresponder a n_historico', () => {
    if (!historico || !fireTrilhaJson) return;
    const nHistorico = fireTrilhaJson.n_historico ?? 0;
    // CSV count should be >= n_historico (CSV may have more data than trilha uses)
    expect(historico.count).toBeGreaterThanOrEqual(nHistorico);
  });
});

// ─────────────────────────────────────────────────────────────
// 6. portfolio_summary.json (L2) → data.json (L2) — sync check
// ─────────────────────────────────────────────────────────────
describe('L2 portfolio_summary → L2 data.json (sync)', () => {
  it('portfolio_summary.json deve existir', () => {
    expect(portfolioSummary).not.toBeNull();
  });

  it('patrimônio fim_brl em portfolio_summary deve ser positivo', () => {
    // portfolio_summary.patrimonio é objeto {inicio_brl, fim_brl, total_aportes_brl, ganho_mercado_brl}
    const pat = portfolioSummary?.patrimonio?.fim_brl ?? portfolioSummary?.patrimonio;
    if (!pat) return;
    expect(typeof pat).toBe('number');
    expect(pat).toBeGreaterThan(0);
  });
});
