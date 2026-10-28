---
name: semgrep
description: >-
  Perform Static Application Security Testing (SAST) on TypeScript, JavaScript, Python, and SQL code using Semgrep.
  Use this skill to detect security flaws, injection vulnerabilities, insecure configs, and code quality issues.
---

# Semgrep Skill: Static Application Security Testing (SAST)

[Semgrep](https://github.com/semgrep/semgrep) is a fast, lightweight static analysis engine for finding security bugs, enforcing secure coding standards, and catching anti-patterns in source code without requiring a full build.

## Scanner Execution

### Run Security Audit with Rulesets
Runs Semgrep with standard OWASP and security rules, generating a machine-readable JSON report:

```powershell
$env:SEMGREP_SEND_METRICS="off"
python -c "import sys; from semgrep.cli import cli; sys.argv=['semgrep', 'scan', '--config', 'p/security-audit', '--config', 'p/owasp-top-ten', '--config', 'p/typescript', '--json', '-o', '.agents/reports/semgrep-report.json', '--exclude', 'node_modules', '--exclude', 'tools/repos', '--exclude', 'dist']; cli()"
```

### Run Quick Terminal Scan
To print a colorful summary directly in the terminal:

```powershell
$env:SEMGREP_SEND_METRICS="off"
python -c "import sys; from semgrep.cli import cli; sys.argv=['semgrep', 'scan', '--config', 'p/default', '--exclude', 'node_modules', '--exclude', 'tools/repos', '--exclude', 'dist']; cli()"
```

## Parsing Findings

The report is written in JSON to [.agents/reports/semgrep-report.json](file:///.agents/reports/semgrep-report.json).
Each finding in `results` contains:
- `check_id`: Rule identifier (e.g. `typescript.react.security.audit.react-dangerouslysetinnerhtml`).
- `path`: File location where the issue was found.
- `start` & `end`: Line numbers and column boundaries.
- `extra.message`: Description of why the pattern is unsafe and guidance on fixing it.
- `extra.severity`: Severity rating (`ERROR`, `WARNING`, `INFO`).
- `extra.metadata.cwe` / `owasp`: Relevant CWE classification and OWASP Top 10 category.

## Remediation Workflow
1. **Analyze Vulnerable Pattern**: Inspect the flagged file and lines.
2. **Apply Security Best Practice**:
   - Sanitize inputs with libraries or Zod schemas.
   - Avoid `eval`, `dangerouslySetInnerHTML`, unparameterized queries, or weak cryptographic ciphers.
3. **Verify Fix**: Re-run Semgrep on the specific file:
   ```powershell
   python -c "import sys; from semgrep.cli import cli; sys.argv=['semgrep', 'scan', '--config', 'p/default', 'path/to/file.ts']; cli()"
   ```
4. Confirm 0 residual high/error findings.
