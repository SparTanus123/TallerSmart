# Plataforma de Gestión y Trazabilidad de Órdenes de Trabajo Automotrices (TallerSmart)
Canal digital unificado compuesto por API Centralizada REST (Express + TypeScript + Prisma), Base de Datos Única (PostgreSQL), Tablero Web Operativo (Next.js 15) y Copiloto Automotriz Inteligente (SmartMec con Google Gemini API).

## 🏛️ Arquitectura y Principio Rector: Registro Único y Trazabilidad de Datos (RNF-07)
El sistema garantiza que la información capturada en la recepción del vehículo por el asesor o recepcionista fluya automáticamente por las etapas operativas y técnicas sin necesidad de re-digitarla:

```text
[ RECEPCIÓN / CLIENTE ] (RF-01)
     │ Ingreso de vehículo (placa, km, queja, combustible, daños, pertenencias y fotos)
     ▼
[ RECEIVED ] ──► Asesor valida datos y asigna mecánico responsable (RF-02)
     │
     ▼
[ DIAGNOSING ] ──► Técnico realiza inspección física y registra diagnóstico y notas (RF-03)
     │             Copiloto IA asiste con triaje y códigos OBD-II
     ▼
[ IN_PROGRESS / WAITING_PARTS ] ──► Se cotizan repuestos/servicios del catálogo (RF-04)
     │                              Asesor y cliente aprueban o rechazan ítems
     ▼
[ COMPLETED ] ──► Técnico finaliza trabajos y pruebas de ruta (RF-05)
     │            SmartMec redacta borrador de informe de entrega (cliente/técnico)
     ▼
[ DELIVERED ] ──► Asesor aprueba informe final inmutable, liquida OT y entrega vehículo (RF-06)
```

Cada transición genera un registro inmutable en `WorkOrderEvent` y `VehicleEvent` (RNF-09), capturando el usuario actor autenticado, la acción realizada, el cambio de estado y los datos sensibles modificados (`fromValue` / `toValue`).

## 📂 Estructura del Proyecto
```text
c:\Proyecto de Ing 1\
├── apps/
│   ├── api/                      # API REST Node.js + Express + TypeScript + Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Esquema Relacional de Base de Datos PostgreSQL
│   │   │   ├── migrations/       # Historial de migraciones SQL aplicadas
│   │   │   └── seed.ts           # Datos de arranque (Taller, Admin, Cliente, Vehículo, Catálogo)
│   │   └── src/
│   │       ├── app.ts            # Entrypoint Express, CORS, headers de seguridad y enrutamiento
│   │       ├── lib/prisma.ts     # Cliente singleton Prisma
│   │       ├── middleware/       # Autenticación de sesión HMAC HttpOnly y autorización por rol (RBAC)
│   │       └── modules/
│   │           ├── ai/           # Copiloto SmartMec: Gemini Client, triaje, preventivo e informes
│   │           ├── auth/         # Login con PBKDF2, Me y Logout de sesión
│   │           ├── catalog/      # Catálogo de servicios y repuestos con precios y códigos
│   │           ├── clients/      # Gestión de clientes (Personal / Empresa) y contactos
│   │           ├── users/        # Administración de usuarios (Admin, Asesor, Técnico)
│   │           ├── vehicles/     # Vehículos, validación de kilometraje y auditoría de cambios
│   │           └── work-orders/  # Ciclo de OT, inspección, fotos, ítems y reportes PDF (pdfkit)
│   │
│   └── web/                      # Tablero Web Operativo Next.js 15 + Tailwind CSS + React 19
│       └── src/
│           ├── app/
│           │   ├── (auth)/login/ # Inicio de sesión seguro
│           │   ├── (dashboard)/  # Tablero Kanban (/work-orders), Clientes, Catálogo, Usuarios e IA
│           │   ├── api/[...path]/# Proxy inverso que enlaza peticiones web con la API centralizada
│           │   └── layout.tsx    # Layout raíz y diseño responsivo
│           ├── components/
│           │   ├── ai/           # AIAssistant multi-pestaña (Chat, Triaje, Preventivo, Informes)
│           │   ├── catalog/      # Vista y administración de ítems de catálogo
│           │   ├── clients/      # Vista y gestión de clientes y sus vehículos
│           │   ├── ui/           # Sistema de diseño: iconos, insignias, botones y modales
│           │   ├── users/        # Panel de administración de usuarios y contraseñas
│           │   └── work-orders/  # Tablero Kanban, vista en lista y cajón lateral OTDrawer
│           └── lib/              # api-client, contexto global (polling cada 4s) y formateadores
│
├── tests/
│   └── e2e/                      # Pruebas End-to-End con Microsoft Playwright (smoke.spec.ts)
├── tools/                        # Scripts de evaluación, orquestación y auditoría de seguridad
└── docker-compose.yml            # Contenedor PostgreSQL 16 para desarrollo local
```

## 🚀 Guía de Puesta en Marcha (Comandos)

### 1. Prerrequisitos
- **Node.js** >= 18 (o versión LTS actual)
- **pnpm** >= 9 o 10 (o ejecución mediante `npx pnpm`)
- **Docker Desktop** con el motor iniciado para PostgreSQL (puerto 5432)

---

### 2. Base de Datos y Backend API

```powershell
# Desde la raíz del proyecto (c:\Proyecto de Ing 1)

# 1. Iniciar la base de datos PostgreSQL en segundo plano
docker compose up -d db

# 2. Configurar variables de entorno del backend
# Copiar apps/api/.env.example a apps/api/.env y ajustar credenciales
Copy-Item apps/api/.env.example apps/api/.env

# 3. Instalar dependencias del workspace
pnpm install

# 4. Generar cliente Prisma y desplegar migraciones en PostgreSQL
pnpm --filter @tallersmart/api db:generate
pnpm --filter @tallersmart/api db:deploy

# 5. Poblar datos iniciales (Taller, Admin, Cliente, Vehículo, Catálogo)
pnpm --filter @tallersmart/api db:seed

# 6. Iniciar la API en modo desarrollo
pnpm --filter @tallersmart/api dev
# -> Disponible en http://localhost:3001/api/v1 (Salud en http://localhost:3001/health)
```

#### Credenciales Semilla Creadas:
| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@tallersmart.local` | Valor de `SEED_ADMIN_PASSWORD` en `apps/api/.env` (ej. `LocalOnly-ChangeMe123!`) |
| **Asesor de Servicio** | Crear desde el panel **Usuarios y Permisos** con rol `ADVISOR` | Asignada por el Administrador (mín. 12 caracteres) |
| **Técnico Mecánico** | Crear desde el panel **Usuarios y Permisos** con rol `TECHNICIAN` | Asignada por el Administrador (mín. 12 caracteres) |

---

### 3. Dashboard Web Operativo

```powershell
# En una segunda terminal desde la raíz del proyecto (c:\Proyecto de Ing 1)

# 1. Configurar variables de entorno del cliente web
Copy-Item apps/web/.env.local.example apps/web/.env.local

# 2. Iniciar el entorno de desarrollo Next.js (Turbopack)
pnpm --filter web dev
# -> Disponible en http://localhost:3000
```

> **Inicio Rápido en un solo comando:**  
> Desde la raíz puedes ejecutar directamente `pnpm dev`. El comando inicializa automáticamente PostgreSQL y levanta en simultáneo tanto la API como el frontend web.

---

### 4. Componente de Inteligencia Artificial (SmartMec con Google Gemini API)

El backend integra el asistente técnico inteligente **SmartMec** potenciado por la API de Google Gemini para triaje, cálculo predictivo de mantenimiento preventivo y redacción de informes técnicos y de entrega:

1. Configurar la clave de API en `apps/api/.env`:
   ```ini
   GEMINI_API_KEY="tu-clave-de-gemini-api"
   GEMINI_MODEL="gemini-3.5-flash-lite"
   ```
2. Verificar el estado de salud y conectividad del agente:
   - **Endpoint REST:** `GET http://localhost:3001/api/v1/ai/status`
   - **Módulo Web:** Ingresar a la sección **SmartMec IA** (`/ai`) en el menú lateral o desplegar la pestaña **"IA"** dentro de cualquier orden de trabajo para generar borradores y diagnósticos en vivo.

---

### 5. Pruebas Automatizadas y End-to-End (E2E)

```powershell
# Verificar compilación y tipado completo del backend y frontend
pnpm --filter @tallersmart/api build
pnpm --filter web build

# Ejecutar pruebas E2E con Playwright (con API y Web en ejecución)
npx playwright test
```
