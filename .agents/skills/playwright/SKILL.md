---
name: playwright
description: >-
  Automate end-to-end (E2E) functional testing of web flows using Microsoft Playwright.
  Use this skill to verify user registration, login, navigation, form submissions, and UI state integrity.
---

# Playwright Skill: End-to-End (E2E) Functional Testing

[Microsoft Playwright](https://github.com/microsoft/playwright) provides reliable end-to-end automation for modern web applications across Chromium, Firefox, and WebKit.

## Running Playwright Tests

### Run Full E2E Test Suite
Executes browser tests headlessly against the frontend application:

```powershell
npx --yes playwright test --config tests/playwright.config.ts
```

### Run Tests with Interactive UI / Inspector
To debug failing journeys visually:

```powershell
npx --yes playwright test --ui
```

### Run Specific Test Flow (e.g. Authentication & Work Orders)
```powershell
npx --yes playwright test tests/e2e/auth-and-orders.spec.ts
```

The output and test artifacts are placed in [.agents/reports/playwright-report.json](file:///.agents/reports/playwright-report.json).

## Test Verification Points
1. **Authentication Flow**: User sign-in with valid credentials, error display on invalid credentials, session persistence.
2. **Work Order Management**: Order list rendering, state progression (e.g. Pending -> In Progress -> Completed), validation error messaging.
3. **Form & Data Validation**: Inputs reject empty required fields and format violations.
4. **Navigation & Routes**: Protected routes redirect unauthenticated users to `/login`.

## Remediation Workflow
1. When a test fails, review the trace and failure message in `.agents/reports/playwright-report.json`.
2. Determine if the issue is a frontend UI bug, an API response discrepancy, or state inconsistency.
3. Fix the bug in `apps/web/src` or `apps/api/src`.
4. Re-run `npx playwright test` to verify complete green passing tests.
