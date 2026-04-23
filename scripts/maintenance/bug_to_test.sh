#!/bin/bash
# Bug-to-Test Workflow
# ====================
#
# When bug found in production:
#   ./bug_to_test.sh "Bug: fmtPrivacy shows R$3.5M as R$245 when value <0.01"
#
# Generates:
# - Test template (Phase X, which test)
# - Root cause analysis checklist
# - Commit message template
# - Lesson learned documentation
#
# Usage:
#   ./bug_to_test.sh "Bug description"
#   ./bug_to_test.sh "Bug description" --component ComponentName
#   ./bug_to_test.sh "Bug description" --test-file test_name.py

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <bug_description> [--component ComponentName] [--test-file test_name.py]"
    echo ""
    echo "Example:"
    echo "  $0 \"Bug: fmtPrivacy shows R\$3.5M as R\$245 when value <0.01\""
    echo "  $0 \"Bug: chart not rendering in hidden tab\" --component Dashboard"
    exit 1
fi

BUG_DESC="$1"
COMPONENT=""
TEST_FILE=""

shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --component)
            COMPONENT="$2"
            shift 2
            ;;
        --test-file)
            TEST_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Determine phase and test file if not specified
if [ -z "$TEST_FILE" ]; then
    if [[ "$BUG_DESC" =~ "privacy" ]] || [[ "$BUG_DESC" =~ "fmtPrivacy" ]] || [[ "$BUG_DESC" =~ "magnitude" ]]; then
        TEST_FILE="test_privacy_magnitude_preserved"
        PHASE="Phase 1"
    elif [[ "$BUG_DESC" =~ "chart" ]] || [[ "$BUG_DESC" =~ "render" ]] || [[ "$BUG_DESC" =~ "hidden" ]]; then
        TEST_FILE="test_chart_hidden_tab_render"
        PHASE="Phase 3"
    elif [[ "$BUG_DESC" =~ "data" ]] || [[ "$BUG_DESC" =~ "export" ]] || [[ "$BUG_DESC" =~ "pipeline" ]]; then
        TEST_FILE="test_config_export_completeness"
        PHASE="Phase 2"
    elif [[ "$BUG_DESC" =~ "import" ]] || [[ "$BUG_DESC" =~ "component" ]] || [[ "$BUG_DESC" =~ "secOpen" ]]; then
        TEST_FILE="test_pages_use_secopen"
        PHASE="Phase 3"
    else
        TEST_FILE="test_custom_regression"
        PHASE="Custom"
    fi
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUG_ID="BUG-$TIMESTAMP"
REPORT_FILE="/tmp/bug_analysis_${TIMESTAMP}.md"

cat > "$REPORT_FILE" << 'EOF'
# Bug Analysis & Test Plan
EOF

echo "" >> "$REPORT_FILE"
echo "**Bug ID:** $BUG_ID" >> "$REPORT_FILE"
echo "**Reported:** $(date)" >> "$REPORT_FILE"
echo "**Description:** $BUG_DESC" >> "$REPORT_FILE"
if [ -n "$COMPONENT" ]; then
    echo "**Component:** $COMPONENT" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << 'EOF'

## Root Cause Analysis Checklist

- [ ] **Reproduce locally** — Can you trigger the bug consistently?
- [ ] **Identify component/file** — Where is the broken code?
- [ ] **Check recent commits** — What changed before the bug appeared?
- [ ] **Diff against stable** — How does current code differ from working version?
- [ ] **Review related tests** — Why didn't existing tests catch this?
- [ ] **Check edge cases** — Does it happen with specific values (negative, <0.01, >1M)?
- [ ] **Trace data flow** — Does data come from Python or React?
- [ ] **Verify config sync** — Is spec.json ↔ config.ts ↔ page synchronized?

## Test Strategy

EOF

if [ "$PHASE" == "Phase 1" ]; then
    cat >> "$REPORT_FILE" << 'EOF'
**Phase:** Phase 1 (Foundation)

### Test Template
```python
def test_bug_<timestamp>(self):
    """Regression test: <bug description>"""
    # Setup

    # Action

    # Assert: Bug should be fixed
```

### Common Phase 1 Patterns
- spec.json ↔ config.ts sync issues
- Schema missing or misnamed fields
- Privacy magnitude edge cases (<0.01, negative, >1M)

### Test Command
```bash
pytest scripts/tests/test_privacy_magnitude_preserved.py -v
```

EOF
elif [ "$PHASE" == "Phase 2" ]; then
    cat >> "$REPORT_FILE" << 'EOF'
**Phase:** Phase 2 (Data Pipeline)

### Test Template
```python
def test_bug_<timestamp>(self):
    """Regression test: <bug description>"""
    # Setup: Call generate_data.py or reconstruct_history.py

    # Action: Validate output

    # Assert: Bug should be fixed
```

### Common Phase 2 Patterns
- Modified Dietz temporal weighting
- yfinance end-of-month returns
- RF MtM vs cost basis
- Data export completeness

### Test Command
```bash
pytest scripts/tests/test_data_pipeline.py -v
```

EOF
elif [ "$PHASE" == "Phase 3" ]; then
    cat >> "$REPORT_FILE" << 'EOF'
**Phase:** Phase 3 (Components & Charts)

### Test Template
```typescript
describe("Bug fix: <bug description>", () => {
    it("should render correctly in hidden tabs", () => {
        // Setup: Render component with display:none

        // Action: Trigger chart render

        // Assert: Bug should be fixed
    });
});
```

### Common Phase 3 Patterns
- Charts not rendering in display:none containers (offsetWidth=0)
- fmtPrivacy imports missing in new components (44+ components)
- secOpen() accessor bypassed (direct portfolio access)

### Test Command
```bash
pytest scripts/tests/test_chart_hidden_tab_render.py -v
```

EOF
fi

cat >> "$REPORT_FILE" << 'EOF'

## Implementation Steps

1. **Write failing test** — Test should fail with current code
   ```bash
   cd /home/user/wealth
   pytest scripts/tests/<test_file> -v
   ```

2. **Identify root cause** — Debug checklist above

3. **Fix the code** — Minimal change to make test pass

4. **Run all tests** — Ensure no regressions
   ```bash
   npm run test:pre-commit
   ```

5. **Document lesson learned** — Add to CONTRIBUTING.md or issue

6. **Commit with reference**
   ```bash
   git add .
   git commit -m "fix: <brief description>

   Fixes bug <BUG_ID> (regression test added).
   Root cause: <one line explanation>

   Related: scripts/tests/<test_file>"
   ```

## Commit Message Template

```
fix: <brief description>

Fixes bug <BUG_ID>

Root cause: <one line explanation of why bug happened>

Changes:
- <change 1>
- <change 2>

Regression test: scripts/tests/<test_file>.py

Related issue: <link if applicable>
```

## Lesson Learned

- **Pattern:** <What pattern does this bug represent?>
- **Prevention:** <How should we prevent this in the future?>
- **Affected tests:** <Which tests should have caught this?>
- **Documentation:** Update CONTRIBUTING.md section: <which section?>

---

**Next steps:**
1. Review this analysis
2. Write and run test
3. Fix code
4. Document lesson learned
5. Commit with template above

EOF

echo "✅ Bug analysis report written to: $REPORT_FILE"
echo ""
echo "=== BUG ANALYSIS REPORT ==="
cat "$REPORT_FILE"
echo ""
echo "=== QUICK REFERENCE ==="
echo "Bug ID: $BUG_ID"
echo "Phase: $PHASE"
echo "Test file: scripts/tests/${TEST_FILE}.py"
if [ -n "$COMPONENT" ]; then
    echo "Component: $COMPONENT"
fi
echo ""
echo "Next step: Review analysis, write test, fix code, commit"
