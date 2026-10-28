---
name: openssf-scorecard
description: >-
  Assess repository security health, supply chain defenses, and engineering best practices using OpenSSF Scorecard.
  Use this skill to audit branch protection, token permissions, CI automation, and dependency pinning.
---

# OpenSSF Scorecard Skill: Repository Supply Chain Security

[OpenSSF Scorecard](https://github.com/ossf/scorecard) evaluates open source repositories and software supply chains against critical security best practices.

## Checks Evaluated by Scorecard

1. **Branch-Protection**: Branch rules prevent unreviewed direct pushes to `main`.
2. **CI-Tests**: Continuous integration runs automated tests on pull requests.
3. **CII-Best-Practices**: Core Infrastructure Initiative badge criteria.
4. **Dangerous-Workflow**: GitHub Actions workflows avoid untrusted script execution.
5. **Dependency-Update-Tool**: Automated tools (Dependabot/Renovate) keep dependencies up to date.
6. **Maintained**: Active commits, issue response, and project health.
7. **Pinned-Dependencies**: GitHub actions and external build tools are pinned to immutable commit hashes (SHAs).
8. **SAST**: Static analysis tooling (e.g. Semgrep, CodeQL) runs in CI.
9. **Security-Policy**: Presence of `SECURITY.md` detailing vulnerability disclosure guidelines.
10. **Token-Permissions**: Workflows adhere to least privilege (`contents: read`).
11. **Vulnerabilities**: Zero unpatched CVEs in the codebase.

## Audit Execution

Run the Scorecard repository evaluator:

```powershell
python tools/scripts/audit_scorecard.py
```

The report is written to [.agents/reports/scorecard-report.json](file:///.agents/reports/scorecard-report.json).

## Remediation Workflow
1. Check the aggregate score and individual check marks in `scorecard-report.json`.
2. Add missing repository files (e.g. `SECURITY.md`, PR templates, GitHub Actions workflow with pinned hashes).
3. Restrict `GITHUB_TOKEN` permissions in `.github/workflows/`.
4. Re-run `audit_scorecard.py` to confirm score improvement.
