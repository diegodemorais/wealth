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
      const nowBlocks = spec?.blocks?.filter((b: any) => b.tab === 'now') ?? [];
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
      const blocks = spec?.blocks?.filter((b: any) => b.tab === 'portfolio') ?? [];
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
      ];
      const missing = required.filter(k => !(k in (data.premissas ?? {})));
      expect(missing).toEqual([]);
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
});
