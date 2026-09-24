import {
  Controller,
  Post,
  Headers,
  Body,
  Req,
  HttpCode,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { DuffelService } from '../duffel/duffel.service';
import { PrismaService } from '../../database/prisma.service';
import { WebhookProcessor } from './processors/duffel-webhook.processor';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly duffelService: DuffelService,
    private readonly prisma: PrismaService,
    private readonly webhookProcessor: WebhookProcessor,
  ) {}

  @Post('duffel')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Duffel webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async handleDuffelWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('duffel-signature') signature: string,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature header');
    }

    const rawBody = JSON.stringify(body);
    const verified = this.duffelService.verifyWebhookSignature(rawBody, signature);

    if (!verified) {
      throw new UnauthorizedException('Invalid signature');
    }

    const event = this.duffelService.parseWebhookEvent(Buffer.from(rawBody));

    const processed = await this.prisma.webhookEvent.findUnique({
      where: { eventId: event.event.id },
    });

    if (processed) {
      this.logger.log(`Duplicate webhook event: ${event.event.id}`);
      return { received: true, duplicate: true };
    }

    await this.prisma.webhookEvent.create({
      data: {
        eventId: event.event.id,
        provider: 'duffel',
        type: event.event.type,
        payload: body as any,
      },
    });

    await this.webhookProcessor.processEvent(event);

    return { received: true };
  }

  @Post('stripe')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log(`Received Stripe webhook`);
    return { received: true };
  }
}
