import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../../../.env'), override: true })

interface ParsedUrl {
  host: string
  port: number
  username: string
  password: string
  database: string
}

function parseDatabaseUrl(url: string): ParsedUrl {
  const parsed = new URL(url)
  return {
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port || '5432', 10),
    username: decodeURIComponent(parsed.username) || 'postgres',
    password: decodeURIComponent(parsed.password) || 'postgres',
    database: String(parsed.pathname).replace(/^\//, '') || 'evento_web',
  }
}

const urlParts = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : null

const options: DataSourceOptions = {
  type: 'postgres',
  host: urlParts?.host || process.env.DB_HOST || 'localhost',
  port: urlParts?.port || parseInt(process.env.DB_PORT || '5432', 10),
  username: urlParts?.username || process.env.DB_USER || 'postgres',
  password: urlParts?.password || process.env.DB_PASSWORD || 'postgres',
  database: urlParts?.database || process.env.DB_NAME || 'evento_web',
  entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, 'migrations/*{.ts,.js}')],
  logging: true,
}

export default new DataSource(options)
