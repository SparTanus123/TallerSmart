---
name: owasp-wstg
description: >-
  Execute active and passive web security testing scenarios based on the OWASP Web Security Testing Guide (WSTG v4.2).
  Use this skill to convert attack scenarios into automated security test cases against running web and API services.
---

# OWASP WSTG Skill: Web Security Testing Guide

The [OWASP Web Security Testing Guide (WSTG)](https://github.com/OWASP/wstg) provides an industry-standard methodology for penetration testing web applications and APIs.

## Testing Categories & Test Cases

1. **WSTG-IDNT (Identity Management)**: Account enumeration, username harvesting.
2. **WSTG-ATHN (Authentication)**: Brute-force resilience, credential stuffing, password policy, logout invalidation.
3. **WSTG-ATHZ (Authorization)**: Insecure Direct Object References (IDOR), privilege escalation, path traversal.
4. **WSTG-SESS (Session Management)**: Cookie attributes (`Secure`, `HttpOnly`, `SameSite`), token expiration, session fixation.
5. **WSTG-INPV (Input Validation)**: SQL Injection (SQLi), Cross-Site Scripting (XSS), Command Injection, Prototype Pollution.
6. **WSTG-ERRH (Error Handling)**: Stack trace disclosure, debug error message leaks.
7. **WSTG-CRYP (Cryptography)**: Insecure algorithms, weak random generators, sensitive data in transit.
8. **WSTG-BUSL (Business Logic)**: Workflow circumvention, state machine tampering, race conditions in order transitions.
9. **WSTG-CLNT (Client-side Testing)**: DOM XSS, clickjacking (`X-Frame-Options`), CORS misconfigurations.
10. **WSTG-APIT (API Testing)**: Mass assignment, improper asset management, excessive data exposure.

## Running WSTG Test Suite

To execute the automated WSTG testing suite against the local development servers (`http://localhost:3000` and `http://localhost:3001`):

```powershell
python tools/scripts/run_wstg_tests.py --target-api http://localhost:3001 --target-web http://localhost:3000
```

The results are saved to [.agents/reports/wstg-report.json](file:///.agents/reports/wstg-report.json).

## Remediation Workflow
1. For failed tests, review the attack payload and endpoint response.
2. Patch the vulnerability at the API or middleware boundary.
3. Re-run `run_wstg_tests.py` to confirm the exploit is blocked.
