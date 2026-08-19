# Dokploy

Guía corta para desplegar `evento-web` en Dokploy.

## Proyecto

- Repo: `https://github.com/brandall2021/evento.git`
- Branch: `master2`
- Build: Dockerfile en la raíz del repo
- App port: `3001`
- Health check: `/api/health`

## Servicios

### App

- Name: `evento-web`
- Port: `3001`
- Volume: `/app/backend/uploads`

### PostgreSQL

- Name: `evento-db`
- Port: `5432`
- Database: `evento_web`
- User: `postgres`

## Variables de entorno

```env
PORT=3001
DB_HOST=evento-db
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=***
JWT_SECRET=***
JWT_EXPIRES_IN=7d
API_URL=https://evento.tudominio.com
CORS_ORIGIN=https://evento.tudominio.com
```

## Pasos

1. Crear proyecto en Dokploy.
2. Conectar el repo GitHub y fijar la branch `master2`.
3. Crear el servicio PostgreSQL `evento-db`.
4. Crear la app `evento-web` desde el Dockerfile raíz.
5. Cargar las variables de entorno.
6. Exponer el puerto `3001` y el health check `/api/health`.
7. Montar `/app/backend/uploads` para persistir archivos.
8. Habilitar auto deploy por SSH key o webhook.
