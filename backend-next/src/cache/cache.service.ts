import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

@Injectable()
export class CacheService implements OnModuleDestroy {
  private redis: Redis | null = null
  private readonly logger = new Logger(CacheService.name)
  private readonly defaultTTL = 300

  constructor(private readonly config: ConfigService) {
    const host = this.config.get('REDIS_HOST', 'localhost')
    const port = this.config.get('REDIS_PORT', 6379)
    try {
      this.redis = new Redis({ host, port: Number(port), maxRetriesPerRequest: 3, lazyConnect: true })
      this.redis.connect().catch(() => {
        this.logger.warn('Redis unavailable — caching disabled')
        this.redis?.disconnect()
        this.redis = null
      })
    } catch {
      this.logger.warn('Redis unavailable — caching disabled')
      this.redis = null
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch { return null }
  }

  async set(key: string, value: any, ttl = this.defaultTTL): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl)
    } catch {}
  }

  async del(pattern: string): Promise<void> {
    if (!this.redis) return
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length) await this.redis.del(...keys)
    } catch {}
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    await this.del(`${prefix}:*`)
  }

  onModuleDestroy() {
    this.redis?.disconnect()
  }
}
