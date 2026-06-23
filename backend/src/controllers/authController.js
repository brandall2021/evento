import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

export async function register(req, res) {
  try {
    const { nombre, email, password, rol } = req.body
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email ya registrado' })
    const user = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'estudiante',
    })
    const token = generateToken(user)
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })
    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' })
    const token = generateToken(user)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function me(req, res) {
  res.json(req.user)
}

export async function updateProfile(req, res) {
  try {
    const { nombre, telefono } = req.body
    req.user.nombre = nombre || req.user.nombre
    req.user.telefono = telefono || req.user.telefono
    await req.user.save()
    res.json(req.user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
