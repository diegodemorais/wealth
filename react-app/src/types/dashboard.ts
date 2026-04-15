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
}

export interface MCResult {
  trajectories: number[][];
  endWealthDist: number[];
  percentiles: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  successRate: number;
  medianEndWealth: number;
  drawdownDistribution?: {
    [key: string]: number;
  };
}

export type Period = 'all' | '1y' | '3m' | '1m';
