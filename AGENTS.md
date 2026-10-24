# TallerSmart repository guide

This repository is a standalone application; it is not hosted by or built for a design platform.

## Structure

- `apps/web`: Next.js client application. Main app routes are under `apps/web/src/app`.
- `apps/api`: Express REST API, Zod request schemas, and Prisma schema/migrations.
- `apps/api/prisma`: PostgreSQL data model, migration history, and seed script.
- `docs`: product scope and architecture notes.

## Development

- Use pnpm from the repository root.
- PostgreSQL connection is configured in `apps/api/.env` using `DATABASE_URL`.
- Apply committed migrations with `pnpm --filter @tallersmart/api db:deploy`.
- The API listens on port 3001 and the web application on port 3000 by default.
- The API is the source of truth for persisted business records. Do not add browser storage as persistence for work orders.
- Validate all request data at the API boundary, enforce order state transitions in the API, and write audit events in the same database transaction as each change.
- Keep generated report language clearly identified as a template unless a real model integration is implemented and evaluated.
