import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useNotify } from '../context/NotificationContext'

const defaultConfig = {
  bgColor: '#faf8f5',
  borderColor: '#c9a84c',
  borderWidth: 2,
  titleColor: '#666',
  codeColor: '#c9a84c',
  nameColor: '#1a1a1a',
  textColor: '#666',
  titleFont: 'Helvetica',
  nameFont: 'Helvetica-Bold',
}

export default function AdminPlantillas() {
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [nombre, setNombre] = useState('')
  const [config, setConfig] = useState(defaultConfig)
  const [firmaFile, setFirmaFile] = useState(null)
  const [firmaPreview, setFirmaPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const firmaInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const { success, error } = useNotify()

  useEffect(() => {
    api.plantillas.listar()
      .then(setPlantillas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleFirmaChange(e) {
    const file = e.target.files[0]
    if (file) {
      setFirmaFile(file)
      setFirmaPreview(URL.createObjectURL(file))
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  function handleConfigChange(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  function handleEdit(plantilla) {
    setEditing(plantilla)
    setNombre(plantilla.nombre)
    setConfig({ ...defaultConfig, ...plantilla.config })
    setFirmaPreview(plantilla.firma_url || null)
    setLogoPreview(plantilla.logo_url || null)
    setFirmaFile(null)
    setLogoFile(null)
  }

  function handleCancel() {
    setEditing(null)
    setNombre('')
    setConfig(defaultConfig)
    setFirmaFile(null)
    setFirmaPreview(null)
    setLogoFile(null)
    setLogoPreview(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('nombre', nombre)
      formData.append('config', JSON.stringify(config))
      if (firmaFile) formData.append('firma', firmaFile)
      if (logoFile) formData.append('logo', logoFile)

      if (editing) {
        await api.plantillas.actualizar(editing.id, formData)
        success('Plantilla actualizada correctamente')
      } else {
        await api.plantillas.crear(formData)
        success('Plantilla creada correctamente')
      }
      handleCancel()
      const updated = await api.plantillas.listar()
      setPlantillas(updated)
    } catch (err) {
      error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta plantilla?')) return
    try {
      await api.plantillas.eliminar(id)
      success('Plantilla eliminada')
      setPlantillas(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      error(err.message)
    }
  }

  async function handleSetDefault(id) {
    try {
      const plantilla = plantillas.find(p => p.id === id)
      const formData = new FormData()
      formData.append('nombre', plantilla.nombre)
      formData.append('config', JSON.stringify(plantilla.config))
      formData.append('is_default', 'true')
      await api.plantillas.actualizar(id, formData)
      const updated = await api.plantillas.listar()
      setPlantillas(updated)
      success('Plantilla predeterminada actualizada')
    } catch (err) {
      error(err.message)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <h1 className="page-title">Plantillas de Certificado</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <h3>{editing ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nombre de la plantilla</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Plantilla oficial"
                required
              />
            </div>

            <div className="form-group">
              <label>Firma electrónica</label>
              <input
                type="file"
                ref={firmaInputRef}
                onChange={handleFirmaChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div
                onClick={() => firmaInputRef.current?.click()}
                className="template-upload-area"
              >
                {firmaPreview ? (
                  <img src={firmaPreview} alt="Firma" />
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>Click para subir firma</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Logo institucional</label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div
                onClick={() => logoInputRef.current?.click()}
                className="template-upload-area"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" />
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>Click para subir logo</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color de fondo</label>
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={e => handleConfigChange('bgColor', e.target.value)}
                  className="color-input"
                />
              </div>
              <div className="form-group">
                <label>Color de borde</label>
                <input
                  type="color"
                  value={config.borderColor}
                  onChange={e => handleConfigChange('borderColor', e.target.value)}
                  className="color-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Grosor del borde: {config.borderWidth}px</label>
              <input
                type="range"
                min="1"
                max="5"
                value={config.borderWidth}
                onChange={e => handleConfigChange('borderWidth', Number(e.target.value))}
                className="range-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color del título</label>
                <input
                  type="color"
                  value={config.titleColor}
                  onChange={e => handleConfigChange('titleColor', e.target.value)}
                  className="color-input"
                />
              </div>
              <div className="form-group">
                <label>Color del código</label>
                <input
                  type="color"
                  value={config.codeColor}
                  onChange={e => handleConfigChange('codeColor', e.target.value)}
                  className="color-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color del nombre</label>
                <input
                  type="color"
                  value={config.nameColor}
                  onChange={e => handleConfigChange('nameColor', e.target.value)}
                  className="color-input"
                />
              </div>
              <div className="form-group">
                <label>Color del texto</label>
                <input
                  type="color"
                  value={config.textColor}
                  onChange={e => handleConfigChange('textColor', e.target.value)}
                  className="color-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fuente del título</label>
                <select
                  value={config.titleFont}
                  onChange={e => handleConfigChange('titleFont', e.target.value)}
                  className="font-select"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Helvetica-Bold">Helvetica Bold</option>
                  <option value="Times-Roman">Times Roman</option>
                  <option value="Times-Bold">Times Bold</option>
                  <option value="Courier">Courier</option>
                  <option value="Courier-Bold">Courier Bold</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fuente del nombre</label>
                <select
                  value={config.nameFont}
                  onChange={e => handleConfigChange('nameFont', e.target.value)}
                  className="font-select"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Helvetica-Bold">Helvetica Bold</option>
                  <option value="Times-Roman">Times Roman</option>
                  <option value="Times-Bold">Times Bold</option>
                  <option value="Courier">Courier</option>
                  <option value="Courier-Bold">Courier Bold</option>
                </select>
              </div>
            </div>

            <div className="form-row" style={{ justifyContent: 'flex-end', display: 'flex', gap: 8 }}>
              {editing && (
                <button type="button" className="btn-outline" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear plantilla'}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-card">
          <h3>Vista previa</h3>
          <div className="template-preview" style={{
            background: config.bgColor,
            border: `${config.borderWidth}px solid ${config.borderColor}`,
          }}>
            {logoPreview && (
              <img src={logoPreview} alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
            )}
            <div style={{ color: config.titleColor, fontFamily: config.titleFont, fontSize: 14 }}>
              CERTIFICADO N°
            </div>
            <div style={{ color: config.codeColor, fontFamily: 'Helvetica-Bold', fontSize: 24 }}>
              2026-000001
            </div>
            <div style={{ color: config.textColor, fontFamily: config.titleFont, fontSize: 12 }}>
              Se certifica que
            </div>
            <div style={{ color: config.nameColor, fontFamily: config.nameFont, fontSize: 28, fontWeight: 'bold' }}>
              Juan Pérez
            </div>
            <div style={{ color: config.textColor, fontFamily: config.titleFont, fontSize: 14 }}>
              ha completado el curso
            </div>
            <div style={{ color: config.nameColor, fontFamily: 'Helvetica-Bold', fontSize: 18 }}>
              Curso de Ejemplo
            </div>
            <div style={{ color: config.textColor, fontFamily: config.titleFont, fontSize: 12 }}>
              40 horas académicas
            </div>
            <div style={{ color: config.textColor, fontSize: 11 }}>
              Fecha de emisión: 10/07/2026
            </div>
            {firmaPreview && (
              <img src={firmaPreview} alt="Firma" style={{ width: 120, height: 60, objectFit: 'contain', marginTop: 12 }} />
            )}
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: 32 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Firma</th>
              <th>Logo</th>
              <th>Creada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plantillas.map(plantilla => (
              <tr key={plantilla.id}>
                <td><strong>{plantilla.nombre}</strong></td>
                <td>
                  {plantilla.is_default ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Predeterminada</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Secundaria</span>
                  )}
                </td>
                <td>{plantilla.firma_url ? '✓' : '—'}</td>
                <td>{plantilla.logo_url ? '✓' : '—'}</td>
                <td>{new Date(plantilla.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(plantilla)} className="btn-small">
                      Editar
                    </button>
                    {!plantilla.is_default && (
                      <button onClick={() => handleSetDefault(plantilla.id)} className="btn-small">
                        Predeterminar
                      </button>
                    )}
                    <button onClick={() => handleDelete(plantilla.id)} className="btn-small" style={{ color: 'var(--error)' }}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
