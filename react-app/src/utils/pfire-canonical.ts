'use client';

/**
 * pfire-canonical.ts — Centralizado: transforma P(FIRE) em forma canônica.
 *
 * Fonte única de transformação para P(FIRE) em React. Todas as páginas
 * DEVEM usar funções desta módulo, nunca fazer × 100 ou ÷ 100 inline.
 *
 * Regra obrigatória: Nenhuma conversão de escala é permitida fora daqui.
 * Validação: tests/pfire-canonicalization.test.ts (QA enforcement).
 */

export type PFireSource = 'mc' | 'heuristic' | 'fallback';

export interface CanonicalPFire {
  /** Forma 0-1, ex: 0.864 */
  decimal: number;
  /** Forma 0-100, ex: 86.4 */
  percentage: number;
  /** String formatada, ex: "86%" ou "86.4%" */
  percentStr: string;
  /** 'mc' = MC real, 'heuristic' = deduzido, 'fallback' = stale constant */
  source: PFireSource;
  /** true apenas se source === 'mc' */
  isCanonical: boolean;
}

/**
 * Transforma decimal 0-1 → forma canônica.
 *
 * GARANTIA: Esta é a ÚNICA função autorizada para fazer conversão × 100.
 *
 * @param decimal Fração 0-1 (ex: 0.864)
 * @param source Origem do valor ('mc' | 'heuristic' | 'fallback')
 * @param precision Casas decimais (padrão: 1)
 * @returns CanonicalPFire com ambas as formas
 * @throws Error se decimal está fora de [0, 1]
 */
export function canonicalizePFire(
  decimal: number,
  source: PFireSource = 'mc',
  precision: number = 1
): CanonicalPFire {
  // Validação obrigatória
  if (typeof decimal !== 'number') {
    throw new TypeError(`decimal must be number, got ${typeof decimal}`);
  }

  if (!Number.isFinite(decimal)) {
    throw new RangeError(`decimal cannot be NaN or Infinity, got ${decimal}`);
  }

  if (decimal < 0 || decimal > 1) {
    throw new RangeError(
      `decimal must be in [0, 1], got ${decimal}. ` +
      `If you have a percentage (0-100), divide by 100 first.`
    );
  }

  // Conversão autorizada × 100 (AQUI APENAS)
  const percentage = Math.round(decimal * 100 * 10 ** precision) / 10 ** precision;
  const percentStr = precision === 0
    ? `${Math.round(percentage)}%`
    : `${percentage.toFixed(precision)}%`;

  return {
    decimal,
    percentage,
    percentStr,
    source,
    isCanonical: source === 'mc'
  };
}

/**
 * Lê P(FIRE) da API (data.json) → forma canônica.
 *
 * Valida que o formato é correto (já em %) e detecta source.
 *
 * @param pctValue Percentual 0-100 vindo de data.json (ex: 86.4)
 * @param source Que foi armazenado no JSON ('mc' | 'heuristic' | 'fallback')
 * @returns CanonicalPFire com decimal convertido
 * @throws Error se pctValue está fora de [0, 100]
 */
export function fromAPIPercentage(
  pctValue: number,
  source: PFireSource = 'mc'
): CanonicalPFire {
  if (typeof pctValue !== 'number') {
    throw new TypeError(`pctValue must be number, got ${typeof pctValue}`);
  }

  if (!Number.isFinite(pctValue)) {
    throw new RangeError(`pctValue cannot be NaN or Infinity`);
  }

  if (pctValue < 0 || pctValue > 100) {
    throw new RangeError(
      `pctValue must be in [0, 100], got ${pctValue}. ` +
      `If you have a decimal (0-1), multiply by 100 first (or use canonicalizePFire).`
    );
  }

  const decimal = pctValue / 100;
  return canonicalizePFire(decimal, source);
}

/**
 * Aplica delta (ex: +2.05pp para cenário fav) mantendo rastreabilidade.
 *
 * @param base Base P(FIRE) (deve ser canonical, source === 'mc')
 * @param deltaPct Delta em pontos percentuais (ex: 2.05)
 * @param reason Descrição do por quê (para logging)
 * @returns Nova CanonicalPFire com delta aplicado
 * @throws Error se base não é canônico
 */
export function applyPFireDelta(
  base: CanonicalPFire,
  deltaPct: number,
  reason: string = ''
): CanonicalPFire {
  if (!base.isCanonical) {
    throw new Error(
      `Cannot apply delta to non-canonical source (${base.source}). ` +
      `Base must be source='mc' before applying deltas. ${reason}`
    );
  }

  const newPercentage = base.percentage + deltaPct;
  // Clamp to [0, 100]
  const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
  const clampedDecimal = clampedPercentage / 100;

  return canonicalizePFire(clampedDecimal, 'heuristic', 1);
}

/**
 * Valida consistência entre dois valores P(FIRE).
 *
 * Usado para verificar se dois cálculos independentes concordam.
 * Ex: MC de fire_montecarlo.py vs valor parseado em generate_data.py
 *
 * @param p1 Primeiro P(FIRE)
 * @param p2 Segundo P(FIRE)
 * @param tolerancePct Tolerância em pp (padrão: 1.0pp)
 * @returns { isConsistent: bool, message: string, diff: number }
 */
export function validatePFireConsistency(
  p1: CanonicalPFire,
  p2: CanonicalPFire,
  tolerancePct: number = 1.0
): { isConsistent: boolean; message: string; diff: number } {
  const diff = Math.abs(p1.percentage - p2.percentage);
  const isConsistent = diff <= tolerancePct;

  const message = isConsistent
    ? `P(FIRE) consistent: ${diff.toFixed(2)}pp diff (tolerance: ${tolerancePct}pp)`
    : `P(FIRE) INCONSISTENT: ${p1.percentStr} vs ${p2.percentStr} (diff: ${diff.toFixed(2)}pp)`;

  return { isConsistent, message, diff };
}

/**
 * Guard: Detecta se código está tentando fazer conversão × 100 fora do padrão.
 *
 * USADO EM TESTES: Valida que nenhum arquivo faz `pfire * 100` inline.
 * Throw se tiver padrão suspeito.
 *
 * @param value Valor suspeito
 * @param context Contexto (arquivo/linha, para erro)
 * @throws Error se parece estar fazendo conversão não-autorizada
 */
export function guardAgainstInlineConversion(
  value: number,
  context: string
): void {
  // Se valor está entre 0-1 e contexto tem "pFire", "pfire", "P(FIRE)"
  // e chamador está tentando fazer × 100, isso vai violar a regra
  if (value >= 0 && value <= 1 && value !== 0 && value !== 1) {
    console.warn(
      `⚠️ [PFIRE-CANONICALIZATION] Detected decimal 0-1 value (${value}) ` +
      `in context: ${context}. ` +
      `Should this be canonicalized via canonicalizePFire()? ` +
      `Never do × 100 inline.`
    );
  }
}
