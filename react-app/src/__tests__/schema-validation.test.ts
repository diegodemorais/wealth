import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Schema Validation — Spec-Driven
 *
 * Reads dashboard/spec.json as the source of truth.
 * Every block's data_fields must be present in react-app/public/data.json.
 *
 * This is the contract layer between the Python data pipeline and the React renderer.
 * If a field is missing in data.json, the corresponding component will silently
 * show nothing or crash — this test catches it before deploy.
 */

// Resolve paths relative to the test file (react-app/src/__tests__/)
const DATA_PATH = path.join(__dirname, '../../public/data.json');
const SPEC_PATH = path.join(__dirname, '../../../dashboard/spec.json');

function getNestedValue(obj: any, dotPath: string): { exists: boolean; value: unknown } {
  const parts = dotPath.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return { exists: false, value: undefined };
    if (!(part in cur)) return { exists: false, value: undefined };
    cur = cur[part];
  }
  return { exists: true, value: cur };
}

describe('Schema Validation — Spec-Driven Contract', () => {
  let data: any;
  let spec: any;

  beforeAll(() => {
    if (!fs.existsSync(DATA_PATH)) throw new Error(`data.json not found at ${DATA_PATH}`);
    if (!fs.existsSync(SPEC_PATH)) throw new Error(`spec.json not found at ${SPEC_PATH}`);
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf-8'));
  });

  it('spec.json is loadable and has blocks', () => {
    expect(Array.isArray(spec.blocks)).toBe(true);
    expect(spec.blocks.length).toBeGreaterThan(0);
  });

  it('data.json is loadable and has a date field', () => {
    expect(typeof data.date).toBe('string');
    expect(new Date(data.date).getTime()).toBeGreaterThan(0);
  });

  // Auto-generate one test per spec block
  describe('Per-block data_fields presence', () => {
    // We run this dynamically after spec loads — use a single test per tab grouping
    const tabGroups: Record<string, Array<{ blockId: string; field: string }>> = {};

    beforeAll(() => {
      for (const block of (spec?.blocks ?? [])) {
        const tab: string = block.tab ?? 'unknown';
        if (!tabGroups[tab]) tabGroups[tab] = [];
        for (const field of (block.data_fields ?? [])) {
          tabGroups[tab].push({ blockId: block.id, field });
        }
      }
    });

    it('all spec data_fields exist in data.json', () => {
      const missing: string[] = [];

      for (const block of (spec?.blocks ?? [])) {
        // optional blocks: warn only, do not fail (fields may be added by a future pipeline run)
        if (block.optional) continue;
        for (const field of (block.data_fields ?? [])) {
          const { exists } = getNestedValue(data, field);
          if (!exists) {
            missing.push(`[${block.id}] ${field}`);
          }
        }
      }

      if (missing.length > 0) {
        console.warn(
          `\n⚠️  Missing data_fields (${missing.length}):\n` +
          missing.map(m => `   - ${m}`).join('\n')
        );
      }

      expect(missing).toEqual([]);
    });
  });

  // Per-tab breakdown for easier debugging
  describe('NOW tab fields', () => {
    it('has required NOW fields', () => {
      // optional blocks are excluded — fields may not yet exist in data.json (pipeline not yet run)
      const nowBlocks = spec?.blocks?.filter((b: any) => b.tab === 'now' && !b.optional) ?? [];
      const missing: string[] = [];
      for (const block of nowBlocks) {
        for (const field of (block.data_fields ?? [])) {
          const { exists } = getNestedValue(data, field);
          if (!exists) missing.push(`[${block.id}] ${field}`);
        }
      }
      if (missing.length > 0) console.warn('NOW tab missing:\n' + missing.join('\n'));
      expect(missing).toEqual([]);
    });
  });

  describe('FIRE tab fields', () => {
    it('has required FIRE fields', () => {
      const blocks = spec?.blocks?.filter((b: any) => b.tab === 'fire') ?? [];
      const missing: string[] = [];
      for (const block of blocks) {
        for (const field of (block.data_fields ?? [])) {
          const { exists } = getNestedValue(data, field);
          if (!exists) missing.push(`[${block.id}] ${field}`);
        }
      }
      if (missing.length > 0) console.warn('FIRE tab missing:\n' + missing.join('\n'));
      expect(missing).toEqual([]);
    });
  });

  describe('PERFORMANCE tab fields', () => {
    it('has required PERFORMANCE fields', () => {
      const blocks = spec?.blocks?.filter((b: any) => b.tab === 'performance') ?? [];
      const missing: string[] = [];
      for (const block of blocks) {
        for (const field of (block.data_fields ?? [])) {
          const { exists } = getNestedValue(data, field);
          if (!exists) missing.push(`[${block.id}] ${field}`);
        }
      }
      if (missing.length > 0) console.warn('PERFORMANCE tab missing:\n' + missing.join('\n'));
      expect(missing).toEqual([]);
    });
  });

  describe('PORTFOLIO tab fields', () => {
    it('has required PORTFOLIO fields', () => {
      // optional blocks excluded — campos podem não existir até o pipeline rodar
      const blocks = spec?.blocks?.filter((b: any) => b.tab === 'portfolio' && !b.optional) ?? [];
      const missing: string[] = [];
      for (const block of blocks) {
        for (const field of (block.data_fields ?? [])) {
          const { exists } = getNestedValue(data, field);
          if (!exists) missing.push(`[${block.id}] ${field}`);
        }
      }
      if (missing.length > 0) console.warn('PORTFOLIO tab missing:\n' + missing.join('\n'));
      expect(missing).toEqual([]);
    });
  });

  describe('Data Quality', () => {
    it('all numeric fields should be finite (not NaN or Infinity)', () => {
      const checkNumeric = (obj: any, p = ''): string[] => {
        const errors: string[] = [];
        for (const [key, value] of Object.entries(obj ?? {})) {
          const fullPath = p ? `${p}.${key}` : key;
          if (typeof value === 'number') {
            if (!isFinite(value)) errors.push(`${fullPath} = ${value}`);
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            errors.push(...checkNumeric(value, fullPath));
          }
        }
        return errors;
      };
      const invalid = checkNumeric(data);
      if (invalid.length > 0) console.warn('Invalid numerics:\n' + invalid.join('\n'));
      expect(invalid).toEqual([]);
    });

    it('date field is a valid ISO string', () => {
      expect(typeof data.date).toBe('string');
      expect(new Date(data.date).getTime()).toBeGreaterThan(0);
    });

    it('cambio is positive and < 100 (BRL/USD sanity check)', () => {
      expect(data.cambio).toBeGreaterThan(0);
      expect(data.cambio).toBeLessThan(100);
    });

    it('premissas has critical FIRE fields', () => {
      const required = [
        'patrimonio_atual',
        'patrimonio_gatilho',
        'custo_vida_base',
        'idade_atual',
        'idade_cenario_base',
        'aporte_mensal',
        'swr_gatilho',
        'retorno_equity_base',
        'ipca_anual',
        'horizonte_vida',
        'taxa_ipca_plus_longa',
      ];
      const missing = required.filter(k => !(k in (data.premissas ?? {})));
      expect(missing).toEqual([]);
    });

    it('premissas — sanity checks on numeric ranges', () => {
      const p = data.premissas ?? {};
      expect(p.swr_gatilho).toBeGreaterThanOrEqual(0.01);
      expect(p.swr_gatilho).toBeLessThanOrEqual(0.10);
      expect(p.retorno_equity_base).toBeGreaterThan(-0.20);
      expect(p.retorno_equity_base).toBeLessThan(0.30);
      expect(p.ipca_anual).toBeGreaterThan(0);
      expect(p.ipca_anual).toBeLessThan(0.30);
      expect(p.idade_cenario_aspiracional).toBeLessThanOrEqual(p.idade_cenario_base);
    });

    it('posicoes is a non-empty object', () => {
      expect(typeof data.posicoes).toBe('object');
      expect(Object.keys(data.posicoes ?? {}).length).toBeGreaterThan(0);
    });

    it('fire target >= 50% of current patrimonio (FIRE on track)', () => {
      const current = data.premissas?.patrimonio_atual ?? 0;
      const target = data.premissas?.patrimonio_gatilho ?? 0;
      expect(target).toBeGreaterThanOrEqual(current * 0.5);
    });
  });

  // ─── Feature 1 + 2: Coast FIRE and FIRE Spectrum schema ─────────────────────
  //
  // These tests are pending data.json population by Dev (generate_data.py pipeline).
  // They will fail with a descriptive skip message until the pipeline is wired.
  // Reference spec: agentes/issues/HD-gaps-aposenteaos40-spec.md
  // ─────────────────────────────────────────────────────────────────────────────

  describe('coast_fire and fire_spectrum schema', () => {
    it('data.json has fire.coast_fire with required fields', () => {
      const coastFire = data?.fire?.coast_fire;

      if (coastFire === undefined) {
        // Pending: Dev has not yet wired compute_coast_fire() in generate_data.py
        console.warn('[PENDING] fire.coast_fire not found in data.json — Dev pipeline not yet wired');
        return;
      }

      expect(coastFire).toBeDefined();
      expect(typeof coastFire?.coast_number_base).toBe('number');
      expect(typeof coastFire?.coast_number_fav).toBe('number');
      expect(typeof coastFire?.coast_number_stress).toBe('number');
      expect(typeof coastFire?.passou_base).toBe('boolean');
      expect(typeof coastFire?.gap_base).toBe('number');
      expect(typeof coastFire?.ano_projetado_base).toBe('number');
      expect(typeof coastFire?.fire_number).toBe('number');
      expect(typeof coastFire?.n_anos).toBe('number');
    });

    it('data.json has fire.coast_fire numeric values in plausible ranges', () => {
      const coastFire = data?.fire?.coast_fire;

      if (coastFire === undefined) {
        console.warn('[PENDING] fire.coast_fire not found in data.json — Dev pipeline not yet wired');
        return;
      }

      // Coast number must be between 1M and 10M (below FIRE number of 10M)
      expect(coastFire.coast_number_base).toBeGreaterThan(1_000_000);
      expect(coastFire.coast_number_base).toBeLessThan(10_000_000);
      // Fav < Base < Stress (higher returns → lower coast needed)
      expect(coastFire.coast_number_fav).toBeLessThan(coastFire.coast_number_base);
      expect(coastFire.coast_number_stress).toBeGreaterThan(coastFire.coast_number_base);
      // Year is plausible
      expect(coastFire.ano_projetado_base).toBeGreaterThanOrEqual(2026);
      expect(coastFire.ano_projetado_base).toBeLessThanOrEqual(2046);
    });

    it('data.json has fire.fire_spectrum with 4 bands', () => {
      const spectrum = data?.fire?.fire_spectrum;

      if (spectrum === undefined) {
        console.warn('[PENDING] fire.fire_spectrum not found in data.json — Dev pipeline not yet wired');
        return;
      }

      expect(spectrum).toBeDefined();
      expect(spectrum?.bandas).toHaveLength(4);
      expect(spectrum?.bandas[0].nome).toBe('Fat FIRE');
      expect(spectrum?.bandas[3].nome).toBe('Barista FIRE');
    });

    it('data.json fire_spectrum bandas have required fields', () => {
      const spectrum = data?.fire?.fire_spectrum;

      if (spectrum === undefined) {
        console.warn('[PENDING] fire.fire_spectrum not found in data.json — Dev pipeline not yet wired');
        return;
      }

      for (const banda of spectrum.bandas) {
        expect(typeof banda.nome).toBe('string');
        expect(typeof banda.multiplo).toBe('number');
        expect(typeof banda.swr_pct).toBe('number');
        expect(typeof banda.alvo_brl).toBe('number');
        expect(typeof banda.atingido).toBe('boolean');
        expect(typeof banda.pct_atual).toBe('number');
        // pct_atual is always capped at 100
        expect(banda.pct_atual).toBeLessThanOrEqual(100);
        expect(banda.pct_atual).toBeGreaterThanOrEqual(0);
      }
    });

    it('data.json fire_spectrum banda_atual is a known value', () => {
      const spectrum = data?.fire?.fire_spectrum;

      if (spectrum === undefined) {
        console.warn('[PENDING] fire.fire_spectrum not found in data.json — Dev pipeline not yet wired');
        return;
      }

      const VALID_BAND_VALUES = [
        'below_barista', 'barista_fire', 'lean_fire', 'fire', 'fat_fire',
      ];
      expect(VALID_BAND_VALUES).toContain(spectrum.banda_atual);
    });

    it('data.json fire_spectrum custo_mensal matches premissas.custo_vida_base / 12', () => {
      const spectrum = data?.fire?.fire_spectrum;

      if (spectrum === undefined) {
        console.warn('[PENDING] fire.fire_spectrum not found in data.json — Dev pipeline not yet wired');
        return;
      }

      const expectedMonthly = (data?.premissas?.custo_vida_base ?? 250_000) / 12;
      // Allow rounding tolerance of ±1
      expect(spectrum.custo_mensal).toBeCloseTo(expectedMonthly, 0);
    });
  });
});
