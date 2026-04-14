# Deprecated Files & Legacy Code

This folder contains files from the old dashboard implementation that have been **superseded by the Next.js 14 React migration**.

## Files

### HTML & Redirection
- **`_redirect_to_wealth_dash.html`** - Old redirect page (replaced by Next.js routing)
- **`index.html`** - Static HTML placeholder (replaced by dynamic React pages)

### Scripts (Pre-React)
- **`test_tab_visibility.mjs`** - Old tab visibility test (replaced by Playwright E2E)
- **`extract_components.py`** - Component extraction script (no longer needed)
- **`test_all_components.py`** - Old component test runner (replaced by Vitest + Playwright)

### Reports (Historical)
- **`DIAGNOSTIC_REPORT_2026-04-14.md`** - Diagnostic report from old system
- **`DASHBOARD_PARTIALS_ISSUE_SUMMARY.md`** - Issue summary from old architecture
- **`COMPONENT_TEST_RESULTS.md`** - Test results from old testing framework

## Why Deprecated?

The **Next.js 14 migration** replaced:
- ❌ Static HTML pages → ✅ Dynamic React components with SSG/ISR
- ❌ Vanilla JavaScript → ✅ TypeScript + React ecosystem
- ❌ Jinja2 templates → ✅ TSX components
- ❌ Manual testing scripts → ✅ Vitest + Playwright automation

## Usage

Do NOT use these files in the current application. If you need to reference old behavior:
1. Check git history: `git log --oneline -- _deprecated/`
2. Create an issue if you need to port something to the new stack
3. Follow new architecture patterns in `react-app/src/`

## Future Cleanup

These files can be permanently removed after:
- [ ] Phase 5.2: Full test coverage (100% components tested)
- [ ] Phase 5.3: Playwright E2E validation complete
- [ ] Stakeholder sign-off on new dashboard feature parity
