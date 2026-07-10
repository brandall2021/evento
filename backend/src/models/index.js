import sequelize from '../config/database.js'
import User from './User.js'
import Curso from './Curso.js'
import Inscripcion from './Inscripcion.js'
import Pago from './Pago.js'
import Asistencia from './Asistencia.js'
import Certificado from './Certificado.js'
import PlantillaCertificado from './PlantillaCertificado.js'

User.hasMany(Inscripcion, { foreignKey: 'estudiante_id', as: 'inscripciones' })
Inscripcion.belongsTo(User, { foreignKey: 'estudiante_id', as: 'estudiante' })

User.hasMany(Curso, { foreignKey: 'docente_id', as: 'cursosDictados' })
Curso.belongsTo(User, { foreignKey: 'docente_id', as: 'docente' })

Curso.hasMany(Inscripcion, { foreignKey: 'curso_id', as: 'inscripciones' })
Inscripcion.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' })

Inscripcion.hasMany(Pago, { foreignKey: 'inscripcion_id', as: 'pagos' })
Pago.belongsTo(Inscripcion, { foreignKey: 'inscripcion_id', as: 'inscripcion' })

Inscripcion.hasMany(Asistencia, { foreignKey: 'inscripcion_id', as: 'asistencias' })
Asistencia.belongsTo(Inscripcion, { foreignKey: 'inscripcion_id', as: 'inscripcion' })

Inscripcion.hasOne(Certificado, { foreignKey: 'inscripcion_id', as: 'certificado' })
Certificado.belongsTo(Inscripcion, { foreignKey: 'inscripcion_id', as: 'inscripcion' })

User.hasMany(PlantillaCertificado, { foreignKey: 'user_id', as: 'plantillas' })
PlantillaCertificado.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' })

export { sequelize, User, Curso, Inscripcion, Pago, Asistencia, Certificado, PlantillaCertificado }
