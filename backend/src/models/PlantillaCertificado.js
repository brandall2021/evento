import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const PlantillaCertificado = sequelize.define('PlantillaCertificado', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  config: { type: DataTypes.JSONB, defaultValue: {} },
  firma_url: DataTypes.STRING,
  logo_url: DataTypes.STRING,
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
}, { paranoid: true })

export default PlantillaCertificado
