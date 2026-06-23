import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Curso = sequelize.define('Curso', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: DataTypes.TEXT,
  imagen: DataTypes.STRING,
  categoria: DataTypes.STRING,
  docente_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin: { type: DataTypes.DATEONLY, allowNull: false },
  duracion_horas: { type: DataTypes.INTEGER, allowNull: false },
  modalidad: {
    type: DataTypes.ENUM('presencial', 'virtual', 'hibrido'),
    defaultValue: 'virtual',
  },
  cupos: { type: DataTypes.INTEGER, allowNull: false },
  precio: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  requisitos: DataTypes.TEXT,
  aceptacion_auto: { type: DataTypes.BOOLEAN, defaultValue: false },
  estado: {
    type: DataTypes.ENUM('borrador', 'publicado', 'finalizado'),
    defaultValue: 'borrador',
  },
}, { paranoid: true })

export default Curso
