import { MigrationInterface, QueryRunner } from 'typeorm'

export class SeedPermissions1700000000009 implements MigrationInterface {
  name = 'SeedPermissions1700000000009'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO evento.permissions (code, module, action, description) VALUES
        ('auth.register', 'auth', 'register', 'Registrar usuario'),
        ('auth.login', 'auth', 'login', 'Iniciar sesión'),
        ('auth.refresh', 'auth', 'refresh', 'Refrescar token'),
        ('user.read', 'users', 'read', 'Ver usuarios'),
        ('user.create', 'users', 'create', 'Crear usuario'),
        ('user.update', 'users', 'update', 'Editar usuario'),
        ('user.delete', 'users', 'delete', 'Eliminar usuario'),
        ('role.read', 'roles', 'read', 'Ver roles'),
        ('role.create', 'roles', 'create', 'Crear rol'),
        ('role.update', 'roles', 'update', 'Editar rol'),
        ('role.delete', 'roles', 'delete', 'Eliminar rol'),
        ('tenant.read', 'tenants', 'read', 'Ver instituciones'),
        ('tenant.create', 'tenants', 'create', 'Crear institución'),
        ('tenant.update', 'tenants', 'update', 'Editar institución'),
        ('tenant.delete', 'tenants', 'delete', 'Eliminar institución'),
        ('audit.read', 'audit', 'read', 'Ver logs de auditoría'),
        ('audit.export', 'audit', 'export', 'Exportar logs de auditoría')
      ON CONFLICT (code) DO NOTHING
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM evento.permissions`)
  }
}
