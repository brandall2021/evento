export { User } from './entities/user.entity.js'

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ORGANIZER = 'organizador',
  COORDINATOR = 'coordinador',
  SPEAKER = 'ponente',
  EXHIBITOR = 'expositor',
  SPONSOR = 'patrocinador',
  ATTENDEE = 'asistente',
  GUEST = 'invitado',
  CHECKIN = 'checkin',
  MODERATOR = 'moderador',
  DOCENTE = 'docente',
  ESTUDIANTE = 'estudiante',
}
