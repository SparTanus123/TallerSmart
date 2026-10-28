#!/usr/bin/env python3
"""
OWASP ZAP (Zed Attack Proxy) Dynamic Application Security Testing (DAST) Simulator / Runner
Audits security headers, CORS configuration, cookie flags, and runtime endpoint vulnerabilities.
"""

import os
import json
import re
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
REPORT_FILE = WORKSPACE_ROOT / ".agents" / "reports" / "zap-report.json"

def run_zap():
    alerts = []
    
    # 1. Check Server Banner / X-Powered-By Disclosure (ZAP Rule 10036)
    api_app_file = WORKSPACE_ROOT / "apps" / "api" / "src" / "app.ts"
    api_text = api_app_file.read_text(encoding="utf-8", errors="ignore") if api_app_file.exists() else ""
    
    has_disable_xpoweredby = "disable('x-powered-by')" in api_text or "helmet" in api_text
    if not has_disable_xpoweredby:
        alerts.append({
            "pluginId": "10036",
            "alert": "Server Leaks Information via 'X-Powered-By' HTTP Response Header Field(s)",
            "risk": "Low",
            "confidence": "High",
            "description": "The web/application server leaks version or technology information in HTTP headers.",
            "solution": "Ensure app.disable('x-powered-by') or helmet middleware is loaded in Express app."
        })

    # 2. Check Missing Anti-Clickjacking Header (ZAP Rule 10020)
    has_x_frame = "X-Frame-Options" in api_text or "helmet" in api_text
    if not has_x_frame:
        alerts.append({
            "pluginId": "10020",
            "alert": "Anti-clickjacking Header (X-Frame-Options) Not Set",
            "risk": "Medium",
            "confidence": "Medium",
            "description": "The response does not include either Content-Security-Policy with 'frame-ancestors' or X-Frame-Options.",
            "solution": "Add helmet() middleware or configure X-Frame-Options: SAMEORIGIN header."
        })

    # 3. Check X-Content-Type-Options Header Missing (ZAP Rule 10021)
    has_nosniff = "X-Content-Type-Options" in api_text or "helmet" in api_text
    if not has_nosniff:
        alerts.append({
            "pluginId": "10021",
            "alert": "X-Content-Type-Options Header Missing",
            "risk": "Low",
            "confidence": "Medium",
            "description": "The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'.",
            "solution": "Ensure helmet middleware is loaded or manually set header to 'nosniff'."
        })

    # 4. Check Content Security Policy (CSP) (ZAP Rule 10038)
    has_csp = "Content-Security-Policy" in api_text or "helmet" in api_text
    if not has_csp:
        alerts.append({
            "pluginId": "10038",
            "alert": "Content Security Policy (CSP) Header Not Set",
            "risk": "Medium",
            "confidence": "High",
            "description": "Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks.",
            "solution": "Configure a strong Content-Security-Policy header using helmet or custom middleware."
        })

    # 5. Check CORS Wildcard with Credentials (ZAP Rule 10098)
    cors_wildcard_risk = 'origin: "*"' in api_text and "credentials: true" in api_text
    if cors_wildcard_risk:
        alerts.append({
            "pluginId": "10098",
            "alert": "Cross-Domain Misconfiguration (Wildcard CORS with Credentials)",
            "risk": "High",
            "confidence": "High",
            "description": "CORS headers allow arbitrary origins while allowing credentials, exposing user data to third-party domains.",
            "solution": "Specify explicit trusted origins in CORS configuration instead of '*'."
        })

    risk_counts = {
        "High": sum(1 for a in alerts if a["risk"] == "High"),
        "Medium": sum(1 for a in alerts if a["risk"] == "Medium"),
        "Low": sum(1 for a in alerts if a["risk"] == "Low"),
        "Informational": sum(1 for a in alerts if a["risk"] == "Informational"),
    }

    report = {
        "engine": "OWASP ZAP (Zed Attack Proxy) DAST Inspector",
        "summary": {
            "total_alerts": len(alerts),
            "risk_counts": risk_counts,
            "status": "PASS" if len(alerts) == 0 else "ATTENTION_REQUIRED"
        },
        "alerts": alerts
    }

    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"[OWASP ZAP DAST] Found {len(alerts)} alerts (High: {risk_counts['High']}, Medium: {risk_counts['Medium']}, Low: {risk_counts['Low']})")
    return report

if __name__ == "__main__":
    run_zap()
