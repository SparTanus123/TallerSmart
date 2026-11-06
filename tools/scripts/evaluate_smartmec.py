#!/usr/bin/env python3
"""
SmartMec AI Evaluation Runner & Report Generator
Executes the automotive benchmark against Google Gemini API,
computes quantitative & qualitative metrics, and generates
the formal evaluation report.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
REPORTS_DIR = WORKSPACE_ROOT / ".agents" / "reports"
DOCS_DIR = WORKSPACE_ROOT / "docs"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def run_evaluation():
    print("======================================================================")
    print("🔧 Running SmartMec AI Benchmark (Google Gemini Model Evaluation)...")
    print("======================================================================")

    ts_script = WORKSPACE_ROOT / "tools" / "scripts" / "evaluate_smartmec.ts"
    cmd = f'npx pnpm --filter @tallersmart/api exec tsx "{ts_script}" --run'

    proc = subprocess.run(cmd, shell=True, cwd=str(WORKSPACE_ROOT), capture_output=True, text=True)
    print(proc.stdout)
    if proc.stderr:
        print("STDERR / Warnings:", proc.stderr, file=sys.stderr)

    report_json = REPORTS_DIR / "smartmec-evaluation-results.json"
    api_report_json = WORKSPACE_ROOT / "apps" / "api" / ".agents" / "reports" / "smartmec-evaluation-results.json"
    target_json = report_json if report_json.exists() else api_report_json
    if not target_json.exists():
        print("❌ Error: Evaluation output file was not generated.", file=sys.stderr)
        return -1

    with open(target_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    summary = data.get("summary", {})
    details = data.get("details", [])

    print("\n✅ Evaluacion finalizada exitosamente.")
    print(f"Casos evaluados: {summary.get('totalCases')}")
    print(f"Tasa de éxito: {summary.get('passRate')}%")
    print(f"Latencia promedio: {summary.get('latency', {}).get('meanMs')} ms")
    return 0

if __name__ == "__main__":
    sys.exit(run_evaluation())
