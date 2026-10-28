---
name: owasp-zap
description: >-
  Perform Dynamic Application Security Testing (DAST) on web applications and APIs using OWASP Zed Attack Proxy (ZAP).
  Use this skill to scan running web applications for runtime vulnerabilities, missing security headers, and cookie risks.
---

# OWASP ZAP Skill: Dynamic Application Security Testing (DAST)

[OWASP ZAP](https://github.com/zaproxy/zaproxy) (Zed Attack Proxy) is a widely-used web application security scanner for detecting vulnerabilities at runtime against active HTTP endpoints.

## Scanner Execution

### Automated Baseline Scan (Integrated Runner)
Executes automated DAST security inspection (verifying HTTP security headers, CORS policies, cookie attributes, information disclosure, and sensitive route exposure):

```powershell
python tools/scripts/run_zap_scan.py --target-api http://localhost:3001 --target-web http://localhost:3000
```

The output report is written to [.agents/reports/zap-report.json](file:///.agents/reports/zap-report.json).

### Docker Containerized ZAP Baseline
When Docker Desktop is active:

```powershell
docker run -t --rm ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:3000 -J zap-report.json
```

## Parsing Findings

The report categorizes alerts into:
- **High**: SQLi, Command Injection, Authentication Bypass, Remote Code Execution.
- **Medium**: Missing Anti-CSRF tokens, Insecure Direct Object References, Permissive CORS headers (`Access-Control-Allow-Origin: *` with credentials).
- **Low**: Missing security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options`).
- **Informational**: Timestamp disclosure, server banner disclosure.

## Remediation Workflow
1. Locate the URI and alert rule in [.agents/reports/zap-report.json](file:///.agents/reports/zap-report.json).
2. Configure HTTP headers via `helmet` in `apps/api/src/app.ts` or `next.config.ts` in `apps/web`.
3. Adjust cookie parameters to `{ httpOnly: true, secure: true, sameSite: 'lax' }`.
4. Re-run `run_zap_scan.py` to confirm zero high/medium alerts.
