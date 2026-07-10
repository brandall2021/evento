import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Asistencia = sequelize.define('Asistencia', {
  inscripcion_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  presente: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { paranoid: true })

export default Asistencia
