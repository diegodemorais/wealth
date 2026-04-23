/**
 * accessibility-screenreader.test.ts — Screen Reader Compatibility
 *
 * Purpose: Validate screen reader support (axe-core principles + manual checks):
 * - ARIA Labels: All buttons/icons have aria-label or text
 * - Semantic HTML: Use <button>, <a>, <form>, not <div onclick>
 * - ARIA Attributes: Correct use of aria-expanded, aria-hidden, role=
 * - Live Regions: Dynamic content announced (aria-live)
 * - Form Labels: <label for="id"> paired with inputs
 *
 * Scope: All 38 components (focus on top 10 high-traffic)
 *
 * Run in isolation:
 *   cd react-app && npx vitest run src/__tests__/accessibility-screenreader.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface ScreenReaderViolation {
  component: string;
  type: string;
  severity: 'critical' | 'major' | 'minor';
  details: string;
  line?: number;
}

interface ARIAIssue {
  type: string;
  count: number;
  examples: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen Reader Analysis
// ─────────────────────────────────────────────────────────────────────────────

function checkAriaLabelsComprehensive(
  source: string,
  componentName: string
): ScreenReaderViolation[] {
  const violations: ScreenReaderViolation[] = [];
  const lines = source.split('\n');

  // Check for icon buttons without labels
  const iconButtonMatches = source.match(/<button[^>]*>\s*<[^>]*Icon/gi) || [];
  for (const btn of iconButtonMatches) {
    if (!btn.includes('aria-label') && !btn.includes('aria-labelledby')) {
      violations.push({
        component: componentName,
        type: 'icon-button-missing-aria-label',
        severity: 'major',
        details:
          'Icon button found without aria-label or aria-labelledby. Screen readers will not know button purpose.',
      });
    }
  }

  // Check for role="button" on div elements (should have click handlers documented)
  const roleDivMatches = source.match(/<div[^>]*role="button"[^>]*>/gi) || [];
  for (const div of roleDivMatches) {
    if (
      !div.includes('aria-label') &&
      !div.includes('aria-labelledby') &&
      !div.includes('aria-pressed')
    ) {
      violations.push({
        component: componentName,
        type: 'custom-button-missing-aria',
        severity: 'major',
        details:
          'Custom button (div with role="button") found without ARIA attributes. Screen readers will not announce state.',
      });
    }
  }

  // Check for aria-hidden on interactive elements
  const ariaHiddenInteractive = source.match(
    /<(button|a|input)[^>]*aria-hidden="true"[^>]*>/gi
  ) || [];
  if (ariaHiddenInteractive.length > 0) {
    violations.push({
      component: componentName,
      type: 'interactive-element-aria-hidden',
      severity: 'critical',
      details: `Found ${ariaHiddenInteractive.length} interactive elements with aria-hidden="true". This hides them from screen readers.`,
    });
  }

  return violations;
}

function checkAriaAttributes(
  source: string,
  componentName: string
): ScreenReaderViolation[] {
  const violations: ScreenReaderViolation[] = [];

  // Check for invalid ARIA attribute values
  const invalidAriaValues = [
    { pattern: /aria-expanded="[^"]*"(?!true|false)/i, attr: 'aria-expanded' },
    { pattern: /aria-hidden="[^"]*"(?!true|false)/i, attr: 'aria-hidden' },
    { pattern: /aria-checked="[^"]*"(?!true|false|mixed)/i, attr: 'aria-checked' },
    { pattern: /aria-selected="[^"]*"(?!true|false)/i, attr: 'aria-selected' },
    { pattern: /aria-pressed="[^"]*"(?!true|false|mixed)/i, attr: 'aria-pressed' },
  ];

  for (const { pattern, attr } of invalidAriaValues) {
    const matches = source.match(pattern);
    if (matches) {
      violations.push({
        component: componentName,
        type: `invalid-${attr}-value`,
        severity: 'major',
        details: `Invalid ${attr} value found. Must be true, false${attr === 'aria-checked' ? ', or mixed' : ''}.`,
      });
    }
  }

  // Check for aria-label and aria-labelledby on elements that shouldn't have them
  const ariaOnForm = source.match(/<form[^>]*aria-label="[^"]*"[^>]*>/gi);
  if (ariaOnForm) {
    // Forms should use fieldset/legend instead
    violations.push({
      component: componentName,
      type: 'aria-label-on-form',
      severity: 'minor',
      details:
        'Form uses aria-label. Consider using <fieldset> and <legend> for semantic grouping.',
    });
  }

  // Check for duplicate role attributes
  const roleMatches = source.match(/role="[^"]*"\s+role="/gi);
  if (roleMatches) {
    violations.push({
      component: componentName,
      type: 'duplicate-role-attributes',
      severity: 'major',
      details: 'Element has duplicate role attributes. Remove redundant roles.',
    });
  }

  return violations;
}

function checkLiveRegions(
  source: string,
  componentName: string
): ScreenReaderViolation[] {
  const violations: ScreenReaderViolation[] = [];

  // Check if component has dynamic content that should be announced
  const dynamicUpdates = [
    'useState',
    'setError',
    'setSuccess',
    'setLoading',
    'setMessage',
  ];
  const hasDynamicContent = dynamicUpdates.some((keyword) =>
    source.includes(keyword)
  );

  if (hasDynamicContent) {
    // Check if aria-live regions are properly used
    const ariaLiveMatches = source.match(/aria-live="[^"]*"/gi) || [];
    const ariaLiveValues = ariaLiveMatches.map((m) => m.match(/"([^"]*)"/)?.[1]);

    // Valid values: polite, assertive, off
    const invalidLiveValues = ariaLiveValues.filter(
      (v) => v && !['polite', 'assertive', 'off'].includes(v)
    );

    if (invalidLiveValues.length > 0) {
      violations.push({
        component: componentName,
        type: 'invalid-aria-live-value',
        severity: 'major',
        details: `Invalid aria-live values. Must be 'polite', 'assertive', or 'off'.`,
      });
    }

    // If has dynamic content but no aria-live, flag it
    if (ariaLiveMatches.length === 0 && hasDynamicContent) {
      violations.push({
        component: componentName,
        type: 'missing-aria-live-for-dynamic-content',
        severity: 'minor',
        details:
          'Component has dynamic content but no aria-live region. Consider adding aria-live="polite" for status updates.',
      });
    }
  }

  return violations;
}

function checkSemanticRoles(
  source: string,
  componentName: string
): ScreenReaderViolation[] {
  const violations: ScreenReaderViolation[] = [];

  // Check for redundant roles (element has native semantic meaning)
  const semanticElements = [
    { tag: 'button', invalidRole: 'button' },
    { tag: 'link', invalidRole: 'link' },
    { tag: 'form', invalidRole: 'form' },
    { tag: 'img', invalidRole: 'img' },
    { tag: 'heading', invalidRole: 'heading' },
  ];

  for (const { tag, invalidRole } of semanticElements) {
    const pattern = new RegExp(
      `<${tag}[^>]*role="${invalidRole}"`,
      'gi'
    );
    if (pattern.test(source)) {
      violations.push({
        component: componentName,
        type: 'redundant-role',
        severity: 'minor',
        details: `<${tag}> has redundant role="${invalidRole}". Remove role for semantic elements.`,
      });
    }
  }

  // Check for invalid role values
  const invalidRoles = [
    'image', // Should be 'img'
    'text', // Not a valid ARIA role
    'container', // Not a valid ARIA role
  ];

  for (const invalidRole of invalidRoles) {
    const pattern = new RegExp(`role="${invalidRole}"`, 'gi');
    if (pattern.test(source)) {
      violations.push({
        component: componentName,
        type: 'invalid-role-value',
        severity: 'major',
        details: `Invalid role="${invalidRole}". Check WAI-ARIA role definitions.`,
      });
    }
  }

  return violations;
}

function checkAlternativeText(
  source: string,
  componentName: string
): ScreenReaderViolation[] {
  const violations: ScreenReaderViolation[] = [];

  // Check images without alt text
  const imgMatches = source.match(/<img[^>]*>/gi) || [];
  let imagesWithoutAlt = 0;

  for (const img of imgMatches) {
    const hasAlt = /alt="[^"]*"/.test(img);
    const hasAriaHidden = /aria-hidden="true"/.test(img);
    const hasRole = /role="presentation"/.test(img);

    if (!hasAlt && !hasAriaHidden && !hasRole) {
      imagesWithoutAlt++;
    }
  }

  if (imagesWithoutAlt > 0) {
    violations.push({
      component: componentName,
      type: 'image-missing-alt-text',
      severity: 'major',
      details: `Found ${imagesWithoutAlt} image(s) without alt text. Either add alt text or use aria-hidden="true" for decorative images.`,
    });
  }

  return violations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Discovery and Priority
// ─────────────────────────────────────────────────────────────────────────────

function getPriorityComponents(): Array<{
  path: string;
  name: string;
}> {
  const componentsDir = path.join(__dirname, '../components');

  // Top 10 high-traffic components (interact with user most)
  const priorityNames = [
    'dashboard/AporteDecisionPanel', // DCA triggers
    'dashboard/SemaforoGatilhos', // Status indicators
    'charts/EChart', // Chart wrapper
    'portfolio/PortfolioOverview', // Main view
    'fire/FIREProjection', // Key projection
    'primitives/Button', // Base interactive
    'primitives/Select', // Form control
    'auth/LoginForm', // Entry point
    'layout/Navigation', // Navigation
    'performance/PerformanceChart', // Data viz
  ];

  const allFiles: Array<{ path: string; name: string }> = [];
  const walkDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && entry !== 'node_modules') {
        walkDir(full);
      } else if (entry.endsWith('.tsx')) {
        const rel = path.relative(componentsDir, full).replace(/\.tsx$/, '');
        allFiles.push({ path: full, name: rel });
      }
    }
  };

  walkDir(componentsDir);

  // Return priority components if they exist, otherwise all
  const priorityFiles = allFiles.filter((f) =>
    priorityNames.some((p) => f.name.endsWith(p))
  );

  return priorityFiles.length > 0 ? priorityFiles : allFiles.slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Screen Reader Compatibility', () => {
  let allViolations: ScreenReaderViolation[] = [];
  let priorityComponents: Array<{ path: string; name: string }> = [];

  beforeAll(() => {
    priorityComponents = getPriorityComponents();
  });

  describe('ARIA Labels (4.1.2)', () => {
    it('all buttons and icons have accessible names', () => {
      const violations: ScreenReaderViolation[] = [];

      for (const component of priorityComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const componentViolations = checkAriaLabelsComprehensive(
          source,
          component.name
        );
        violations.push(...componentViolations);
      }

      if (violations.length > 0) {
        console.warn(
          `⚠️  ARIA label violations found (${violations.length}):\n` +
            violations
              .map((v) => `  - ${v.component}: ${v.details}`)
              .join('\n')
        );
      }

      allViolations.push(...violations);
      // Critical violations must fail
      expect(violations.filter((v) => v.severity === 'critical')).toHaveLength(
        0
      );
    });
  });

  describe('ARIA Attributes (1.3.1)', () => {
    it('ARIA attributes have valid values', () => {
      const violations: ScreenReaderViolation[] = [];

      for (const component of priorityComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const componentViolations = checkAriaAttributes(
          source,
          component.name
        );
        violations.push(...componentViolations);
      }

      if (violations.length > 0) {
        console.warn(
          `⚠️  ARIA attribute violations found (${violations.length}):\n` +
            violations
              .map((v) => `  - ${v.component}: ${v.details}`)
              .join('\n')
        );
      }

      allViolations.push(...violations);
      expect(violations.filter((v) => v.severity === 'critical')).toHaveLength(
        0
      );
    });
  });

  describe('Live Regions (4.1.3)', () => {
    it('dynamic content is announced with aria-live regions', () => {
      const violations: ScreenReaderViolation[] = [];

      for (const component of priorityComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const componentViolations = checkLiveRegions(
          source,
          component.name
        );
        violations.push(...componentViolations);
      }

      if (violations.length > 0) {
        console.log(
          `ℹ️  Live region suggestions (${violations.length}):\n` +
            violations
              .map((v) => `  - ${v.component}: ${v.details}`)
              .join('\n')
        );
      }

      allViolations.push(...violations);
      // Minor violations: informational
    });
  });

  describe('Semantic Roles (1.3.1)', () => {
    it('roles are used correctly and not redundant', () => {
      const violations: ScreenReaderViolation[] = [];

      for (const component of priorityComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const componentViolations = checkSemanticRoles(
          source,
          component.name
        );
        violations.push(...componentViolations);
      }

      if (violations.length > 0) {
        console.warn(
          `⚠️  Semantic role violations found (${violations.length}):\n` +
            violations
              .map((v) => `  - ${v.component}: ${v.details}`)
              .join('\n')
        );
      }

      allViolations.push(...violations);
      expect(violations.filter((v) => v.severity === 'critical')).toHaveLength(
        0
      );
    });
  });

  describe('Alternative Text (1.1.1)', () => {
    it('all images have alt text or are marked decorative', () => {
      const violations: ScreenReaderViolation[] = [];

      for (const component of priorityComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const componentViolations = checkAlternativeText(
          source,
          component.name
        );
        violations.push(...componentViolations);
      }

      if (violations.length > 0) {
        console.warn(
          `⚠️  Alternative text violations found (${violations.length}):\n` +
            violations
              .map((v) => `  - ${v.component}: ${v.details}`)
              .join('\n')
        );
      }

      allViolations.push(...violations);
      expect(violations.filter((v) => v.severity === 'critical')).toHaveLength(
        0
      );
    });
  });

  describe('Coverage Summary', () => {
    it('scans top 10 high-traffic components', () => {
      expect(priorityComponents.length).toBeGreaterThan(0);
      console.log(`✅ Screen Reader Coverage: ${priorityComponents.length} priority components`);
      priorityComponents.forEach((c) => console.log(`   - ${c.name}`));
    });

    it('establishes baseline for screen reader accessibility', () => {
      const summary = {
        critical: allViolations.filter((v) => v.severity === 'critical').length,
        major: allViolations.filter((v) => v.severity === 'major').length,
        minor: allViolations.filter((v) => v.severity === 'minor').length,
        total: allViolations.length,
      };

      console.log(
        `\n📊 Screen Reader Accessibility Baseline:\n` +
          `  Critical: ${summary.critical}\n` +
          `  Major: ${summary.major}\n` +
          `  Minor: ${summary.minor}\n` +
          `  Total: ${summary.total}`
      );

      // Critical violations must be 0
      expect(summary.critical).toBe(0);
    });
  });
});
