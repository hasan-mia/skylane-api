import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksController } from './webhooks.controller';
import { PrismaModule } from '../../database/prisma.module';
import { DuffelModule } from '../duffel/duffel.module';
import { DuffelWebhookProcessor } from './processors/duffel-webhook.processor';

@Module({
  imports: [
    PrismaModule,
    DuffelModule,
    BullModule.registerQueue({
      name: 'webhooks',
    }),
  ],
  controllers: [WebhooksController],
  providers: [DuffelWebhookProcessor],
  exports: [],
})
export class WebhooksModule {}