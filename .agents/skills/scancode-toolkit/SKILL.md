---
name: scancode-toolkit
description: >-
  Scan files and codebases for licenses, copyrights, package manifests, and third-party code origins using ScanCode Toolkit.
  Use this skill to detect license obligations, copyleft code (GPL/AGPL), and copyright headers.
---

# ScanCode Toolkit Skill: License & Origin Detection

[ScanCode Toolkit](https://github.com/aboutcode-org/scancode-toolkit) is a comprehensive engine that scans source code and dependencies to detect license texts, copyright notices, author information, and package dependencies.

## Scanner Execution

### Source Code License Scan
Scans application source code excluding generated directories:

```powershell
scancode -l -c --json-pp .agents/reports/scancode-report.json apps/ packages/ --ignore "node_modules" --ignore ".next" --ignore "dist"
```

If running via Python executable directly:
```powershell
python -c "from scancode.cli import scancode_cli; import sys; sys.argv=['scancode', '-l', '-c', '--json-pp', '.agents/reports/scancode-report.json', 'apps/api/src', 'apps/web/src']; scancode_cli()"
```

### Lightweight Fast License Scan (Node Workspace)
For instant dependency license compliance auditing:
```powershell
npx --yes license-checker --json --out .agents/reports/licenses-summary.json
```

## Parsing Findings

The report is written in JSON to [.agents/reports/scancode-report.json](file:///.agents/reports/scancode-report.json).
Key properties to analyze:
- `files[].licenses`: Array of detected licenses (`spdx_license_key`, `key`, `category`).
- `files[].copyrights`: Copyright statements found in file headers.
- `files[].holders`: Detected copyright holders.

## Remediation Workflow
1. **Identify High-Risk Licenses**:
   - Check for viral copyleft licenses (e.g., `GPL-3.0`, `AGPL-3.0`) if building proprietary/commercial software.
   - Verify compatibility with permissive licenses (`MIT`, `Apache-2.0`, `BSD-3-Clause`).
2. **Missing Copyright / License Headers**: Add standardized license comments to proprietary source files.
3. **Dependency Replacement**: If a library carries an unacceptable license, isolate or replace it with a permissive alternative.
4. **Re-run Scan**: Verify all files meet compliance policies.
