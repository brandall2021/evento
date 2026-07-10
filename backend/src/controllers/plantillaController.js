import { PlantillaCertificado } from '../models/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function listar(req, res) {
  try {
    const plantillas = await PlantillaCertificado.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    })
    res.json(plantillas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function obtener(req, res) {
  try {
    const plantilla = await PlantillaCertificado.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    })
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' })
    res.json(plantilla)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function crear(req, res) {
  try {
    const { nombre, config, is_default } = req.body
    const data = {
      nombre,
      config: typeof config === 'string' ? JSON.parse(config) : config,
      user_id: req.user.id,
      is_default: is_default || false,
    }

    if (req.files?.firma) {
      data.firma_url = `/uploads/firmas/${req.files.firma[0].filename}`
    }
    if (req.files?.logo) {
      data.logo_url = `/uploads/firmas/${req.files.logo[0].filename}`
    }

    if (data.is_default) {
      await PlantillaCertificado.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      )
    }

    const plantilla = await PlantillaCertificado.create(data)
    res.status(201).json(plantilla)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function actualizar(req, res) {
  try {
    const plantilla = await PlantillaCertificado.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    })
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' })

    const data = { ...req.body }
    if (data.config && typeof data.config === 'string') {
      data.config = JSON.parse(data.config)
    }

    if (req.files?.firma) {
      if (plantilla.firma_url) {
        const oldPath = path.resolve(__dirname, '..', plantilla.firma_url)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      data.firma_url = `/uploads/firmas/${req.files.firma[0].filename}`
    }
    if (req.files?.logo) {
      if (plantilla.logo_url) {
        const oldPath = path.resolve(__dirname, '..', plantilla.logo_url)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      data.logo_url = `/uploads/firmas/${req.files.logo[0].filename}`
    }

    if (data.is_default) {
      await PlantillaCertificado.update(
        { is_default: false },
        { where: { user_id: req.user.id, id: { [Symbol.for('ne')]: plantilla.id } } }
      )
    }

    await plantilla.update(data)
    res.json(plantilla)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function eliminar(req, res) {
  try {
    const plantilla = await PlantillaCertificado.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    })
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' })

    if (plantilla.firma_url) {
      const firmaPath = path.resolve(__dirname, '..', plantilla.firma_url)
      if (fs.existsSync(firmaPath)) fs.unlinkSync(firmaPath)
    }
    if (plantilla.logo_url) {
      const logoPath = path.resolve(__dirname, '..', plantilla.logo_url)
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath)
    }

    await plantilla.destroy()
    res.json({ mensaje: 'Plantilla eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function obtenerDefault(req, res) {
  try {
    const plantilla = await PlantillaCertificado.findOne({
      where: { user_id: req.user.id, is_default: true },
    })
    res.json(plantilla || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
