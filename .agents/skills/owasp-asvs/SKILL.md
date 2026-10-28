---
name: owasp-asvs
description: >-
  Evaluate and enforce the OWASP Application Security Verification Standard (ASVS) Level 1, 2, and 3 security requirements.
  Use this skill to audit authentication, authorization, session management, input validation, cryptographic controls, and API security.
---

# OWASP ASVS Skill: Security Requirements & Verification

The [OWASP Application Security Verification Standard (ASVS)](https://github.com/OWASP/ASVS) defines a rigorous framework of security controls for modern web applications and APIs across 14 verification chapters:

- **V1: Architecture, Design and Threat Modeling**
- **V2: Authentication** (Password hashing, MFA, lockout, credential stuffing protection)
- **V3: Session Management** (Secure cookies, HttpOnly, SameSite, JWT validation, expiry)
- **V4: Access Control** (RBAC, IDOR prevention, multi-tenancy, least privilege)
- **V5: Validation, Sanitization and Encoding** (Zod request validation, SQL injection prevention, XSS prevention)
- **V6: Stored Cryptography** (Argon2id/bcrypt, AES-256-GCM, TLS encryption)
- **V7: Error Handling and Logging** (No stack trace leakage, audit logging)
- **V8: Data Protection** (PII handling, sensitive field masking)
- **V9: Communication** (HSTS, TLS 1.3, CSP, CORS headers)
- **V10: Malicious Code** (Dependency integrity, code provenance)
- **V11: Business Logic** (Order state machine integrity, workflow validation)
- **V12: File and Resource Handling** (Upload validation, path traversal defense)
- **V13: API and Web Service** (REST validation, rate limiting, JSON schemas)
- **V14: Configuration** (Security headers, framework hardening)

## Verification Execution

Run the automated ASVS checklist auditor:

```powershell
python tools/scripts/audit_asvs.py
```

This generates [.agents/reports/asvs-compliance.json](file:///.agents/reports/asvs-compliance.json) mapping controls directly to project files and endpoints.

## Remediation Workflow
1. Check non-compliant items in `asvs-compliance.json`.
2. Implement missing defense (e.g. rate-limiter middleware, helmet security headers, strict Zod schema validation, transaction-bound audit logs).
3. Re-run `audit_asvs.py` to confirm the control passes.
