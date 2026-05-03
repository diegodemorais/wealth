/**
 * portfolioConfig.ts — Configuração estrutural de buckets/tickers da carteira.
 *
 * Fonte canônica: agentes/contexto/carteira.md → carteira_params.json.
 * Aqui mantemos apenas mapeamento de display (LEGACY status, label de bucket,
 * ordem de exibição) — pesos target vêm de data.pesosTarget e drift de data.drift.
 *
 * Spec: HD-portfolio-buckets-view (Caminho A — extensão da HoldingsTable).
 */

/** Tickers transitórios em rota de migração para os 3 ETFs alvo (SWRD/AVGS/AVEM). */
export const LEGACY_TICKERS = new Set<string>([
  'AVDV', 'AVUV', 'USSC', 'EIMI', 'AVES', 'DGS', 'IWVL', 'JPGL',
]);

/** Ordem visual dos buckets no agrupamento da HoldingsTable. */
export const BUCKET_ORDER = [
  'EQUITY_DM_CORE',
  'EQUITY_DM_FACTOR',
  'EQUITY_EM',
  'RF_ESTRUTURAL',
  'RF_TATICO',
  'CRYPTO',
] as const;

export type BucketId = typeof BUCKET_ORDER[number];

/** Label legível para cabeçalho de seção. */
export const BUCKET_LABELS: Record<BucketId, string> = {
  EQUITY_DM_CORE:   'EQUITY DM CORE',
  EQUITY_DM_FACTOR: 'EQUITY DM FACTOR',
  EQUITY_EM:        'EQUITY EM',
  RF_ESTRUTURAL:    'RF ESTRUTURAL',
  RF_TATICO:        'RF TÁTICO',
  CRYPTO:           'CRYPTO',
};

/**
 * Mapeia o campo `bucket` que vem de data.posicoes[ticker] (SWRD/AVGS/AVEM/...)
 * para os 3 buckets de equity. RF/Crypto não estão em posicoes — vêm de
 * data.rf e data.hodl11 e são associados explicitamente.
 *
 * Alguns tickers legacy têm bucket=AVGS ou bucket=AVEM no pipeline porque
 * compartilham o bucket lógico com o alvo (DM Factor / EM).
 */
export const POSICAO_BUCKET_TO_BUCKET_ID: Record<string, BucketId> = {
  SWRD:  'EQUITY_DM_CORE',
  AVGS:  'EQUITY_DM_FACTOR',
  AVEM:  'EQUITY_EM',
  // Defensivo: se pipeline emitir bucket=JPGL para tickers legacy, encaixar em factor.
  JPGL:  'EQUITY_DM_FACTOR',
};

/** Override por ticker (precedência sobre POSICAO_BUCKET_TO_BUCKET_ID). */
export const TICKER_TO_BUCKET_ID: Record<string, BucketId> = {
  // EQUITY DM CORE
  SWRD: 'EQUITY_DM_CORE',
  // EQUITY DM FACTOR
  AVGS: 'EQUITY_DM_FACTOR',
  AVDV: 'EQUITY_DM_FACTOR',
  AVUV: 'EQUITY_DM_FACTOR',
  USSC: 'EQUITY_DM_FACTOR',
  IWVL: 'EQUITY_DM_FACTOR',
  JPGL: 'EQUITY_DM_FACTOR',
  // EQUITY EM
  AVEM: 'EQUITY_EM',
  EIMI: 'EQUITY_EM',
  AVES: 'EQUITY_EM',
  DGS:  'EQUITY_EM',
  // RF ESTRUTURAL / TATICO / CRYPTO são fabricados a partir de data.rf e data.hodl11
};

/** Tickers que são alvo permanente (sem aspas legacy/transitório). */
export const TARGET_TICKERS = new Set<string>(['SWRD', 'AVGS', 'AVEM']);

/** Mapa drift key (data.drift.{KEY}) por bucket — usado para % atual e alvo. */
export const BUCKET_DRIFT_KEY: Record<BucketId, string | null> = {
  EQUITY_DM_CORE:   'SWRD',
  EQUITY_DM_FACTOR: 'AVGS',
  EQUITY_EM:        'AVEM',
  RF_ESTRUTURAL:    'IPCA',
  RF_TATICO:        null,        // Renda+ 2065 — soma derivada de data.rf
  CRYPTO:           'HODL11',
};
