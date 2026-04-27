"""
Validation Framework for Data Pipeline

Provides:
- SnapshotValidator: Check individual snapshot validity
- DataJsonValidator: Check SSOT completeness and consistency
- ValidationError: Custom exception for validation failures
"""

import math
from datetime import datetime
from typing import Any, Dict, List, Optional
from pathlib import Path

from snapshot_schemas import EXPECTED_SCHEMA_VERSIONS


class ValidationError(Exception):
    """Raised when validation fails."""
    pass


class SnapshotValidator:
    """Validate individual snapshot files."""

    @staticmethod
    def validate_metadata(
        snapshot_name: str,
        data: Dict[str, Any],
        max_age_hours: int = 24,
    ) -> None:
        """
        Validate snapshot has required metadata.

        Args:
            snapshot_name: Name of snapshot (e.g., "macro_snapshot")
            data: Snapshot data dict
            max_age_hours: Maximum age in hours before considered stale

        Raises:
            ValidationError: If validation fails
        """
        # Check required fields
        required_fields = ["_schema_version", "_generated", "_window_id"]
        for field in required_fields:
            if field not in data:
                raise ValidationError(
                    f"{snapshot_name} missing required metadata field: {field}"
                )

        # Validate schema version
        expected_version = EXPECTED_SCHEMA_VERSIONS.get(snapshot_name)
        if expected_version:
            actual_version = data["_schema_version"]
            if actual_version != expected_version:
                raise ValidationError(
                    f"{snapshot_name} schema version mismatch: "
                    f"expected {expected_version}, got {actual_version}"
                )

        # Validate _generated timestamp format and freshness
        generated_str = data["_generated"]
        try:
            # Handle both "2026-04-26T22:30:45Z" and "2026-04-26T22:30:45+00:00"
            if generated_str.endswith("Z"):
                generated_str_clean = generated_str[:-1] + "+00:00"
            else:
                generated_str_clean = generated_str
            generated = datetime.fromisoformat(generated_str_clean)
        except ValueError as e:
            raise ValidationError(
                f"{snapshot_name} has invalid _generated timestamp: {data['_generated']}"
            ) from e

        # Check freshness
        age_seconds = (datetime.utcnow().timestamp() - generated.timestamp())
        age_hours = age_seconds / 3600
        if age_hours > max_age_hours:
            raise ValidationError(
                f"{snapshot_name} is {age_hours:.1f}h old (max {max_age_hours}h). "
                f"Run: python scripts/reconstruct_{snapshot_name.replace('_snapshot', '')}.py"
            )

    @staticmethod
    def validate_window_id_consistency(
        snapshots: Dict[str, Dict[str, Any]],
        expected_window_id: str,
    ) -> None:
        """
        Verify all snapshots have matching _window_id.

        Args:
            snapshots: Dict of snapshot name -> data
            expected_window_id: Window ID all snapshots should have

        Raises:
            ValidationError: If any snapshot has mismatched window_id
        """
        mismatches = []
        for snapshot_name, data in snapshots.items():
            if not data:  # Skip empty snapshots
                continue
            actual_window_id = data.get("_window_id")
            if actual_window_id != expected_window_id:
                mismatches.append(
                    f"  {snapshot_name}: got {actual_window_id}"
                )

        if mismatches:
            raise ValidationError(
                f"Window ID mismatch (snapshots not from same generation):\n" +
                "\n".join(mismatches)
            )

    @staticmethod
    def validate_completeness(
        snapshots: Dict[str, Dict[str, Any]],
        required_snapshots: Optional[List[str]] = None,
    ) -> None:
        """
        Check that required snapshots are present and not empty.

        Args:
            snapshots: Dict of snapshot name -> data
            required_snapshots: List of snapshot names that must exist.
                               If None, uses default set.

        Raises:
            ValidationError: If required snapshot missing
        """
        if required_snapshots is None:
            required_snapshots = [
                "macro_snapshot",
                "factor_snapshot",
                "tax_snapshot",
                "fire_snapshot",
            ]

        for snapshot_name in required_snapshots:
            if snapshot_name not in snapshots or not snapshots[snapshot_name]:
                raise ValidationError(
                    f"Required snapshot missing or empty: {snapshot_name}"
                )


class DataJsonValidator:
    """Validate final data.json (SSOT) for internal consistency."""

    @staticmethod
    def validate_structure(data: Dict[str, Any]) -> None:
        """
        Check data.json has required top-level structure.

        Args:
            data: data.json content

        Raises:
            ValidationError: If required fields missing
        """
        # Check root-level metadata
        required_root_fields = ["_generated", "_window_id"]
        for field in required_root_fields:
            if field not in data:
                raise ValidationError(f"data.json missing required root field: {field}")

    @staticmethod
    def validate_no_nan_inf(data: Dict[str, Any]) -> None:
        """
        Recursively check for NaN/Inf values.

        Args:
            data: Data structure to check

        Raises:
            ValidationError: If NaN or Inf found
        """
        DataJsonValidator._check_finite_recursive(data, "data")

    @staticmethod
    def _check_finite_recursive(obj: Any, path: str = "") -> None:
        """
        Recursively check that all floats are finite.

        Args:
            obj: Object to check
            path: Current path in data structure (for error messages)

        Raises:
            ValidationError: If non-finite float found
        """
        if isinstance(obj, dict):
            for key, value in obj.items():
                new_path = f"{path}.{key}" if path else key
                DataJsonValidator._check_finite_recursive(value, new_path)
        elif isinstance(obj, (list, tuple)):
            for i, value in enumerate(obj):
                new_path = f"{path}[{i}]"
                DataJsonValidator._check_finite_recursive(value, new_path)
        elif isinstance(obj, float):
            if not math.isfinite(obj):
                raise ValidationError(f"Non-finite number at {path}: {obj}")

    @staticmethod
    def validate_consistency_rules(data: Dict[str, Any]) -> None:
        """
        Validate semantic consistency rules specific to data.json.

        Examples:
        - If posicoes exist, sum should roughly match patrimonio total
        - P(FIRE) should be 0-100 or 0-1 (depending on representation)
        - Dates should be in valid range

        Args:
            data: data.json content

        Raises:
            ValidationError: If consistency rule violated
        """
        # Rule 1: posicoes sum should roughly match patrimonio
        if "posicoes" in data and isinstance(data["posicoes"], dict):
            posicoes_sum = sum(
                p.get("valor", 0)
                for p in (data["posicoes"].values() if data["posicoes"] else [])
                if isinstance(p, dict)
            )
            if "patrimonio" in data and isinstance(data["patrimonio"], dict):
                patrimonio_total = data["patrimonio"].get("total", 0)
                if patrimonio_total > 0:
                    diff_pct = abs(posicoes_sum - patrimonio_total) / patrimonio_total
                    if diff_pct > 0.05:  # Allow 5% difference
                        raise ValidationError(
                            f"Patrimonio mismatch: posicoes sum={posicoes_sum}, "
                            f"total={patrimonio_total} (diff {diff_pct*100:.1f}%)"
                        )

        # Rule 2: P(FIRE) should be in valid range
        for pfire_key in ["pfire_base", "pfire_aspiracional", "pfire_stress"]:
            if pfire_key in data and isinstance(data[pfire_key], dict):
                pfire = data[pfire_key]
                # Check if percentage representation (0-100) or decimal (0-1)
                if "percentage" in pfire:
                    value = pfire["percentage"]
                    if not (0 <= value <= 100):
                        raise ValidationError(
                            f"{pfire_key}.percentage out of range [0-100]: {value}"
                        )
                elif "decimal" in pfire:
                    value = pfire["decimal"]
                    if not (0 <= value <= 1):
                        raise ValidationError(
                            f"{pfire_key}.decimal out of range [0-1]: {value}"
                        )


def validate_pipeline_output(data: Dict[str, Any]) -> None:
    """
    Comprehensive validation of data.json output.

    Runs all validators in sequence. First failure raises ValidationError.

    Args:
        data: data.json content

    Raises:
        ValidationError: If any validation fails
    """
    DataJsonValidator.validate_structure(data)
    DataJsonValidator.validate_no_nan_inf(data)
    DataJsonValidator.validate_consistency_rules(data)
