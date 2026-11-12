# TallerSmart - Plataforma de Gestión, Trazabilidad Operativa y Diagnóstico Asistido por IA

Plataforma integral de grado de ingeniería diseñada para la digitalización, control operativo y diagnóstico vehicular en talleres automotrices multimarca. Compuesta por una **API Centralizada RESTful** (Node.js, Express, TypeScript, Prisma ORM y PostgreSQL), un **Tablero Web Operativo** (Next.js 15 App Router, React 19 y Tailwind CSS) y un **Copiloto Automotriz Inteligente** (**SmartMec**, potenciado por la API de Google Gemini).

---

## Estado de Avance 6

El producto y su documentación están avanzados. Las pruebas de navegador, la demostración persistente de una OT completa, la revisión humana de SmartMec, la medición de utilidad y la restauración de fotos todavía requieren evidencia de ejecución. El plan de registro está en [`docs/AVANCE6_VALIDACION_Y_EVIDENCIAS.md`](docs/AVANCE6_VALIDACION_Y_EVIDENCIAS.md). Las cifras históricas de los informes no sustituyen una ejecución reproducible en el commit entregado.

El proyecto satisface a cabalidad los cuatro componentes requeridos para la entrega de **Terminación, pruebas y validación**:

| Componente Exigido | Estado | Evidencias y Documentación Técnica |
| :--- | :---: | :--- |
| **1. Producto prácticamente terminado** | **Implementado; recorrido real pendiente de evidencia** | • API, PostgreSQL, autenticación, roles, órdenes, eventos y documentos están en el repositorio.<br>• La demostración debe confirmar el flujo completo y la persistencia con PostgreSQL real; consultar el protocolo de evidencias. |
| **2. Resultados de pruebas** | **Ejecución local: 80 backend + 9 E2E aprobadas** | • El 11-11-2026 pasaron 80 pruebas backend, 9 pruebas Playwright y el build web.<br>• Playwright cubre login, navegación y smoke; aún no prueba el recorrido integral de la OT con PostgreSQL real.<br>• Detalles y limitaciones: [`docs/TESTING_VALIDATION_REPORT.md`](docs/TESTING_VALIDATION_REPORT.md). |
| **3. Evaluación del componente inteligente** | **Benchmark técnico existente; evaluación de taller pendiente** | • Informe de 20 casos con 71.4% de concordancia de urgencia y discrepancias descritas.<br>• Falta comparación con plantilla convencional, revisión humana independiente y tiempo de corrección. No generalizar “cero alucinaciones”. |
| **4. Borrador del documento** | **Borrador amplio existente; edición final pendiente** | • Memoria técnica con requisitos, arquitectura, implementación y QA.<br>• Revisar que los resultados afirmados correspondan a evidencia reproducible y agregar el protocolo de validación. |

---

## Arquitectura y Principios Rectores

### 1. Registro Único y No Redundancia de Datos (RNF-07)
La información ingresada en la recepción del vehículo por el asesor fluye automáticamente por todas las etapas operativas sin re-digitación:

```text
[ RECEPCIÓN / CLIENTE ] (RF-01)
     │ Captura única: placa normalizada, kilometraje, combustible, queja inicial, pertenencias y fotos
     ▼
[ RECEIVED ] ──► Asesor valida datos y asigna mecánico responsable a la bahía (RF-02)
     │
     ▼
[ DIAGNOSING ] ──► Mecánico realiza diagnóstico técnico en taller; SmartMec asiste con triaje y DTCs OBD-II (RF-03)
     │
     ▼
[ IN_PROGRESS / WAITING_PARTS ] ──► Cotización de repuestos/servicios del catálogo; aprobación trazable del cliente (RF-04)
     │
     ▼
[ COMPLETED ] ──► Verificación de calidad, pruebas de ruta y generación de informe pedagógico por IA (RF-05)
     │
     ▼
[ DELIVERED ] ──► Asesor entrega vehículo, bloquea orden inmutablemente y emite liquidación y PDFs oficiales (RF-06)
```

### 2. Trazabilidad y Auditoría Inmutable (RNF-09)
Toda modificación de estado, variación de kilometraje o cambio en la cotización de repuestos se almacena en `WorkOrderEvent` y `VehicleEvent` dentro de la **misma transacción atómica de base de datos**, auditando usuario autenticado, marca de tiempo y diferencias de valores (`fromValue` / `toValue`).

---

## Estructura del Repositorio

```text
c:\Proyecto de Ing 1\
├── apps/
│   ├── api/                      # Backend REST API (Node.js, Express, TypeScript, Prisma ORM)
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Modelo Relacional PostgreSQL
│   │   │   ├── migrations/       # Migraciones SQL aplicadas
│   │   │   └── seed.ts           # Semilla de datos (Taller, Admin, Cliente, Vehículo, Catálogo)
│   │   ├── src/
│   │   │   ├── app.ts            # Servidor Express, seguridad HTTP y enrutamiento v1
│   │   │   ├── middleware/       # Autenticación criptográfica HMAC, sesiones HttpOnly y RBAC
│   │   │   └── modules/
│   │   │       ├── ai/           # Copiloto SmartMec: Google Gemini SDK, triaje, preventivo e informes
│   │   │       ├── auth/         # Login con PBKDF2 (310k rondas), verificación de sesión y logout
│   │   │       ├── catalog/      # Catálogo de repuestos y servicios
│   │   │       ├── clients/      # Directorio de clientes y contactos
│   │   │       ├── users/        # Administración de usuarios y roles (Admin, Asesor, Técnico)
│   │   │       ├── vehicles/     # Vehículos, normalización de placas y auditoría de kilometraje
│   │   │       └── work-orders/  # FSM de OTs, inspección, cotización, cálculo y generación PDF
│   │   └── tests/
│   │       ├── unit/             # 36 pruebas unitarias (PBKDF2, HMAC, FSM, Zod, PDF, IA)
│   │       └── integration/      # 37 pruebas de integración HTTP (Auth, RBAC, OTs, IA, Errores)
│   │
│   └── web/                      # Tablero Web Operativo (Next.js 15, Tailwind CSS, React 19)
│       └── src/
│           ├── app/
│           │   ├── (auth)/login/ # Pantalla de inicio de sesión
│           │   ├── (dashboard)/  # Tableros Kanban (/work-orders), Clientes, Catálogo, Usuarios e IA
│           │   └── api/[...path]/# Proxy inverso a la API centralizada
│           ├── components/
│           │   ├── ai/           # Interfaz multi-pestaña de SmartMec (Triaje, Preventivo, Informes)
│           │   ├── work-orders/  # Tablero Kanban, vista en lista y cajón lateral OTDrawer
│           │   └── ui/           # Componentes del sistema de diseño
│           └── lib/              # Cliente de API, sincronización y formateadores
│
├── docs/                         # Documentación formal y reportes académicos
│   ├── MEMORIA_TECNICA_PROYECTO.md # Memoria técnica formal y completa del proyecto de grado
│   ├── TESTING_VALIDATION_REPORT.md# Reporte consolidado de pruebas (unitarias, integración y E2E)
│   ├── SMARTMEC_AI_EVALUATION_REPORT.md # Evaluación formal del modelo de IA (Google Gemini)
│   └── README.md                 # Índice general de la documentación
├── tests/
│   └── e2e/                      # Pruebas End-to-End con Playwright (auth, navegación, smoke)
├── tools/
│   └── scripts/                  # Scripts de benchmarking de IA y auditorías de seguridad
├── .agents/reports/              # Reportes estructurados JSON de ASVS, WSTG, Semgrep, Scorecard e IA
└── docker-compose.yml            # Contenedor PostgreSQL 16 local
```

---

## Guía de Puesta en Marcha (Comandos)

### 1. Prerrequisitos
* **Node.js** >= 18 (o LTS actual)
* **pnpm** >= 9 o 10 (disponible nativamente o mediante `npx pnpm`)
* **Docker Desktop** con motor en ejecución para PostgreSQL (puerto 5432)

---

### 2. Base de Datos y Backend API

```powershell
# Desde la raíz del repositorio (c:\Proyecto de Ing 1)

# 1. Iniciar contenedor de base de datos PostgreSQL
docker compose up -d db

# 2. Configurar variables de entorno del backend
Copy-Item apps/api/.env.example apps/api/.env

# 3. Instalar dependencias del workspace
pnpm install
# (o: npx pnpm install)

# 4. Generar cliente Prisma y aplicar migraciones
pnpm --filter @tallersmart/api db:generate
pnpm --filter @tallersmart/api db:deploy

# 5. Cargar datos semilla de prueba
pnpm --filter @tallersmart/api db:seed

# 6. Iniciar la API en modo desarrollo
pnpm --filter @tallersmart/api dev
# -> Disponible en http://localhost:3001/api/v1 (Health check: http://localhost:3001/health)
```

#### Credenciales Semilla por Defecto:
| Rol | Email de Acceso | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@tallersmart.local` | Valor de `SEED_ADMIN_PASSWORD` en `apps/api/.env` (ej. `LocalOnly-ChangeMe123!`) |
| **Asesor de Servicio** | Gestionado desde el panel **Usuarios** con rol `ADVISOR` | Asignada por Administrador (mínimo 12 caracteres) |
| **Técnico Mecánico** | Gestionado desde el panel **Usuarios** con rol `TECHNICIAN` | Asignada por Administrador (mínimo 12 caracteres) |

---

### 3. Tablero Web Operativo (Frontend)

```powershell
# En una segunda terminal desde la raíz del repositorio

# 1. Configurar variables de entorno del cliente web
Copy-Item apps/web/.env.local.example apps/web/.env.local

# 2. Iniciar el servidor Next.js
pnpm --filter web dev
# -> Disponible en http://localhost:3000
```

> **Inicio Rápido (Full Stack en un solo paso):**  
> Ejecutando `pnpm dev` desde la raíz se levanta el contenedor PostgreSQL, la API Express y el frontend Next.js de forma simultánea y paralela.

---

### 4. Componente de Inteligencia Artificial (SmartMec)

El backend incorpora al asistente especializado **SmartMec** para triaje técnico, planes preventivos estructurados y redacción de informes:

1. Configurar credenciales en `apps/api/.env`:
   ```ini
   GEMINI_API_KEY="tu-clave-de-gemini-api"
   GEMINI_MODEL="gemini-3.5-flash-lite"
   ```
2. Verificar conectividad del agente:
   * **Endpoint REST:** `GET http://localhost:3001/api/v1/ai/status`
   * **Interfaz Web:** Pestaña **"SmartMec IA"** (`/ai`) en el menú lateral o dentro del drawer de cualquier OT.
3. Ejecutar el arnés automatizado de evaluación (20 casos automotrices):
   ```powershell
   python tools/scripts/evaluate_smartmec.py
   # Resultados detallados en docs/SMARTMEC_AI_EVALUATION_REPORT.md
   ```

---

## Ejecución de Pruebas y Validación

```powershell
# 1. Ejecutar toda la batería de 73 pruebas backend (unitarias e integración)
pnpm test
# (o: npx pnpm test)

# 2. Ejecutar únicamente pruebas unitarias (lógica, criptografía PBKDF2/HMAC, FSM, Zod, PDFKit)
pnpm test:unit

# 3. Ejecutar únicamente pruebas de integración (rutas HTTP, RBAC, ciclo de vida OT, IA)
pnpm test:integration

# 4. Validar compilación de producción de la aplicación web Next.js
pnpm build

# 5. Ejecutar suite de pruebas End-to-End con Playwright (con servicios iniciados)
pnpm test:e2e
```

---

## Documentación Técnica y Académica

* **[Memoria Técnica Formal del Proyecto](docs/MEMORIA_TECNICA_PROYECTO.md):** Documento formal académico para Proyecto de Ingeniería I (562 líneas con marco teórico, requisitos RF/RNF, C4, FSM, seguridad y conclusiones).
* **[Informe Consolidado de Pruebas y QA](docs/TESTING_VALIDATION_REPORT.md):** Detalle de las 73 pruebas backend, 9 pruebas E2E, matrices de trazabilidad y cobertura de requisitos.
* **[Evaluación Formal del Componente de IA](docs/SMARTMEC_AI_EVALUATION_REPORT.md):** Metodología experimental, matriz de 20 casos de prueba automotrices, métricas de precisión, latencia y análisis de alucinaciones.
* **[Reporte de Completitud y Seguridad](.agents/reports/project-completeness.md):** Resumen de escaneos OWASP ASVS, WSTG, Semgrep, Gitleaks, ORT y OpenSSF Scorecard.
