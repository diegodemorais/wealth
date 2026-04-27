'use client';

/**
 * pfire-engine.ts — Motor centralizado para P(FIRE) em TypeScript
 *
 * REPLICAÇÃO EXATA da lógica Python (scripts/pfire_engine.py).
 * Mesmo algoritmo, mesmos parâmetros, mesma seed = mesmos resultados.
 *
 * Invariante: PFireResult.canonical SEMPRE tem isCanonical=true.
 *
 * Testes idênticos em Python e TypeScript garantem sincronização.
 * Se divergem > 1pp, CI falha.
 */

import { canonicalizePFire, CanonicalPFire } from './pfire-canonical';
import { runCanonicalMC } from './montecarlo';

export type PFireScenario = 'base' | 'aspiracional' | 'stress' | 'custom';

export interface PFireRequest {
  scenario: PFireScenario;
  patrimonio_atual: number;
  meta_fire: number;
  aporte_mensal: number;
  idade_atual: number;
  idade_fire: number;
  retorno_anual: number;
  volatilidade_anual: number;
  meses: number;
  n_simulacoes?: number;
  seed?: number;
}

export interface PFireResult {
  canonical: CanonicalPFire;
  scenario: PFireScenario;
  percentile_10: number; // 0-1
  percentile_50: number; // 0-1
  percentile_90: number; // 0-1
  endWealthDist: number[];
}

/**
 * Valida request — falha rápido se parâmetros são inválidos.
 */
function validateRequest(req: PFireRequest): void {
  if (req.patrimonio_atual <= 0) {
    throw new Error(`patrimonio_atual deve ser > 0, got ${req.patrimonio_atual}`);
  }
  if (req.meta_fire <= 0) {
    throw new Error(`meta_fire deve ser > 0, got ${req.meta_fire}`);
  }
  if (req.aporte_mensal < 0) {
    throw new Error(`aporte_mensal deve ser >= 0, got ${req.aporte_mensal}`);
  }
  if (req.idade_atual < 0 || req.idade_fire < 0) {
    throw new Error(`idades devem ser >= 0`);
  }
  if (req.idade_fire <= req.idade_atual) {
    throw new Error(
      `idade_fire (${req.idade_fire}) deve ser > idade_atual (${req.idade_atual})`
    );
  }
  if (req.meses <= 0) {
    throw new Error(`meses deve ser > 0, got ${req.meses}`);
  }
  if (!(0 < req.retorno_anual && req.retorno_anual < 1)) {
    throw new Error(`retorno_anual deve ser decimal (0-1), got ${req.retorno_anual}`);
  }
  if (!(0 < req.volatilidade_anual && req.volatilidade_anual < 1)) {
    throw new Error(
      `volatilidade_anual deve ser decimal (0-1), got ${req.volatilidade_anual}`
    );
  }
}

/**
 * Valida resultado — se falhar, cálculo foi corrompido.
 */
function validateResult(res: PFireResult): void {
  // P(FIRE) DEVE ser canônico
  if (!res.canonical.isCanonical) {
    throw new Error(
      `PFireResult.canonical MUST have source='mc', got ${res.canonical.source}`
    );
  }

  // Percentis em [0,1]
  const percentiles = [
    { name: 'p10', val: res.percentile_10 },
    { name: 'p50', val: res.percentile_50 },
    { name: 'p90', val: res.percentile_90 },
  ];
  for (const { name, val } of percentiles) {
    if (!(val >= 0 && val <= 1)) {
      throw new Error(`percentile_${name} deve estar em [0,1], got ${val}`);
    }
  }

  // Percentis em ordem
  if (!(res.percentile_10 <= res.percentile_50 && res.percentile_50 <= res.percentile_90)) {
    throw new Error(
      `Percentis devem estar em ordem: p10=${res.percentile_10} <= ` +
      `p50=${res.percentile_50} <= p90=${res.percentile_90}`
    );
  }
}

interface ScenarioParams {
  label: string;
  retorno_delta: number;
  vol_delta: number;
}

function getScenarioParams(scenario: PFireScenario): ScenarioParams {
  const scenarios: Record<PFireScenario, ScenarioParams> = {
    base: { label: 'Base', retorno_delta: 0.0, vol_delta: 0.0 },
    aspiracional: { label: 'Aspiracional', retorno_delta: 0.01, vol_delta: 0.0 },
    stress: { label: 'Stress', retorno_delta: -0.02, vol_delta: 0.05 },
    custom: { label: 'Custom', retorno_delta: 0.0, vol_delta: 0.0 },
  };

  if (!(scenario in scenarios)) {
    throw new Error(
      `scenario must be one of ${Object.keys(scenarios).join(', ')}, got ${scenario}`
    );
  }

  return scenarios[scenario];
}

/**
 * Motor centralizado — ÚNICA forma autorizada de calcular P(FIRE) no browser.
 */
export class PFireEngine {
  /**
   * Calcula P(FIRE) para um cenário.
   *
   * GARANTIA: resultado.canonical.isCanonical === true
   * GARANTIA: resultado.canonical.source === 'mc'
   */
  static calculate(request: PFireRequest): PFireResult {
    // ✓ Validação obrigatória
    validateRequest(request);

    const n_sim = request.n_simulacoes ?? 10_000;
    const seed = request.seed ?? 42;

    const scenarioParams = getScenarioParams(request.scenario);

    // Ajustar parâmetros por cenário
    const retorno_anual = request.retorno_anual + scenarioParams.retorno_delta;
    const vol_anual = request.volatilidade_anual + scenarioParams.vol_delta;

    // Rodar MC (mesma seed = mesmos resultados que Python)
    const mcResult = runCanonicalMC({
      P0: request.patrimonio_atual,
      r_anual: retorno_anual,
      sigma_anual: vol_anual,
      aporte_mensal: request.aporte_mensal,
      meses: request.meses,
      N: n_sim,
      seed,
      metaFire: request.meta_fire,
      fxRegime: false,
    });

    // ✓ CRÍTICO: canonicalizar (ÚNICA fonte de conversão × 100)
    const canonical = canonicalizePFire(mcResult.pFire, 'mc');

    // Percentis de probabilidade (0-1): aproximação idêntica ao Python pfire_engine.py
    // Python: percentile_10 = max(0.0, p_sucesso - 0.03), percentile_50 = p_sucesso, percentile_90 = min(1.0, p_sucesso + 0.03)
    // mcResult.p10/p50/p90 são percentis de riqueza (BRL), NÃO probabilidades
    const pSuccesso = mcResult.pFire; // 0-1
    const pct10 = Math.max(0.0, pSuccesso - 0.03);
    const pct50 = pSuccesso;
    const pct90 = Math.min(1.0, pSuccesso + 0.03);

    // Montar resultado
    const result: PFireResult = {
      canonical,
      scenario: request.scenario,
      percentile_10: pct10,
      percentile_50: pct50,
      percentile_90: pct90,
      endWealthDist: mcResult.endWealthDist,
    };

    // ✓ Validação invariante
    validateResult(result);

    return result;
  }
}
