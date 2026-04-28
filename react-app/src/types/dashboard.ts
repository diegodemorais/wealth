/**
 * Dashboard Data Types
 * Automatically generated from dashboard/data.json schema
 */

export interface Position {
  qty: number;
  avg_cost: number;
  price: number;
  bucket: string;
  status: string;
  ter: number | null;
}

export interface Positions {
  [ticker: string]: Position;
}

export interface PesosTarget {
  [ticker: string]: number;
}

export interface Pisos {
  pisoTaxaIpcaLongo: number;
  pisoTaxaRendaPlus: number;
  pisoVendaRendaPlus: number;
  ir_aliquota: number;
}

export interface TimestampRecord {
  posicoes_ibkr: string;
  precos_yfinance: string;
  historico_csv: string;
  holdings_md: string;
  fire_mc: string;
  geral: string;
}

export interface FireData {
  data_fire: string;
  idade_fire: number;
  meses_para_fire: number;
  net_worth_fire: number;
  taxa_swr: number;
  trajetoria_fire: number[];
  percentil_10: number[];
  percentil_50: number[];
  percentil_90: number[];
  probabilidade_sucesso: number;
}

export interface Macro {
  [key: string]: any; // Flexible macro data structure
}

export interface Attribution {
  [key: string]: any; // Flexible attribution structure
}

export interface KPI {
  value: number;
  delta: number;
  status: 'ok' | 'warning' | 'critical';
  label: string;
}

export interface NonFinancialAssetImovel {
  venda_ano: number;
  valor_mercado: number;
  saldo_sac_venda: number;
  equity_bruto: number;
  custo_aquisicao: number;
  ganho_capital: number;
  ir_estimado: number;
  equity_liquido: number;
  fv_fire: number;
}

export interface NonFinancialAssetTerreno {
  venda_ano: number;
  valor_atual: number;
  ir_estimado: number;
  equity_liquido: number;
  fv_fire: number;
}

export interface NonFinancialAssets {
  imovel: NonFinancialAssetImovel;
  terreno: NonFinancialAssetTerreno;
  total_fv_fire: number;
  _nota: string;
}

export interface DashboardData {
  _generated: string;
  _generated_brt: string;
  date: string;
  timestamps: TimestampRecord;
  cambio: number;
  posicoes: Positions;
  pesosTarget: PesosTarget;
  pisos: Pisos;
  fire?: any; // Structure varies — allow flexibility
  macro?: Macro;
  attribution?: Attribution;
  premissas: Record<string, any>;
  timeline?: any;
  backtest?: any;
  drift?: any;
  rf?: any;
  hodl11?: any;
  realized_pnl?: any; // ibkr/realized_pnl.json — DARF obligations data
  non_financial_assets?: NonFinancialAssets; // Gap V — projeção de venda imóvel + terreno
  [key: string]: any; // Allow for additional fields from Python generation
}

export interface DerivedValues {
  networth: number;
  networthUsd: number;
  monthlyIncome: number;
  yearlyExpense: number;
  fireDate: Date;
  fireMonthsAway: number;
  firePercentage: number;
  pfire: number; // Probability of FIRE success (0-1)
  wellnessScore: number;
  wellnessStatus: 'critical' | 'warning' | 'ok' | 'excellent';
  equityPercentage: number;
  rfPercentage: number;
  internationalPercentage: number;
  concentrationBrazil: number;
  costIndexBps: number;
  trackingDifference: number;
  // Unified sources of truth (v2)
  dcaItems: DcaItem[];
  driftItems: DriftItem[];
  marketContext: MarketContext;
  [key: string]: any;
}

export interface MCParams {
  initialCapital: number;
  monthlyContribution: number;
  returnMean: number;
  returnStd: number;
  stressLevel: number; // 0-100, percentage shock to returns
  years: number;
  numSims: number;
  seed?: number; // optional: makes MC deterministic
}

/** Parameters for year-based MC (StressChart — acumulação/desacumulação with shock) */
export interface MCYearlyParams {
  initialCapital: number;
  annualReturn: number;
  annualVol: number;
  numSims: number;
  years: number;
  /** Annual contribution during accumulation phase (pre-fireYear) */
  annualContribution: number;
  /** Year index (0-based) at which accumulation stops and spending begins */
  yearsToFire: number;
  /** Year index (0-based) at which the one-time shock is applied */
  shockYear: number;
  /** Shock magnitude as fraction (e.g. -0.4 for -40%) */
  shockFrac: number;
  seed?: number;
}

export interface MCResult {
  trajectories: number[][];
  endWealthDist: number[];
  percentiles: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  successRate: number; // 0-1 decimal form (never 0-100) — use canonicalizePFire() for display
  medianEndWealth: number;
  drawdownDistribution?: {
    [key: string]: number;
  };
}

export type Period = 'all' | '1y' | '3m' | '1m';

export type StatusColor = 'verde' | 'amarelo' | 'vermelho';

/**
 * Unified DCA / monitoring item — single source of truth for RF and crypto positions.
 * Consumers: SemaforoGatilhos, SemaforoTriggers, DCAStatusGrid, Cascade calculator.
 */
export interface DcaItem {
  id: string;                             // 'ipca2040' | 'ipca2050' | 'renda2065' | 'hodl11'
  nome: string;                           // Display label
  categoria: 'rf_ipca' | 'rf_renda' | 'crypto';
  taxa: number | null;                    // Current rate / price metric (%)
  pisoCompra: number | null;             // Buy-floor rate (%)
  pisoVenda: number | null;              // Sell-floor rate (%)
  gapPiso: number | null;               // taxa - pisoCompra (pp); negative = below floor
  status: StatusColor;
  dcaAtivo: boolean;
  posicaoBrl: number;                    // Current position in BRL
  pctCarteira: number | null;           // % of total portfolio
  alvoPct: number | null;               // Target allocation %
  gapAlvoPp: number | null;            // pctCarteira - alvoPct (pp); negative = underweight
  proxAcao: string;                      // Human-readable next action
  // Crypto-specific (only populated when categoria === 'crypto')
  bandaMin?: number;
  bandaMax?: number;
  bandaAtual?: number;
}

/**
 * Unified drift item per allocation bucket.
 * Consumers: Drift block (NOW tab), rebalancing hints, gatilhos.
 */
export interface DriftItem {
  id: string;                            // 'SWRD' | 'AVGS' | 'AVEM' | 'IPCA' | 'HODL11'
  nome: string;
  atual: number;                         // Current allocation %
  alvo: number;                          // Target allocation %
  gap: number;                           // alvo - atual (pp); positive = underweight
  absGap: number;
  status: StatusColor;
  impactoBrl: number | null;            // BRL amount needed to close gap
}

/**
 * Snapshot of market context indicators.
 */
export interface MarketContext {
  cambio: number;
  cambioPctMtd: number | null;
  btcUsd: number | null;
  btcPctMtd: number | null;
  selic: number | null;
  fedFunds: number | null;
  spreadSelicFf: number | null;
  exposicaoCambialPct: number | null;
}
