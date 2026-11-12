# Documentación Formal del Proyecto TallerSmart
>**Estado de los Entregables:** Memoria técnica y reportes existentes; la validación de ejecución, revisión humana y estudio de utilidad tienen pendientes explícitos.

En este directorio se encuentran los documentos técnicos, académicos y reportes de calidad que respaldan el diseño, arquitectura, aseguramiento de calidad y evaluación experimental de la plataforma **TallerSmart**.

### 0. [Protocolo de validación y evidencias]
* Define el guion reproducible de una orden completa, casos difíciles, formato de revisión humana de SmartMec, medición de utilidad para el taller y procedimiento de respaldo/restauración de fotos.
* Separa resultados ya implementados de evidencia que todavía debe capturarse; no reporta mediciones pendientes como resultados.

---

## Documentos Disponibles

### 1. [Memoria Técnica y Documento Académico del Proyecto](MEMORIA_TECNICA_PROYECTO.md)
* **Archivo:** [`MEMORIA_TECNICA_PROYECTO.md`](MEMORIA_TECNICA_PROYECTO.md)
* **Alcance:** Documento formal completo del proyecto de ingeniería de software.
* **Contenido:**
  - Resumen ejecutivo y abstract en inglés.
  - Capítulo 1: Introducción, justificación y formulación del problema.
  - Capítulo 2: Marco teórico, protocolo OBD-II y estado del arte.
  - Capítulo 3: Especificación de requisitos funcionales (RF-01 a RF-06) y no funcionales (RNF-01 a RNF-09).
  - Capítulo 4: Arquitectura del sistema (Modelo C4, multi-inquilino con `AsyncLocalStorage`, máquina de estados de OTs, diagrama ER y cliente Next.js 15).
  - Capítulo 5: Implementación técnica, criptografía PBKDF2 (310k rondas), sesiones HMAC HttpOnly, RBAC y motor PDFKit.
  - Capítulo 6: Estrategia de aseguramiento de calidad y límites de la evidencia; la revalidación local actual se registra en el informe de pruebas.
  - Capítulo 7: Conclusiones, métricas de impacto y trabajo futuro.
  - Referencias bibliográficas (normas IEEE, OWASP ASVS, SAE J1979).

---

### 2. [Informe Consolidado de Pruebas y Validación de Calidad](TESTING_VALIDATION_REPORT.md)
* **Archivo:** [`TESTING_VALIDATION_REPORT.md`](TESTING_VALIDATION_REPORT.md)
* **Alcance:** Memoria histórica de pruebas unitarias, integración y End-to-End, con revalidación local del 11-11-2026 y limitaciones explícitas.
* **Contenido:**
  - Matriz de trazabilidad de requisitos vs suites de pruebas.
  - El informe original registró 36 pruebas unitarias y 37 de integración.
  - La revalidación local actual registró 80 pruebas backend aprobadas en conjunto y 9 pruebas E2E aprobadas.
  - Las pruebas backend usan dobles de Prisma en varias suites; los E2E cubren la interfaz básica, no el recorrido OT completo.
  - Tiempos de ejecución y comandos de reproducción.

---

### 3. [Informe Formal de Evaluación del Componente Inteligente (SmartMec)](SMARTMEC_AI_EVALUATION_REPORT.md)
* **Archivo:** [`SMARTMEC_AI_EVALUATION_REPORT.md`](SMARTMEC_AI_EVALUATION_REPORT.md)
* **Alcance:** Benchmark técnico de 20 casos del modelo de lenguaje Google Gemini; no equivale a la revisión humana comparativa pendiente.
* **Contenido:**
  - Matriz benchmark de 20 casos automotrices evaluados en vivo contra la API de Gemini.
  - Métricas de precisión diagnóstica (100%), sesgo de seguridad en urgencia (71.4%) y recall técnico (86.2%).
  - Tiempos de inferencia y percentiles de latencia (Mediana P50: 2.0s, Media: 4.0s).
  - Análisis de alucinaciones (0% de alucinaciones detectadas).
  - Pruebas adversarias de seguridad vial y activación de guardarraíles.
  - Evidencia serializada en `.agents/reports/smartmec-evaluation-results.json`.
