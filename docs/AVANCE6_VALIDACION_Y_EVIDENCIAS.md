# Avance 6: protocolo de validación y evidencias

Este documento convierte las observaciones del profesor en actividades reproducibles. Distingue lo implementado de lo que todavía requiere una ejecución observada. **No se deben marcar como resultados las casillas de ejecución sin guardar la evidencia correspondiente.**

## Estado a la fecha

- El repositorio incluye persistencia PostgreSQL, roles, máquina de estados, eventos de auditoría, borrador/aprobación de informes y pruebas automatizadas.
- La suite E2E tiene nueve casos, pero el artefacto guardado de Playwright se generó con `--list`: enumera los casos y registra 9 omitidos, 0 ejecutados. No prueba que el navegador haya completado el flujo.
- La evaluación existente de SmartMec contiene 20 casos y métricas del modelo. No incluye comparación cronometrada con una plantilla convencional ni revisión independiente de un mecánico.
- No hay aún medición observada de tiempos del taller, video del recorrido completo ni evidencia de restauración de fotos desde respaldo.
- En el flujo de entrega se detectó que una transición a `DELIVERED` podía crear automáticamente una aprobación ficticia del informe. Ahora la API rechaza la entrega sin aprobación explícita y también revisa que no queden ítems `PENDING`. Se añadieron pruebas de integración para ambos rechazos; deben ejecutarse y registrarse abajo.

## A. Demostración reproducible del ciclo de una orden

### Preparación

1. Usar una copia local del repositorio y una base de datos de demostración sin datos personales.
2. Configurar `apps/api/.env` a partir de `.env.example`, establecer una clave `JWT_SECRET` aleatoria y una contraseña nueva exclusiva para la cuenta de prueba (`SEED_ADMIN_PASSWORD`). No grabar ni publicar `.env`, cookies, tokens o contraseñas.
3. Arrancar PostgreSQL y aplicar las migraciones con los comandos del README. Cargar los datos de prueba y arrancar API y web.
4. En `docs/evidence/`, guardar capturas sin secretos y una exportación JSON/CSV de eventos de la orden, con nombres como `01-recepcion.png` y `eventos-OT-demo.json`. Anonimizar placas, nombres, teléfonos, correos y rostros.

### Guion y evidencia que se debe capturar

| Paso | Acción y actor de prueba | Comprobar en pantalla/API/base de datos | Evidencia |
|---|---|---|---|
| Recepción | Asesor crea cliente, vehículo y OT; registra queja, kilometraje e inspección | OT en PostgreSQL; estado `RECEIVED`; evento con actor; foto asociada si se usa | Captura de formulario y detalle; fila/evento anonimizados |
| Diagnóstico | Técnico asignado registra diagnóstico y cambia a `DIAGNOSING` | Actor, antes/después y fecha en `work_order_events` | Captura de diagnóstico e historial |
| Cotización/autorización | Se agregan dos ítems; asesor autoriza uno y deja otro pendiente; luego rechaza o autoriza explícitamente el restante | Solo autorizados suman; cada cambio identifica actor; no se completa mientras quede `PENDING` | Capturas de ítems y respuesta 409 del caso negativo |
| Ejecución | Técnico registra los trabajos autorizados y transición válida | Registro técnico persistido y evento asociado al usuario | Captura y evento anonimizados |
| Informe | Asesor guarda borrador, lo revisa y aprueba; modificarlo después debe retirar la aprobación y exigir aprobación nueva | Snapshot aprobado, fecha y aprobador; cambio posterior no conserva aprobación anterior | Capturas antes/después e historial |
| Entrega | Asesor entrega después de completar y aprobar informe | `DELIVERED`, snapshot aprobado sin cambios, evento de entrega, PDF | Captura de estado final, evento y PDF con datos ficticios |
| Rechazo | Intentar `RECEIVED → DELIVERED`, completar con pendiente y entregar sin aprobación explícita | HTTP 409 y códigos `INVALID_STATUS_TRANSITION`, `PENDING_WORK_REQUIRES_CLIENT_APPROVAL`, `APPROVED_REPORT_REQUIRED`; sin mutación ni evento de éxito | Capturas de respuesta y consulta de auditoría |

Al terminar, verificar que `createdById`, `technicianId`, `reportApprovedById` y los `actorId` de eventos correspondan a las cuentas de prueba y que el orden temporal tenga sentido. No usar capturas de mocks como prueba de persistencia real.

### Ejecución automatizada y registro

```powershell
pnpm test
pnpm test:e2e
pnpm build
```

El E2E requiere servicios disponibles; `playwright.config.ts` inicia la web y usa `http://localhost:3000`. Guardar la salida de consola y `playwright-results.json` de una ejecución real. Comprobar que `expected` sea mayor que cero y `unexpected` sea cero; el resultado de `--list` no cuenta como ejecución. Registrar commit, fecha, versión de Node/pnpm, estado de base de datos, conteo de pasadas/fallidas/omitidas y enlaces a las evidencias. Las pruebas de backend actuales usan dobles/mocks de Prisma en varias suites, por lo que la demo con PostgreSQL es evidencia independiente.

## B. Casos difíciles que deben validarse

| Caso | Resultado exigido | Estado de evidencia |
|---|---|---|
| Dos usuarios editan el mismo informe u orden a partir de la misma versión | Detectar conflicto y pedir recargar; no sobrescribir silenciosamente el cambio más reciente | Pendiente: no se ha implementado control de versión/ETag ni se ha probado concurrencia real |
| Usuario del taller A consulta o modifica una OT del taller B | Sin acceso ni filtración de datos en detalle, lista, fotos, documentos y mutaciones | Hay aislamiento tenant en Prisma; falta caso multi-taller con PostgreSQL real y dos cuentas/talleres sembrados |
| Técnico intenta acceder a OT ajena | `403` o respuesta de no autorización y ningún evento de modificación | Hay prueba de asignación a otro técnico en integración con mocks; conservarla y complementar con demo |
| Entrega con trabajo pendiente | HTTP 409; OT continúa en `COMPLETED`; no se registra entrega | Prueba añadida; ejecución aún pendiente |
| Entrega sin informe aprobado / informe editado tras aprobar | HTTP 409 hasta volver a aprobar; snapshot anterior no puede darse por válido | Regla corregida y prueba para falta de aprobación añadida; probar edición y re-aprobación en integración |

La concurrencia es una brecha conocida, no se debe afirmar que queda resuelta por usar transacciones. Antes de darla por cerrada, implementar control optimista (por ejemplo, `version`/ETag con actualización condicional) o bloqueo apropiado y probar dos solicitudes simultáneas contra PostgreSQL.

## C. Evaluación de SmartMec frente a plantilla convencional

### Protocolo

1. Seleccionar al menos 10 quejas e informes anonimizados y representativos; preparar una respuesta SmartMec y una respuesta de plantilla convencional con los mismos datos de entrada.
2. Mezclar y etiquetar como A/B sin indicar al revisor cuál es IA. Un mecánico o asesor con experiencia revisa cada par de manera independiente; registrar su rol (sin información personal), fecha y experiencia relevante.
3. Para cada versión, medir desde que se muestra el texto hasta que el revisor confirma que está listo. Incluir tiempo de edición, no solo inferencia del modelo.
4. Puntuar de 1 a 5: exactitud respecto a datos suministrados, recomendaciones aplicables, información inventada/no respaldada, claridad para el cliente y cambios necesarios. Para invenciones, registrar el fragmento, severidad y corrección requerida.
5. Comparar mediana y rango de tiempos de corrección, puntuaciones por criterio y preferencia del revisor. Publicar casos fallidos y limitaciones; 10 casos son exploratorios, no prueban generalización.

| ID anónimo | A/B | Exactitud (1–5) | Aplicabilidad (1–5) | Claridad (1–5) | ¿Dato inventado? | Correcciones realizadas | Tiempo de corrección (s) | Revisor/fecha |
|---|---|---:|---:|---:|---|---|---:|---|
| Caso 01 | | | | | | | | |

Hasta completar esta revisión, describir la evaluación actual solo como benchmark técnico de 20 casos; no afirmar “cero alucinaciones” como propiedad general. SmartMec produce borradores sujetos a revisión humana.

## D. Medición de utilidad para el taller

Realizar un estudio pequeño con 5 o más tareas comparables por método (procedimiento actual y TallerSmart), en orden alternado para reducir el efecto de aprendizaje. Usar las mismas tareas ficticias o anonimizadas. Medir tiempo desde que se inicia la tarea hasta que termina y errores/retrabajo.

| Tarea | Método | Inicio/fin | Tiempo (s) | Errores/retrabajo | Observación |
|---|---|---|---:|---|---|
| Registrar recepción | Actual / TallerSmart | | | | |
| Encontrar historial del vehículo | Actual / TallerSmart | | | | |
| Elaborar informe de entrega | Actual / TallerSmart | | | | |

Reportar cada observación y mediana por tarea/método, tamaño de muestra, perfil general del participante y limitaciones. No extrapolar a todos los talleres desde una sola persona o demostración.

## E. Demostración, datos y respaldos

- El enlace temporal solo sirve mientras el equipo y los servicios estén encendidos. Entregar junto con él instrucciones locales reproducibles, versión/commit, requisitos y usuario de demostración desechable; no compartir credenciales reutilizables.
- Grabar un video corto siguiendo la tabla del apartado A: recepción, diagnóstico, autorización, ejecución, aprobación, entrega y un intento rechazado. Usar datos sintéticos; revisar el video para ocultar claves, `.env`, tokens y datos personales antes de compartirlo.
- Las fotos se guardan como archivos bajo `UPLOAD_DIR` (por defecto `apps/api/storage/uploads` en local; `/app/storage/uploads` en Docker) y sus metadatos/rutas se guardan en PostgreSQL. Un `pg_dump` por sí solo **no incluye los bytes de las fotos**; respaldar ambos componentes de forma coordinada.
- Para una demostración Docker local, con el servicio API activo, guardar en una carpeta privada excluida de Git:

```powershell
New-Item -ItemType Directory -Force .\backups\demo | Out-Null
docker compose exec -T db pg_dump -U postgres -d tallersmart -Fc > .\backups\demo\tallersmart.dump
docker compose cp api:/app/storage/uploads .\backups\demo\uploads
```

  Comprobar que el dump y la carpeta de fotos no estén vacíos. Para recuperación, restaurar el dump en una base vacía con `pg_restore` y copiar `uploads` de vuelta al mismo `UPLOAD_DIR`; luego verificar que una OT de prueba pueda consultar y abrir sus fotos. Guardar fecha, resultado y tamaño de ambos respaldos. No subir respaldos a Git ni incluir datos reales. En despliegues con rutas/volúmenes diferentes, aplicar el mismo principio con las rutas configuradas.

## Registro final de ejecución

Completar después de ejecutar, nunca de forma anticipada:

| Campo | Resultado |
|---|---|
| Commit evaluado | Cambios locales sin commit (código/documentos modificados) |
| Fecha y ambiente | 2026-11-11; Windows; Node v25.9.0; Next.js 15.5.27; Playwright 1.64.1 |
| Pruebas backend (pasadas/fallidas) | **80 / 0** con `apps/api/node_modules/.bin/tsx.cmd --test "tests/**/*.test.ts"` desde `apps/api`; incluye mocks de Prisma en varias suites |
| Playwright (pasadas/fallidas/omitidas) | **9 / 0 / 0** con `.\node_modules\.bin\playwright.cmd test`; los casos cubren login, navegación y smoke, no el ciclo de OT |
| Build web/API | **Web: correcto** con `apps/web/node_modules/.bin/next.cmd build`; **API: Prisma Client generado y `tsc --noEmit` correcto** |
| Flujo OT y evidencias | Pendiente |
| Revisión humana SmartMec | Pendiente |
| Medición de utilidad | Pendiente |
| Respaldo y restauración de fotos | Pendiente |

La orden `pnpm test` no llegó a ejecutar porque el `pnpm` disponible intentó reinstalar módulos y abortó por ausencia de TTY (`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`). Para evitar tocar `node_modules`, se lanzó la suite con el `tsx` ya instalado. Playwright primero falló por falta de su navegador; tras instalar Chromium se corrigió un selector 404 ambiguo (coincidía con dos textos), y la segunda ejecución terminó con 9/9 aprobadas. La salida JSON es evidencia de ejecución UI, no del flujo completo de órdenes. Docker tampoco estaba activo (`docker compose ps` no pudo conectar al daemon); por tanto, no se aplicaron migraciones ni se hizo el recorrido con PostgreSQL, ni respaldo/restauración.
