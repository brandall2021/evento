import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { Redis } from 'ioredis'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check básico' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  @Get('database')
  @ApiOperation({ summary: 'Verifica conexión a PostgreSQL' })
  async database() {
    const start = Date.now()
    await this.dataSource.query('SELECT 1')
    return { status: 'ok', latency: `${Date.now() - start}ms` }
  }

  @Get('redis')
  @ApiOperation({ summary: 'Verifica conexión a Redis' })
  async redis() {
    const start = Date.now()
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
    })
    try {
      await client.connect()
      const pong = await client.ping()
      return { status: pong === 'PONG' ? 'ok' : 'error', latency: `${Date.now() - start}ms` }
    } catch {
      return { status: 'error', latency: `${Date.now() - start}ms` }
    } finally {
      client.disconnect()
    }
  }
}
