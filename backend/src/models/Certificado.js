import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Certificado = sequelize.define('Certificado', {
  inscripcion_id: { type: DataTypes.INTEGER, allowNull: false },
  codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
  fecha_emision: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  horas: { type: DataTypes.INTEGER, allowNull: false },
  nota: DataTypes.DECIMAL(4, 2),
  pdf_url: DataTypes.STRING,
  qr_url: DataTypes.STRING,
  valido: { type: DataTypes.BOOLEAN, defaultValue: true },
})

export default Certificado
