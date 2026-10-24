# TallerSmart — Proyecto I

TallerSmart es una demostración web para documentar y seguir órdenes de trabajo de un taller automotriz. El alcance de Proyecto I es un flujo principal completo: recepción → diagnóstico/ejecución → informe revisado y aprobado → entrega.

La aplicación no reemplaza el diagnóstico del mecánico. La clasificación por palabras clave, las reglas de intervalo y el borrador del informe son mecanismos deterministas. La pantalla del asistente usa respuestas de ejemplo; no constituye una integración de IA evaluada.

## Estado del entregable

- **Demostración web:** Next.js con datos iniciales de ejemplo; las órdenes creadas y sus cambios se guardan en `localStorage` del navegador.
- **Persistencia de demo:** disponible tras recargar en el mismo navegador/perfil. No sincroniza entre usuarios ni equipos.
- **API:** Express todavía es un esqueleto de salud, sin endpoints de negocio.
- **Modelo objetivo:** PostgreSQL + Prisma, descrito en `apps/api/prisma/schema.prisma`; pendiente de validar, migrar y conectar a la API.
- **Arquitectura, flujo, permisos y criterios de aceptación:** `docs/arquitectura-proyecto-i.md`.

## Ejecutar localmente

Requisitos: Node.js 20+, pnpm 9+.

```bash
pnpm install
pnpm --filter web dev
```

La web estará disponible en <http://localhost:3000>. Para producción local:

```bash
pnpm --filter web build
pnpm --filter web start
```

## Recorrido de demostración

1. En el Dashboard, pulsa **Registrar Nueva Recepción**.
2. Escribe el motivo de ingreso y crea la orden. La recepción de esta versión usa un vehículo y cliente de ejemplo.
3. Abre la orden desde **Órdenes de Trabajo**. Registra y guarda el diagnóstico del mecánico y el trabajo ejecutado. Avanza por los estados; desde diagnóstico o en proceso puedes elegir **Esperar repuestos** y luego regresar a ejecución.
4. En **Asistente IA**, genera el borrador determinista, revísalo y pulsa **Aprobar informe**.
5. Completa la orden y entrégala. La sección **Trazabilidad de la orden** muestra creación, cambios de estado y aprobación.
6. Recarga la página: la orden y su historial deben seguir en el mismo navegador.

El navegador puede borrar los datos locales desde la configuración del sitio. No se deben introducir datos personales reales en esta demo.

## Validar el modelo Prisma

Con dependencias instaladas y una variable `DATABASE_URL` configurada:

```bash
pnpm --filter @tallersmart/api exec prisma validate --schema prisma/schema.prisma
```

La validación del esquema no crea la base ni ejecuta migraciones.