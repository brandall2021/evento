import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import bcrypt from 'bcryptjs'

const User = sequelize.define('User', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  rol: {
    type: DataTypes.ENUM('admin', 'docente', 'estudiante'),
    defaultValue: 'estudiante',
  },
  telefono: DataTypes.STRING,
  avatar: DataTypes.STRING,
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10)
    },
  },
})

User.prototype.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

User.prototype.toJSON = function () {
  const values = { ...this.get() }
  delete values.password
  return values
}

export default User
