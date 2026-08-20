# Roadmap

## Completado

- [x] Fase 0 - Infraestructura: Docker Compose, NestJS scaffold, Auth + Users, proxy
- [x] Fase 1 - Core: Cursos, Inscripciones, Pagos, Certificados, Plantillas
- [x] Fase 2 - Asistentes & Agenda: Perfil, Agenda jerarquica, Check-in, Credenciales
- [x] Fase 3 - Ponentes, Expositores, Patrocinadores con beneficios
- [x] Fase 4 - Networking & Streaming: Chat, Match, Reuniones, Salas + Encuestas + Q&A
- [x] Fase 5 - Gamificacion & Interaccion: Puntos, Badges, Ranking, Comentarios, Likes, Trivias
- [x] Fase 6 - CMS & Notificaciones: Paginas, Blog, Galeria, FAQ, Notificaciones con plantillas
- [x] Fase 7 - API Publica, Webhooks, PWA, OAuth2 Google
- [x] Fase 8 - Analytics, Export CSV, Audit Logs, Organizaciones multi-tenant, Permisos granulares
- [x] Redis caching - CacheService global con ioredis, fallback graceful
- [x] MinIO storage - StorageService S3-compatible con fallback a disco local
- [x] WebSocket chat - ChatGateway con socket.io (join, send, typing, read)
- [x] Swagger/OpenAPI - Documentacion auto-generada en `/docs`
- [x] Unit tests - 12 tests pasando (Cursos, Auth, Analytics)

## Proximos pasos

- [ ] Desplegar NestJS como servicio separado en Dokploy
- [x] Aplicar branding LACDI (colores hex + logo)
- [ ] Tests de integracion (end-to-end)
- [ ] App movil (React Native o Flutter)
- [ ] CI/CD pipeline (GitHub Actions)
