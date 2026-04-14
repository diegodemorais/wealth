# Comprehensive Test Strategy

## Overview

This document outlines the **three-tier testing strategy** for the Next.js 14 wealth management dashboard migration.

## Tier 1: Unit Tests (Vitest)

**Purpose:** Test individual utilities and business logic in isolation.

### Coverage Areas

#### Utilities (`src/utils/__tests__/`)

- **`formatters.test.ts`** - Format functions (BRL, USD, percentages, dates, deltas)
  - ✅ Number formatting with locale-specific rules
  - ✅ Currency conversion (BRL ↔ USD)
  - ✅ Null/undefined handling
  - ✅ Status color mapping

- **`montecarlo.test.ts`** - Monte Carlo simulation engine
  - ✅ Trajectory generation (correct count, length, initial values)
  - ✅ Contributions applied correctly
  - ✅ Percentile calculations (P10 ≤ P50 ≤ P90)
  - ✅ Success rate accuracy (0-1 range)
  - ✅ Stress level effect on outcomes
  - ✅ Return assumptions applied correctly

- **`dataWiring.test.ts`** - Derived values computation
  - ✅ Net worth calculation from positions
  - ✅ USD conversion using FX rate
  - ✅ FIRE percentage (0-1 range)
  - ✅ Wellness score (0-100)
  - ✅ Wellness status classification
  - ✅ FIRE date projection

- **`wellness.test.ts`** - Wellness scoring algorithm
  - ✅ Score bounds (0-100)
  - ✅ Factor weighting (FIRE%, tracking, equity allocation)
  - ✅ Status determination (critical/warning/ok/excellent)
  - ✅ Color/label mapping for UI display
  - ✅ Edge cases (all zeros, all ones)

#### Store Tests (`src/store/__tests__/`)

- **`dashboardStore.test.ts`** - Zustand store state management
  - ✅ Data loading and derived value computation
  - ✅ Single field updates with recalculation
  - ✅ MC parameter initialization and updates
  - ✅ MC results storage and retrieval
  - ✅ RunMC action with default/custom params
  - ✅ Stress level impact on simulations
  - ✅ Stress shock management (return, volatility, contribution)

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui

# CI mode (single run, coverage)
npm run test:ci
```

## Tier 2: Component Tests (React Testing Library)

**Purpose:** Test component rendering, props handling, and user interactions.

### Planned Coverage (To be added)

- **KPI Cards** - Value display, delta formatting, status colors
- **Charts** - Canvas rendering, data binding, privacy mode masking
- **Sliders** - Value changes, event handling, min/max bounds
- **Collapsible Sections** - Toggle state, smooth animations
- **Store Integration** - Component reading/writing to Zustand store

### Example Structure

```typescript
// src/components/__tests__/KpiCard.test.tsx
describe('KpiCard', () => {
  it('renders value with correct formatting', () => {
    render(<KpiCard value={1000000} label="Net Worth" />);
    expect(screen.getByText(/1\.0M|1,000,000/)).toBeInTheDocument();
  });
  
  it('applies status color based on delta', () => {
    const { container } = render(
      <KpiCard value={100} delta={0.1} label="Test" status="ok" />
    );
    expect(container).toHaveTextContent(/✓|+/); // positive indicator
  });
});
```

## Tier 3: End-to-End Tests (Playwright)

**Purpose:** Test complete user workflows across real browser environments.

### Coverage Areas

#### Navigation (`e2e/navigation.spec.ts`)
- ✅ All 7 tabs visible and clickable
- ✅ Tab routing works (URL updates)
- ✅ Active tab highlighting
- ✅ Page loading states (no infinite loading)
- ✅ Error handling (no error dialogs)

#### Charts (`e2e/charts.spec.ts`)
- ✅ Chart containers rendered
- ✅ Canvas/SVG elements present
- ✅ Data binding (charts display data, not empty)
- ✅ Collapsible sections toggle
- ✅ Hover interactions (tooltips if applicable)

#### Simulators (`e2e/simulators.spec.ts`)
- ✅ All 4 sliders present and adjustable
- ✅ Slider changes trigger simulations
- ✅ Success rate percentage displays (0-100%)
- ✅ Drawdown histogram renders
- ✅ Monte Carlo trajectories update
- ✅ Stress level affects outcomes
- ✅ Monthly contribution affects projections

#### Privacy Mode (`e2e/privacy-and-design.spec.ts`)
- ✅ Privacy toggle visible and functional
- ✅ Sensitive values masked (blurred, —, •••)
- ✅ Tooltips disabled in privacy mode
- ✅ Privacy mode applies globally to all tabs
- ✅ Design consistency (colors, spacing, fonts)
- ✅ Responsive layout (desktop, tablet, mobile)
- ✅ Header/tabs remain visible when scrolling
- ✅ Text contrast meets WCAG standards

### Running E2E Tests

```bash
# Install Playwright browsers (one-time)
npx playwright install

# Run all E2E tests
npm run e2e

# UI mode (debug-friendly)
npm run e2e:ui

# Headed mode (see browser)
npm run e2e:headed

# Single test file
npx playwright test e2e/navigation.spec.ts

# Specific test
npx playwright test -g "navigating between tabs"
```

## CI/CD Integration

### Build Pipeline

All tests run automatically during build:

```bash
npm run build
# Internally runs:
# 1. npm run test:ci (Vitest with coverage)
# 2. next build (Next.js compilation)
# 3. npm run e2e (Playwright E2E tests) - TODO: add to pipeline
```

### Environment Setup

**Local Development:**
```bash
npm install
npm run test:watch     # Continuous testing
npm run dev            # Dev server on :3000
npm run e2e:ui         # Visual E2E debugging
```

**CI/CD (GitHub Actions, etc.):**
```bash
npm ci                 # Install from lock file
npm run test:ci        # Unit tests + coverage
npm run build:no-test  # Compile without test gate
npm run e2e            # Run E2E in headless mode
```

## Coverage Goals

| Layer | Target | Current |
|-------|--------|---------|
| **Unit Tests** | 80%+ of utils/store | 40% (formatters, montecarlo, dataWiring, wellness, store) |
| **Component Tests** | 60%+ of components | 0% (planned) |
| **E2E Tests** | All critical paths | 100% (navigation, charts, simulators, privacy, design) |
| **Overall** | 75%+ | Target for Phase 5 completion |

## Test Data

### Mock Data Strategy

- **`mockData`** in each test file provides realistic but minimal data
- Positions: SWRD, AVGS, IPCA+2050 (realistic Brazilian assets)
- Assumptions: 7% returns, 12% volatility, 15-year accumulation
- Cambio: 5.0 BRL/USD (realistic exchange rate)

### Fixtures (To be added)

```
tests/fixtures/
  ├── dashboard-data-2026-04-14.json
  ├── mc-results-1000-sims.json
  └── positions-snapshot.json
```

## Debugging Failed Tests

### Unit Tests

```bash
# Run single test file
npm run test src/utils/__tests__/formatters.test.ts

# Run with debug output
DEBUG=* npm run test

# Debug in VS Code
# Add breakpoint, then: npm run test:watch
```

### E2E Tests

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Screenshot on failure
npx playwright test --screenshot=only-on-failure

# Trace mode
npx playwright test --trace=on
```

## Maintenance

### When to Add Tests

✅ **Do add tests for:**
- New utilities or complex calculations
- Store actions or state changes
- User-facing workflows (tabs, clicks, data display)
- Privacy/security features
- Breaking changes to existing APIs

❌ **Don't add tests for:**
- Styling-only changes (handled by E2E visual inspection)
- Third-party library behavior (Chart.js, Zustand, Next.js)
- Trivial getters/setters without side effects

### Test Review Checklist

Before committing tests:
- [ ] All tests pass locally (`npm run test:ci && npm run e2e`)
- [ ] No hardcoded timeouts (use `waitFor` instead)
- [ ] No flaky tests (run 5× consecutively)
- [ ] Meaningful assertion messages
- [ ] No test dependencies (each test is independent)
- [ ] Coverage maintained or improved

## Future Enhancements

- [ ] Visual regression testing (Percy, Chromatic)
- [ ] Performance testing (Lighthouse, Web Vitals)
- [ ] Accessibility testing (axe-core, Playwright a11y)
- [ ] Load testing (k6, Apache JMeter)
- [ ] Contract testing (data schema validation)

## References

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
