import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Webhook, WebhookEvent } from './webhook.entity.js'
import { WebhooksService } from './webhooks.service.js'
import { WebhooksController } from './webhooks.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookEvent])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
