# Documentación Formal del Proyecto TallerSmart
> 🎯 **Hito Académico:** **Avance 6 — Terminación, pruebas y validación (9 de noviembre)**  
> 🟢 **Estado de los Entregables:** Documentación técnica, académica y empírica al 100% completada.

En este directorio se encuentran los documentos técnicos, académicos y reportes de calidad que respaldan el diseño, arquitectura, aseguramiento de calidad y evaluación experimental de la plataforma **TallerSmart**.

---

## 📚 Documentos Disponibles

### 1. 📖 [Memoria Técnica y Documento Académico del Proyecto](MEMORIA_TECNICA_PROYECTO.md)
* **Archivo:** [`MEMORIA_TECNICA_PROYECTO.md`](MEMORIA_TECNICA_PROYECTO.md)
* **Alcance:** Documento formal completo del proyecto de ingeniería de software.
* **Contenido:**
  - Resumen ejecutivo y abstract en inglés.
  - Capítulo 1: Introducción, justificación y formulación del problema.
  - Capítulo 2: Marco teórico, protocolo OBD-II y estado del arte.
  - Capítulo 3: Especificación de requisitos funcionales (RF-01 a RF-06) y no funcionales (RNF-01 a RNF-09).
  - Capítulo 4: Arquitectura del sistema (Modelo C4, multi-inquilino con `AsyncLocalStorage`, máquina de estados de OTs, diagrama ER y cliente Next.js 15).
  - Capítulo 5: Implementación técnica, criptografía PBKDF2 (310k rondas), sesiones HMAC HttpOnly, RBAC y motor PDFKit.
  - Capítulo 6: Estrategia de aseguramiento de calidad (pirámide de pruebas, 73 pruebas backend, 9 pruebas E2E y auditorías de seguridad).
  - Capítulo 7: Conclusiones, métricas de impacto y trabajo futuro.
  - Referencias bibliográficas (normas IEEE, OWASP ASVS, SAE J1979).

---

### 2. 🧪 [Informe Consolidado de Pruebas y Validación de Calidad](TESTING_VALIDATION_REPORT.md)
* **Archivo:** [`TESTING_VALIDATION_REPORT.md`](TESTING_VALIDATION_REPORT.md)
* **Alcance:** Memoria de pruebas unitarias, integración y End-to-End.
* **Contenido:**
  - Matriz de trazabilidad de requisitos vs suites de pruebas.
  - Detalle de 36 pruebas unitarias (`apps/api/tests/unit`) aprobadas al 100%.
  - Detalle de 37 pruebas de integración (`apps/api/tests/integration`) aprobadas al 100%.
  - Detalle de 9 pruebas funcionales E2E con Playwright (`tests/e2e`).
  - Tiempos de ejecución y comandos de reproducción.

---

### 3. 🤖 [Informe Formal de Evaluación del Componente Inteligente (SmartMec)](SMARTMEC_AI_EVALUATION_REPORT.md)
* **Archivo:** [`SMARTMEC_AI_EVALUATION_REPORT.md`](SMARTMEC_AI_EVALUATION_REPORT.md)
* **Alcance:** Evaluación cuantitativa y cualitativa del modelo de lenguaje Google Gemini (`gemini-3.5-flash-lite`).
* **Contenido:**
  - Matriz benchmark de 20 casos automotrices evaluados en vivo contra la API de Gemini.
  - Métricas de precisión diagnóstica (100%), sesgo de seguridad en urgencia (71.4%) y recall técnico (86.2%).
  - Tiempos de inferencia y percentiles de latencia (Mediana P50: 2.0s, Media: 4.0s).
  - Análisis de alucinaciones (0% de alucinaciones detectadas).
  - Pruebas adversarias de seguridad vial y activación de guardarraíles.
  - Evidencia serializada en `.agents/reports/smartmec-evaluation-results.json`.
