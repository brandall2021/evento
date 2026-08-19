import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Webhook, WebhookEvent } from './webhook.entity'
import { WebhooksService } from './webhooks.service'
import { WebhooksController } from './webhooks.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookEvent])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
