# Spec: Constructor de Formularios Dinámicos

**Fecha:** 2026-08-21  
**Proyecto:** evento-web  
**Estado:** Aprobado en chat, listo para implementación

---

## 1. Objetivo

Construir un sistema de formularios dinámicos administrable desde el panel, con versiones publicadas estables y renderer público reutilizable.

El primer alcance cubre formularios de inscripción, pero el modelo debe servir también para otros formularios administrativos y CMS.

---

## 2. Alcance

### Incluido
- Editor de formularios desde el panel admin.
- Versionado por borrador/publicación.
- Renderer público basado en la versión publicada.
- Reglas soportadas en la primera entrega:
  - `required`
  - longitud mínima/máxima
  - rango mínimo/máximo
  - regex
  - condicionales simples
- Respuestas persistidas contra una versión concreta.

### Excluido
- Cálculos automáticos.
- Repetidores.
- Visibilidad por rol.
- Lógica de workflow avanzada.

---

## 3. Arquitectura

### Enfoque
- `DB-first` con borrador editable y snapshot publicado.
- El panel modifica el borrador.
- Publicar congela un JSON de versión.
- El público solo lee la versión publicada.

### Módulos
- `forms` en backend: entidades, service y controller admin.
- `public-api` en backend: lectura pública de formularios publicados.
- Frontend admin: builder y listado de formularios.
- Frontend público: renderer de formulario y envío de respuestas.

---

## 4. Modelo de Datos

### `form_templates`
- `id`
- `slug`
- `name`
- `context`
- `status` (`draft`, `published`, `archived`)
- `draft_schema_json`
- `published_version_id`

### `form_template_versions`
- `id`
- `form_template_id`
- `version_number`
- `schema_json`
- `published_at`

### `form_submissions`
- `id`
- `form_template_id`
- `form_template_version_id`
- `payload_json`
- `submitted_by_user_id` nullable
- `submitted_at`

### Esquema JSON de campos
Cada campo conserva:
- `id`
- `type`
- `name`
- `label`
- `helpText`
- `placeholder`
- `required`
- `validation`
- `condition`
- `order`

---

## 5. Reglas

### Validación soportada
- `required`: campo obligatorio.
- `minLength` / `maxLength`: strings.
- `min` / `max`: números o fechas según tipo.
- `regex`: patrón de texto.
- `condition`: mostrar/validar según valor de otro campo.

### Regla de publicación
- Toda publicación crea una versión inmutable.
- La versión publicada no se edita.
- El borrador puede cambiar sin afectar envíos históricos.

---

## 6. Experiencia de usuario

### Admin
- Lista de formularios.
- Crear formulario.
- Editar estructura de campos.
- Publicar versión.
- Ver historial de versiones.

### Público
- Abrir formulario por `slug`.
- Renderizar campos desde la versión publicada.
- Enviar respuestas.

---

## 7. Testing

- Normalización del esquema JSON.
- Evaluación de reglas simples.
- Publicación crea versión nueva.
- Renderer público usa solo versión publicada.
- Build y lint del frontend.

---

## 8. Fuera de Alcance Inmediato

- Constructor visual avanzado con drag and drop.
- Secciones repetibles.
- Reglas por rol.
- Cálculos automáticos.
- Workflow complejo de aprobación.
