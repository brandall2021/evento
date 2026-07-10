import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Pago = sequelize.define('Pago', {
  inscripcion_id: { type: DataTypes.INTEGER, allowNull: false },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  metodo: {
    type: DataTypes.ENUM('mercado_pago', 'transferencia', 'tarjeta', 'paypal'),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'rechazado', 'vencido'),
    defaultValue: 'pendiente',
  },
  fecha_pago: DataTypes.DATE,
  codigo_transaccion: DataTypes.STRING,
  comprobante: DataTypes.STRING,
  cuota_numero: { type: DataTypes.INTEGER, defaultValue: 1 },
  cuota_total: { type: DataTypes.INTEGER, defaultValue: 1 },
  descuento: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tipo_beca: DataTypes.STRING,
}, { paranoid: true })

export default Pago
