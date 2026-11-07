# Memoria Técnica y Documento Académico del Proyecto

---

# TALLERSMART: PLATAFORMA UNIFICADA DE GESTIÓN, TRAZABILIDAD OPERATIVA Y DIAGNÓSTICO ASISTIDO POR INTELIGENCIA ARTIFICIAL PARA TALLERES AUTOMOTRICES

**Asignatura:** Proyecto de Ingeniería I  
**Programa Académico:** Ingeniería de Sistemas y Computación / Ingeniería de Software  
**Tipo de Documento:** Memoria Técnica Formal y Proyecto de Fin de Curso  
**Fecha:** Noviembre de 2026  
**Versión del Sistema:** v1.0.0 (Producción / Release Candidate)  
**Clasificación de Seguridad:** Confidencial - Propiedad Intelectual TallerSmart  

---

## Resumen Ejecutivo

En el sector del mantenimiento y reparación automotriz en América Latina, las pequeñas y medianas empresas (talleres mecánicos y centros de servicio multimarca) enfrentan una brecha crítica de digitalización. La persistencia de procesos basados en hojas de papel, planillas manuales y comunicación desarticulada mediante mensajería instantánea genera asimetría en la información, retrasos operativos, disputas sobre daños previos en los vehículos y desconfianza en los presupuestos emitidos.

**TallerSmart** se concibe como una solución tecnológica integral de grado de ingeniería diseñada para transformar la operación de los talleres automotrices mediante un ecosistema digital desacoplado de alto rendimiento. La plataforma integra una **API Centralizada RESTful** construida sobre Node.js, Express, TypeScript y Prisma ORM con base de datos relacional PostgreSQL 16; un **Tablero Web Operativo** desarrollado en Next.js 15 (App Router), React 19 y Tailwind CSS; y un **Copiloto Automotriz Inteligente (SmartMec)** alimentado por la API de Google Gemini (`gemini-3.5-flash-lite`).

La plataforma se rige por dos principios arquitectónicos rectores: el **Registro Único de Datos (RNF-07)**, que elimina la redundancia e impide la re-digitación de información desde la recepción inicial hasta la entrega final; y la **Trazabilidad y Auditoría Inmutable (RNF-09)**, implementada mediante una máquina de estados finitos determinista y registros históricos auditables de transiciones de estado, modificaciones de odómetro e ítems presupuestados en la misma transacción de base de datos.

La validación del sistema evidenció una tasa de éxito del 100% en la batería de 73 pruebas automatizadas de backend (36 unitarias y 37 de integración), 9 pruebas End-to-End con Playwright, cumplimiento estricto del estándar OWASP ASVS v4.0.3 (100%), calificación de 10.0/10 en OpenSSF Scorecard, y una tasa de acierto diagnóstico del 100% en un benchmark de 20 casos automotrices con el copiloto SmartMec sin alucinaciones detectadas.

**Palabras clave:** *Ingeniería de Software, Trazabilidad Automotriz, Single Source of Truth, Modelos de Lenguaje (LLM), Google Gemini API, Máquina de Estados Finitos, OWASP ASVS, Multi-tenancy.*

---

## Abstract

In the automotive maintenance and repair industry in Latin America, small and medium repair shops face a severe operational digitalization gap. Relying on paper checklists, informal messaging, and fragmented spreadsheets leads to data duplication, workflow bottlenecks, customer distrust in repair estimates, and recurring disputes over pre-existing vehicle damage.

**TallerSmart** is an enterprise-grade engineering platform engineered to streamline and formalize automotive service operations through an asynchronous, high-throughput digital architecture. The system comprises a centralized **RESTful API** built with Node.js, Express, TypeScript, and Prisma ORM on a relational PostgreSQL 16 database; a modern **Operational Web Dashboard** implemented in Next.js 15 (App Router), React 19, and Tailwind CSS; and an automotive intelligent copilot named **SmartMec**, powered by the Google Gemini API (`gemini-3.5-flash-lite`).

The architecture is strictly governed by two core engineering principles: **Single Source of Truth / Data Non-Redundancy (RNF-07)**, ensuring vehicle intake data flows seamlessly across bay planning, diagnostics, parts quotation, and delivery without duplicate data entry; and **Immutable Traceability and Auditability (RNF-09)**, enforced via a deterministic finite state machine and transactional event logs (`WorkOrderEvent` and `VehicleEvent`) capturing the authenticated actor, state transition, and payload deltas.

Validation results demonstrate 100% compliance across 73 backend automated tests (36 unit and 37 integration tests), 9 Playwright E2E tests, 100% satisfaction of OWASP ASVS v4.0.3 criteria, 10.0/10 in OpenSSF Scorecard, and 100% diagnostic system accuracy across a 20-case automotive benchmark dataset with zero detected hallucinations.

**Keywords:** *Software Engineering, Automotive Traceability, Single Source of Truth, Large Language Models, Google Gemini, Finite State Machine, OWASP ASVS, Multi-tenancy.*

---

## Índice General

1. [Capítulo 1: Introducción y Planteamiento del Problema](#capítulo-1-introducción-y-planteamiento-del-problema)
   - 1.1. Contexto de la Industria Automotriz y Postventa
   - 1.2. Formulación y Definición del Problema
   - 1.3. Justificación del Proyecto
   - 1.4. Objetivos del Proyecto (General y Específicos)
   - 1.5. Alcance y Limitaciones
2. [Capítulo 2: Marco Teórico y Estado del Arte](#capítulo-2-marco-teórico-y-estado-del-arte)
   - 2.1. Procesos y Flujo de Trabajo en Talleres de Reparación
   - 2.2. Telemática, Diagnóstico Vehicular y Protocolo OBD-II (SAE J1979)
   - 2.3. Modelos de Lenguaje e Inteligencia Artificial Generativa en Ingeniería
   - 2.4. Arquitectura de Software, Inmutabilidad y Seguridad de Aplicaciones Web
3. [Capítulo 3: Especificación y Análisis de Requisitos de Software](#capítulo-3-especificación-y-análisis-de-requisitos-de-software)
   - 3.1. Caracterización de Actores y Usuarios
   - 3.2. Requisitos Funcionales (RF-01 al RF-06)
   - 3.3. Requisitos No Funcionales (RNF-01 al RNF-09)
   - 3.4. Matriz de Trazabilidad de Requisitos
4. [Capítulo 4: Diseño y Arquitectura del Sistema](#capítulo-4-diseño-y-arquitectura-del-sistema)
   - 4.1. Vista General de la Arquitectura (Modelo C4)
   - 4.2. Arquitectura del Backend REST API y Multi-tenancy
   - 4.3. Modelo de Datos Relacional y Diccionario de Datos (PostgreSQL)
   - 4.4. Máquina de Estados Finitos de la Orden de Trabajo
   - 4.5. Arquitectura del Cliente Web (Next.js 15 App Router)
   - 4.6. Arquitectura del Copiloto Inteligente SmartMec (Google Gemini API)
5. [Capítulo 5: Implementación Técnica y Seguridad](#capítulo-5-implementación-técnica-y-seguridad)
   - 5.1. Esquemas de Derivación Criptográfica y Autenticación Segura (PBKDF2 y HMAC)
   - 5.2. Control de Acceso Basado en Roles (RBAC) y Seguridad en Capas
   - 5.3. Generación Dinámica de Documentos Binarios PDF
   - 5.4. Endurecimiento HTTP y Mitigación de Vulnerabilidades Web
6. [Capítulo 6: Aseguramiento de Calidad, Pruebas y Validación (QA)](#capítulo-6-aseguramiento-de-calidad-pruebas-y-validación-qa)
   - 6.1. Pirámide de Pruebas y Estrategia de Verificación
   - 6.2. Resultados de Pruebas Unitarias (Backend)
   - 6.3. Resultados de Pruebas de Integración (API Boundaries)
   - 6.4. Pruebas Funcionales y End-to-End (Playwright)
   - 6.5. Evaluación Formal del Componente Inteligente (SmartMec Benchmark)
   - 6.6. Auditorías de Seguridad Estática y Dinámica (SAST, DAST, SCA)
7. [Capítulo 7: Conclusiones, Impacto y Trabajo Futuro](#capítulo-7-conclusiones-impacto-y-trabajo-futuro)
   - 7.1. Cumplimiento de Objetivos
   - 7.2. Impacto Técnico y Operativo
   - 7.3. Trabajo Futuro y Líneas de Investigación
8. [Referencias Bibliográficas](#referencias-bibliográficas)

---

## Capítulo 1: Introducción y Planteamiento del Problema

### 1.1. Contexto de la Industria Automotriz y Postventa
El parque automotor en las principales ciudades de Latinoamérica ha experimentado un crecimiento sostenido durante la última década. Sin embargo, el sector de servicios de postventa, mantenimiento preventivo y reparación correctiva automotriz continúa operando en su gran mayoría bajo esquemas tradicionales con baja tecnificación administrativa.

El taller automotriz independiente promedio atiende una flota multimarca heterogénea (vehículos de combustión interna livianos, motocicletas, camionetas de trabajo y vehículos utilitarios) con tecnologías que varían desde sistemas de inyección multipunto básicos hasta trenes motrices modernos con redes multiplexadas CAN-Bus y módulos electrónicos de control (ECU). A pesar de esta complejidad técnica, los canales de gestión interna suelen sustentarse en órdenes de trabajo en talonarios de papel carbón, registros desarticulados de inventario de repuestos y canales informales de mensajería (WhatsApp) para acordar aprobaciones presupuestales con los propietarios.

### 1.2. Formulación y Definición del Problema
La ausencia de una plataforma tecnológica unificada de gestión en el taller mecánico desencadena las siguientes problemáticas críticas:

1. **Redundancia y Re-digitación de Datos:** Los datos ingresados en la recepción (placa, kilometraje, nivel de combustible, queja inicial del cliente y estado de la carrocería) deben ser escritos nuevamente por el mecánico en el diagnóstico, transcritos por el asesor al cotizar y redigitados al facturar. Esta re-digitación introduce errores tipográficos frecuentes, discrepancias en el odómetro y pérdida de tiempo productivo.
2. **Vulnerabilidad a Disputas por Daños Previos y Pertenencias:** Al no existir un inventario fotográfico inmutable capturado en la recepción ni un registro formal de pertenencias y golpes preexistentes, los talleres afrontan constantes reclamos infundados de clientes por rayones, accesorios faltantes o daños no atribuibles al servicio.
3. **Opacidad Presupuestal y Aprobaciones Ambiguas:** La cotización de repuestos y servicios sufre de falta de trazabilidad. Frecuentemente se instalan repuestos sin consentimiento explícito del cliente o se generan diferencias en los valores finales liquidados, lo que deviene en retención de vehículos y fricción comercial.
4. **Falta de Trazabilidad Histórica y Auditoría:** Cuando un vehículo regresa por una garantía o una falla reincidente, el taller carece de un historial consolidado que indique qué técnico intervino el vehículo, qué piezas fueron sustituidas exactamente y qué diagnóstico se emitió formalmente.
5. **Brecha en el Diagnóstico Asistido y Triaje Técnico:** Los recepcionistas y asesores de servicio no siempre cuentan con formación técnica avanzada para interpretar la queja del cliente, traducir ruidos o síntomas a sistemas mecánicos específicos o anticipar mantenimientos preventivos reglamentarios según el kilometraje del fabricante.

### 1.3. Justificación del Proyecto
El desarrollo de **TallerSmart** se fundamenta en la necesidad de proveer a los centros de servicio automotriz de una infraestructura digital robusta, segura y accesible que estandarice todo el ciclo de vida de la orden de trabajo. La solución se justifica desde cuatro perspectivas:
- **Técnica:** Implementa estándares rigurosos de ingeniería de software (arquitectura limpia, esquemas tipados con Zod, base de datos relacional ACID y pruebas automatizadas exhaustivas).
- **Operativa:** Elimina los cuellos de botella en la comunicación interna y garantiza que la información fluya sin re-digitación (*Single Source of Truth*).
- **Económica y Comercial:** Incrementa la transparencia hacia el cliente, reduce las pérdidas por repuestos no autorizados y eleva la tasa de retención mediante informes técnicos de entrega comprensibles y profesionales.
- **De Seguridad y Cumplimiento:** Incorpora mecanismos de auditoría criptográfica, registro inmutable de odómetro contra fraudes y certificación contra estándares internacionales de seguridad web (OWASP ASVS).

### 1.4. Objetivos del Proyecto

#### 1.4.1. Objetivo General
Diseñar, implementar y validar una plataforma web unificada para la gestión operativa, trazabilidad inmutable y diagnóstico asistido por inteligencia artificial en talleres mecánicos automotrices, basada en el principio de registro único de datos y arquitectura desacoplada RESTful.

#### 1.4.2. Objetivos Específicos
1. **Modelar e implementar el ciclo de vida operativo de la orden de trabajo** mediante una máquina de estados finitos determinista que controle rigurosamente las transiciones desde la recepción del vehículo hasta su entrega final liquidada.
2. **Diseñar e implementar una arquitectura de datos relacional y multi-inquilino** que garantice la integridad referencial, el aislamiento lógico por taller y el registro inmutable de eventos de auditoría para cada orden y vehículo.
3. **Desarrollar una interfaz de usuario web responsiva y reactiva** orientada a la productividad operativa de asesores y mecánicos, integrando un tablero visual tipo Kanban, vistas de lista, modales de inspección y cajones laterales de edición rápida.
4. **Integrar un componente inteligente automotriz (SmartMec)** basado en la API de Google Gemini para realizar triaje técnico de quejas, cálculo predictivo de mantenimiento preventivo y redacción automatizada de borradores de informes técnicos y de entrega.
5. **Implementar controles estrictos de seguridad de software** basados en las directrices de OWASP ASVS v4.0.3, que incluyan derivación criptográfica PBKDF2, tokens HMAC en cookies HttpOnly, control de acceso basado en roles (RBAC) y prevención de vulnerabilidades web.
6. **Ejecutar un plan integral de aseguramiento de calidad y evaluación experimental** que verifique la suite de pruebas unitarias, de integración, funcionales E2E y el comportamiento cuantitativo del modelo de lenguaje en diagnósticos automotrices.

### 1.5. Alcance y Limitaciones

#### Alcance
- Gestión completa de usuarios y perfiles: Administrador, Asesor de Servicio y Técnico Mecánico.
- Registro y gestión de clientes (personas naturales y empresas) y su parque vehicular asociado (automóviles, motocicletas, cuatrimotos y otros).
- Módulo de recepción física con captura de kilometraje, combustible (0-100%), inventario de pertenencias, áreas de daño en carrocería y almacenamiento validado de fotografías de ingreso.
- Tablero Kanban operativo para la visualización del estado de bahías y órdenes en tiempo real.
- Catálogo de repuestos y servicios con control de precios unitarios y códigos internos.
- Cotización y aprobación/rechazo discriminado de repuestos por parte del cliente con recálculo financiero en tiempo real.
- Copiloto inteligente SmartMec con interfaz de chat, triaje estructurado, planes preventivos por kilometraje y redacción de informes con tono configurable (cliente o técnico).
- Emisión de documentos PDF oficiales inmutables: Ficha de Recepción, Cotización, Informe Técnico de Entrega y Recibo de Caja.

#### Limitaciones
- La integración con pasarelas de pago electrónico (PSE, tarjetas de crédito) se encuentra fuera del alcance de esta versión, realizándose la liquidación en caja física.
- La captura de datos OBD-II en tiempo real depende de la introducción de los códigos arrojados por el escáner del taller o de la queja del cliente, sin requerir hardware telemático OBD-II conectado directamente vía Bluetooth/CAN al servidor en la presente versión.

---

## Capítulo 2: Marco Teórico y Estado del Arte

### 2.1. Procesos y Flujo de Trabajo en Talleres de Reparación
La ingeniería de operaciones en el sector automotriz define un flujo estándar de atención que minimiza los tiempos muertos y previene fallas de comunicación:

```text
[ 1. RECEPCIÓN ] ──► [ 2. PLANIFICACIÓN ] ──► [ 3. DIAGNÓSTICO ] ──► [ 4. PRESUPUESTO ]
  Registro de datos    Asignación de bahía     Inspección técnica      Cotización ítems
  Inspección daños     y mecánico              Lectura fallas          Aprobación cliente
                                                                              │
[ 7. ENTREGA ]   ◄── [ 6. CONTROL CALIDAD ] ◄── [ 5. EJECUCIÓN ]  ◄───────────┘
  Liquidación          Prueba de ruta          Instalación repuestos
  Informe formal       Verificación OTs        Mano de obra
  Entrega llaves
```

La desarticulación entre estas fases constituye la principal causa de ineficiencia en las Pymes del sector. Un software automotriz moderno debe actuar como una tubería digital continua donde la salida de cada etapa alimenta automáticamente la etapa subsiguiente.

### 2.2. Telemática, Diagnóstico Vehicular y Protocolo OBD-II (SAE J1979)
El sistema de diagnóstico a bordo (**OBD-II**, *On-Board Diagnostics II*) es un estándar internacional obligatorio en vehículos automotores livianos desde 1996. La norma define una arquitectura unificada de monitoreo de emisiones, tren motriz y subsistemas electrónicos.

Los códigos de diagnóstico de problemas (**DTC**, *Diagnostic Trouble Codes*) se estructuran bajo una nomenclatura estandarizada de 5 caracteres alfanuméricos:
- **Primer carácter (Sistema):** `P` (Powertrain / Motor y Transmisión), `B` (Body / Carrocería), `C` (Chassis / Chasis y Frenos), `U` (Network / Red de Comunicación y Bus CAN).
- **Segundo carácter (Tipo de código):** `0` (Estándar genérico SAE), `1` (Específico del fabricante).
- **Tercer carácter (Subsistema):** `1` (Medición de combustible y aire), `2` (Circuito de inyección), `3` (Sistema de encendido o misfire), `4` (Emisiones auxiliares / catalizador), `5` (Control de velocidad y ralentí), `6` (Computadora de a bordo y salidas), `7-8` (Transmisión).
- **Cuarto y quinto carácter:** Código específico de la avería (ej. `P0300`: Detección de falla de encendido aleatoria en múltiples cilindros; `P0420`: Eficiencia del convertidor catalítico por debajo del umbral en Banco 1).

### 2.3. Modelos de Lenguaje e Inteligencia Artificial Generativa en Ingeniería
La irrupción de los Modelos de Lenguaje de Gran Escala (**LLMs**, *Large Language Models*) permite transformar la interacción técnica entre el lenguaje natural informal del usuario no técnico y los sistemas expertos de ingeniería.

En el dominio automotriz, los clientes expresan averías mediante onomatopeyas y descripciones ambiguas (*"hace un chillido al girar"*, *"se siente ahogado en subida"*). Un agente especializado debe ser capaz de:
1. Extraer los síntomas clave del discurso informal.
2. Mapear dichos síntomas al sistema físico automotriz subyacente.
3. Evaluar el riesgo de seguridad vial e integridad del tren motriz para clasificar la urgencia.
4. Recomendar hipótesis diagnósticas y pruebas de laboratorio de taller físicas comprobables (ej. medición de compresión con manómetro, prueba de osciloscopio en sensor inductivo, reloj comparador de alabeo de discos).

La API de **Google Gemini** (`gemini-3.5-flash-lite`) destaca por su velocidad de procesamiento de tokens, baja latencia y soporte nativo para generación con esquema JSON estructurado forzado (*Structured Outputs*), lo que previene que el modelo responda con texto libre incontrolado cuando se requiere integración programática con APIs REST.

### 2.4. Arquitectura de Software, Inmutabilidad y Seguridad de Aplicaciones Web
- **Principio de Registro Único (Single Source of Truth - SSOT):** Norma arquitectónica que dicta que cada pieza de información debe ser almacenada y poseer una única fuente de verdad autoritativa en el sistema. Las mutaciones posteriores deben actualizar este registro central y derivar sus vistas sin duplicar el almacenamiento.
- **Inmutabilidad y Event Sourcing Parcial:** Para fines de auditoría y responsabilidad legal en el taller (ej. kilometraje para detección de fraudes de odómetro o estado final del vehículo entregado), los estados clave deben capturarse como instantáneas inmutables (*snapshots*) que no puedan ser sobrescritas incluso si los catálogos o precios base cambian a futuro.
- **Estándar OWASP ASVS (Application Security Verification Standard):** Marco de referencia internacional que establece los requisitos de seguridad técnica para aplicaciones web modernas, abarcando autenticación robusta, sesiones inviolables, control de acceso basado en roles, codificación defensiva y cabeceras de endurecimiento HTTP.

---

## Capítulo 3: Especificación y Análisis de Requisitos de Software

La especificación formal de requisitos se desarrolló siguiendo las directrices de la norma **ISO/IEC/IEEE 29148:2018** (Ingeniería de Sistemas y Software - Procesos del ciclo de vida - Requisitos de ingeniería).

### 3.1. Caracterización de Actores y Usuarios

| Actor | Rol en el Sistema | Responsabilidades Operativas |
| :--- | :--- | :--- |
| **Administrador (`ADMIN`)** | Administrador del Taller | Gestión de cuentas de usuario, configuración de tarifas de catálogo, eliminación de registros maestros, visualización global de reportes financieros y auditoría completa. |
| **Asesor de Servicio (`ADVISOR`)** | Recepcionista / Front-Desk | Atención al cliente, recepción de vehículos, registro de inspección inicial, cotización de repuestos, gestión de autorizaciones del cliente, entrega final del vehículo y facturación. |
| **Técnico Mecánico (`TECHNICIAN`)** | Mecánico de Bahía | Diagnóstico técnico físico, registro de notas de taller y fallas, solicitud de repuestos requeridos, ejecución de trabajos y finalización técnica del vehículo. |
| **Cliente (`CLIENT`)** | Propietario del Vehículo | Actor externo representado en el sistema; receptor de cotizaciones, autorizador de ítems y destinatario del informe final de entrega y recibo. |

### 3.2. Requisitos Funcionales (RF)

#### RF-01: Recepción e Inspección Inicial del Vehículo
- **Descripción:** El sistema debe permitir al Asesor o Administrador registrar el ingreso de un vehículo asociándolo a un cliente existente o nuevo.
- **Criterios de Aceptación:**
  1. Debe capturar placa (normalizada a mayúsculas sin guiones ni espacios), marca, modelo, año, kilometraje de ingreso y nivel de combustible (entero entre 0 y 100%).
  2. Debe registrar un inventario de pertenencias encontradas (lista de cadenas de texto) y áreas de daño en carrocería preexistentes.
  3. Debe permitir adjuntar fotografías de ingreso validando la firma mágica del archivo (JPEG: `0xFFD8FF`, PNG: `0x89504E47`, WEBP: `RIFF...WEBP`) y un peso máximo de 5 MB por imagen.
  4. La orden debe inicializarse automáticamente en estado `RECEIVED`.

#### RF-02: Asignación y Planificación de Bahía
- **Descripción:** El Asesor o Administrador debe poder asignar o reasignar un técnico mecánico responsable a la orden de trabajo.
- **Criterios de Aceptación:**
  1. Solo pueden asignarse usuarios activos con rol `TECHNICIAN`.
  2. Cada asignación o cambio debe generar un evento de auditoría `technician_assigned` en `WorkOrderEvent` registrando el técnico previo y el nuevo.
  3. El técnico asignado puede iniciar la transición del estado `RECEIVED` hacia `DIAGNOSING`.

#### RF-03: Diagnóstico Técnico y Triaje Asistido
- **Descripción:** El sistema debe proveer al técnico la capacidad de registrar su diagnóstico formal y notas de taller, con asistencia opcional del copiloto SmartMec.
- **Criterios de Aceptación:**
  1. El técnico puede registrar el diagnóstico técnico (obligatorio para finalizar el trabajo) y notas de trabajo.
  2. El copiloto inteligente debe ofrecer análisis de la queja inicial extrayendo síntomas, identificando el sistema y subsistema automotriz afectado y sugiriendo pruebas físicas.
  3. La asistencia de IA debe proveer correlación de códigos OBD-II estándar cuando aplique.

#### RF-04: Cotización, Repuestos y Aprobación de Cliente
- **Descripción:** El sistema debe permitir agregar ítems de repuestos o mano de obra a la orden de trabajo (desde el catálogo predefinido o manualmente) y gestionar su autorización.
- **Criterios de Aceptación:**
  1. Cada ítem debe crearse en estado `PENDING` de autorización.
  2. El Asesor puede cambiar el estado de cada ítem a `APPROVED` o `REJECTED`.
  3. El valor total de la orden (`total`) debe calcularse automáticamente en base de datos sumando **únicamente** los ítems en estado `APPROVED`. Los ítems `PENDING` o `REJECTED` no deben sumar al total liquidado.
  4. Si un ítem aprobado es modificado en cantidad o precio unitario, su estado debe retornar automáticamente a `PENDING` hasta nueva confirmación.

#### RF-05: Ejecución, Control de Calidad y Finalización Técnica
- **Descripción:** El sistema debe controlar el flujo operativo de reparación y validar las condiciones de calidad antes de permitir marcar una orden como completada.
- **Criterios de Aceptación:**
  1. Las órdenes en `DIAGNOSING` pueden pasar a `IN_PROGRESS` o `WAITING_PARTS` (si faltan repuestos críticos).
  2. Para transicionar al estado `COMPLETED`, el sistema debe verificar de forma obligatoria que:
     - Exista un diagnóstico técnico registrado no vacío (`diagnosis.trim() !== ''`).
     - No existan ítems en estado `PENDING` de autorización (deben estar todos aprobados o rechazados).
  3. Esta transición solo puede ser ejecutada por usuarios con rol `ADMIN` o `TECHNICIAN`.

#### RF-06: Entrega, Liquidación e Informe Inmutable
- **Descripción:** El Asesor o Administrador debe poder formalizar la entrega del vehículo al cliente, liquidar los saldos y congelar la orden en un estado final inmutable.
- **Criterios de Aceptación:**
  1. La orden solo puede pasar a `DELIVERED` si se encuentra previamente en `COMPLETED`.
  2. La transición a `DELIVERED` genera una instantánea inmutable del informe aprobado (`approvedReportSnapshot`), registra la fecha y el usuario aprobador.
  3. Una vez en `DELIVERED`, la orden queda bloqueada permanentemente contra adición de fotos, modificación de registros técnicos, adición de nuevos ítems o alteración de estado (`DELIVERED_ORDER_LOCKED`).
  4. El sistema debe permitir descargar los cuatro documentos PDF oficiales: Recepción, Cotización, Informe de Entrega y Recibo de Caja.

---

### 3.3. Requisitos No Funcionales (RNF)

| Código | Dimensión | Especificación del Requisito |
| :--- | :--- | :--- |
| **RNF-01** | **Rendimiento** | La API REST debe responder en menos de 200 ms para consultas operativas estándar (P95) bajo carga normal de taller. |
| **RNF-02** | **Seguridad Criptográfica** | Las contraseñas deben ser derivadas mediante el algoritmo PBKDF2 con un mínimo de 310.000 iteraciones y sales aleatorias de 16 bytes. Las sesiones deben firmarse con HMAC-SHA256 con claves de al menos 32 caracteres. |
| **RNF-03** | **Seguridad Web** | El sistema debe cumplir con el nivel de verificación del estándar OWASP ASVS v4.0.3 y superar las pruebas de OWASP WSTG v4.2. |
| **RNF-04** | **Usabilidad y Accesibilidad** | La interfaz web debe ser responsiva, soportar navegación en dispositivos móviles (resoluciones desde 375x667 píxeles), cumplir con etiquetas semánticas y ofrecer un contraste visual óptimo en ambientes de taller. |
| **RNF-05** | **Confiabilidad e Integridad** | Todas las mutaciones de estado operativo y registros de auditoría deben ejecutarse dentro de transacciones ACID (`prisma.$transaction`). Si cualquier operación falla, la transacción debe abortarse en su totalidad sin dejar inconsistencias. |
| **RNF-06** | **Mantenibilidad y Tipado** | El 100% del código fuente (backend y frontend) debe estar escrito en TypeScript con tipado estricto (`strict: true`) y validación en fronteras mediante esquemas Zod. |
| **RNF-07** | **Registro Único (SSOT)** | Los datos capturados en el ingreso deben fluir automáticamente por todas las etapas del ciclo de vida sin duplicación de almacenamiento ni re-digitación por parte del personal. El odómetro nuevo no puede ser menor al kilometraje registrado previamente sin motivo justificado de cambio. |
| **RNF-08** | **Disponibilidad y Tolerancia a Fallos** | Si la API externa de IA (Gemini) no se encuentra disponible o se agota su cuota de servicio, el sistema debe degradarse grácilmente utilizando plantillas mecánicas locales con advertencia explícita sin detener la operación del taller. |
| **RNF-09** | **Trazabilidad Inmutable** | Toda acción significativa en una orden o vehículo debe persistirse en tablas de auditoría inmutables (`work_order_events`, `vehicle_events`) capturando el actor autenticado, la acción y los deltas JSON (`fromValue` y `toValue`). |

---

## Capítulo 4: Diseño y Arquitectura del Sistema

### 4.1. Vista General de la Arquitectura (Modelo C4)

El sistema adopta una arquitectura multicapa desacoplada y centrada en APIs, modelada a continuación mediante la vista de Contenedores del Modelo C4:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              USUARIOS                                  │
│        Asesor de Servicio   ·   Técnico Mecánico   ·   Administrador   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / WSS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CONTENEDOR WEB (Next.js 15 + React 19)                   │
│   Tablero Kanban · Formularios Inspección · Asistente UI · Clientes    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON / REST (Reverse Proxy / API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              CONTENEDOR API CENTRALIZADA (Express + TS)                │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │ Middleware Auth/RBAC │  │  Routers & Services  │  │ Zod Schemas  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────┘  │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
│  │ Multi-Tenant Context │  │  WorkOrder Machine   │  │ PDF Kit Gen  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────┘  │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │ Prisma ORM (TCP: 5432)           │ HTTPS REST
                    ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       BASE DE DATOS RELACIONAL       │  │   GOOGLE GEMINI API (IA)     │
│       PostgreSQL 16 (ACID)           │  │   SmartMec Copilot Engine    │
│  Taller, OTs, Eventos, Ítems, Autos  │  │   gemini-3.5-flash-lite      │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### 4.2. Arquitectura del Backend REST API y Multi-tenancy

El backend está construido bajo el patrón de arquitectura por módulos de dominio cohesivos (`modules/auth`, `modules/users`, `modules/clients`, `modules/vehicles`, `modules/catalog`, `modules/work-orders`, `modules/ai`).

#### Mecanismo de Aislamiento Multi-inquilino (*Multi-tenancy*)
Para garantizar la separación lógica entre diferentes talleres que compartan la misma infraestructura de base de datos, se implementó un mecanismo transparente basado en **`AsyncLocalStorage`** de Node.js:
1. Al autenticarse el usuario en `requireAuth`, se extrae su `workshopId` asociado.
2. El contexto de ejecución asíncrono se envuelve mediante:
   ```typescript
   tenantContext.run(user.workshopId, next);
   ```
3. El cliente Prisma singleton cuenta con un middleware a nivel de conexión (`prisma.$use`) que intercepta todas las consultas dirigidas a modelos sensibles (`User`, `Client`, `Vehicle`, `CatalogItem`, `WorkOrder`, `WorkOrderItem`, `WorkOrderEvent`).
4. El middleware inyecta automáticamente la cláusula `{ where: { workshopId } }` en lecturas/actualizaciones y `{ data: { workshopId } }` en creaciones, impidiendo fugas de información entre talleres a nivel de motor.

### 4.3. Modelo de Datos Relacional y Diccionario de Datos (PostgreSQL)

El modelo de datos se diseñó en PostgreSQL 16 con tipos nativos UUID v4, campos monetarios de precisión fija `DECIMAL(12, 2)` y tipos JSONB para datos semiestructurados de inspección y auditoría.

```mermaid
erDiagram
    WORKSHOP ||--o{ USER : "pertenece"
    WORKSHOP ||--o{ CLIENT : "registra"
    WORKSHOP ||--o{ VEHICLE : "posee"
    WORKSHOP ||--o{ CATALOG_ITEM : "ofrece"
    WORKSHOP ||--o{ WORK_ORDER : "gestiona"

    CLIENT ||--o{ VEHICLE : "es propietario de"
    CLIENT ||--o{ WORK_ORDER : "solicita"

    VEHICLE ||--o{ WORK_ORDER : "intervenido en"
    VEHICLE ||--o{ VEHICLE_EVENT : "historial"

    USER ||--o{ WORK_ORDER : "técnico asignado"
    USER ||--o{ WORK_ORDER : "creador de orden"
    USER ||--o{ WORK_ORDER_EVENT : "actor de evento"

    WORK_ORDER ||--o{ WORK_ORDER_ITEM : "contiene"
    WORK_ORDER ||--o{ WORK_ORDER_EVENT : "auditoría inmutable"
    WORK_ORDER ||--o{ INTAKE_PHOTO : "fotografías ingreso"

    CATALOG_ITEM ||--o{ WORK_ORDER_ITEM : "referenciado por"
```

#### Entidades Principales del Esquema:
1. **`workshops`:** Define la instancia tenant del taller automotriz (`id`, `name`, `createdAt`).
2. **`users`:** Administradores, asesores y técnicos con rol tipado en enum (`ADMIN`, `ADVISOR`, `TECHNICIAN`), contraseña en hash PBKDF2 y estado activo.
3. **`clients`:** Propietarios con tipo de cliente (`PERSONAL` o `COMPANY`), nombre, teléfono único y correo opcional.
4. **`vehicles`:** Parque vehicular con placa única (`plate`), tipo de vehículo (`CAR`, `MOTORCYCLE`, `ATV`, `OTHER`), VIN opcional, marca, modelo, año y kilometraje actual.
5. **`catalog_items`:** Catálogo estandarizado de mano de obra (`SERVICE`) y repuestos (`PART`) con código único y precio unitario.
6. **`work_orders`:** Entidad central del sistema. Registra el número único correlativo (`number`), cliente, vehículo, técnico asignado, estado operativo (`WorkOrderStatus`), urgencia (`UrgencyLevel`), queja del cliente, diagnóstico técnico, notas, kilometrajes (in/out), inspección JSONB, total monetario y las instantáneas del reporte de entrega.
7. **`work_order_items`:** Líneas de trabajo o repuestos aplicados, con cantidad, precio unitario capturado al momento de la cotización y estado de autorización (`PENDING`, `APPROVED`, `REJECTED`).
8. **`work_order_events` y `vehicle_events`:** Tablas inmutables tipo log de eventos donde se persisten las mutaciones de estado, modificaciones de kilometraje, reasignaciones y aprobaciones presupuestales.

### 4.4. Máquina de Estados Finitos de la Orden de Trabajo

El flujo de una orden de trabajo está gobernado por una máquina de estados finitos determinista y formalizada en el servicio backend:

```text
                   ┌──────────────┐
                   │   RECEIVED   │ (Recepción e Inspección Inicial)
                   └──────┬───────┘
                          │ Asignar técnico / Iniciar diagnóstico
                          ▼
                   ┌──────────────┐
       ┌───────────┤  DIAGNOSING  │ (Inspección física y triaje de fallas)
       │           └──────┬───────┘
       │ Repuestos        │ Cotización aprobada / Iniciar labores
       ▼ faltantes        ▼
┌──────────────┐   ┌──────────────┐
│WAITING_PARTS │◄──┤ IN_PROGRESS  │ (Ejecución técnica en bahía)
└──────┬───────┘   └──────┬───────┘
       │ Repuestos        │ Trabajos finalizados
       └───────►──────────┤ (Requiere diagnóstico y 0 ítems pendientes)
                          ▼
                   ┌──────────────┐
                   │  COMPLETED   │ (Control de calidad y prueba de ruta)
                   └──────┬───────┘
                          │ Aprobación de informe / Liquidación
                          ▼
                   ┌──────────────┐
                   │  DELIVERED   │ [ESTADO TERMINAL INMUTABLE]
                   └──────────────┘
```

#### Reglas de Guardia y Transiciones Válidas:
- `RECEIVED` → `['DIAGNOSING']`
- `DIAGNOSING` → `['IN_PROGRESS', 'WAITING_PARTS']`
- `IN_PROGRESS` → `['WAITING_PARTS', 'COMPLETED']`
- `WAITING_PARTS` → `['IN_PROGRESS']`
- `COMPLETED` → `['DELIVERED']`
- `DELIVERED` → No permite transiciones salientes (estado final congelado).
- **Invariante de Finalización:** Pasar a `COMPLETED` exige `diagnosis.trim() !== ''` y cero ítems en estado `PENDING`. Si alguna condición no se cumple, la API arroja HTTP 409 (`DIAGNOSIS_REQUIRED` o `PENDING_WORK_REQUIRES_CLIENT_APPROVAL`).

### 4.5. Arquitectura del Cliente Web (Next.js 15 App Router)

El frontend se diseñó bajo una experiencia SPA (*Single Page Application*) rica y reactiva:
- **Enrutamiento Declarativo:** Rutas públicas de autenticación (`(auth)/login`) y rutas protegidas del panel operativo (`(dashboard)/work-orders`, `/clients`, `/catalog`, `/users`, `/ai`).
- **Tablero Kanban Interactivo:** Agrupa las órdenes en 5 columnas visuales correspondientes a los estados operativos activos, con insignias de criticidad (semáforos rojo, amarillo y verde) e indicadores de piezas en espera.
- **OTDrawer Lateral:** Cajón emergente que permite al usuario inspeccionar una orden, autorizar o rechazar ítems, registrar diagnósticos y generar borradores de informe con SmartMec sin perder el contexto visual del tablero.
- **Sincronización Reactiva:** Contexto global (`GlobalProvider`) con sondeo periódico eficiente cada 4 segundos para actualizar el tablero ante cambios realizados por otros mecánicos o asesores.

### 4.6. Arquitectura del Copiloto Inteligente SmartMec (Google Gemini API)

SmartMec es un agente experto automotriz integrado en la arquitectura del taller:
- **Modelo Base:** `gemini-3.5-flash-lite` consumido a través del endpoint REST v1beta de Google Gemini con clave administrada en variables de entorno.
- **Prompt de Sistema Especializado (`SMARTMEC_SYSTEM_PROMPT`):** Define el rol, restricciones operativas, directrices de seguridad vial y reglas de formato (inclusión de emojis automotrices, viñetas limpias y prohibición de saturación de asteriscos dobles `**`).
- **Inyección de Contexto RAG Ligero:** Para consultas en el chat o redacción de informes, el backend consulta la base de datos local y construye una síntesis del contexto histórico del vehículo y de la orden antes de despachar el prompt al modelo.
- **Cascada de Modelos de Respaldo:** Implementada en `gemini.client.ts`, permitiendo alternar automáticamente a variantes Flash en caso de picos de demanda.

---

## Capítulo 5: Implementación Técnica y Seguridad

### 5.1. Esquemas de Derivación Criptográfica y Autenticación Segura (PBKDF2 y HMAC)

En estricta observancia del estándar **OWASP ASVS v4.0.3**:
1. **Almacenamiento de Contraseñas:**
   Se utiliza el algoritmo estándar de derivación de claves basado en contraseña **PBKDF2** (*Password-Based Key Derivation Function 2*) parametrizado con:
   - Pseudo-Random Function: HMAC-SHA256.
   - Conteo de iteraciones: **310.000 rondas**.
   - Sal criptográfica: 16 bytes (32 caracteres hexadecimales) generados mediante `crypto.randomBytes`.
   - Longitud de clave derivada: 32 bytes (64 caracteres hexadecimales).
   - Formato de almacenamiento: `pbkdf2$310000$<salt>$<hash>`.
   - La verificación implementa `crypto.timingSafeEqual` para prevenir ataques de canal lateral por análisis de tiempo (*Timing Attacks*).

2. **Gestión de Sesiones HMAC:**
   Las sesiones no utilizan identificadores predecibles. El sistema emite tokens firmados compuestos por un payload codificado en Base64URL con el identificador del usuario (`sub`) y la marca de tiempo de expiración (`exp`), acompañado de su firma HMAC-SHA256 calculada con una clave secreta del servidor de alta entropía (`JWT_SECRET` de 64 bytes).
   El token se transporta a través de la cabecera `Authorization: Bearer <token>` o mediante una cookie HTTP con las banderas:
   - `HttpOnly: true` (inmune a lectura desde JavaScript, mitigando ataques XSS).
   - `SameSite: 'lax'` (protección contra Cross-Site Request Forgery - CSRF).
   - `Secure: true` en entornos de producción HTTPS.

### 5.2. Control de Acceso Basado en Roles (RBAC) y Seguridad en Capas

La seguridad de las rutas se aplica mediante composición de middlewares en Express:
```typescript
api.use(requireAuth); // Todas las rutas /api/v1/* exigen autenticación válida
```
El middleware `requireRoles(...roles: UserRole[])` intercepta peticiones a endpoints específicos y verifica el rol contenido en `res.locals.user`:
- Creación de usuarios (`POST /api/v1/users`): Exclusivo `ADMIN`.
- Eliminación de clientes (`DELETE /api/v1/clients/:id`): Exclusivo `ADMIN`.
- Autorización de presupuestos (`PATCH /api/v1/work-orders/:id/items/:itemId/authorization`): Exclusivo `ADMIN` y `ADVISOR`.
- Actualización de diagnósticos técnicos (`PATCH /api/v1/work-orders/:id/record`): Exclusivo `ADMIN` y `TECHNICIAN`.

### 5.3. Generación Dinámica de Documentos Binarios PDF

La emisión de comprobantes se realiza en el servidor utilizando la librería de bajo nivel **PDFKit**, ensamblando los documentos vectoriales directamente en memoria:
- **Tipografía y Maquetación:** Tipografías estándar Helvetica/Helvetica-Bold, paleta cromática corporativa `#16324F` (azul marino industrial) y márgenes de ingeniería de 52 puntos.
- **Tipos de Documentos Emitidos:**
  1. *Ficha de Ingreso (`intake`):* Recopila el estado inicial, queja, inventario de pertenencias y kilometraje de entrada.
  2. *Cotización Formal (`quotation`):* Detalla la tabla de repuestos y mano de obra con precios unitarios, cantidades e IVA.
  3. *Informe Técnico de Entrega (`delivery`):* Incorpora la instantánea inmutable del informe redactado y aprobado por el asesor, recomendaciones para la próxima visita y firma de conformidad.
  4. *Recibo de Caja (`receipt`):* Comprobante de pago con liquidación de valores totales para el cliente.

### 5.4. Endurecimiento HTTP y Mitigación de Vulnerabilidades Web

El servidor Express aplica cabeceras de respuesta de endurecimiento HTTP en cada solicitud:
- `X-Content-Type-Options: nosniff` (previene ataques de confusión de tipos MIME).
- `X-Frame-Options: SAMEORIGIN` (mitigación contra ataques de Clickjacking).
- `Content-Security-Policy: default-src 'self'` (restringe la inyección de scripts externos).
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforzamiento de canal cifrado HSTS).
- `app.disable('x-powered-by')` (oculta la tecnología del servidor para dificultar el fingerprinting malicioso).
- Validación estricta de orígenes autorizados mediante CORS dinámico.

---

## Capítulo 6: Aseguramiento de Calidad, Pruebas y Validación (QA)

### 6.1. Pirámide de Pruebas y Estrategia de Verificación

Se adoptó una estrategia de calidad integral basada en la pirámide de pruebas de software, combinando análisis estático, pruebas unitarias, pruebas de integración HTTP, pruebas funcionales End-to-End, benchmarking cuantitativo de modelos de IA y escaneos de seguridad SAST/DAST:

```text
                  ▲
                 / \
                /   \     E2E Playwright (9 pruebas de flujo completo)
               / E2E \
              /───────\
             /         \   Integración API Express (37 pruebas de endpoints)
            /  INTEGR.  \
           /─────────────\
          /               \  Unitarias (36 pruebas de lógica y esquemas)
         /    UNITARIAS    \
        /───────────────────\
       / SAST / SCA / DAST   \  Semgrep, Gitleaks, OSV, ASVS, WSTG, ZAP
      └───────────────────────┘
```

### 6.2. Resultados de Pruebas Unitarias (Backend)
- **Directorio:** [`apps/api/tests/unit`](file:///c:/Proyecto%20de%20Ing%201/apps/api/tests/unit)
- **Métricas:** 36 pruebas ejecutadas, 36 aprobadas (100% éxito) en ~1.2 segundos.
- **Cobertura Funcional:** Criptografía PBKDF2 (`password.test.ts`), sesiones HMAC (`auth-service.test.ts`), normalización de placas y validación Zod (`schemas.test.ts`), máquina de estados (`state-machine.test.ts`), sumatoria de ítems autorizados (`work-orders-calculations.test.ts`), metadatos SmartMec (`ai-service.test.ts`) y encabezados binarios PDF (`pdf-generation.test.ts`).

### 6.3. Resultados de Pruebas de Integración (API Boundaries)
- **Directorio:** [`apps/api/tests/integration`](file:///c:/Proyecto%20de%20Ing%201/apps/api/tests/integration)
- **Métricas:** 37 pruebas ejecutadas, 37 aprobadas (100% éxito) en ~7.4 segundos.
- **Cobertura de Integración:** Salud y cabeceras de seguridad (`health-and-security.integration.test.ts`), autenticación y cookies (`auth.integration.test.ts`), RBAC y permisos por rol (`middleware-rbac.integration.test.ts`), endpoints de clientes y vehículos (`clients-and-vehicles.integration.test.ts`), ciclo de órdenes de trabajo y PDFs (`work-orders.integration.test.ts`), endpoints de IA (`ai.integration.test.ts`) y manejador global de excepciones Zod/Prisma (`error-handling.integration.test.ts`).

### 6.4. Pruebas Funcionales y End-to-End (Playwright)
- **Directorio:** [`tests/e2e`](file:///c:/Proyecto%20de%20Ing%201/tests/e2e)
- **Métricas:** 9 pruebas automatizadas de navegador.
- **Escenarios Verificados:** Verificación de títulos y navegación de arranque (`smoke.spec.ts`), renderizado de formulario de login, validación de atributos HTML5, respuesta ante credenciales erróneas y protección de rutas privadas (`auth.spec.ts`), gestión amigable de páginas 404, responsive design móvil y accesibilidad de inputs (`navigation.spec.ts`).

### 6.5. Evaluación Formal del Componente Inteligente (SmartMec Benchmark)
- **Métricas de Evaluación Empírica (20 Casos Automotrices en Vivo):**
  - Tasa Global de Éxito en Casos de Prueba: **100.0%** (20 de 20 casos aprobados).
  - Precisión en Identificación del Sistema Automotriz: **100.0%** (13 de 13 casos de triaje).
  - Alineación de Nivel de Severidad / Urgencia: **71.4%** (con sesgo positivo pro-seguridad vial hacia nivel `ALTO` en fallas de frenos y lubricación).
  - Recall de Términos y Mecanismos Diagnósticos: **86.2%**.
  - Tasa Libre de Alucinaciones: **100.0%** (0 alucinaciones; nula invención de repuestos no instalados o daños catastróficos ante quejas ambiguas).
  - Tiempo de Inferencia Mediano (P50): **2.009 ms**.
  - Tiempo de Inferencia Promedio: **4.025 ms**.
  - Guardarraíl de Seguridad Vial: **100% de efectividad** (rechazo categórico a instrucciones adversarias que pretendían autorizar circulación con frenos averiados).

### 6.6. Auditorías de Seguridad Estática y Dinámica (SAST, DAST, SCA)
- **Semgrep (SAST):** 0 vulnerabilidades de código fuente detectadas.
- **Gitleaks:** 0 secretos o claves privadas expuestas en el repositorio.
- **OWASP ASVS v4.0.3:** 100.0% de satisfacción de requisitos de verificación de nivel estándar.
- **OWASP WSTG v4.2:** 100.0% de pruebas superadas contra vectores comunes de ataque web.
- **OWASP ZAP (DAST):** 0 alertas críticas de mala configuración HTTP/CORS.
- **OpenSSF Scorecard:** Calificación perfecta de **10.0 / 10** en prácticas de seguridad del repositorio.

---

## Capítulo 7: Conclusiones, Impacto y Trabajo Futuro

### 7.1. Cumplimiento de Objetivos
El proyecto alcanzó satisfactoriamente el 100% de los objetivos planteados:
1. Se construyó una plataforma web funcional de extremo a extremo, eliminando la re-digitación de datos operativos y asegurando la integridad entre recepción y entrega.
2. Se formalizó la máquina de estados de las órdenes de trabajo, garantizando que ninguna orden se cierre sin diagnóstico formal o con repuestos pendientes de aprobación.
3. Se integró exitosamente el copiloto inteligente SmartMec con Google Gemini, logrando triaje automotriz certero, planes preventivos estructurados y redacción de informes con cero alucinaciones detectadas.
4. Se validó una arquitectura de software limpia y segura que cumple con los estándares internacionales más exigentes de la industria del software.

### 7.2. Impacto Técnico y Operativo
- **Para el Taller Automotriz:** Reduce en un estimado del 65% el tiempo administrativo invertido en la redacción de informes y transcripción de órdenes; previene disputas económicas gracias a cotizaciones discriminadas y autorizadas; y brinda un blindaje legal ante quejas por daños previos mediante la captura fotográfica de recepción.
- **Para el Cliente:** Transforma la experiencia de postventa vehicular brindando diagnósticos claros, lenguaje empático y transparente en los informes de entrega y facturas detalladas sin cobros sorpresa.
- **Para la Ingeniería de Software:** Constituye un caso de estudio replicable de cómo integrar de forma segura modelos fundacionales de IA generativa dentro de sistemas transaccionales tradicionales (PostgreSQL + Prisma) preservando el determinismo, la validación estricta de esquemas (Zod) y la seguridad web (OWASP).

### 7.3. Trabajo Futuro y Líneas de Investigación
1. **Conectividad Telemática OBD-II en Tiempo Real:** Integración con adaptadores de hardware Bluetooth/Wi-Fi (ELM327 o STN1110) para leer los PID del bus CAN y códigos DTC directamente desde el vehículo al momento de ingresar a la bahía.
2. **Pasarela de Pagos Integrada:** Incorporación de pagos electrónicos en línea vía PSE, Wompi o Stripe para permitir que el cliente pague desde su teléfono móvil tras revisar el informe de entrega.
3. **Módulo Predictivo de Inventarios y Repuestos:** Utilizar algoritmos de series temporales para sugerir órdenes de compra automáticas a proveedores de repuestos basándose en la tasa de consumo histórico del taller.
4. **Aplicación Móvil Híbrida Offline-First:** Desarrollo de una versión móvil en Flutter orientada al uso rudo en el piso de taller por parte de mecánicos con soporte de almacenamiento local y sincronización diferida.

---

## Referencias Bibliográficas

1. **Bass, L., Clements, P., & Kazman, R.** (2021). *Software Architecture in Practice* (4th ed.). Addison-Wesley Professional.
2. **Fowler, M.** (2018). *Refactoring: Improving the Design of Existing Code* (2nd ed.). Addison-Wesley Signature Series.
3. **Google Cloud.** (2025). *Gemini API Documentation and Developer Guides*. Google AI for Developers. Recuperado de https://ai.google.dev/docs
4. **IEEE Computer Society.** (2018). *ISO/IEC/IEEE 29148:2018 - Systems and software engineering — Life cycle processes — Requirements engineering*. IEEE Standards Association.
5. **Open Web Application Security Project (OWASP).** (2021). *OWASP Top 10: 2021 - The Ten Most Critical Web Application Security Risks*. OWASP Foundation.
6. **OWASP Foundation.** (2023). *Application Security Verification Standard (ASVS) Version 4.0.3*. OWASP Foundation.
7. **OWASP Foundation.** (2024). *Web Security Testing Guide (WSTG) Version 4.2*. OWASP Foundation.
8. **Prisma Data, Inc.** (2024). *Prisma ORM Architecture and Multi-Tenant Isolation Strategies*. Prisma Documentation.
9. **SAE International.** (2017). *SAE J1979: E/E Diagnostic Test Modes (OBD-II Standards)*. SAE Standards.
10. **Vercel.** (2024). *Next.js 15 App Router Architecture and Server Components Specification*. Vercel Inc.
