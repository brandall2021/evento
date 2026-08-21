function getProgramEditorMeta(kind) {
  switch (kind) {
    case 'day':
      return { title: 'Editar día', description: 'Ajusta el título, fecha u orden del día.', submitLabel: 'Guardar día' }
    case 'block':
      return { title: 'Editar bloque', description: 'Modifica el nombre y el rango horario.', submitLabel: 'Guardar bloque' }
    case 'room':
      return { title: 'Editar sala', description: 'Actualiza nombre, capacidad o ubicación.', submitLabel: 'Guardar sala' }
    case 'session':
      return { title: 'Editar sesión', description: 'Actualiza los datos básicos de la sesión.', submitLabel: 'Guardar sesión' }
    default:
      return { title: '', description: '', submitLabel: '' }
  }
}

module.exports = { getProgramEditorMeta }
