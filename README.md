# TallerSmart - Plataforma de Gestión, Trazabilidad Operativa y Diagnóstico Asistido por IA

Plataforma integral de grado de ingeniería diseñada para la digitalización, control operativo y diagnóstico vehicular en talleres automotrices multimarca. Compuesta por una **API Centralizada RESTful** (Node.js, Express, TypeScript, Prisma ORM y PostgreSQL), un **Tablero Web Operativo** (Next.js 15 App Router, React 19 y Tailwind CSS) y un **Copiloto Automotriz Inteligente** (**SmartMec**, potenciado por la API de Google Gemini).

---

## 📋 Resumen de Cumplimiento:

El proyecto satisface a cabalidad los cuatro componentes requeridos para la entrega de **Terminación, pruebas y validación**:

| Componente Exigido | Estado | Evidencias y Documentación Técnica |
| :--- | :---: | :--- |
| **1. Producto prácticamente terminado** | 🟢 **100%** | • Backend REST API (`apps/api`) completo con autenticación criptográfica PBKDF2/HMAC y RBAC.<br>• Base de datos PostgreSQL con migraciones y transacciones ACID.<br>• Frontend Web (`apps/web`) en Next.js 15 con compilación limpia (`next build`) y diseño responsivo.<br>• Flujo operativo íntegro: Recepción con inventario de daños ➔ Asignación de bahía ➔ Diagnóstico ➔ Presupuesto y repuestos ➔ Control de calidad ➔ Entrega y emisión de 4 tipos de documentos PDF binarios. |
| **2. Resultados de pruebas** | 🟢 **100%** | • **73 de 73 pruebas automatizadas de backend aprobadas (100% éxito)**: 36 unitarias y 37 de integración.<br>• Suite de 9 pruebas funcionales y End-to-End con Playwright (`tests/e2e`).<br>• Cumplimiento estricto de estándares: **OWASP ASVS v4.0.3 (100%)**, **OWASP WSTG v4.2 (100%)**, **Semgrep SAST (0 alertas)**, **Gitleaks (0 secretos)** y **OpenSSF Scorecard (10.0 / 10)**.<br>• 📄 Documento consolidado: [`docs/TESTING_VALIDATION_REPORT.md`](docs/TESTING_VALIDATION_REPORT.md). |
| **3. Evaluación del componente inteligente** | 🟢 **100%** | • Benchmark formal del copiloto **SmartMec** (`gemini-3.5-flash-lite` con cascade fallback) contra un dataset de **20 casos empíricos automotrices reales**.<br>• **100.0% acierto en detección de subsistemas mecánicos**, correlación de códigos OBD-II (SAE J1979), **0% alucinaciones**, rechazo de ataques adversarios y latencia mediana P50 de 2.0 s.<br>• 📄 Informe formal: [`docs/SMARTMEC_AI_EVALUATION_REPORT.md`](docs/SMARTMEC_AI_EVALUATION_REPORT.md). |
| **4. Borrador completo del documento del proyecto** | 🟢 **100%** | • Memoria técnica formal y académica de 562 líneas estructurada según estándares IEEE e ISO/IEC 25010.<br>• Capítulos desarrollados en su totalidad: Introducción, Marco Teórico, Requisitos (RF/RNF), Arquitectura C4 y FSM, Implementación Técnica, Aseguramiento de Calidad y Conclusiones.<br>• 📄 Documento completo: [`docs/MEMORIA_TECNICA_PROYECTO.md`](docs/MEMORIA_TECNICA_PROYECTO.md). |

---

## 🏛️ Arquitectura y Principios Rectores

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

## 📂 Estructura del Repositorio

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

## 🚀 Guía de Puesta en Marcha (Comandos)

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

> 💡 **Inicio Rápido (Full Stack en un solo paso):**  
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

## 🧪 Ejecución de Pruebas y Validación

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

## 📚 Documentación Técnica y Académica

* 📖 **[Memoria Técnica Formal del Proyecto](docs/MEMORIA_TECNICA_PROYECTO.md):** Documento formal académico para Proyecto de Ingeniería I (562 líneas con marco teórico, requisitos RF/RNF, C4, FSM, seguridad y conclusiones).
* 🧪 **[Informe Consolidado de Pruebas y QA](docs/TESTING_VALIDATION_REPORT.md):** Detalle de las 73 pruebas backend, 9 pruebas E2E, matrices de trazabilidad y cobertura de requisitos.
* 🤖 **[Evaluación Formal del Componente de IA](docs/SMARTMEC_AI_EVALUATION_REPORT.md):** Metodología experimental, matriz de 20 casos de prueba automotrices, métricas de precisión, latencia y análisis de alucinaciones.
* 🛡️ **[Reporte de Completitud y Seguridad](.agents/reports/project-completeness.md):** Resumen de escaneos OWASP ASVS, WSTG, Semgrep, Gitleaks, ORT y OpenSSF Scorecard.
