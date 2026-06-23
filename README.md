# Evento — Sistema de Gestión de Eventos y Cursos

Plataforma completa para que instituciones educativas y organizaciones publiquen cursos, gestionen inscripciones, procesen pagos y emitan certificados digitales.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + Vite 8 + React Router |
| **Backend** | Node.js + Express |
| **Base de datos** | PostgreSQL |
| **ORM** | Sequelize |
| **Autenticación** | JWT (jsonwebtoken + bcryptjs) |
| **PDF** | PDFKit + QRCode |
| **Despliegue** | Docker + Dokploy |

## Estructura

```
evento-web/
├── backend/
│   └── src/
│       ├── config/database.js    # Conexión PostgreSQL
│       ├── models/               # Modelos Sequelize
│       │   ├── User.js
│       │   ├── Curso.js
│       │   ├── Inscripcion.js
│       │   ├── Pago.js
│       │   ├── Asistencia.js
│       │   └── Certificado.js
│       ├── controllers/          # Lógica de negocio
│       ├── routes/               # Rutas Express
│       ├── middleware/auth.js    # JWT + roles
│       └── seeders/seed.js       # Datos iniciales
├── src/
│   ├── components/               # Layout, ProtectedRoute
│   ├── context/AuthContext.jsx   # Estado de autenticación
│   ├── pages/                    # Páginas del frontend
│   └── services/api.js           # Cliente HTTP
├── Dockerfile                    # Multi-stage build
└── .dockerignore
```

## Variables de entorno

### Backend (`.env`)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=evento-web-secret-key-2026
JWT_EXPIRES_IN=7d
API_URL=http://localhost:3001
```

### Frontend (para desarrollo)

```env
VITE_API_URL=http://localhost:3001/api
```

> En producción el frontend se sirve desde el mismo Express, por lo que `VITE_API_URL` no es necesario (usa `/api` por defecto).

## Instalación y desarrollo local

```bash
# 1. Clonar
git clone https://github.com/brandall2021/evento.git
cd evento-web

# 2. Instalar dependencias
npm install
cd backend && npm install && cd ..

# 3. Configurar base de datos
#   Crear DB en PostgreSQL: createdb evento_web
#   Editar backend/.env con tus credenciales

# 4. Sembrar datos iniciales
cd backend && npm run seed && cd ..

# 5. Iniciar (requiere dos terminales)
cd backend && npm run dev    # API en http://localhost:3001
cd .. && npm run dev          # Frontend en http://localhost:5173
```

## Usuarios seed

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@evento.com | admin123 |
| Docente | carlos@evento.com | docente123 |
| Docente | maria@evento.com | docente123 |
| Estudiante | juan@test.com | 123456 |
| Estudiante | ana@test.com | 123456 |

## API endpoints

### Auth
- `POST /api/auth/register` — Registro
- `POST /api/auth/login` — Login → JWT
- `GET /api/auth/me` — Perfil actual

### Cursos
- `GET /api/cursos` — Listar
- `GET /api/cursos/:id` — Detalle
- `POST /api/cursos` — Crear (admin/docente)
- `PUT /api/cursos/:id` — Actualizar
- `DELETE /api/cursos/:id` — Eliminar (admin)

### Inscripciones
- `POST /api/inscripciones` — Solicitar inscripción
- `GET /api/inscripciones/mis` — Mis inscripciones
- `GET /api/inscripciones` — Todas (admin/docente)
- `PUT /api/inscripciones/:id/aprobar` — Aprobar
- `PUT /api/inscripciones/:id/rechazar` — Rechazar

### Pagos
- `POST /api/pagos` — Crear pago
- `GET /api/pagos` — Listar
- `PUT /api/pagos/:id/confirmar` — Confirmar pago

### Certificados
- `GET /api/certificados` — Listar
- `POST /api/certificados/emitir` — Emitir certificado
- `GET /api/certificados/:id/descargar` — Descargar PDF
- `GET /api/certificados/validar/:codigo` — Validar código (público)

## Despliegue con Dokploy

### Usando Docker

```bash
# Build
docker build -t evento-web:latest .

# Run (ajustar variables de entorno)
docker run -d \
  --name evento-web \
  -p 3001:3001 \
  -e DB_HOST=postgres \
  -e DB_NAME=evento_web \
  -e DB_USER=postgres \
  -e DB_PASSWORD=secreto \
  -e JWT_SECRET=clave-segura \
  -e API_URL=https://tudominio.com \
  evento-web:latest
```

### Configuración en Dokploy

1. Crear proyecto → **Docker** deployment
2. Repositorio: `https://github.com/brandall2021/evento`
3. Puerto: `3001`
4. Variables de entorno requeridas:

| Variable | Descripción |
|----------|------------|
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto (default: 5432) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña |
| `JWT_SECRET` | Clave secreta para tokens |
| `API_URL` | URL pública del deployment |

5. Agregar un servicio **PostgreSQL** vinculado

> La primera vez que arranque, el backend crea automáticamente las tablas (synchronize). Para datos de prueba, ejecutar `npm run seed` dentro del contenedor o vía Dokploy.

## Funcionalidades

- **Roles:** Admin, docente y estudiante con permisos diferenciados
- **Cursos:** CRUD completo con modalidades (virtual/presencial/híbrido)
- **Inscripciones:** Flujo pendiente → aceptado/rechazado, con aceptación automática opcional
- **Pagos:** Por cuotas, con confirmación manual y desbloqueo automático
- **Asistencia:** Control por clase, requisito mínimo 80%
- **Certificados:** PDF generado con código único y QR de validación pública
- **Validación:** Endpoint público sin autenticación para verificar certificados
