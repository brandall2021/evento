# Programa Académico Drag & Drop

## Objetivo
Reemplazar los controles de reordenamiento por botones en `Programa académico` por drag & drop jerárquico para `días`, `bloques` y `sesiones`.

## Alcance
- Reordenar elementos dentro del mismo padre.
- Mover `bloques` entre `días`.
- Mover `sesiones` entre `bloques`.
- Mantener `orden` como fuente de verdad persistida.
- Conservar el panel lateral de edición y las acciones de duplicar/eliminar.

## No Alcance
- Cambios en la vista pública.
- Cambios en check-in, credenciales o inscripciones.
- Edición inline por arrastre de campos.

## Enfoque
Usar `dnd-kit` para resolver arrastre vertical y cross-parent sin acoplar la UI a HTML5 drag nativo.

La implementación añadirá las dependencias necesarias en `frontend/package.json` para `dnd-kit`.

Razones:
- Soporta reordenamiento estable entre listas anidadas.
- Encaja mejor con React 19 y con el layout actual del dashboard.
- Permite limitar el scope a una sola pantalla sin inventar un subsistema nuevo.

## Arquitectura
La pantalla `frontend/src/app/(dashboard)/dashboard/programa-academico/page.tsx` seguirá siendo la superficie principal.

Se agregan tres unidades de interacción:
- `DaySortZone`: lista ordenable de días.
- `BlockSortZone`: lista ordenable de bloques dentro de cada día.
- `SessionSortZone`: lista ordenable de sesiones dentro de cada bloque.

Cada zona recibe:
- `items` actuales.
- `parentId` o contexto necesario para el move.
- `onReorder` o `onMoveAcrossParent`.

El backend no cambia de contrato; se reutilizan:
- `PUT /dias/:id`
- `PUT /bloques/:id`
- `PUT /sesiones/:id`

Para mover entre padres, la UI debe actualizar en una sola operación:
- `bloques`: `dia_id` y `orden`
- `sesiones`: `bloque_id` y `orden`

## Flujo de Datos
1. El usuario arrastra un elemento dentro o fuera de su contenedor.
2. La UI calcula el nuevo orden local.
3. Si el elemento cambió de padre, la UI persiste primero el nuevo parent y luego el `orden` afectado.
4. La query `programa-academico` se invalida y la vista se rehidrata desde servidor.

## Errores
- Si el drop no produce cambio real, no se persiste nada.
- Si falla una persistencia cross-parent, se revierte la UI local y se muestra toast de error.
- Si el backend devuelve una validación o entidad faltante, el panel sigue usable.

## Pruebas
- Unit tests para helpers de reordenamiento y cálculo de payload cross-parent.
- Test de integración de la pantalla para verificar que el `drag end` dispara la mutación correcta.
- `npx tsc --noEmit`.
- `npm run build` en frontend.

## Resultado Esperado
El editor de programa académico permitirá reorganizar toda la agenda por arrastre, incluyendo movimientos entre padres, sin perder la consistencia de `orden`.
