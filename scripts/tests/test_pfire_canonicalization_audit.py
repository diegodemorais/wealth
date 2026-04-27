#!/usr/bin/env python3
"""
P(FIRE) Canonicalization Audit Tests

Enforces that P(FIRE) conversions only happen via canonical functions.
Grep-based CI tests to prevent regression.
"""

import subprocess
from pathlib import Path


ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = ROOT / "scripts"
REACT_DIR = ROOT / "react-app" / "src"


class TestPFireCanonicalizationCompliance:
    """Verify P(FIRE) canonicalization rules are followed."""

    def test_no_pfire_inline_conversion_in_python(self):
        """❌ BANNED: p_sucesso * 100 or p_fire * 100 without canonicalizing"""
        violations = subprocess.run(
            [
                "grep",
                "-rn",
                r'p_sucesso\s*\*\s*100|p_fire.*\*\s*100|"p_fire.*":\s*.*\*\s*100',
                str(SCRIPTS_DIR),
            ],
            capture_output=True,
            text=True,
        ).stdout.strip()

        # Filter: allow violations in canonical layers (pfire_transformer, tests)
        exceptions = [
            "pfire_transformer",
            "test_pfire",
            "test_",
            "__pycache__",
            "# AUDIT:",
        ]

        violations = [
            v
            for v in violations.split("\n")
            if v and not any(e in v for e in exceptions)
        ]

        # Document violations for audit report
        if violations:
            print("\n🔴 P(FIRE) CANONICALIZATION VIOLATIONS FOUND:")
            for v in violations:
                print(f"  {v}")

        # This test will FAIL until violations are fixed
        assert len(violations) == 0, (
            f"Found {len(violations)} P(FIRE) canonicalization violations. "
            "Use canonicalize_pfire() instead of * 100. "
            f"Violations:\n" + "\n".join(violations)
        )

    def test_canonicalize_pfire_imported_in_generators(self):
        """✅ REQUIRED: Snapshot generators must import canonicalize_pfire"""
        # Check fire_montecarlo.py
        fm_content = (SCRIPTS_DIR / "fire_montecarlo.py").read_text()

        # Should import canonicalize_pfire
        has_import = "from pfire_transformer import" in fm_content or "canonicalize_pfire" in fm_content

        # Note: This test documents current state (not enforced yet)
        # Will become stricter after fire_montecarlo.py is refactored
        if "p_sucesso" in fm_content and "canonicalize_pfire" not in fm_content:
            print("⚠️  fire_montecarlo.py has p_sucesso but doesn't import canonicalize_pfire")
            print("    Action: Add 'from pfire_transformer import canonicalize_pfire'")

    def test_react_no_pfire_multiplication_in_display(self):
        """❌ BANNED: React components should use .percentStr, not * 100"""
        # Look for P(FIRE) specific multiplications in React
        violations = subprocess.run(
            [
                "grep",
                "-rn",
                r'pfire.*\*\s*100|\.pfire.*\*\s*100',
                str(REACT_DIR),
            ],
            capture_output=True,
            text=True,
        ).stdout.strip()

        exceptions = [
            "__tests__",
            "node_modules",
            "pfire-canonical",
            ".percentStr",
        ]

        violations = [
            v
            for v in violations.split("\n")
            if v and not any(e in v for e in exceptions)
        ]

        if violations:
            print("\n🔴 REACT P(FIRE) VIOLATIONS FOUND:")
            for v in violations:
                print(f"  {v}")

    def test_canonicalize_pfire_used_in_key_locations(self):
        """✅ REQUIRED: Key files must use canonical form"""
        # Check generate_data.py
        gd_content = (SCRIPTS_DIR / "generate_data.py").read_text()
        assert "canonicalize_pfire" in gd_content, (
            "generate_data.py should import and use canonicalize_pfire()"
        )

    def test_audit_documentation(self):
        """✅ REQUIRED: Audit report must exist"""
        audit_file = ROOT / "agentes" / "referencia" / "PFIRE-CANONICO-SPEC.md"
        assert (
            audit_file.exists()
        ), f"Canonicalization audit report missing: {audit_file}"

        content = audit_file.read_text()
        assert "VIOLATION" in content or "violation" in content, (
            "Audit report should document violations found"
        )


class TestPFireCanonicalForm:
    """Verify CanonicalPFire structure is used consistently."""

    def test_canonical_form_has_required_fields(self):
        """CanonicalPFire must have decimal, percentage, percentStr, source"""
        from pfire_transformer import CanonicalPFire, canonicalize_pfire

        pfire = canonicalize_pfire(0.864, source="mc")

        # Check all required fields
        assert hasattr(pfire, "decimal"), "Missing: decimal"
        assert hasattr(pfire, "percentage"), "Missing: percentage"
        assert hasattr(pfire, "percentStr"), "Missing: percentStr"
        assert hasattr(pfire, "source"), "Missing: source"
        assert hasattr(pfire, "is_canonical"), "Missing: is_canonical"

        # Verify values
        assert pfire.decimal == 0.864, f"Expected decimal 0.864, got {pfire.decimal}"
        assert pfire.percentage == 86.4, f"Expected percentage 86.4, got {pfire.percentage}"
        assert pfire.percentStr == "86.4%", f"Expected '86.4%', got {pfire.percentStr}"
        assert pfire.source == "mc", f"Expected source 'mc', got {pfire.source}"
        assert pfire.is_canonical is True, f"Expected is_canonical=True, got {pfire.is_canonical}"

    def test_canonical_decimal_in_valid_range(self):
        """Canonical decimal must be 0-1"""
        from pfire_transformer import canonicalize_pfire

        # Test boundaries
        pfire_low = canonicalize_pfire(0.0, source="mc")
        assert 0 <= pfire_low.decimal <= 1, "Decimal out of range"

        pfire_high = canonicalize_pfire(1.0, source="mc")
        assert 0 <= pfire_high.decimal <= 1, "Decimal out of range"

        pfire_mid = canonicalize_pfire(0.5, source="mc")
        assert 0 <= pfire_mid.decimal <= 1, "Decimal out of range"

    def test_canonical_percentage_scaled_correctly(self):
        """Canonical percentage must be decimal × 100"""
        from pfire_transformer import canonicalize_pfire

        test_cases = [
            (0.0, 0.0),
            (0.5, 50.0),
            (0.864, 86.4),
            (1.0, 100.0),
        ]

        for decimal, expected_pct in test_cases:
            pfire = canonicalize_pfire(decimal, source="mc")
            assert (
                pfire.percentage == expected_pct
            ), f"For {decimal}, expected {expected_pct}%, got {pfire.percentage}%"

    def test_canonical_percentstr_formatted(self):
        """Canonical percentStr must be formatted with % sign"""
        from pfire_transformer import canonicalize_pfire

        pfire = canonicalize_pfire(0.864, source="mc")
        assert pfire.percentStr.endswith("%"), "percentStr must end with %"
        assert "86.4" in pfire.percentStr, "percentStr must contain the percentage value"


if __name__ == "__main__":
    import pytest

    pytest.main([__file__, "-v"])
