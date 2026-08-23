# App Móvil de Evento

## Objetivo
Crear una app móvil para iOS y Android que reutilice el mismo backend y el mismo sistema de autenticación del web actual, con acceso para asistentes y para staff/organización.

## Alcance
- Login y sesión persistida con el auth actual.
- Vista de asistente: inicio, agenda, detalle de evento, mis inscripciones y perfil.
- Vista de staff: acceso básico a eventos, asistentes y check-in operativo.
- Navegación por roles con una sola app móvil.
- Consumo del backend existente sin duplicar lógica de negocio.

## No Alcance
- Reescribir el frontend web.
- Crear un backend nuevo.
- Cambiar permisos o credenciales del backend.
- Offline-first completo.
- Chat en tiempo real o streaming nativo en esta primera versión.

## Enfoque
Usar `React Native + Expo` como una app separada dentro del repo, en un directorio `mobile/` propio, con su `package.json`, configuración y build independientes.

La app consumirá la API existente y usará la misma identidad de usuario que el web:
- `login`
- `refresh`
- `me`
- `logout`

## Arquitectura
La app móvil será una superficie nueva, no una adaptación del frontend web.

### Capas
- `mobile/app/`: navegación y pantallas.
- `mobile/src/api/`: cliente HTTP, auth, sesiones y helpers de endpoints.
- `mobile/src/features/`: flujos por dominio: auth, agenda, inscripciones, check-in, perfil.
- `mobile/src/components/`: UI reutilizable.
- `mobile/src/state/`: cache, sesión y almacenamiento seguro.

### Navegación
- Stack de auth para login/reset básico.
- Stack principal con tabs o drawer según rol.
- Rutas protegidas por estado de sesión y permisos.

## Roles y UX
### Asistente
- Ver agenda del evento.
- Ver detalle de sesiones.
- Ver inscripciones y estado.
- Ver perfil y datos básicos.

### Staff / Organización
- Ver agenda operativa.
- Ver participantes y asistentes.
- Ejecutar check-in rápido.
- Acceder a vistas de trabajo básicas por evento.

Un usuario con ambos permisos ve ambas superficies, sin duplicar sesión.

## Flujo de datos
1. La app abre y lee la sesión guardada de forma segura.
2. Si hay token, intenta refrescar y consulta `me`.
3. Con el usuario cargado, resuelve roles y habilita el mapa de navegación.
4. La agenda y los datos operativos se piden desde el backend existente.
5. Las mutaciones importantes reintentan solo cuando tenga sentido; el error se muestra con feedback claro y sin perder la sesión.

## Errores
- Si el login falla, mostrar mensaje corto y reutilizable.
- Si el token expira, reintentar refresh una vez y volver al login si falla.
- Si una pantalla no puede cargar datos, mostrar empty/error state con reintento.
- Si el usuario no tiene permiso para una ruta, redirigir al inicio correcto.
- Si el backend está caído, la app debe seguir arrancando y mostrar estado degradado.

## Seguridad
- Guardar tokens con almacenamiento seguro del dispositivo.
- No exponer secrets en el bundle.
- Mantener la misma identidad de usuario que el backend usa en web.

## Testing
- Tests unitarios para auth, parsing de sesión y helpers de API.
- Tests de navegación/guards para verificar redirección por rol.
- Smoke de build móvil para validar que Expo compila.
- Verificación manual de login, agenda y check-in básico.

## Resultado Esperado
Una app móvil separada, reutilizable y mantenible, con la misma autenticación y datos del backend actual, lista para evolucionar por fases sin tocar el frontend web.
