# 🚗 TallerSmart

![TallerSmart Banner](https://via.placeholder.com/1200x400?text=TallerSmart) *(Opcional: Añade aquí un banner o logo del proyecto)*

**TallerSmart** es una plataforma web integral diseñada para digitalizar y optimizar la gestión de talleres automotrices. Su objetivo es centralizar la información de clientes, vehículos, órdenes de trabajo, inventario de repuestos y costos, integrando además **Inteligencia Artificial** para agilizar tareas como la clasificación de solicitudes, el resumen de historiales de mantenimiento y la preparación de informes de entrega.

🌍 **Despliegue (entorno público):** [https://tallersmart.vercel.app/](https://tallersmart.vercel.app/)

---

## ✨ Características Principales

- 👥 **Gestión de Clientes y Vehículos**: Registro detallado de clientes y la flota de vehículos que ingresan al taller.
- 📋 **Órdenes de Trabajo**: Seguimiento completo de cada reparación, desde el diagnóstico hasta la entrega.
- ⚙️ **Repuestos y Costos**: Control de inventario de repuestos, registro de gastos y facturación.
- 🕒 **Historial de Mantenimiento**: Registro inmutable de todas las intervenciones realizadas a cada vehículo.
- 🤖 **Integración con IA**:
  - Clasificación automática de solicitudes y síntomas reportados por los clientes.
  - Resumen inteligente de historiales de vehículos complejos.
  - Generación automática de informes de entrega y recomendaciones futuras.

---

## 🛠️ Stack Tecnológico

El proyecto está estructurado como un **monorepo** (utilizando `pnpm workspaces`) y emplea las siguientes tecnologías:

### Frontend (`apps/web`)
- [Next.js 15](https://nextjs.org/) (App Router, React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Backend (`apps/api`)
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/) (ORM)
- [Zod](https://zod.dev/) (Validación de esquemas)
- [TypeScript](https://www.typescriptlang.org/)

### Base de Datos & Infraestructura
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/) & Docker Compose

---

## 🏗️ Estructura del Proyecto

```text
Proyecto de Ing 1/
├── apps/
│   ├── api/       # Backend (Node.js, Express, Prisma)
│   └── web/       # Frontend (Next.js, Tailwind CSS)
├── packages/
│   ├── config/    # Configuraciones compartidas (ESLint, TS, etc.)
│   └── types/     # Tipos e interfaces de TypeScript compartidos
├── docker-compose.yml # Configuración de servicios locales (PostgreSQL)
├── package.json   # Dependencias globales y scripts del workspace
└── pnpm-workspace.yaml
```

---

## 🚀 Empezando (Getting Started)

### Prerrequisitos

Asegúrate de tener instalados los siguientes programas en tu máquina local:
- [Node.js](https://nodejs.org/es/) (v20 o superior recomendado)
- [pnpm](https://pnpm.io/es/) (v9+)
- [Docker](https://www.docker.com/) Desktop (para levantar la base de datos)

### Instalación y Ejecución Local

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd "Proyecto de Ing 1"
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar Variables de Entorno**
   - En `apps/api`, copia el archivo `.env.example` a `.env`:
     ```bash
     cp apps/api/.env.example apps/api/.env
     ```
   - *Nota: Asegúrate de que `DATABASE_URL` en el archivo `.env` apunte a tu instancia local.*

4. **Levantar la Base de Datos (PostgreSQL)**
   ```bash
   docker-compose up -d db
   ```

5. **Ejecutar migraciones de Prisma**
   (Una vez que el esquema de base de datos esté definido):
   ```bash
   cd apps/api
   npx prisma db push
   ```

6. **Iniciar el entorno de desarrollo**
   Vuelve a la raíz del proyecto para levantar el frontend o levanta ambas aplicaciones por separado:
   ```bash
   # Para levantar el entorno web desde la raíz
   pnpm dev
   ```
   *Para probar el backend:*
   - **API**: `cd apps/api && pnpm dev` (correrá en http://localhost:3001)

---

## 📜 Scripts Útiles del Workspace

Desde la raíz del proyecto puedes utilizar:

- `pnpm dev`: Inicia el modo de desarrollo de la app Web.
- `pnpm build`: Compila la aplicación Web para producción.
- `pnpm start`: Inicia la aplicación en modo de producción.
- `pnpm lint`: Ejecuta el linter.

---

## 🤝 Contribuir

1. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
2. Haz commit de tus cambios (`git commit -m 'Añade una nueva característica'`)
3. Haz push a la rama (`git push origin feature/NuevaCaracteristica`)
4. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.
