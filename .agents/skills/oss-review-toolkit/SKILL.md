---
name: oss-review-toolkit
description: >-
  Verify open source software supply chain, dependency licenses, and governance policies using OSS Review Toolkit (ORT).
  Use this skill to automate software bill of materials (SBOM) checks, license compatibility, and policy compliance.
---

# OSS Review Toolkit (ORT) Skill: Open Source Compliance

[OSS Review Toolkit (ORT)](https://github.com/oss-review-toolkit/ort) provides tools to verify open source software dependencies, licenses, copyrights, and organizational policy rules across software packages.

## Scanning and Policy Evaluation

### Automated Policy Evaluation
ORT verifies that dependencies comply with license rules (e.g. prohibiting incompatible copyleft licenses in client bundles):

```powershell
# Analyze package manifests and evaluate policy compliance
python tools/scripts/run_ort_evaluation.py
```

### Docker Execution (Full ORT Pipeline)
When Docker Desktop is running:

```powershell
docker run --rm -v ${PWD}:/project ghcr.io/oss-review-toolkit/ort:latest analyze -i /project -o /project/.agents/reports/ort-analyzer
```

## Policy Rules
The ORT policy evaluator enforces:
1. **Permitted Licenses**: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, CC0-1.0.
2. **Restricted / Review Needed**: LGPL-2.1, LGPL-3.0, MPL-2.0.
3. **Prohibited (In Commercial/Proprietary Web Bundles)**: AGPL-3.0, GPL-3.0, SSPL, Commons Clause.

## Remediation Workflow
1. Read [.agents/reports/ort-compliance.json](file:///.agents/reports/ort-compliance.json).
2. Flag any dependency marked with `VIOLATION` or `REVIEW_REQUIRED`.
3. Swap the problematic dependency with a permissively licensed alternative.
4. Re-run compliance verification.
