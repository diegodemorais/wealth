# Screenshot Audit Reference

**Last Updated:** 2026-04-15  
**Status:** Phase 2 Complete (v0.1.164) — Quant Analysis In Progress

## Directories

### Reference (HTML Stable v2.77)
```
/Users/diegodemorais/claude/code/wealth/react-app/analysis/screenshots/stable-v2.77/
├── 1.png
├── 2.png
├── ...
└── 25.png
```
Golden standard baseline for fidelity comparison.

### Current (React Dashboard)
```
/Users/diegodemorais/claude/code/wealth/react-app/audit-screenshots/
├── 01-now-tab.png
├── 02-portfolio-tab.png
├── 03-performance-tab.png
├── 04-fire-tab.png
├── 05-withdraw-tab.png
├── 06-simuladores-tab.png
└── 07-backtest-tab.png
```
Generated via Playwright e2e tests (regenerate each audit cycle).

## Regenerate Screenshots

```bash
cd /Users/diegodemorais/claude/code/wealth/react-app
SKIP_WEB_SERVER=1 npm run test:audit
```

## Analysis Checklist

- [ ] Phase 1: UX/UI Fidelity (COMPLETED v0.1.160 — 92%)
- [ ] Phase 2: Cosmetic Fixes (COMPLETED v0.1.164 — 95% target)
- [ ] Phase 3: Data/Information Gaps (IN PROGRESS — Quant analyzing)
  - [ ] Missing data structures (fire_matrix, dca_status)
  - [ ] Data completeness validation
  - [ ] Functional parity audit

## Notes

- Use these paths for recurring audits (retros, releases, comparisons)
- Reference screenshots are static baseline — only update when design formally approved
- Current screenshots regenerated fresh each cycle (not persisted in git)
