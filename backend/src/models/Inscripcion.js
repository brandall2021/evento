import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Inscripcion = sequelize.define('Inscripcion', {
  estudiante_id: { type: DataTypes.INTEGER, allowNull: false },
  curso_id: { type: DataTypes.INTEGER, allowNull: false },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado', 'en_curso', 'finalizado'),
    defaultValue: 'pendiente',
  },
  fecha_solicitud: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_aceptacion: DataTypes.DATE,
  fecha_rechazo: DataTypes.DATE,
  motivo_rechazo: DataTypes.TEXT,
}, { paranoid: true })

export default Inscripcion
