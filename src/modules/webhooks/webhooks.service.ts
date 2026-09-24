import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DuffelService } from '../duffel/duffel.service';
import { DuffelWebhookEvent } from '../duffel/duffel.types';

@Injectable()
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly duffelService: DuffelService,
  ) {}

  async processEvent(event: DuffelWebhookEvent) {
    const eventType = event.event.type;

    try {
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
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error processing webhook ${event.event.id}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  private async handleOrderCreated(event: DuffelWebhookEvent) {
    const orderId = event.data?.order_id;

    if (!orderId) {
      this.logger.warn('Order created event missing order_id');
      return;
    }

    const order = await this.duffelService.getOrder(orderId);

    await this.prisma.booking.updateMany({
      where: { duffelOrderId: orderId },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Booking confirmed for order ${orderId}`);
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
