# TallerSmart

Aplicación propia para registrar, tramitar y auditar órdenes de trabajo de un taller automotriz. El flujo principal conecta recepción, diagnóstico, ejecución, revisión del informe y entrega. El sistema documenta el trabajo; el diagnóstico mecánico y la aprobación del informe siguen bajo responsabilidad humana.

## Arquitectura

- `apps/web`: interfaz Next.js.
- `apps/api`: API REST con Express, validación Zod y persistencia Prisma.
- PostgreSQL: base persistente local/compartida.
- Sesión propia con cookie `HttpOnly`, firma HMAC, vencimiento de ocho horas y contraseñas derivadas con PBKDF2.
- Permisos por rol validados en la API. El rol no se puede cambiar desde el selector de interfaz.
- Actualización del tablero cada cuatro segundos mientras la pestaña está visible.
- La API registra cambios de estado, registro técnico, informe, aprobación, repuestos/servicios y cambios de vehículo como eventos auditables.

El informe usa una plantilla determinista; no se presenta como IA generativa. El usuario `admin@tallersmart.local` se crea con la contraseña que figure en `SEED_ADMIN_PASSWORD` dentro de `apps/api/.env`; la de ejemplo solo sirve para desarrollo. Cámbiala y configura un `JWT_SECRET` aleatorio de al menos 32 caracteres antes de cualquier despliegue.

## Puesta en marcha local

Requisitos: Node.js, pnpm y Docker Desktop con el motor de contenedores iniciado.

1. Instala dependencias desde la raíz: `pnpm install`.
2. Inicia PostgreSQL: `docker compose up -d db`.
3. Copia `apps/api/.env.example` como `apps/api/.env` y `apps/web/.env.local.example` como `apps/web/.env.local`.
4. Desde la raíz, crea las tablas y los registros de arranque:

   ```powershell
   pnpm --filter @tallersmart/api db:generate
   pnpm --filter @tallersmart/api db:deploy
   pnpm --filter @tallersmart/api db:seed
   ```

5. Ejecuta `pnpm dev`. El comando inicia PostgreSQL y espera a que esté listo antes de levantar la API y la web. En siguientes sesiones no necesitas iniciar la base por separado.

La interfaz queda en `http://localhost:3000`; API y estado de base de datos en `http://localhost:3001/health`. El seed crea datos identificados como muestra para recorrer recepción. No son datos de un taller validado.

Inicia sesión con `admin@tallersmart.local` y el valor local de `SEED_ADMIN_PASSWORD`. La sección **Usuarios y permisos** permite al administrador crear asesores y técnicos. Las contraseñas deben tener al menos 12 caracteres.

## Recorrido funcional

1. Abrir **Nueva recepción**, seleccionar vehículo y registrar kilometraje y motivo.
2. La orden se crea en PostgreSQL y aparece en el tablero.
3. Abrir la orden, guardar diagnóstico y notas; el API valida estados permitidos y registra los cambios.
4. Preparar el borrador de informe, completar el trabajo y aprobarlo desde la aplicación antes de entregar.
5. Consultar la bitácora de eventos de la orden.

Las ediciones concurrentes se leen por polling. Si dos personas editan el mismo campo a la vez, todavía no hay control optimista de conflictos; se debe acordar este riesgo antes de una prueba con datos reales.

## Endpoints principales

- `GET/POST /api/v1/clients`
- `GET/POST/PUT /api/v1/vehicles`
- `GET/POST/PATCH /api/v1/catalog`
- `GET/POST /api/v1/work-orders`
- `PATCH /api/v1/work-orders/:id/record`
- `PATCH /api/v1/work-orders/:id/status`
- `PUT /api/v1/work-orders/:id/report`
- `POST /api/v1/work-orders/:id/report/approve`
- `POST /api/v1/work-orders/:id/items`
- `PATCH /api/v1/work-orders/:id/items/:itemId/authorization`
- `GET/POST/PATCH /api/v1/users` (solo administrador)
- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`

Las transiciones de estado y cambios de kilometraje/propietario se validan en backend; las modificaciones relevantes guardan valores anteriores y nuevos. Admin y asesor pueden gestionar recepción/clientes; técnico y admin registran el trabajo; solo admin/asesor aprueban trabajos adicionales e informes. Admin gestiona catálogo y usuarios.
