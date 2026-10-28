---
name: security-qa-orchestrator
description: >-
  Orchestrate and coordinate all 10 security, compliance, quality, and E2E tools (Semgrep, Gitleaks, OSV-Scanner, ORT, ScanCode, ASVS, WSTG, ZAP, Playwright, Scorecard).
  Use this skill to execute the complete verification pipeline, aggregate findings, classify issues by severity, propose fixes, re-test, and determine remaining gaps for project completeness.
---

# Security & QA Master Orchestrator

This skill orchestrates the multi-tool security, compliance, and quality verification pipeline across the entire software lifecycle.

## Pipeline Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          Security & QA Orchestrator          │
                  └──────────────────────┬───────────────────────┘
                                         │
     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
     │                   │                               │                   │
┌────┴────────┐   ┌──────┴────────┐               ┌──────┴────────┐   ┌──────┴────────┐
│   CÓDIGO    │   │ DEPENDENCIAS  │               │   LICENCIAS   │   │ SEGURIDAD WEB │
│  Semgrep +  │   │  OSV-Scanner  │               │     ORT +     │   │ ASVS + WSTG + │
│  Gitleaks   │   │               │               │   ScanCode    │   │      ZAP      │
└────┬────────┘   └──────┬────────┘               └──────┬────────┘   └──────┬────────┘
     │                   │                               │                   │
     └───────────────────┼───────────────────────────────┼───────────────────┘
                         │                               │
                  ┌──────┴────────┐               ┌──────┴────────┐
                  │ FUNCIONAMIENTO│               │  REPOSITORIO  │
                  │   Playwright  │               │   Scorecard   │
                  └──────┬────────┘               └──────┬────────┘
                         │                               │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                     ┌──────────────────────────────────────┐
                     │          Unified Assessment          │
                     │  1. Ingest all tool reports          │
                     │  2. Classify & prioritize issues     │
                     │  3. Propose actionable fixes         │
                     │  4. Re-run scans to verify patches   │
                     │  5. Determine completeness checklist │
                     └──────────────────────────────────────┘
```

## Running the Master Pipeline

To execute all checks in sequence and produce a consolidated assessment report:

```powershell
python tools/scripts/run_orchestrator.py
```

Optional selective flags:
- `--stage code`: Run only Semgrep and Gitleaks.
- `--stage deps`: Run OSV-Scanner.
- `--stage licenses`: Run ORT and ScanCode.
- `--stage web`: Run ASVS, WSTG, and ZAP.
- `--stage e2e`: Run Playwright tests.
- `--stage repo`: Run Scorecard.

## Master Report Output
The aggregated results are compiled into:
- [.agents/reports/master-assessment.json](file:///.agents/reports/master-assessment.json)
- [.agents/reports/project-completeness.md](file:///.agents/reports/project-completeness.md)

## Six-Phase AI Analysis Workflow

1. **Ingetion**: Aggregate JSON outputs from each tool.
2. **Classification**: Categorize every detected issue by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`) and category (`Secret Leak`, `Known Vulnerability`, `Code Quality / SAST`, `License Incompatibility`, `Security Control Gap`, `Functional Failure`, `Repo Governance`).
3. **Remediation Plan**: Propose specific file edits, configuration changes, or dependency upgrades.
4. **Execution & Fixes**: Implement the patches.
5. **Re-Test Verification**: Re-run the affected tools to ensure 100% resolution.
6. **Project Completeness Assessment**: Measure adherence against OWASP ASVS Level 1/2 requirements, Scorecard benchmarks, and zero-critical vulnerability policies to determine what is required for full production release.
