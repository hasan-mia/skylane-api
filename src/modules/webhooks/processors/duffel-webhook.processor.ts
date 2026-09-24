import { Injectable, Logger } from '@nestjs/common';
import { DuffelWebhookEvent } from '../../duffel/duffel.types';
import { PrismaService } from '../../../database/prisma.service';
import { DuffelService } from '../../duffel/duffel.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DuffelWebhookProcessor {
  private readonly logger = new Logger(DuffelWebhookProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly duffelService: DuffelService,
  ) {}

  async processEvent(event: DuffelWebhookEvent) {
    const eventType = event.event.type;

    this.logger.log(`Processing webhook event: ${event.event.id} (${eventType})`);

    switch (eventType) {
      case 'order.created':
        await this.handleOrderCreated(event);
        break;
      case 'order.cancelled':
        await this.handleOrderCancelled(event);
        break;
      case 'order.change_confirmed':
        await this.handleOrderChangeConfirmed(event);
        break;
      case 'duffel.ping':
        this.logger.log('Duffel ping received');
        break;
      default:
        this.logger.log(`Unhandled webhook type: ${eventType}`);
        break;
    }
  }

  private async handleOrderCreated(event: DuffelWebhookEvent) {
    const orderId = event.data?.order_id;

    if (!orderId) {
      this.logger.warn('Order created event missing order_id');
      return;
    }

    try {
      const order = await this.duffelService.getOrder(orderId);

      await this.prisma.booking.updateMany({
        where: { duffelOrderId: orderId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Booking confirmed for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Error processing order.created: ${(error as Error).message}`);
      throw error;
    }
  }

  private async handleOrderCancelled(event: DuffelWebhookEvent) {
    const orderId = event.data?.order_id;

    await this.prisma.booking.updateMany({
      where: { duffelOrderId: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Booking cancelled for order ${orderId}`);
  }

  private async handleOrderChangeConfirmed(event: DuffelWebhookEvent) {
    const orderId = event.data?.order_id;

    this.logger.log(`Order change confirmed for order ${orderId}`);
  }
}

export { DuffelWebhookProcessor as WebhookProcessor };