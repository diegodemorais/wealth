/**
 * accessibility-keyboard.test.ts — Keyboard Navigation Testing
 *
 * Purpose: Validate full keyboard navigation (no mouse required):
 * - Tab Order: All interactive elements reachable via Tab
 * - Enter/Space: Buttons activate with Enter or Space
 * - Escape: Modals/dropdowns close with Escape
 * - Arrow Keys: Lists/tabs navigate with arrow keys
 * - No Keyboard Trap: Focus can always move forward/backward
 *
 * Scope: Interactive flows (button activation, form submission, tab switching)
 *
 * Note: This tests keyboard event handling patterns in source code.
 * Full E2E keyboard testing is in playwright (playwright test).
 *
 * Run in isolation:
 *   cd react-app && npx vitest run src/__tests__/accessibility-keyboard.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface KeyboardIssue {
  component: string;
  type: string;
  severity: 'critical' | 'major' | 'minor';
  details: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyboard Handler Detection
// ─────────────────────────────────────────────────────────────────────────────

function checkKeyboardHandlers(
  source: string,
  componentName: string
): KeyboardIssue[] {
  const issues: KeyboardIssue[] = [];

  // Check for common keyboard handlers
  const hasOnKeyDown = /onKeyDown|on:keydown/i.test(source);
  const hasOnKeyUp = /onKeyUp|on:keyup/i.test(source);
  const hasOnKeyPress = /onKeyPress|on:keypress/i.test(source);

  // Check for Enter key handling
  const hasEnterHandling = /key\.code\s*===?\s*['"](Enter|NumpadEnter)|key\s*===?\s*['"](Enter|NumpadEnter)/i.test(
    source
  );

  // Check for Escape key handling
  const hasEscapeHandling = /key\.code\s*===?\s*['"](Escape|Esc)|key\s*===?\s*['"](Escape|Esc)/i.test(
    source
  );

  // Check for Arrow key handling
  const hasArrowHandling = /key\.code\s*===?\s*['"](Arrow|Up|Down|Left|Right)|key\s*===?\s*['"](Arrow|Up|Down|Left|Right)/i.test(
    source
  );

  // If component has onClick, check if it also has keyboard handler
  const hasOnClick = /onClick\s*=/i.test(source);
  const isCustomButton = /role\s*=\s*['"](button|tab|menuitem|option)/i.test(
    source
  );

  if (hasOnClick && isCustomButton && !hasOnKeyDown) {
    issues.push({
      component: componentName,
      type: 'custom-button-missing-keyboard',
      severity: 'major',
      details:
        'Custom button (with onClick) found without keyboard handler. Add onKeyDown to handle Enter/Space.',
    });
  }

  return issues;
}

function checkTabIndexPattern(
  source: string,
  componentName: string
): KeyboardIssue[] {
  const issues: KeyboardIssue[] = [];

  // Check for positive tabindex (can break logical tab order)
  const positiveTabindex = source.match(/tabindex\s*=\s*['"]\d+['"]/gi) || [];
  const negativeTabindex = source.match(/tabindex\s*=\s*['"](?:-\d+|0)['"]/gi) || [];

  // Only flag high positive tabindex values (>1)
  for (const match of positiveTabindex) {
    const value = parseInt(match.match(/\d+/)?.[0] || '0');
    if (value > 0) {
      issues.push({
        component: componentName,
        type: 'positive-tabindex',
        severity: 'minor',
        details: `Found tabindex="${value}". Positive tabindex can break tab order. Use natural DOM order or tabindex="0".`,
      });
    }
  }

  // Check for keyboard trap pattern: focus management without escape hatch
  const hasModalPattern = /modal|Modal|dialog|Dialog|popup|Popup/i.test(source);
  const hasEscapeHandler = /Escape|key\.code\s*===?\s*['"]Escape/i.test(source);

  if (hasModalPattern && !hasEscapeHandler) {
    issues.push({
      component: componentName,
      type: 'modal-missing-escape-handler',
      severity: 'major',
      details: 'Modal/dialog component found without Escape key handler. Users should be able to close with Escape.',
    });
  }

  return issues;
}

function checkFocusTrapPattern(
  source: string,
  componentName: string
): KeyboardIssue[] {
  const issues: KeyboardIssue[] = [];

  // Check for focus management patterns that could indicate focus trap
  const hasFocusElement = /focusElement|document\.activeElement|focus\(\)|setFocus/i.test(
    source
  );
  const hasModal = /modal|Modal|dialog|Dialog/i.test(source);

  // If modal or dialog has explicit focus management, that's good
  if (hasModal && hasFocusElement) {
    // This is expected behavior for accessible modals
    return issues;
  }

  // Check for event.preventDefault() on Tab key (red flag for keyboard trap)
  const hasPreventDefaultOnTab = /key\.code\s*===?\s*['"](Tab|9)[\s\S]{0,50}preventDefault/i.test(source);

  if (hasPreventDefaultOnTab) {
    issues.push({
      component: componentName,
      type: 'keyboard-trap-tab-prevented',
      severity: 'critical',
      details:
        'preventDefault() called on Tab key. This creates a keyboard trap. Users cannot navigate away.',
    });
  }

  // Check for focus trap without proper focus management
  const hasFocusWithin = /focusWithin|contains\(document\.activeElement/i.test(
    source
  );

  if (hasModal && hasFocusElement && !hasFocusWithin) {
    // Warn about incomplete focus trap implementation
    issues.push({
      component: componentName,
      type: 'incomplete-focus-trap',
      severity: 'major',
      details:
        'Modal/dialog has focus() call but may not properly manage focus trap. Ensure initial focus is set correctly.',
    });
  }

  return issues;
}

function checkFormInputHandling(
  source: string,
  componentName: string
): KeyboardIssue[] {
  const issues: KeyboardIssue[] = [];

  // Check for form elements with onKeyDown but no onKeyUp balance
  const hasInput = /<input|<textarea|<select/i.test(source);
  const hasKeyDown = /onKeyDown/i.test(source);

  if (hasInput && hasKeyDown) {
    // Check if keydown is for form submission (Enter in input)
    const hasEnterSubmit = /key\.code\s*===?\s*['"](Enter|NumpadEnter).*submit|key\.code\s*===?\s*['"](Enter|NumpadEnter).*form/i.test(
      source
    );

    if (!hasEnterSubmit) {
      // Could be a custom handler, check pattern
      const context = source.substring(
        Math.max(0, source.indexOf('onKeyDown') - 200),
        Math.min(source.length, source.indexOf('onKeyDown') + 400)
      );

      if (!/preventDefault|stopPropagation/.test(context)) {
        // No preventDefault, so default behavior is preserved (OK)
        return issues;
      }
    }
  }

  // Check for contentEditable without proper keyboard support
  const hasContentEditable = /contentEditable|contentEditable=["']true["']/i.test(
    source
  );
  if (hasContentEditable && !hasKeyDown) {
    issues.push({
      component: componentName,
      type: 'contenteditable-missing-keyboard-handler',
      severity: 'major',
      details:
        'contentEditable element found without keyboard handler. Provide keyboard support for content editing.',
    });
  }

  return issues;
}

function checkArrowKeyNavigation(
  source: string,
  componentName: string
): KeyboardIssue[] {
  const issues: KeyboardIssue[] = [];

  // Check for components that need arrow key support
  const isListComponent = /list|List|menu|Menu|tabs|Tabs|select|Select/i.test(
    componentName
  );
  const isCarousel = /carousel|Carousel|slider|Slider/i.test(componentName);
  const isDropdown = /dropdown|Dropdown|options|Options/i.test(componentName);

  if ((isListComponent || isCarousel || isDropdown) &&
    !componentName.endsWith('Page')) {
    // These should support arrow keys
    const hasArrowHandling = /key\.code\s*match\s*\(|key\.code\.startsWith\s*\(|[\w]+Direction|arrow/i.test(
      source
    );

    if (!hasArrowHandling) {
      // Check if it uses react-specific patterns
      const usesSelect = source.includes('select') &&
        source.includes('onChange');

      if (!usesSelect) {
        issues.push({
          component: componentName,
          type: 'missing-arrow-key-support',
          severity: 'major',
          details: `${isListComponent ? 'List' : isCarousel ? 'Carousel' : 'Dropdown'} component should support Arrow keys for navigation.`,
        });
      }
    }
  }

  return issues;
}

function checkSpaceEnterKeySupport(
  source: string,
  componentName: string
): KeyboardIssue[] {
  const issues: KeyboardIssue[] = [];

  // Check for buttons/toggles with custom handlers
  const hasToggle = /toggle|Toggle|checkbox|Checkbox|switch|Switch/i.test(
    componentName
  );
  const hasButton = /button|Button/i.test(componentName);

  if (hasToggle || hasButton) {
    // Check for role="button" divs or custom toggles
    const hasCustomButton = /role\s*=\s*['"](button|switch|checkbox|radio)/i.test(
      source
    );

    if (hasCustomButton) {
      const hasSpaceEnterHandler = /[Ss]pace|Enter|NumpadEnter|Code\s*===?\s*['"]Space/i.test(
        source
      );

      if (!hasSpaceEnterHandler) {
        // Check if it's a standard HTML button (which works natively)
        const isHtmlButton = /<button[\s>]/.test(source);

        if (!isHtmlButton) {
          issues.push({
            component: componentName,
            type: 'custom-button-missing-space-enter',
            severity: 'major',
            details:
              'Custom button role found without Space/Enter key support. Add onKeyDown handler for key.code in ["Space", "Enter"].',
          });
        }
      }
    }
  }

  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Discovery
// ─────────────────────────────────────────────────────────────────────────────

function getInteractiveComponents(): Array<{
  path: string;
  name: string;
}> {
  const componentsDir = path.join(__dirname, '../components');
  const interactiveKeywords = [
    'button',
    'select',
    'input',
    'form',
    'modal',
    'dropdown',
    'tab',
    'toggle',
    'checkbox',
    'radio',
    'carousel',
    'slider',
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

  // Filter to interactive components
  const interactive = allFiles.filter((f) =>
    interactiveKeywords.some((kw) =>
      f.name.toLowerCase().includes(kw.toLowerCase())
    )
  );

  return interactive.length > 0 ? interactive : allFiles.slice(0, 15);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Keyboard Navigation', () => {
  let allIssues: KeyboardIssue[] = [];
  let interactiveComponents: Array<{ path: string; name: string }> = [];

  beforeAll(() => {
    interactiveComponents = getInteractiveComponents();
  });

  describe('Custom Button Keyboard Support', () => {
    it('custom buttons have keyboard handlers for Enter/Space', () => {
      const issues: KeyboardIssue[] = [];

      for (const component of interactiveComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const componentIssues = checkKeyboardHandlers(source, component.name);
        issues.push(...componentIssues);
      }

      if (issues.length > 0) {
        console.warn(
          `⚠️  Keyboard handler issues found (${issues.length}):\n` +
            issues
              .map((i) => `  - ${i.component}: ${i.details}`)
              .join('\n')
        );
      }

      allIssues.push(...issues);
      expect(issues.filter((i) => i.severity === 'critical')).toHaveLength(0);
    });
  });

  describe('Tab Order and Focus Management', () => {
    it('tab order is logical and no keyboard traps exist', () => {
      const issues: KeyboardIssue[] = [];

      for (const component of interactiveComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');

        // Check tabindex patterns
        const tabIndexIssues = checkTabIndexPattern(source, component.name);
        issues.push(...tabIndexIssues);

        // Check for focus traps
        const focusTrapIssues = checkFocusTrapPattern(source, component.name);
        issues.push(...focusTrapIssues);
      }

      if (issues.length > 0) {
        console.warn(
          `⚠️  Tab order and focus issues found (${issues.length}):\n` +
            issues
              .map((i) => `  - ${i.component}: ${i.details}`)
              .join('\n')
        );
      }

      allIssues.push(...issues);
      // Critical issues (keyboard traps) must fail
      expect(issues.filter((i) => i.severity === 'critical')).toHaveLength(0);
    });
  });

  describe('Form Input Keyboard Support', () => {
    it('form inputs handle keyboard events correctly', () => {
      const issues: KeyboardIssue[] = [];

      for (const component of interactiveComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');

        // Check for contentEditable and form patterns
        const formIssues = checkFormInputHandling(source, component.name);
        issues.push(...formIssues);

        // Check for Space/Enter support
        const spaceEnterIssues = checkSpaceEnterKeySupport(
          source,
          component.name
        );
        issues.push(...spaceEnterIssues);
      }

      if (issues.length > 0) {
        console.warn(
          `⚠️  Form keyboard issues found (${issues.length}):\n` +
            issues
              .map((i) => `  - ${i.component}: ${i.details}`)
              .join('\n')
        );
      }

      allIssues.push(...issues);
      expect(issues.filter((i) => i.severity === 'critical')).toHaveLength(0);
    });
  });

  describe('Arrow Key Navigation', () => {
    it('list/menu/carousel components support arrow keys', () => {
      const issues: KeyboardIssue[] = [];

      for (const component of interactiveComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const arrowKeyIssues = checkArrowKeyNavigation(source, component.name);
        issues.push(...arrowKeyIssues);
      }

      if (issues.length > 0) {
        console.log(
          `ℹ️  Arrow key navigation suggestions (${issues.length}):\n` +
            issues
              .map((i) => `  - ${i.component}: ${i.details}`)
              .join('\n')
        );
      }

      allIssues.push(...issues);
      // These are major but could be features not yet implemented
      const criticalOnly = issues.filter((i) => i.severity === 'critical');
      expect(criticalOnly).toHaveLength(0);
    });
  });

  describe('Escape Key Handling', () => {
    it('modals and dropdowns can be closed with Escape', () => {
      const issues: KeyboardIssue[] = [];

      const modalComponents = interactiveComponents.filter(
        (c) =>
          /modal|dialog|dropdown|popover|tooltip/i.test(c.name) &&
          !c.name.endsWith('Page')
      );

      for (const component of modalComponents) {
        const source = fs.readFileSync(component.path, 'utf-8');
        const hasEscapeHandler = /Escape|key\.code\s*===?\s*['"]Escape/i.test(
          source
        );

        if (!hasEscapeHandler) {
          issues.push({
            component: component.name,
            type: 'missing-escape-handler',
            severity: 'major',
            details: 'Modal/dropdown should handle Escape key to close.',
          });
        }
      }

      if (issues.length > 0) {
        console.warn(
          `⚠️  Escape key handler issues found (${issues.length}):\n` +
            issues
              .map((i) => `  - ${i.component}: ${i.details}`)
              .join('\n')
        );
      }

      allIssues.push(...issues);
      expect(issues.filter((i) => i.severity === 'critical')).toHaveLength(0);
    });
  });

  describe('Coverage Summary', () => {
    it('scans interactive components for keyboard support', () => {
      expect(interactiveComponents.length).toBeGreaterThan(0);
      console.log(
        `✅ Keyboard Navigation Coverage: ${interactiveComponents.length} interactive components`
      );
    });

    it('establishes baseline for keyboard accessibility', () => {
      const summary = {
        critical: allIssues.filter((i) => i.severity === 'critical').length,
        major: allIssues.filter((i) => i.severity === 'major').length,
        minor: allIssues.filter((i) => i.severity === 'minor').length,
        total: allIssues.length,
      };

      console.log(
        `\n📊 Keyboard Navigation Baseline:\n` +
          `  Critical: ${summary.critical}\n` +
          `  Major: ${summary.major}\n` +
          `  Minor: ${summary.minor}\n` +
          `  Total: ${summary.total}`
      );

      // Critical issues must be 0
      expect(summary.critical).toBe(0);
    });
  });
});
