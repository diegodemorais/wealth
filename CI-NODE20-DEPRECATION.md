# CI: Node.js 20 Actions Deprecated

**Type:** CI/CD - GitHub Actions Maintenance

**Status:** Active Warning

**Error Message:**
```
Node.js 20 is deprecated. The following actions target Node.js 20 
but are being forced to run on Node.js 24:
  - actions/checkout@v4
  - actions/setup-node@v4
  - actions/upload-pages-artifact@v3
```

## Impact
- Build warnings (non-blocking but noisy)
- Actions will eventually drop Node.js 20 support
- Proactive fix prevents future breaking changes

## Root Cause
GitHub Actions v4 versions have fallback behavior: they prefer Node.js 20 but gracefully degrade to 24 with a warning. To suppress the warning, we need to either:
1. Use environment variable to force Node.js 24
2. Pin specific action versions that default to Node.js 24

## Solutions Tested

### ✅ Current Workaround (in use)
Set environment variable in workflow jobs:
```yaml
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

This silences the warning but is not the "proper" fix.

### ❌ Alternative: Explicitly declare Node.js version
Some actions accept `node-version` parameter, but most v4 actions don't expose this.

### ✅ Proper Fix: Upgrade to newer action versions
Check if newer releases exist that default to Node.js 24:
- `actions/checkout@v5+` (if released)
- `actions/setup-node@v5+` (if released)
- `actions/upload-pages-artifact@v4+` (if released)

As of 2026-04-14, these are not yet released. Once available, upgrade to them.

## Current Workflow Location
`.github/workflows/deploy-dashboard.yml`

Current config:
```yaml
jobs:
  build:
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
  deploy:
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

## Action Items
- [ ] Monitor GitHub Actions releases for v5+ versions
- [ ] Once available, upgrade actions to v5+ (checkout, setup-node, upload-pages-artifact)
- [ ] Remove `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` environment variables
- [ ] Verify warnings disappear in next build

## Monitoring
Search `actions/checkout@v` and `actions/setup-node@v` in `.github/workflows/*.yml` to find any other usages.

Currently only in `deploy-dashboard.yml`.
