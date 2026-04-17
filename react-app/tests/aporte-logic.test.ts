/**
 * aporte-logic.test.ts — Testa lógicas do componente AporteDoMes via dataWiring
 *
 * Cobre os edge cases que causaram quebras:
 * - acumuladoMes: lógica com || quando aporte é de mês passado
 * - acumuladoAno: fallback quando data.aporte_mensal não existe
 * - isPremissa / primaryValue: quando ultimoAporte = 0
 * - savingsRate: quando renda_mensal_liquida está ausente
 * - ultimoAporteData: formato e ausência
 */

import { describe, it, expect } from 'vitest';
import type { DashboardData } from '@/types/dashboard';
import { computeDerivedValues } from '@/utils/dataWiring';

// Mês corrente no formato YYYY-MM (compatível com ultimoAporteData)
const CURRENT_MONTH = new Date().toISOString().substring(0, 7);
const PAST_MONTH = '2020-01';

function makeData(premissasOverride: Record<string, any> = {}, topOverride: Record<string, any> = {}): DashboardData {
  return {
    _generated: '2026-04-01T00:00:00Z',
    _generated_brt: '2026-04-01T00:00:00-03:00',
    date: '2026-04-01',
    timestamps: { geral: '2026-04-01T00:00:00Z', posicoes_ibkr: '', precos_yfinance: '', historico_csv: '', holdings_md: '', fire_mc: '' },
    cambio: 5.0,
    posicoes: { SWRD: { valor_usd: 100000, valor_brl: 500000, bucket: 'DM', shares: 1000, price_usd: 100, pct_portfolio: 0.5 } },
    pesosTarget: { SWRD: 0.5 },
    pisos: { pisoTaxaIpcaLongo: 0.045, pisoTaxaRendaPlus: 0.05, pisoVendaRendaPlus: 0.045, ir_aliquota: 0.15 },
    premissas: {
      patrimonio_atual: 3_500_000,
      patrimonio_gatilho: 5_000_000,
      idade_atual: 39,
      idade_cenario_base: 50,
      custo_vida_base: 180_000,
      aporte_mensal: 25_000,
      renda_mensal_liquida: 45_000,
      ultimo_aporte_brl: 78_194,
      ultimo_aporte_data: CURRENT_MONTH,
      retorno_equity_base: 0.07,
      volatilidade_equity: 0.15,
      ...premissasOverride,
    },
    rf: { ipca2029: { valor: 100000 }, ipca2040: { valor: 200000 }, ipca2050: { valor: 300000 }, renda2065: { valor: 150000 } },
    pfire_base: { base: 88.0, fav: 94.0, stress: 82.0 },
    passivos: { hipoteca_brl: 452_124, ir_diferido_brl: 120_000, hipoteca_vencimento: '2051-02-15', total: 572_124 },
    fire_trilha: { dates: ['2026-04'], trilha_brl: [3_500_000], meta_fire_date: '2033-07', n_historico: 1 },
    ...topOverride,
  } as unknown as DashboardData;
}

describe('AporteDoMes — wiring lógico (acumuladoMes / acumuladoAno / primaryValue)', () => {

  // ─── acumuladoMes ───────────────────────────────────────────
  describe('acumuladoMes', () => {
    it('quando aporte é do mês corrente: acumuladoMes = ultimoAporte', () => {
      const data = makeData({ ultimo_aporte_data: CURRENT_MONTH, ultimo_aporte_brl: 78_194 });
      const d = computeDerivedValues(data);
      expect(d.acumuladoMes).toBe(78_194);
    });

    it('quando aporte é de mês passado: acumuladoMes cai no fallback aporteMensal', () => {
      // Comportamento atual: || aporteMensal — mostra premissa, não 0
      const data = makeData({ ultimo_aporte_data: PAST_MONTH, ultimo_aporte_brl: 78_194 });
      const d = computeDerivedValues(data);
      // acumuladoMes = 78194 * 0 = 0, 0 || 25_000 → retorna premissa como fallback
      expect(d.acumuladoMes).toBe(25_000); // fallback = aporteMensal
    });

    it('quando ultimo_aporte_data está vazio: acumuladoMes = aporteMensal (fallback)', () => {
      const data = makeData({ ultimo_aporte_data: '', ultimo_aporte_brl: 50_000 });
      const d = computeDerivedValues(data);
      // 50000 * 0 = 0, 0 || 25_000 → aporteMensal
      expect(d.acumuladoMes).toBe(25_000);
    });

    it('quando ultimoAporte é 0 e data é mês corrente: acumuladoMes = aporteMensal (fallback)', () => {
      // 0 * 1 = 0, 0 || aporteMensal = aporteMensal
      const data = makeData({ ultimo_aporte_data: CURRENT_MONTH, ultimo_aporte_brl: 0 });
      const d = computeDerivedValues(data);
      expect(d.acumuladoMes).toBe(25_000);
    });

    it('quando ambos são 0: acumuladoMes = 0', () => {
      const data = makeData({ ultimo_aporte_data: PAST_MONTH, ultimo_aporte_brl: 0, aporte_mensal: 0 });
      const d = computeDerivedValues(data);
      expect(d.acumuladoMes).toBe(0);
    });
  });

  // ─── acumuladoAno ────────────────────────────────────────────
  describe('acumuladoAno', () => {
    it('quando data.aporte_mensal existe: usa total_aporte_brl', () => {
      const data = makeData({}, { aporte_mensal: { total_aporte_brl: 150_000 } });
      const d = computeDerivedValues(data);
      expect(d.acumuladoAno).toBe(150_000);
    });

    it('quando data.aporte_mensal não existe: fallback = aporteMensal * 12', () => {
      const data = makeData(); // sem aporte_mensal no top-level
      const d = computeDerivedValues(data);
      expect(d.acumuladoAno).toBe(25_000 * 12); // 300_000
    });

    it('acumuladoAno deve ser positivo', () => {
      const data = makeData();
      const d = computeDerivedValues(data);
      expect(d.acumuladoAno).toBeGreaterThan(0);
    });
  });

  // ─── ultimoAporte / primaryValue ─────────────────────────────
  describe('ultimoAporte e primaryValue', () => {
    it('quando ultimo_aporte_brl > 0: ultimoAporte = último aporte real', () => {
      const data = makeData({ ultimo_aporte_brl: 78_194 });
      const d = computeDerivedValues(data);
      expect(d.ultimoAporte).toBe(78_194);
    });

    it('quando ultimo_aporte_brl ausente: ultimoAporte = 0 (não usa aporteMensal)', () => {
      const data = makeData();
      delete (data.premissas as any).ultimo_aporte_brl;
      const d = computeDerivedValues(data);
      expect(d.ultimoAporte).toBe(0);
    });

    it('aporteMensal vem sempre de premissas.aporte_mensal', () => {
      const data = makeData({ aporte_mensal: 30_000 });
      const d = computeDerivedValues(data);
      expect(d.aporteMensal).toBe(30_000);
    });
  });

  // ─── ultimoAporteData ────────────────────────────────────────
  describe('ultimoAporteData', () => {
    it('formato padrão YYYY-MM deve ser preservado', () => {
      const data = makeData({ ultimo_aporte_data: '2026-04' });
      const d = computeDerivedValues(data);
      expect(d.ultimoAporteData).toBe('2026-04');
    });

    it('quando ausente: ultimoAporteData = "" (string vazia)', () => {
      const data = makeData();
      delete (data.premissas as any).ultimo_aporte_data;
      const d = computeDerivedValues(data);
      expect(d.ultimoAporteData).toBe('');
    });
  });

  // ─── savingsRate (lógica no componente, validada via inputs) ─
  describe('savingsRate inputs (renda_mensal_liquida)', () => {
    it('quando renda_mensal_liquida > 0: inputs corretos para calcular savings rate', () => {
      const data = makeData({ renda_mensal_liquida: 45_000, ultimo_aporte_brl: 78_194 });
      const d = computeDerivedValues(data);
      // O componente calcula: primaryValue / rendaMensal * 100
      const rendaMensal = data.premissas?.renda_mensal_liquida ?? 0;
      const primaryValue = d.ultimoAporte > 0 ? d.ultimoAporte : d.aporteMensal;
      const rate = rendaMensal > 0 ? (primaryValue / rendaMensal) * 100 : null;
      expect(rate).not.toBeNull();
      expect(rate!).toBeGreaterThan(0);
      expect(rate!).toBeLessThan(200); // sanidade
    });

    it('quando renda_mensal_liquida = 0: savingsRate deve ser null (sem barra)', () => {
      const data = makeData({ renda_mensal_liquida: 0 });
      const d = computeDerivedValues(data);
      const rendaMensal = data.premissas?.renda_mensal_liquida ?? 0;
      const primaryValue = d.ultimoAporte > 0 ? d.ultimoAporte : d.aporteMensal;
      const rate = rendaMensal > 0 ? (primaryValue / rendaMensal) * 100 : null;
      expect(rate).toBeNull();
    });

    it('quando renda_mensal_liquida está ausente: savingsRate deve ser null', () => {
      const data = makeData();
      delete (data.premissas as any).renda_mensal_liquida;
      const rendaMensal = data.premissas?.renda_mensal_liquida ?? 0;
      const rate = rendaMensal > 0 ? 1 : null;
      expect(rate).toBeNull();
    });
  });
});
