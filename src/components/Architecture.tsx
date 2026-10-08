import { useState } from 'react';

type DocTab = 'erd' | 'api' | 'llm' | 'folders' | 'module1';

const TAB_META: Record<DocTab, { label: string; icon: string }> = {
  erd:     { label: '1. ERD',             icon: '⬡' },
  api:     { label: '2. API Contracts',   icon: '⇄' },
  llm:     { label: '3. LLM Integration', icon: '⚡' },
  folders: { label: '4. Folder Structure', icon: '📁' },
  module1: { label: '5. Módulo 1',         icon: '🚀' },
};

const ERD = `erDiagram
  USER {
    uuid     id          PK
    varchar  name
    varchar  email       UNIQUE
    varchar  password_hash
    enum     role        "admin|advisor|technician"
    boolean  active      DEFAULT true
    timestamptz created_at
    timestamptz updated_at
  }

  CLIENT {
    uuid     id          PK
    varchar  name
    varchar  phone
    varchar  email
    enum     type        "personal|empresa"
    text     notes
    timestamptz created_at
    timestamptz updated_at
  }

  VEHICLE {
    uuid     id          PK
    uuid     client_id   FK → CLIENT.id
    varchar  plate       UNIQUE
    varchar  vin
    varchar  make
    varchar  model
    smallint year
    int      mileage
    varchar  color
    text     notes
    timestamptz created_at
    timestamptz updated_at
  }

  CATALOG_ITEM {
    uuid     id          PK
    enum     type        "service|part"
    varchar  code        UNIQUE
    varchar  name
    text     description
    decimal  unit_price  NUMERIC(12,2)
    varchar  unit
    varchar  category
    boolean  active      DEFAULT true
    timestamptz created_at
  }

  WORK_ORDER {
    uuid     id          PK
    varchar  number      UNIQUE  "OT-YYYY-NNNN"
    uuid     vehicle_id  FK → VEHICLE.id
    uuid     technician_id FK → USER.id
    uuid     created_by  FK → USER.id
    enum     status      "received|diagnosing|in_progress|waiting_parts|completed|delivered"
    enum     urgency     "low|medium|high"
    text     complaint
    text     diagnosis
    text     notes
    int      mileage_in
    int      mileage_out
    decimal  total       NUMERIC(12,2)
    date     estimated_delivery
    timestamptz created_at
    timestamptz updated_at
  }

  WORK_ORDER_ITEM {
    uuid     id           PK
    uuid     work_order_id FK → WORK_ORDER.id
    uuid     catalog_item_id FK → CATALOG_ITEM.id
    enum     type         "service|part"
    varchar  name
    int      quantity
    decimal  unit_price   NUMERIC(12,2)
    decimal  subtotal     NUMERIC(12,2)
  }

  MAINTENANCE_REMINDER {
    uuid     id          PK
    uuid     vehicle_id  FK → VEHICLE.id
    varchar  service_name
    int      km_interval
    int      day_interval
    int      last_km
    date     last_date
    int      next_km
    date     next_date
    boolean  active      DEFAULT true
  }

  AI_LOG {
    uuid     id          PK
    uuid     work_order_id FK → WORK_ORDER.id "nullable"
    uuid     user_id     FK → USER.id
    enum     tool        "intake|history|preventive|report"
    text     input_payload
    text     output_payload
    int      tokens_used
    int      latency_ms
    timestamptz created_at
  }

  CLIENT          ||--o{  VEHICLE              : "owns"
  VEHICLE         ||--o{  WORK_ORDER           : "subject_of"
  USER            ||--o{  WORK_ORDER           : "assigned_to (technician_id)"
  USER            ||--o{  WORK_ORDER           : "created_by"
  WORK_ORDER      ||--o{  WORK_ORDER_ITEM      : "contains"
  CATALOG_ITEM    ||--o{  WORK_ORDER_ITEM      : "referenced_by"
  VEHICLE         ||--o{  MAINTENANCE_REMINDER : "has"
  WORK_ORDER      ||--o{  AI_LOG               : "generates"
  USER            ||--o{  AI_LOG               : "triggered_by"`;

const API_CONTRACTS = `# TallerSmart REST API v1 — Contratos Principales

Base URL: /api/v1
Auth: Bearer JWT (Authorization: Bearer <token>)
Format: application/json
Errores: { "error": "code", "message": "...", "details": {...} }

──────────────────────────────────────────────

## AUTH

POST /auth/login
Body:   { "email": string, "password": string }
200:    { "token": string, "user": UserDTO, "expires_at": ISO8601 }
401:    Invalid credentials

POST /auth/refresh
Header: Authorization: Bearer <refresh_token>
200:    { "token": string, "expires_at": ISO8601 }

──────────────────────────────────────────────

## CLIENTES

GET    /clients                  → PaginatedList<ClientDTO>
  Query: ?search=&type=&page=1&limit=20
POST   /clients                  → ClientDTO           [advisor, admin]
  Body: CreateClientDTO
GET    /clients/:id              → ClientDTO + vehicles[]
PUT    /clients/:id              → ClientDTO           [advisor, admin]
DELETE /clients/:id              → 204 No Content      [admin]

### ClientDTO
{
  "id": "uuid",
  "name": "string",
  "phone": "string",
  "email": "string",
  "type": "personal | empresa",
  "notes": "string",
  "vehicles": VehicleDTO[],
  "created_at": "ISO8601"
}

──────────────────────────────────────────────

## VEHÍCULOS

GET    /vehicles                 → PaginatedList<VehicleDTO>
  Query: ?client_id=&plate=&make=&page=1&limit=20
POST   /vehicles                 → VehicleDTO          [advisor, admin]
GET    /vehicles/:id             → VehicleDTO + work_orders[]
PUT    /vehicles/:id             → VehicleDTO          [advisor, admin]
GET    /vehicles/:id/history     → WorkOrderSummary[]  (cronológico)
GET    /vehicles/:id/reminders   → MaintenanceReminder[]

### VehicleDTO
{
  "id": "uuid", "client_id": "uuid",
  "plate": "string", "vin": "string",
  "make": "string", "model": "string",
  "year": 2019, "mileage": 87450,
  "color": "string", "notes": "string"
}

──────────────────────────────────────────────

## ÓRDENES DE TRABAJO

GET    /work-orders              → PaginatedList<WorkOrderDTO>
  Query: ?status=&technician_id=&vehicle_id=&from=&to=&page=1&limit=20
POST   /work-orders              → WorkOrderDTO        [advisor, admin]
GET    /work-orders/:id          → WorkOrderDTO (full con items)
PUT    /work-orders/:id          → WorkOrderDTO        [advisor, admin]
PATCH  /work-orders/:id/status   → WorkOrderDTO
  Body: { "status": OTStatus, "notes"?: string }
POST   /work-orders/:id/items    → WorkOrderItemDTO    [advisor, admin]
DELETE /work-orders/:id/items/:itemId → 204            [advisor, admin]
GET    /work-orders/:id/pdf      → application/pdf (Ficha OT)

### WorkOrderDTO
{
  "id": "uuid", "number": "OT-2025-0341",
  "vehicle": VehicleDTO, "technician": UserSummaryDTO,
  "status": "received|diagnosing|in_progress|waiting_parts|completed|delivered",
  "urgency": "low|medium|high",
  "complaint": "string", "diagnosis": "string|null",
  "notes": "string", "items": WorkOrderItemDTO[],
  "total": 163500,
  "mileage_in": 87450, "mileage_out": null,
  "estimated_delivery": "2025-09-25",
  "created_at": "ISO8601", "updated_at": "ISO8601"
}

### PATCH /work-orders/:id/status — Transiciones permitidas
received → diagnosing | in_progress
diagnosing → in_progress | waiting_parts
in_progress → waiting_parts | completed
waiting_parts → in_progress
completed → delivered

──────────────────────────────────────────────

## CATÁLOGO

GET    /catalog                  → CatalogItem[]
  Query: ?type=service|part&category=&search=
POST   /catalog                  → CatalogItem         [admin]
PUT    /catalog/:id              → CatalogItem         [admin]
DELETE /catalog/:id              → 204                 [admin]

──────────────────────────────────────────────

## IA — ENDPOINTS DEDICADOS

POST /ai/intake-classification
Body:  { "complaint": string, "vehicle_id"?: string }
200:   IntakeClassificationResult (JSON Schema validado)
429:   Rate limit exceeded

POST /ai/history-summary
Body:  { "vehicle_id": string }
200:   { "summary": string (3 viñetas markdown), "alerts": Alert[] }

POST /ai/preventive-recommendations
Body:  { "vehicle_id": string, "current_mileage": number }
200:   PreventiveRecommendation[]

POST /ai/delivery-report
Body:  { "work_order_id": string, "technician_notes": string }
200:   { "report_text": string }

──────────────────────────────────────────────

## DASHBOARD

GET    /dashboard/metrics        → DashboardMetrics
GET    /dashboard/technician-load → TechnicianLoad[]
GET    /dashboard/top-services   → ServiceStat[]`;

const LLM_CODE = `// src/services/ai/intake-classification.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // ANTHROPIC_API_KEY from env

const INTAKE_SCHEMA = {
  type: 'object' as const,
  properties: {
    sintomas_extraidos:      { type: 'array', items: { type: 'string' } },
    sistema_afectado:        { type: 'string' },
    subsistema:              { type: 'string' },
    nivel_urgencia:          { type: 'string', enum: ['BAJO', 'MEDIO', 'ALTO'] },
    razon_urgencia:          { type: 'string' },
    diagnosticos_recomendados: { type: 'array', items: { type: 'string' } },
    nota_mecanico:           { type: 'string' },
  },
  required: ['sintomas_extraidos','sistema_afectado','subsistema',
             'nivel_urgencia','razon_urgencia','diagnosticos_recomendados'],
};

export async function classifyIntake(
  complaint: string,
  vehicleContext?: string
): Promise<IntakeClassificationResult> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: \`Eres un asistente de diagnóstico automotriz. Recibes la descripción
informal de un cliente. Extrae síntomas, identifica el sistema afectado y
la urgencia (BAJO/MEDIO/ALTO). Responde SIEMPRE en JSON válido.\`,
    messages: [{
      role: 'user',
      content: vehicleContext
        ? \`Vehículo: \${vehicleContext}\\n\\nDescripción del cliente: \${complaint}\`
        : complaint,
    }],
    tools: [{
      name: 'extract_intake',
      description: 'Extrae y estructura la información de ingreso del vehículo',
      input_schema: INTAKE_SCHEMA,
    }],
    tool_choice: { type: 'auto' },
  });

  const toolUse = msg.content.find(b => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Model did not use tool');
  }

  return toolUse.input as IntakeClassificationResult;
}

// ─────────────────────────────────────────────────────────

// src/services/ai/history-summary.ts
export async function generateHistorySummary(
  vehicleHistory: WorkOrderSummary[]
): Promise<HistorySummaryResult> {
  const historyText = vehicleHistory
    .map(ot => \`[\${ot.date}] \${ot.number}: \${ot.items.join(', ')} — \${ot.mileage}km\`)
    .join('\\n');

  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 800,
    system: \`Eres un asistente técnico automotriz. Genera un briefing conciso
en 3 viñetas para el mecánico: (1) resumen de mantenimientos,
(2) piezas cambiadas, (3) alertas preventivas. Solo usa los datos provistos.\`,
    messages: [{ role: 'user', content: historyText }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  return { summary: text, tokens: msg.usage.input_tokens + msg.usage.output_tokens };
}

// ─────────────────────────────────────────────────────────

// src/services/ai/preventive-recommendations.ts
const PREVENTIVE_SCHEMA = {
  type: 'array' as const,
  items: {
    type: 'object',
    properties: {
      servicio:         { type: 'string' },
      prioridad:        { type: 'string', enum: ['URGENTE','RECOMENDADO','PROGRAMAR'] },
      km_actual:        { type: 'number' },
      km_ultimo_servicio: { type: 'number', nullable: true },
      km_intervalo_fabricante: { type: 'number' },
      razon:            { type: 'string' },
      costo_estimado:   { type: 'number' },
    },
    required: ['servicio','prioridad','km_actual','km_intervalo_fabricante','razon'],
  },
};

export async function getPreventiveRecommendations(
  vehicle: Vehicle,
  history: WorkOrderSummary[],
  currentMileage: number
): Promise<PreventiveRecommendation[]> {
  const prompt = buildPreventivePrompt(vehicle, history, currentMileage);

  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1500,
    system: \`Eres un sistema de mantenimiento preventivo automotriz.
Cruza el kilometraje actual, el historial de servicios y los intervalos
estándar del fabricante. Devuelve un array JSON ordenado por prioridad.\`,
    messages: [{ role: 'user', content: prompt }],
    tools: [{
      name: 'get_recommendations',
      description: 'Lista de servicios preventivos recomendados',
      input_schema: { type: 'object', properties: { recommendations: PREVENTIVE_SCHEMA }, required: ['recommendations'] },
    }],
    tool_choice: { type: 'auto' },
  });

  const toolUse = msg.content.find(b => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') return [];
  return (toolUse.input as any).recommendations;
}

// ─────────────────────────────────────────────────────────

// src/services/ai/delivery-report.ts
export async function generateDeliveryReport(
  workOrder: WorkOrder,
  technicianNotes: string
): Promise<string> {
  const context = \`
OT: \${workOrder.number}
Cliente: \${workOrder.client.name}
Vehículo: \${workOrder.vehicle.year} \${workOrder.vehicle.make} \${workOrder.vehicle.model}
Patente: \${workOrder.vehicle.plate}
Km ingreso: \${workOrder.mileageIn} | Km salida: \${workOrder.mileageOut}

Repuestos instalados:
\${workOrder.items.filter(i=>i.type==='part').map(i=>\`- \${i.name}\`).join('\\n')}

Servicios realizados:
\${workOrder.items.filter(i=>i.type==='service').map(i=>\`- \${i.name}\`).join('\\n')}

Notas del mecánico: \${technicianNotes}
  \`.trim();

  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1200,
    system: \`Eres un redactor técnico para talleres automotrices.
Transforma las notas técnicas del mecánico y los datos de la OT en un
informe de entrega formal, claro y comprensible para el cliente final
(no técnico). Incluye: trabajos, repuestos, condición final y
recomendaciones para el próximo mantenimiento. Tono profesional y amigable.\`,
    messages: [{ role: 'user', content: context }],
  });

  return msg.content[0].type === 'text' ? msg.content[0].text : '';
}`;

const FOLDER_STRUCTURE = `tallersmart/
├── apps/
│   ├── api/                          # Backend Node.js / Express + TypeScript
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts       # Prisma client singleton
│   │   │   │   └── env.ts            # zod-validated env vars
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # JWT verify + RBAC guard
│   │   │   │   ├── validate.ts       # zod request validation
│   │   │   │   └── error-handler.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.router.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.schema.ts
│   │   │   │   ├── clients/
│   │   │   │   │   ├── clients.router.ts
│   │   │   │   │   ├── clients.service.ts
│   │   │   │   │   └── clients.schema.ts
│   │   │   │   ├── vehicles/
│   │   │   │   ├── work-orders/
│   │   │   │   │   ├── work-orders.router.ts
│   │   │   │   │   ├── work-orders.service.ts
│   │   │   │   │   ├── work-orders.schema.ts
│   │   │   │   │   └── work-orders.pdf.ts  # Puppeteer PDF generation
│   │   │   │   ├── catalog/
│   │   │   │   ├── dashboard/
│   │   │   │   └── ai/
│   │   │   │       ├── ai.router.ts
│   │   │   │       ├── intake-classification.ts
│   │   │   │       ├── history-summary.ts
│   │   │   │       ├── preventive-recommendations.ts
│   │   │   │       └── delivery-report.ts
│   │   │   └── app.ts                # Express app + router assembly
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Modelo de datos canónico
│   │   │   ├── migrations/           # Migraciones Prisma
│   │   │   └── seed.ts               # Datos semilla
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Frontend Next.js 15 + Tailwind
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   └── login/page.tsx
│       │   │   ├── (dashboard)/
│       │   │   │   ├── layout.tsx    # Shell con sidebar + topbar
│       │   │   │   ├── page.tsx      # Dashboard
│       │   │   │   ├── work-orders/
│       │   │   │   │   ├── page.tsx  # Lista / Kanban
│       │   │   │   │   └── [id]/page.tsx
│       │   │   │   ├── clients/
│       │   │   │   ├── catalog/
│       │   │   │   └── ai/
│       │   │   ├── api/              # Next.js route handlers (BFF opcional)
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   ├── work-orders/
│       │   │   ├── clients/
│       │   │   └── ai/
│       │   ├── lib/
│       │   │   ├── api-client.ts     # Fetch wrapper con auth headers
│       │   │   ├── auth.ts           # NextAuth.js config
│       │   │   └── utils.ts
│       │   └── types/
│       │       └── index.ts
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/                        # DTOs compartidos front↔back
│   │   ├── src/index.ts
│   │   └── package.json
│   └── config/                       # ESLint / TS base configs
│
├── docker-compose.yml                # PostgreSQL + API + Web
├── package.json                      # pnpm workspace root
└── pnpm-workspace.yaml`;

const MODULE1_STEPS = `# Paso a paso — Módulo 1: Datos + Auth + CRUD Clientes/Vehículos

## Prerrequisitos
Node.js 20+, pnpm 9+, PostgreSQL 16, Docker (opcional)

──────────────────────────────────────────────
PASO 1 — Scaffolding del monorepo
──────────────────────────────────────────────

mkdir tallersmart && cd tallersmart
pnpm init
# pnpm-workspace.yaml
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Crear apps
mkdir -p apps/api apps/web packages/types

──────────────────────────────────────────────
PASO 2 — Backend: Inicializar Express + TypeScript
──────────────────────────────────────────────

cd apps/api
pnpm init
pnpm add express @prisma/client jsonwebtoken bcryptjs zod
pnpm add -D typescript @types/node @types/express @types/jsonwebtoken
         @types/bcryptjs ts-node-dev prisma

# tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022", "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist", "rootDir": "src",
    "strict": true, "esModuleInterop": true
  }
}

──────────────────────────────────────────────
PASO 3 — Schema Prisma (schema.prisma)
──────────────────────────────────────────────

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole     { ADMIN ADVISOR TECHNICIAN }
enum ClientType   { PERSONAL EMPRESA }
enum OTStatus     { RECEIVED DIAGNOSING IN_PROGRESS WAITING_PARTS COMPLETED DELIVERED }
enum UrgencyLevel { LOW MEDIUM HIGH }
enum ItemType     { SERVICE PART }
enum AiTool       { INTAKE HISTORY PREVENTIVE REPORT }

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         UserRole  @default(ADVISOR)
  active       Boolean   @default(true)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  workOrders   WorkOrder[] @relation("TechnicianOrders")
  createdOrders WorkOrder[] @relation("CreatorOrders")
  @@map("users")
}

model Client {
  id        String     @id @default(uuid())
  name      String
  phone     String
  email     String
  type      ClientType @default(PERSONAL)
  notes     String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  vehicles  Vehicle[]
  @@map("clients")
}

model Vehicle {
  id        String   @id @default(uuid())
  clientId  String   @map("client_id")
  client    Client   @relation(fields: [clientId], references: [id])
  plate     String   @unique
  vin       String
  make      String
  model     String
  year      Int
  mileage   Int
  color     String
  notes     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  workOrders WorkOrder[]
  reminders  MaintenanceReminder[]
  @@map("vehicles")
}

# ... (WorkOrder, WorkOrderItem, CatalogItem, AiLog — ver ERD completo)

──────────────────────────────────────────────
PASO 4 — Migrar y sembrar datos
──────────────────────────────────────────────

# .env
DATABASE_URL="postgresql://taller:secret@localhost:5432/tallersmart"
JWT_SECRET="change-me-in-production-min-32-chars"
JWT_EXPIRES_IN="8h"
ANTHROPIC_API_KEY="sk-ant-..."

npx prisma migrate dev --name init_auth_clients_vehicles
npx prisma db seed     # ejecuta prisma/seed.ts

──────────────────────────────────────────────
PASO 5 — Middleware de autenticación JWT + RBAC
──────────────────────────────────────────────

// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED' });

  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'TOKEN_INVALID' });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}

──────────────────────────────────────────────
PASO 6 — CRUD Clientes (service + router)
──────────────────────────────────────────────

// src/modules/clients/clients.service.ts
export const ClientsService = {
  async list(params: ListClientsParams) {
    const where = params.search
      ? { OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
        ]} : {};
    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where, include: { vehicles: true },
        take: params.limit ?? 20,
        skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);
    return { data, total, page: params.page ?? 1 };
  },

  async create(dto: CreateClientDTO) {
    return prisma.client.create({ data: dto, include: { vehicles: true } });
  },

  async findById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id }, include: { vehicles: { include: { workOrders: true } } },
    });
    if (!client) throw new NotFoundError('Cliente no encontrado');
    return client;
  },

  async update(id: string, dto: UpdateClientDTO) {
    await this.findById(id);
    return prisma.client.update({ where: { id }, data: dto });
  },
};

// src/modules/clients/clients.router.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { ClientsService } from './clients.service';
import { validate } from '../../middleware/validate';
import { CreateClientSchema } from './clients.schema';

export const clientsRouter = Router();

clientsRouter.get('/',
  authenticate,
  async (req, res) => {
    const result = await ClientsService.list(req.query);
    res.json(result);
  }
);

clientsRouter.post('/',
  authenticate,
  authorize('ADMIN', 'ADVISOR'),
  validate(CreateClientSchema),
  async (req, res) => {
    const client = await ClientsService.create(req.body);
    res.status(201).json(client);
  }
);

──────────────────────────────────────────────
PASO 7 — Levantar y verificar
──────────────────────────────────────────────

# Terminal 1 — PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_DB=tallersmart \\
  -e POSTGRES_USER=taller -e POSTGRES_PASSWORD=secret postgres:16

# Terminal 2 — API
cd apps/api && pnpm dev

# Probar auth
curl -X POST http://localhost:3001/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@taller.com","password":"admin123"}'

# Probar CRUD con token
curl -X GET http://localhost:3001/api/v1/clients \\
  -H "Authorization: Bearer <token>"

# Resultado esperado:
# { "data": [...], "total": 5, "page": 1 }`;

export default function Architecture() {
  const [tab, setTab] = useState<DocTab>('erd');
  const tabs: DocTab[] = ['erd', 'api', 'llm', 'folders', 'module1'];

  const content: Record<DocTab, string> = {
    erd: ERD,
    api: API_CONTRACTS,
    llm: LLM_CODE,
    folders: FOLDER_STRUCTURE,
    module1: MODULE1_STEPS,
  };

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Arquitectura TallerSmart v1.0</h1>
        </div>
        <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
          Documentación técnica completa — ERD · API Contracts · LLM Integration · Folder Structure · Módulo 1 paso a paso
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 4, gap: 3, marginBottom: 20, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#1E3A5F' : '#64748B',
            fontWeight: tab === t ? 700 : 400, fontSize: '0.82rem',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: '0.85rem' }}>{TAB_META[t].icon}</span>
            {TAB_META[t].label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'erd' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Diagrama Entidad-Relación</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 4 }}>Mermaid ERD</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { name: 'USER', desc: 'Autenticación y roles', color: '#7C3AED' },
              { name: 'CLIENT / VEHICLE', desc: 'Propietarios y vehículos', color: '#2563EB' },
              { name: 'WORK_ORDER', desc: 'Órdenes de trabajo', color: '#E55A2B' },
              { name: 'CATALOG_ITEM', desc: 'Servicios y repuestos', color: '#059669' },
            ].map(e => (
              <div key={e.name} style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: `1px solid ${e.color}30` }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.73rem', fontWeight: 700, color: e.color }}>{e.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>{e.desc}</div>
              </div>
            ))}
          </div>
          <div className="mermaid-box">{content.erd}</div>
        </div>
      )}

      {tab === 'api' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Contratos de API REST</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: '#F0FDF4', color: '#059669', padding: '2px 8px', borderRadius: 4 }}>OpenAPI-style</span>
          </div>
          <div className="code-block">{content.api}</div>
        </div>
      )}

      {tab === 'llm' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Integración LLM — Anthropic SDK</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: '#F5F3FF', color: '#7C3AED', padding: '2px 8px', borderRadius: 4 }}>TypeScript</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 4 }}>claude-sonnet-5</span>
          </div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.78rem', color: '#92400E', display: 'flex', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span><strong>Pattern:</strong> Todas las llamadas usan <code>tool_choice</code> para forzar Structured Outputs validados por JSON Schema, eliminando errores de parseo.</span>
          </div>
          <div className="code-block">{content.llm}</div>
        </div>
      )}

      {tab === 'folders' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Estructura de Carpetas</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4 }}>pnpm monorepo</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'apps/api', desc: 'Node.js + Express + Prisma + TypeScript', color: '#059669' },
              { label: 'apps/web', desc: 'Next.js 15 + Tailwind + shadcn/ui', color: '#2563EB' },
              { label: 'packages/types', desc: 'DTOs compartidos front ↔ back', color: '#7C3AED' },
              { label: 'packages/config', desc: 'ESLint + TypeScript base configs', color: '#64748B' },
            ].map(p => (
              <div key={p.label} style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #E2E8F0', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{p.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mermaid-box">{content.folders}</div>
        </div>
      )}

      {tab === 'module1' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Módulo 1 — Implementación Paso a Paso</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: '#FEF2F2', color: '#DC2626', padding: '2px 8px', borderRadius: 4 }}>7 pasos</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {['1. Monorepo', '2. Express+TS', '3. Prisma Schema', '4. Migración', '5. JWT + RBAC', '6. CRUD Clientes', '7. Verificar'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 6, padding: '5px 10px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E55A2B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 700 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: '0.73rem', color: '#334155', fontWeight: 500 }}>{s.slice(3)}</span>
              </div>
            ))}
          </div>
          <div className="code-block">{content.module1}</div>
        </div>
      )}
    </div>
  );
}
