---
name: osv-scanner
description: >-
  Scan open source dependencies for known security vulnerabilities (CVEs/GHSAs) using Google's OSV-Scanner.
  Use this skill to audit package.json, pnpm-lock.yaml, and other lockfiles for vulnerable dependencies.
---

# OSV-Scanner Skill: Dependency Vulnerability Audit

[OSV-Scanner](https://github.com/google/osv-scanner) is Google's vulnerability scanner for project dependencies, querying the open and distributed [OSV.dev](https://osv.dev) database for CVE and GHSA records across npm, pnpm, PyPI, Go, and more.

## Scanner Execution

### Scan Entire Workspace
Scans all manifests (`package.json`, `pnpm-lock.yaml`, etc.):

```powershell
& "C:\Users\danie\AppData\Local\Microsoft\WinGet\Packages\Google.OSVScanner_Microsoft.Winget.Source_8wekyb3d8bbwe\osv-scanner.exe" scan source -r . --format json --output .agents/reports/osv-scanner-report.json
```

### Human-Readable Table Scan
To print a formatted terminal summary:

```powershell
& "C:\Users\danie\AppData\Local\Microsoft\WinGet\Packages\Google.OSVScanner_Microsoft.Winget.Source_8wekyb3d8bbwe\osv-scanner.exe" scan source -r .
```

## Parsing Findings

The report is written in JSON to [.agents/reports/osv-scanner-report.json](file:///.agents/reports/osv-scanner-report.json).
Each vulnerability finding contains:
- `id`: OSV ID (e.g. `GHSA-xxxx` or `CVE-202X-xxxx`).
- `package`: Name and ecosystem of the affected package.
- `version`: Currently installed vulnerable version.
- `affected`: Version ranges impacted.
- `fixed`: First safe patched version.
- `database_specific.severity`: Severity score (CRITICAL, HIGH, MEDIUM, LOW) and CVSS metrics.

## Remediation Workflow
1. **Identify Fixed Version**: Check the recommended `fixed` version in the OSV report.
2. **Update Dependency**:
   - For direct dependencies, update `package.json` in `apps/api` or `apps/web`.
   - Run `npx pnpm install` to update `pnpm-lock.yaml`.
3. **Handle Transitive Dependencies**:
   - If transitive, add a `pnpm.overrides` section in root `package.json`.
4. **Re-run Scanner**: Verify that the identified CVE/GHSA no longer appears in `.agents/reports/osv-scanner-report.json`.
