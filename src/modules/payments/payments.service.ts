import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../common/cache/redis-cache.service';
import { PrismaService } from '../../database/prisma.service';
import { StripeProvider } from './providers/stripe.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeProvider: StripeProvider,
    private readonly cacheManager: RedisCacheService,
  ) {}

  async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const intent = await this.stripeProvider.createPaymentIntent(amount, currency, {
      booking_id: bookingId,
      user_id: booking.userId,
    });

    await this.prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency,
        status: 'PENDING',
        provider: 'stripe',
        providerChargeId: intent.id,
      },
    });

    return intent;
  }

  async capturePayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const charge = await this.stripeProvider.capturePayment(
      payment.providerChargeId ?? '',
      amount,
    );

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        providerChargeId: charge.id,
      },
    });

    return charge;
  }

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new Error('Payment not completed');
    }

    const refund = await this.stripeProvider.refundPayment(
      payment.providerChargeId ?? '',
      amount,
    );

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        providerChargeId: refund.id,
      },
    });

    return refund;
  }

  async getPayments(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
    });
  }

  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    return this.stripeProvider.verifyWebhookSignature(payload, signature);
  }
}
