import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'
import { randomUUID } from 'crypto'
import { extname } from 'path'

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly client: Minio.Client | null
  private readonly bucket: string
  private readonly logger = new Logger(StorageService.name)
  private readonly endpoint: string

  constructor(private readonly config: ConfigService) {
    const host = this.config.get('MINIO_ENDPOINT', 'localhost')
    const port = this.config.get('MINIO_PORT', 9000)
    const accessKey = this.config.get('MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = this.config.get('MINIO_SECRET_KEY', 'minioadmin')
    this.bucket = this.config.get('MINIO_BUCKET', 'evento-files')
    this.endpoint = `http://${host}:${port}`

    try {
      this.client = new Minio.Client({
        endPoint: host,
        port: parseInt(String(port)),
        useSSL: false,
        accessKey,
        secretKey,
      })
    } catch {
      this.logger.warn('MinIO unavailable — file storage will use local disk')
      this.client = null
    }
  }

  async onModuleInit() {
    if (!this.client) return
    try {
      const exists = await this.client.bucketExists(this.bucket)
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1')
        const policy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${this.bucket}/*`] }],
        })
        await this.client.setBucketPolicy(this.bucket, policy)
        this.logger.log(`Bucket "${this.bucket}" created with public read`)
      }
    } catch (err) {
      this.logger.warn('MinIO bucket setup failed — using local storage')
    }
  }

  async upload(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    if (!this.client) return this.saveLocal(file, folder)
    try {
      const ext = extname(file.originalname)
      const key = `${folder}/${randomUUID()}${ext}`
      await this.client.putObject(this.bucket, key, file.buffer, file.size, { 'Content-Type': file.mimetype })
      return `${this.endpoint}/${this.bucket}/${key}`
    } catch (err) {
      this.logger.error('MinIO upload failed, falling back to local')
      return this.saveLocal(file, folder)
    }
  }

  async delete(url: string): Promise<void> {
    if (!this.client || !url.includes(this.bucket)) return
    try {
      const key = url.split(`${this.bucket}/`)[1]
      if (key) await this.client.removeObject(this.bucket, key)
    } catch {}
  }

  async getPresignedUrl(key: string, expiry = 3600): Promise<string | null> {
    if (!this.client) return null
    try {
      return await this.client.presignedGetObject(this.bucket, key, expiry)
    } catch { return null }
  }

  private saveLocal(file: Express.Multer.File, folder: string): string {
    const fs = require('fs')
    const path = require('path')
    const dir = path.join(process.cwd(), 'uploads', folder)
    fs.mkdirSync(dir, { recursive: true })
    const ext = extname(file.originalname)
    const filename = `${randomUUID()}${ext}`
    fs.writeFileSync(path.join(dir, filename), file.buffer)
    return `/uploads/${folder}/${filename}`
  }
}
