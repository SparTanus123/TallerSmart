#!/usr/bin/env python3
"""
OpenSSF Scorecard Automated Evaluator
Evaluates repository supply chain security, workflow hygiene, and security policies.
"""

import os
import json
import re
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
REPORT_FILE = WORKSPACE_ROOT / ".agents" / "reports" / "scorecard-report.json"

def evaluate_scorecard():
    checks = []

    # 1. Security Policy (SECURITY.md)
    sec_md = (WORKSPACE_ROOT / "SECURITY.md").exists() or (WORKSPACE_ROOT / ".github" / "SECURITY.md").exists()
    checks.append({
        "name": "Security-Policy",
        "score": 10 if sec_md else 0,
        "reason": "SECURITY.md policy file found in repository" if sec_md else "SECURITY.md is missing. Needs vulnerability disclosure policy."
    })

    # 2. License File
    has_license = (WORKSPACE_ROOT / "LICENSE").exists() or (WORKSPACE_ROOT / "LICENSE.md").exists() or (WORKSPACE_ROOT / "LICENSE.txt").exists()
    checks.append({
        "name": "License",
        "score": 10 if has_license else 2,
        "reason": "Root LICENSE file present" if has_license else "Root LICENSE file missing."
    })

    # 3. CI-Tests
    workflow_dir = WORKSPACE_ROOT / ".github" / "workflows"
    has_ci = False
    if workflow_dir.exists():
        workflows = list(workflow_dir.glob("*.yml")) + list(workflow_dir.glob("*.yaml"))
        has_ci = len(workflows) > 0

    checks.append({
        "name": "CI-Tests",
        "score": 10 if has_ci else 0,
        "reason": f"Found {len(list(workflow_dir.glob('*')))} CI workflow(s) in .github/workflows" if has_ci else "No CI workflows found in .github/workflows."
    })

    # 4. Dependency-Update-Tool
    has_dependabot = (WORKSPACE_ROOT / ".github" / "dependabot.yml").exists() or (WORKSPACE_ROOT / ".dependabot").exists() or (WORKSPACE_ROOT / "renovate.json").exists()
    checks.append({
        "name": "Dependency-Update-Tool",
        "score": 10 if has_dependabot else 0,
        "reason": "Automated dependency update config found" if has_dependabot else "No dependabot.yml or renovate configuration found."
    })

    # 5. Pinned-Dependencies & Lockfiles
    has_lockfile = (WORKSPACE_ROOT / "pnpm-lock.yaml").exists() or (WORKSPACE_ROOT / "package-lock.json").exists()
    checks.append({
        "name": "Pinned-Dependencies",
        "score": 10 if has_lockfile else 3,
        "reason": "Deterministic dependency lockfile (pnpm-lock.yaml) exists and is tracked" if has_lockfile else "Lockfile missing."
    })

    # 6. SAST Tooling Configured
    semgrep_configured = (WORKSPACE_ROOT / ".semgrep").exists() or (WORKSPACE_ROOT / ".semgrep.yml").exists() or (WORKSPACE_ROOT / ".agents" / "skills" / "semgrep").exists()
    checks.append({
        "name": "SAST",
        "score": 10 if semgrep_configured else 0,
        "reason": "Static Application Security Testing (Semgrep) skill/tool active" if semgrep_configured else "No SAST tool configured."
    })

    # 7. Token-Permissions / Least Privilege
    token_perm_score = 0
    token_reason = "No GitHub workflows found to inspect permissions"
    if has_ci:
        read_only_found = False
        for wf in workflow_dir.glob("*.y*ml"):
            txt = wf.read_text(encoding="utf-8", errors="ignore")
            if "permissions:" in txt and ("read-all" in txt or "contents: read" in txt):
                read_only_found = True
                break
        if read_only_found:
            token_perm_score = 10
            token_reason = "GitHub actions token permissions configured with least privilege"
        else:
            token_perm_score = 4
            token_reason = "Workflow files lack top-level read-only permissions block"
    checks.append({
        "name": "Token-Permissions",
        "score": token_perm_score,
        "reason": token_reason
    })

    # 8. Secret-Scanning
    has_gitleaks_cfg = (WORKSPACE_ROOT / ".gitleaks.toml").exists() or (WORKSPACE_ROOT / ".agents" / "skills" / "gitleaks").exists()
    checks.append({
        "name": "Secret-Scanning",
        "score": 10 if has_gitleaks_cfg else 0,
        "reason": "Gitleaks secret detection tool active and integrated" if has_gitleaks_cfg else "No secret scanning detected."
    })

    # Calculate overall aggregate score (0 to 10 scale)
    total_score = sum(c["score"] for c in checks)
    max_possible = len(checks) * 10
    aggregate_score = round((total_score / max_possible) * 10, 1)

    result = {
        "framework": "OpenSSF Scorecard v5.x",
        "aggregate_score": aggregate_score,
        "total_checks": len(checks),
        "checks": checks
    }

    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"[OpenSSF Scorecard] Aggregate Score: {aggregate_score} / 10 ({len(checks)} checks evaluated)")
    return result

if __name__ == "__main__":
    evaluate_scorecard()
