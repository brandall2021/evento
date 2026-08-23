# Estado de `proyecto.txt`

Documento de seguimiento contra la especificación técnica de `proyecto.txt`.

## Hecho

- Auth JWT con `login`, `register`, `refresh`, `logout` y `me`.
- RBAC base con `users`, `roles`, `tenants`, `permissions` y auditoría.
- Backend Nest con health, Swagger, throttling y multi-tenant base.
- Frontend Next con login, register, dashboard y pantallas admin.
- Admin frontend completo para usuarios, roles, instituciones, permisos y settings.
- Gestión frontend de cursos e inscripciones sobre los endpoints reales del backend.
- Gestión frontend de pagos, check-in y credenciales sobre los endpoints reales del backend.
- Eventos públicos, tipos de evento y página pública de evento.
- Constructor de formularios dinámicos con borrador, publicación y renderer público.
- Participantes e inscripciones completos con alta pública y alta autenticada.
- Cupos visibles en la UI pública y lista de espera operativa cuando el curso está completo.
- Programa académico con agenda reordenable por drag-and-drop jerárquico en días, bloques y sesiones.
- App móvil Expo para asistentes y staff reutilizando el mismo backend y auth.
- Branding LACDI aplicado en todo el frontend.
- Deploy separado para Dokploy con `backend-next` y `frontend`.
- Tests básicos y smoke E2E de arranque.

## Parcial

- Arquitectura: el repo tiene frontend + backend separados, no un monolito modular único.
- Docs: README y roadmap están alineados con el estado actual, pero no sustituyen toda la especificación.
- Stack: la base técnica está en Next + Nest + PostgreSQL + Redis + MinIO, pero la spec original pedía una versión más amplia y estricta.

## Falta

- Ponentes, materiales y evaluación.
- Pagos reales con Mercado Pago y webhooks.
- Credenciales, acreditación y asistencia por actividad.
- Certificados, validación pública, revocación y plantillas avanzadas.
- Encuestas, notificaciones, email worker, reportes y exportaciones.
- Tests de integración y E2E completos del flujo end-to-end.

## Observación

- Este documento marca el estado del repo actual contra `proyecto.txt` al momento de la revisión. No es la spec original; es una guía de seguimiento.
