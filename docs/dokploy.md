# Dokploy

Guía corta para desplegar `evento-web` en Dokploy como dos servicios separados.

## Proyecto

- Repo: `https://github.com/brandall2021/evento.git`
- Branch: `master2`

## Servicios

### API NestJS

- Name: `evento-api`
- Build context: `backend-next/`
- Dockerfile: `backend-next/Dockerfile`
- Port: `3002`
- Health check: `/api/v1/health`

### Frontend Next.js

- Name: `evento-web`
- Build context: `frontend/`
- Dockerfile: `frontend/Dockerfile`
- Port: `3000`
- Health check: `/`

### Infraestructura

- Name: `evento-db`
- Port: `5432`
- Database: `evento_web`
- User: `postgres`

- Name: `evento-redis`
- Port: `6379`

- Name: `evento-minio`
- Port: `9000` / `9001`

## Variables de entorno

### API

```env
PORT=3002
DB_HOST=evento-db
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=***
# alternatively: DATABASE_URL=postgresql://postgres:***@evento-db:5432/evento_web
JWT_SECRET=***
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_HOST=evento-redis
REDIS_PORT=6379
MINIO_ENDPOINT=evento-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=evento-files
# public site URL used in generated PDFs and QR validation links
API_URL=https://evento.tudominio.com
CORS_ORIGIN=https://evento.tudominio.com
```

### Frontend

```env
PORT=3000
NEXT_PUBLIC_API_URL=https://api.evento.tudominio.com/api/v1
```

## Pasos

1. Crear proyecto en Dokploy.
2. Conectar el repo GitHub y fijar la branch `master2`.
3. Crear los servicios `evento-db`, `evento-redis` y `evento-minio`.
4. Crear la app `evento-api` usando `backend-next/Dockerfile`.
5. Crear la app `evento-web` usando `frontend/Dockerfile`.
6. Cargar las variables de entorno de cada servicio.
7. Exponer los puertos `3002` y `3000`.
8. Habilitar auto deploy por SSH key o webhook.
