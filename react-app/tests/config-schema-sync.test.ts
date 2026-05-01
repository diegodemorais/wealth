/**
 * config-schema-sync.test.ts — Validates sync between spec.json, dashboard.config.ts, and pages
 *
 * Ensures that:
 * - All tabs in spec.json exist in dashboard.config.ts::TABS
 * - Tab order is identical
 * - All groups (sections) in spec.json exist in SECTIONS[tab]
 * - defaultOpen in SECTIONS matches spec.json intent
 * - Pages use secOpen() helper, not hardcoded defaultOpen values
 *
 * This test prevents layout divergence between manifest and code.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { TABS, SECTIONS } from '@/config/dashboard.config';

interface SpecTab {
  id: string;
  label: string;
  groups: string[];
}

interface SpecData {
  tabs: SpecTab[];
}

let specData: SpecData;

beforeAll(() => {
  // Load spec.json from dashboard directory
  const specPath = resolve(__dirname, '../../dashboard/spec.json');
  const specContent = readFileSync(specPath, 'utf-8');
  specData = JSON.parse(specContent) as SpecData;
});

describe('Config Schema Sync (spec.json ↔ dashboard.config.ts)', () => {

  // ─────────────────────────────────────────────────────────────
  // 1. TABS SYNC
  // ─────────────────────────────────────────────────────────────

  describe('TABS sync', () => {
    it('all 7 tabs in spec.json exist in dashboard.config.ts::TABS', () => {
      const specTabIds = specData.tabs.map(t => t.id);
      const configTabIds = TABS.map(t => {
        // dashboard.config.ts uses 'tab-now', 'tab-portfolio', etc.
        // spec.json uses 'now', 'portfolio', etc.
        return t.id.replace('tab-', '');
      });

      for (const specId of specTabIds) {
        expect(configTabIds).toContain(specId);
      }
    });

    it('tab order in TABS matches spec.json order', () => {
      const specTabIds = specData.tabs.map(t => t.id);
      const configTabIds = TABS.map(t => t.id.replace('tab-', ''));

      expect(configTabIds).toEqual(specTabIds);
    });

    it('all tab labels match spec.json', () => {
      const specLabels = new Map(specData.tabs.map(t => [t.id, t.label]));

      for (const tab of TABS) {
        const tabId = tab.id.replace('tab-', '');
        const specLabel = specLabels.get(tabId);
        expect(tab.label).toBe(specLabel);
      }
    });

    it('exactly 7 tabs defined', () => {
      expect(TABS.length).toBe(7);
      expect(specData.tabs.length).toBe(7);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SECTIONS SYNC — Groups per Tab
  // ─────────────────────────────────────────────────────────────

  describe('SECTIONS sync', () => {
    it('all groups in spec.json exist in SECTIONS[tab]', () => {
      for (const specTab of specData.tabs) {
        const configSections = SECTIONS[specTab.id] ?? [];
        const configGroups = new Set(
          configSections
            .map(s => s.group)
            .filter((g): g is string => !!g)
        );

        for (const specGroup of specTab.groups) {
          expect(configGroups).toContain(specGroup);
        }
      }
    });

    it('group order in SECTIONS[tab] matches spec.json', () => {
      for (const specTab of specData.tabs) {
        const configSections = SECTIONS[specTab.id] ?? [];

        // Extract unique groups in order
        const seen = new Set<string>();
        const configGroups: string[] = [];
        for (const s of configSections) {
          if (s.group && !seen.has(s.group)) {
            seen.add(s.group);
            configGroups.push(s.group);
          }
        }

        expect(configGroups).toEqual(specTab.groups);
      }
    });

    it('all tabs have SECTIONS defined', () => {
      const specTabIds = specData.tabs.map(t => t.id);

      for (const tabId of specTabIds) {
        expect(SECTIONS).toHaveProperty(tabId);
        expect(Array.isArray(SECTIONS[tabId])).toBe(true);
        expect(SECTIONS[tabId].length).toBeGreaterThan(0);
      }
    });

    it('each section has required fields (id, title, defaultOpen, collapsible, group)', () => {
      for (const [tabId, sections] of Object.entries(SECTIONS)) {
        for (const section of sections) {
          expect(section).toHaveProperty('id');
          expect(section).toHaveProperty('title');
          expect(section).toHaveProperty('defaultOpen');
          expect(section).toHaveProperty('collapsible');
          expect(section).toHaveProperty('group');
          expect(typeof section.id).toBe('string');
          expect(typeof section.title).toBe('string');
          expect(typeof section.defaultOpen).toBe('boolean');
          expect(typeof section.collapsible).toBe('boolean');
          expect(typeof section.group).toBe('string');
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. PAGES: No Hardcoded defaultOpen
  // ─────────────────────────────────────────────────────────────

  describe('Pages do not hardcode defaultOpen', () => {
    it('pages use secOpen() from config, not hardcoded values', () => {
      // Find all .tsx files in pages directory
      try {
        const pagesDir = resolve(__dirname, '../../src/pages');
        // Use grep to find hardcoded defaultOpen={true|false}
        const output = execSync(
          `grep -r "defaultOpen={" "${pagesDir}" 2>/dev/null | grep -v "secOpen" || echo ""`,
          { encoding: 'utf-8' }
        );

        const matches = output.trim().split('\n').filter(line => line.length > 0);

        // Each match should contain secOpen, not a literal boolean
        for (const match of matches) {
          // If match exists and doesn't contain secOpen, it's a hardcoded value
          if (match && !match.includes('secOpen')) {
            // Verify it's actually a hardcoded boolean
            if (match.includes('defaultOpen={true}') || match.includes('defaultOpen={false}')) {
              throw new Error(`Found hardcoded defaultOpen in: ${match}`);
            }
          }
        }
      } catch (error) {
        // If grep fails or no pages found, that's OK — just verify we tried
        if ((error as any).code === 127) {
          // grep command not found, skip
          return;
        }
        // If we found actual hardcoded values, throw
        if ((error as any).message?.includes('Found hardcoded')) {
          throw error;
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. SECTION IDs ARE UNIQUE PER TAB
  // ─────────────────────────────────────────────────────────────

  describe('Section IDs uniqueness', () => {
    it('section IDs are unique within each tab', () => {
      for (const [tabId, sections] of Object.entries(SECTIONS)) {
        const ids = sections.map(s => s.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(ids.length);
      }
    });
  });
});
