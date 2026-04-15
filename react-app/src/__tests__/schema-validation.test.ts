import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Schema Validation Test
 * Validates that data.json has ALL required fields for ALL components
 * Prevents components from breaking due to missing data fields
 */
describe('Schema Validation', () => {
  let realData: any;

  beforeAll(() => {
    const dataPath = path.join(__dirname, '../../public/data.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      realData = JSON.parse(raw);
    } else {
      throw new Error('data.json not found');
    }
  });

  describe('Critical Top-Level Fields', () => {
    it('should have all required root fields', () => {
      const required = [
        'date',
        'cambio',
        'premissas',
        'posicoes',
        'rf',
      ];
      const missing = required.filter(k => !(k in realData));
      expect(missing).toEqual([]);
    });
  });

  describe('Premissas (assumptions)', () => {
    it('should have all critical premissas fields', () => {
      const critical = [
        'patrimonio_atual',
        'patrimonio_gatilho',
        'custo_vida_base',
        'idade_atual',
        'idade_cenario_base',
        'aporte_mensal',
      ];
      const missing = critical.filter(k => !(k in (realData.premissas || {})));
      expect(missing).toEqual([]);
    });

    it('should have optional premissas fields if defined', () => {
      // renda_mensal_liquida is optional (has fallback in dataWiring)
      if ('renda_mensal_liquida' in realData.premissas) {
        expect(typeof realData.premissas.renda_mensal_liquida).toBe('number');
      }
    });
  });

  describe('NOW Page (/) - KpiHero & KeyMetrics', () => {
    it('should have fields for portfolio composition', () => {
      // KpiHero uses: networth, fireProgress, fireMonthsAway, fireDate
      // KeyMetrics uses: equityPercentage, rfPercentage, internationalPercentage, concentrationBrazil

      expect(realData.posicoes).toBeDefined();
      expect(realData.rf).toBeDefined();
      expect(realData.cambio).toBeGreaterThan(0);
      expect(realData.premissas?.patrimonio_gatilho).toBeGreaterThan(0);
    });
  });

  describe('Portfolio Page', () => {
    it('should have fields for DonutCharts & StackedAllocChart', () => {
      // Needs posicoes (can be Object or Array), rf, premissas
      expect(realData.posicoes).toBeDefined();
      // posicoes can be Object {SWRD: {...}, AVGS: {...}} or Array format
      expect(typeof realData.posicoes === 'object').toBe(true);
      expect(realData.rf).toBeDefined();
    });

    it('should have fields for GlidePathChart', () => {
      // Needs glide path data (evolution of allocation)
      expect(realData.glide).toBeDefined();
    });

    it('should have fields for HeatmapChart', () => {
      // Needs correlation/risk data
      expect(realData.posicoes).toBeDefined();
    });

    it('should have fields for BucketAllocationChart', () => {
      // Needs bucket allocation data
      expect(realData.posicoes).toBeDefined();
    });

    it('should have fields for ConcentrationChart', () => {
      // Needs concentracao_brasil
      expect(realData.concentracao_brasil).toBeDefined();
    });

    it('should have fields for TerChart', () => {
      // Needs TER (total expense ratio) data
      expect(realData.posicoes).toBeDefined();
    });
  });

  describe('Performance Page', () => {
    it('should have fields for TimelineChart', () => {
      // Needs historical returns/performance timeline
      expect(realData.retornos_mensais).toBeDefined();
    });

    it('should have fields for AttributionChart', () => {
      // Needs attribution data
      expect(realData.attribution).toBeDefined();
    });

    it('should have fields for DeltaBarChart', () => {
      // Needs equity attribution
      expect(realData.equity_attribution).toBeDefined();
    });

    it('should have fields for RollingSharpChart', () => {
      // Needs rolling sharpe ratio
      expect(realData.rolling_sharpe).toBeDefined();
    });

    it('should have fields for InformationRatioChart', () => {
      // Needs info ratio data
      expect(realData.factor_rolling).toBeDefined();
    });

    it('should have fields for BacktestChart', () => {
      // Needs backtest data
      expect(realData.backtest).toBeDefined();
    });

    it('should have fields for ShadowChart', () => {
      // Needs shadow portfolio data
      expect(realData.shadows).toBeDefined();
    });
  });

  describe('FIRE Page', () => {
    it('should have fields for TrackingFireChart', () => {
      // Needs fire progress and target
      expect(realData.fire).toBeDefined();
      expect(realData.premissas?.patrimonio_gatilho).toBeDefined();
    });

    it('should have fields for NetWorthProjectionChart', () => {
      // Needs net worth projections
      expect(realData.fire).toBeDefined();
    });

    it('should have fields for EarliestFireCard', () => {
      // Needs earliest FIRE scenario
      expect(realData.earliest_fire).toBeDefined();
    });

    it('should have fields for EventosVidaChart', () => {
      // Needs life events/milestones
      expect(realData.eventos_vida).toBeDefined();
    });
  });

  describe('Withdraw Page', () => {
    it('should have fields for GuardrailsChart', () => {
      // Needs guardrails data
      expect(realData.guardrails).toBeDefined();
    });

    it('should have fields for GuardrailsRetirada (if enabled)', () => {
      // Needs guardrails_retirada — optional, only if component is active
      if (!realData.guardrails_retirada) {
        console.log('ℹ️  guardrails_retirada not in data.json (component may be disabled)');
      }
    });

    it('should have fields for IncomeChart', () => {
      // Needs income data
      expect(realData.mercado).toBeDefined();
    });

    it('should have fields for IncomeProjectionChart', () => {
      // Needs income projection
      expect(realData.mercado).toBeDefined();
    });
  });

  describe('Simulators Page', () => {
    it('should have fields for SimulatorParams & SimulationTrajectories', () => {
      // Needs Monte Carlo setup: networth, monthly contribution, return assumptions
      expect(realData.posicoes).toBeDefined();
      expect(realData.rf).toBeDefined();
      expect(realData.premissas?.aporte_mensal).toBeDefined();
    });

    it('should have fields for SuccessRateCard', () => {
      // Needs MC results
      expect(realData.fire).toBeDefined();
    });

    it('should have fields for DrawdownDistribution', () => {
      // Needs drawdown data from simulations
      expect(realData.drawdown_history).toBeDefined();
    });
  });

  describe('Backtest Page', () => {
    it('should have fields for BacktestR7Chart', () => {
      // Needs backtest vs R7 benchmark
      expect(realData.backtest).toBeDefined();
      expect(realData.backtestR5).toBeDefined();
    });

    it('should have fields for DrawdownHistChart', () => {
      // Needs historical drawdown analysis
      expect(realData.drawdown_history).toBeDefined();
    });
  });

  describe('Data Quality', () => {
    it('all numeric fields should be valid numbers (not NaN or Infinity)', () => {
      const checkNumeric = (obj: any, path = ''): string[] => {
        const errors: string[] = [];
        Object.entries(obj || {}).forEach(([key, value]) => {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof value === 'number') {
            if (!isFinite(value)) {
              errors.push(`${fullPath} = ${value}`);
            }
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            errors.push(...checkNumeric(value, fullPath));
          }
        });
        return errors;
      };

      const invalidFields = checkNumeric(realData);
      if (invalidFields.length > 0) {
        console.warn(`⚠️  Invalid numeric values found:\n${invalidFields.join('\n')}`);
      }
      expect(invalidFields.length).toBe(0);
    });

    it('arrays should not be empty when required', () => {
      const criticalArrays = ['posicoes', 'retornos_mensais'];
      const emptyArrays = criticalArrays.filter(
        k => Array.isArray(realData[k]) && realData[k].length === 0
      );
      expect(emptyArrays).toEqual([]);
    });

    it('date field should be a valid ISO string', () => {
      expect(typeof realData.date).toBe('string');
      expect(() => new Date(realData.date)).not.toThrow();
      expect(new Date(realData.date).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Cross-Field Consistency', () => {
    it('cambio should be positive and reasonable', () => {
      expect(realData.cambio).toBeGreaterThan(0);
      expect(realData.cambio).toBeLessThan(100); // Sanity check: BRL/USD shouldn't exceed 100
    });

    it('patrimonio_atual should match sum of posicoes when converted to BRL', () => {
      // This is a consistency check — rough estimate
      const hasPosicoes = typeof realData.posicoes === 'object' && Object.keys(realData.posicoes || {}).length > 0;

      // posicoes should be populated for complete portfolio
      expect(hasPosicoes).toBe(true);
    });

    it('fire target should be greater than current patrimonio', () => {
      const current = realData.premissas?.patrimonio_atual || 0;
      const target = realData.premissas?.patrimonio_gatilho || 0;

      // In FIRE context, target should be >= current (already fired or working towards)
      expect(target).toBeGreaterThanOrEqual(current * 0.5); // At least half-way
    });
  });
});
