# Arquitectura y primera versión funcional

## Objetivo

Demostrar una orden de trabajo persistente y auditable de extremo a extremo: recepción de vehículo, registro del motivo, diagnóstico y notas del técnico, revisión y aprobación humana del informe, y entrega. El producto organiza registros del taller; no sustituye la valoración mecánica.

## Componentes

```text
Navegador (Next.js)
    │ HTTP / JSON + polling de órdenes (4 s)
    ▼
API REST (Express + Zod)
    │ Prisma
    ▼
PostgreSQL
```

La API es la fuente de verdad. Las órdenes ya no se guardan en `localStorage`. El tablero consulta periódicamente la API y refleja cambios compartidos entre clientes conectados. Las escrituras de orden y su evento de auditoría se agrupan en transacciones Prisma.

La sesión se entrega como cookie `HttpOnly`, firmada con HMAC y con expiración de ocho horas. Las contraseñas se almacenan como derivaciones PBKDF2. La API vuelve a consultar el usuario y su estado activo en cada solicitud; cambiar o desactivar la cuenta invalida su acceso.

## Modelo de datos

- `User`: actor del sistema y rol.
- `Client`: persona u organización titular actual.
- `Vehicle`: identificación, kilometraje y propietario actual.
- `VehicleEvent`: auditoría de correcciones de kilometraje y cambios de propietario con motivo.
- `CatalogItem`: servicios y repuestos.
- `WorkOrder`: recepción, responsable, estado, diagnóstico, notas, kilometraje e informe.
- `WorkOrderItem`: servicio/repuesto como fotografía de nombre y precio; su autorización está pendiente, aprobada o rechazada.
- `WorkOrderEvent`: estado anterior/nuevo, edición del registro técnico, informe y aprobaciones.

La placa y el VIN (cuando se informan) son únicos. El kilometraje de ingreso no puede ser menor al último valor guardado salvo corrección documentada. El kilometraje nuevo se obtiene al recibir el vehículo o por un ajuste explícito con motivo; no se infiere mientras el vehículo no regrese al taller.

## Flujo y reglas

1. **Recepción:** seleccionar un vehículo registrado, confirmar kilometraje y guardar el motivo del cliente. La orden toma al titular actual del vehículo como cliente y crea evento `created`.
2. **Diagnóstico y ejecución:** guardar diagnóstico y notas técnicas; cada edición registra antes/después. Un informe aprobado se invalida si después cambian los datos del trabajo.
3. **Trabajos adicionales:** el servicio o repuesto se agrega con estado `PENDING`; un trabajo pendiente bloquea el cierre. Su aprobación o rechazo actualiza la bitácora y el total cobrado solo suma conceptos aprobados.
4. **Estados:** `RECEIVED → DIAGNOSING → IN_PROGRESS ↔ WAITING_PARTS → COMPLETED → DELIVERED`, con transiciones restringidas en backend. `COMPLETED` exige diagnóstico y sin aprobaciones pendientes; `DELIVERED` exige informe aprobado.
5. **Informe:** la plantilla solo usa datos existentes de la orden. La persona asesora revisa y aprueba el texto; el servidor guarda una instantánea inmutable del contenido aprobado. No se envía contenido inventado por un modelo.

## API

Base: `/api/v1`.

- Clientes y vehículos: consulta y alta; edición de vehículo requiere motivo al corregir kilometraje o transferir titular.
- Catálogo: consulta, alta y actualización.
- Órdenes: listado, creación, consulta, registro técnico, cambio de estado, borrador/aprobación de informe y líneas con autorización.
- `/health`: confirma disponibilidad de API y conexión PostgreSQL.

Los payloads se validan con Zod. La API registra actor, instante, operación y valores anterior/nuevo en la misma transacción de la modificación.

Los permisos se verifican en Express: administración gestiona usuarios y catálogo; asesoría administra recepción, clientes, cambios del propietario y kilometraje, e informes y autorizaciones; técnicos registran diagnóstico y ejecución y solicitan trabajos adicionales. Cada escritura de orden usa el ID del usuario autenticado como actor. Los datos de contraseña nunca se devuelven por la API.

## Sincronización

El navegador consulta el tablero cada cuatro segundos mientras la pestaña está activa. Así el asesor y el técnico pueden ver órdenes compartidas sin recargar. Es polling, no WebSocket; la actualización no es instantánea. La edición concurrente del mismo campo todavía no tiene detección de conflictos.

## Alcance y criterios de aceptación

- Una recepción nueva aparece desde otro navegador en un máximo aproximado de cuatro segundos.
- Al reiniciar navegador o servidor, la orden y su bitácora permanecen en PostgreSQL.
- Una transición no permitida o un kilometraje no válido se rechaza en el servidor.
- Un trabajo adicional pendiente impide completar la OT; el total no cobra un concepto rechazado.
- El informe aprobado no cambia por ediciones posteriores; una modificación obliga a revisarlo de nuevo.
- Los datos semilla son ficticios y solo sirven para la demostración.

## Estado y límites actuales

El esquema Prisma y una migración inicial están en el repositorio, junto con API para clientes, vehículos, catálogo y el flujo de órdenes. La migración y el seed ya se aplicaron a la instancia PostgreSQL local. El recorrido de creación, registro técnico, cambio de estados, aprobación y entrega se verificó y produjo eventos persistentes. Para otra instalación, siga los pasos del README.

Las pantallas de clientes, vehículos y catálogo consultan y crean registros en PostgreSQL. El administrador puede provisionar usuarios en **Usuarios y permisos**. Antes de producción hay que reemplazar secretos y credenciales de desarrollo, configurar HTTPS y respaldos de PostgreSQL, y revisar el manejo de conflictos cuando dos personas editan el mismo registro al mismo tiempo.

No hay componente de aprendizaje automático activo. Las reglas, plantillas y texto asistido determinista no se anuncian como modelo de IA.
