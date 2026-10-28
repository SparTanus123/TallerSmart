---
name: gitleaks
description: >-
  Detect secrets, API keys, passwords, private keys, and tokens within the codebase and Git history using Gitleaks.
  Use this skill when auditing the project for credentials leaks or before committing changes.
---

# Gitleaks Skill: Secret & Credential Scanning

[Gitleaks](https://github.com/gitleaks/gitleaks) scans code, configuration files, environment files, and Git commit history to find exposed credentials, private keys, JWT secrets, database connection strings, and cloud tokens.

## Scanner Execution

### Quick Scan (Current Working Tree)
To detect uncommitted and committed secrets in the workspace:

```powershell
& "C:\Users\danie\AppData\Local\Microsoft\WinGet\Packages\Gitleaks.Gitleaks_Microsoft.Winget.Source_8wekyb3d8bbwe\gitleaks.exe" detect --source . --no-git --report-path .agents/reports/gitleaks-report.json --report-format json --verbose
```

### Git History Scan
To detect secrets committed anywhere in the repository history:

```powershell
& "C:\Users\danie\AppData\Local\Microsoft\WinGet\Packages\Gitleaks.Gitleaks_Microsoft.Winget.Source_8wekyb3d8bbwe\gitleaks.exe" detect --source . --report-path .agents/reports/gitleaks-report.json --report-format json --verbose
```

## Parsing Findings

The report is written in JSON to [.agents/reports/gitleaks-report.json](file:///.agents/reports/gitleaks-report.json).
Each finding includes:
- `Description`: Type of secret (e.g., Generic API Key, AWS Access Key, Private Key).
- `File`: Relative file path.
- `StartLine` and `EndLine`: Exact line range of the leak.
- `Secret`: Matched secret string snippet.
- `Commit`: Git commit hash (if scanning history).

## Remediation Workflow
1. **Immediate Revocation**: Any real exposed credential must be invalidated and regenerated immediately.
2. **Environment Isolation**: Move secret values to `.env` files and verify `.env` is listed in `.gitignore`.
3. **Template Defaults**: Replace real tokens in `.env.example` with placeholders like `CHANGE_ME_SECRET`.
4. **Git History Scrubbing**: If committed in history, remove with `git filter-repo` or `git-filter-branch` if required.
5. **Re-run Scan**: Verify 0 findings are reported after applying fixes.
