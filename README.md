# Evento — Sistema de Gestión de Eventos y Cursos

Plataforma completa para que instituciones educativas y organizaciones publiquen cursos, gestionen inscripciones, procesen pagos y emitan certificados digitales con validación por QR. Incluye editor de plantillas de certificado con firma electrónica, panel de administración de usuarios, modo oscuro/claro, y landing page institucional.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + Vite 8 + React Router 7 |
| **Backend** | Node.js + Express 4 |
| **Base de datos** | PostgreSQL |
| **ORM** | Sequelize 6 |
| **Autenticación** | JWT (jsonwebtoken + bcryptjs) |
| **Editor enriquecido** | Tiptap (descrito de React Quill por incompatibilidad con React 19) |
| **Generación PDF** | PDFKit + QRCode |
| **Subida de archivos** | Multer (imágenes de cursos, firma, logo) |
| **Validación** | express-validator |
| **Seguridad** | express-rate-limit, CORS configurable |
| **Despliegue** | Docker (multi-stage) + Dokploy |

## Estructura del proyecto

```
evento-web/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexión PostgreSQL (Sequelize)
│   │   ├── models/
│   │   │   ├── index.js             # Asociaciones entre modelos
│   │   │   ├── User.js              # Usuarios (admin/docente/estudiante)
│   │   │   ├── Curso.js             # Cursos con soft delete
│   │   │   ├── Inscripcion.js       # Solicitudes, estados, cupos
│   │   │   ├── Pago.js              # Pagos por cuota
│   │   │   ├── Asistencia.js        # Control de asistencia
│   │   │   ├── Certificado.js       # PDF + QR + validación
│   │   │   └── PlantillaCertificado.js # Plantilla de certificado (JSONB)
│   │   ├── controllers/
│   │   │   ├── authController.js       # Registro, login, perfil
│   │   │   ├── cursoController.js      # CRUD con paginación
│   │   │   ├── inscripcionController.js# Solicitud, aprobar/rechazar
│   │   │   ├── pagoController.js       # Crear, confirmar (desbloqueo automático)
│   │   │   ├── certificadoController.js# Emitir, descargar PDF, validar
│   │   │   ├── plantillaController.js  # CRUD plantillas con archivos
│   │   │   └── usuarioController.js    # CRUD usuarios + toggleActivo + estadísticas
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── cursos.js
│   │   │   ├── inscripciones.js
│   │   │   ├── pagos.js
│   │   │   ├── certificados.js
│   │   │   ├── plantillas.js        # Multer para firma/logo
│   │   │   └── usuarios.js          # Solo admin
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT + roles + query token fallback
│   │   │   ├── validate.js             # Schemas express-validator
│   │   │   └── errorHandler.js         # Manejador centralizado de errores
│   │   ├── seeders/
│   │   │   └── seed.js                 # Datos de prueba (5 usuarios, 5 cursos)
│   │   └── index.js                    # Entry point
│   ├── uploads/                        # Archivos generados (QR, firmas, logos)
│   ├── .env                            # Variables de entorno
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Layout.jsx                  # Header + navegación responsive
│   │   ├── ProtectedRoute.jsx          # Guard por autenticación y roles
│   │   ├── ErrorBoundary.jsx           # Captura errores de React
│   │   └── RichTextEditor.jsx          # Editor Tiptap (compatible React 19)
│   ├── context/
│   │   ├── AuthContext.jsx             # Estado de autenticación global
│   │   ├── ThemeContext.jsx            # Modo oscuro/claro (persistente)
│   │   └── NotificationContext.jsx     # Sistema de toasts
│   ├── pages/
│   │   ├── Landing.jsx                 # Landing page institucional
│   │   ├── Login.jsx                   # Inicio de sesión
│   │   ├── Register.jsx                # Registro de usuarios
│   │   ├── CursosList.jsx              # Grid con búsqueda y filtro por categoría
│   │   ├── CursoDetail.jsx             # Detalle + solicitud de inscripción (HTML render)
│   │   ├── MisInscripciones.jsx        # Estado de inscripciones + descarga certificados
│   │   ├── Dashboard.jsx               # Panel admin con estadísticas
│   │   ├── AdminCursos.jsx             # CRUD completo de cursos + imágenes
│   │   ├── AdminInscripciones.jsx      # Aprobar/rechazar solicitudes
│   │   ├── AdminCertificados.jsx       # Emitir y listar certificados
│   │   ├── AdminPlantillas.jsx         # Editor visual de plantillas de certificado
│   │   └── AdminUsuarios.jsx           # Administración de usuarios
│   ├── services/
│   │   └── api.js                      # Cliente HTTP con JWT automático
│   ├── App.jsx                         # Router con lazy loading
│   ├── App.css                         # Estilos del sistema
│   ├── index.css                       # Variables CSS + reset + modo oscuro
│   └── main.jsx                        # Entry point
├── public/
├── Dockerfile                          # Multi-stage build (40MB producción)
├── .dockerignore
└── package.json
```

## Modelo de datos

```
User ──1:N──> Inscripcion <──N:1── Curso
  │                │
  │                ├──1:N──> Pago
  │                ├──1:N──> Asistencia
  │                └──1:1──> Certificado
  │
  └──1:N──> Curso (como docente)

PlantillaCertificado ──1:N──> Certificado
  (JSONB config: colores, fuentes, tamaños, posición elementos)
  (firma_url, logo_url, is_default)
```

### Roles

| Rol | Permisos |
|-----|----------|
| **Admin** | CRUD completo, aprobar/rechazar inscripciones, emitir certificados, confirmar pagos, gestionar plantillas, administrar usuarios |
| **Docente** | Crear/editar cursos propios, ver inscripciones de sus cursos |
| **Estudiante** | Ver cursos, solicitar inscripción, ver estado, descargar certificados |

## API endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registro (nombre, email, password) |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | Sí | Perfil del usuario actual |
| PUT | `/api/auth/profile` | Sí | Actualizar nombre/teléfono |

### Cursos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/cursos` | Sí | Listar (con paginación: `?page=&pageSize=`) |
| GET | `/api/cursos/:id` | Sí | Detalle del curso |
| POST | `/api/cursos` | Admin/Docente | Crear curso |
| PUT | `/api/cursos/:id` | Admin/Docente | Actualizar (dueño o admin) |
| DELETE | `/api/cursos/:id` | Admin | Eliminar (soft delete) |

### Inscripciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/inscripciones` | Estudiante | Solicitar inscripción |
| GET | `/api/inscripciones/mis` | Estudiante | Mis inscripciones |
| GET | `/api/inscripciones` | Admin/Docente | Listar todas (con paginación) |
| PUT | `/api/inscripciones/:id/aprobar` | Admin | Aprobar |
| PUT | `/api/inscripciones/:id/rechazar` | Admin | Rechazar con motivo |

### Pagos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pagos` | Sí | Crear pago |
| GET | `/api/pagos` | Sí | Listar (con paginación) |
| PUT | `/api/pagos/:id/confirmar` | Admin | Confirmar pago |

### Certificados
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/certificados` | Sí | Listar (con paginación) |
| POST | `/api/certificados/emitir` | Admin | Emitir (verifica 80% asistencia) |
| GET | `/api/certificados/:id/descargar` | Sí | Descargar PDF (usa plantilla activa) |
| GET | `/api/certificados/validar/:codigo` | No | Validar código público |

### Plantillas de certificado
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/plantillas` | Sí | Listar todas |
| GET | `/api/plantillas/:id` | Sí | Detalle de plantilla |
| POST | `/api/plantillas` | Admin | Crear plantilla (con config JSON, firma, logo) |
| PUT | `/api/plantillas/:id` | Admin | Actualizar plantilla |
| DELETE | `/api/plantillas/:id` | Admin | Eliminar plantilla |
| PUT | `/api/plantillas/:id/defecto` | Admin | Establecer como plantilla por defecto |
| GET | `/api/plantillas/activo/config` | Sí | Obtener configuración de plantilla activa |

### Usuarios (admin)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/usuarios` | Admin | Listar (con paginación, filtros: rol, busqueda, activo) |
| GET | `/api/usuarios/estadisticas` | Admin | Conteos por rol y estado |
| GET | `/api/usuarios/:id` | Admin | Detalle de usuario |
| POST | `/api/usuarios` | Admin | Crear usuario |
| PUT | `/api/usuarios/:id` | Admin | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Admin | Eliminar usuario (hard delete) |
| PUT | `/api/usuarios/:id/toggle` | Admin | Activar/desactivar usuario |

## Instalación y desarrollo local

### Requisitos
- Node.js 20+
- PostgreSQL 14+
- npm

### Pasos

```bash
# 1. Clonar
git clone https://github.com/brandall2021/evento.git
cd evento-web

# 2. Instalar dependencias
npm install
cd backend && npm install && cd ..

# 3. Configurar base de datos
createdb evento_web
# Editar backend/.env con tus credenciales

# 4. Sembrar datos iniciales
cd backend && npm run seed && cd ..

# 5. Iniciar (dos terminales)
cd backend && npm run dev      # API → http://localhost:3001
cd .. && npm run dev            # Frontend → http://localhost:5173
```

### Variables de entorno

#### Backend (`backend/.env`)

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
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

> `CORS_ORIGIN` permite múltiples orígenes separados por coma. En producción, reemplazar con el dominio real.

#### Frontend (solo desarrollo)

```env
VITE_API_URL=http://localhost:3001/api
```

> En producción el frontend se sirve desde Express, por lo que usa `/api` por defecto.

### Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@evento.com | admin123 |
| Docente | carlos@evento.com | docente123 |
| Docente | maria@evento.com | docente123 |
| Estudiante | juan@test.com | 123456 |
| Estudiante | ana@test.com | 123456 |

## Despliegue con Docker

### Build y run local

```bash
# Build
docker build -t evento-web:latest .

# Run
docker run -d \
  --name evento-web \
  -p 3001:3001 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=evento_web \
  -e DB_USER=postgres \
  -e DB_PASSWORD=secreto \
  -e JWT_SECRET=clave-segura-cambiame \
  -e JWT_EXPIRES_IN=7d \
  -e API_URL=https://tudominio.com \
  -e CORS_ORIGIN=https://tudominio.com \
  evento-web:latest

# Seed dentro del contenedor
docker exec evento-web npm run seed
```

## Despliegue con Dokploy

### Requisitos en Dokploy
- Servidor con Docker instalado
- Dokploy con acceso al repositorio de GitHub

### Configuración paso a paso

1. **Crear proyecto**
   - En Dokploy, ir a **Proyectos → Nuevo proyecto**
   - Tipo: **Docker deployment**
   - Nombre: `evento-web`

2. **Conectar repositorio**
   - Repositorio: `https://github.com/brandall2021/evento`
   - Rama: `main`
   - Build method: `Dockerfile` (auto-detected)

3. **Configurar puerto**
   - Puerto del contenedor: `3001`

4. **Variables de entorno requeridas**

   | Variable | Descripción | Ejemplo |
   |----------|------------|---------|
   | `DB_HOST` | Host interno de PostgreSQL en Dokploy | `postgres` |
   | `DB_PORT` | Puerto de PostgreSQL | `5432` |
   | `DB_NAME` | Nombre de la base de datos | `evento_web` |
   | `DB_USER` | Usuario de BD | `postgres` |
   | `DB_PASSWORD` | Contraseña de BD | *(generar aleatoria)* |
   | `JWT_SECRET` | Clave para firmar tokens JWT | *(generar con `openssl rand -hex 32`)* |
   | `JWT_EXPIRES_IN` | Duración del token | `7d` |
   | `API_URL` | URL pública del deploy | `https://evento.tudominio.com` |
   | `CORS_ORIGIN` | Orígenes permitidos | `https://evento.tudominio.com` |

5. **Agregar servicio PostgreSQL**
   - En Dokploy, crear un servicio **PostgreSQL** vinculado al proyecto
   - Anotar los datos de conexión generados
   - Las tablas se crean automáticamente al iniciar (Sequelize sync)

6. **Seed inicial (opcional)**
   ```bash
   # Ejecutar dentro del contenedor via Dokploy terminal
   cd /app/backend && npm run seed
   ```

7. **Health check**
   - Ruta: `/api/health`
   - Respuesta esperada: `{ "ok": true }`

### Notas de producción

- El Dockerfile usa **multi-stage build**: ~40MB en producción
- El frontend compilado (Vite) se sirve desde Express en `dist/` con headers `no-cache`
- Los archivos generados se guardan en `backend/uploads/` (QR, firmas, logos de certificados)
- Se recomienda usar un **volumen persistente** para `backend/uploads` si se reinicia el contenedor
- SSL termina en Dokploy o en un reverse proxy (Nginx, Traefik)
- React 19 requiere `--legacy-peer-deps` para Tiptap (incompatible con react-quill)

## Funcionalidades

- **Roles:** Admin, docente y estudiante con permisos diferenciados
- **Cursos:** CRUD completo con modalidades (virtual/presencial/híbrido), categorías, estados (borrador/publicado/finalizado)
- **Búsqueda y filtros:** Por nombre y categoría en la grilla de cursos
- **Inscripciones:** Flujo pendiente → aceptado/rechazado, con verificación de cupos y aceptación automática configurable
- **Pagos:** Por cuotas, con confirmación manual y desbloqueo automático al completar el pago
- **Asistencia:** Control por clase, requisito mínimo 80% para certificación
- **Certificados:** PDF generado con código único, QR de validación pública y endpoint de verificación
- **Plantillas de certificado:** Editor visual con colores, fuentes, tamaños, posición de elementos; firma electrónica y logo personalizables
- **Validación pública:** Sin autenticación, solo con el código único del certificado
- **Administración de usuarios:** CRUD completo con activar/desactivar, estadísticas por rol, búsqueda y filtros
- **Modo oscuro/claro:** Toggle persistente con preferencia guardada en localStorage
- **Editor enriquecido:** Tiptap para descripción y requisitos de cursos (compatible con React 19)
- **Subida de imágenes:** Multer para imágenes de cursos (jpg/png/webp, 5MB máx), firma y logo de certificados
- **Landing page:** Página de inicio con hero, características, cursos destacados, CTA y footer
- **Finalización rápida:** Botón para cambiar estado de curso a "finalizado" directamente desde admin
- **Soft delete:** Todos los modelos mantienen registros eliminados con timestamp
- **Paginación:** Endpoints de listado soportan `?page=1&pageSize=20`
- **Rate limiting:** 200 req/15min global, 20 req/15min en auth
- **Validación de entrada:** Schemas con express-validator en todas las rutas POST/PUT
- **Seguridad:** JWT sin exposición en URLs, CORS configurable, manejo centralizado de errores
- **UX:** Lazy loading de rutas, skeleton loaders, notificaciones toast, error boundary
- **Responsive:** Adaptado a mobile, tablet y desktop
- **Despliegue:** Docker multi-stage (~40MB), Dokploy, uploads persistentes

## Licencia

MIT
