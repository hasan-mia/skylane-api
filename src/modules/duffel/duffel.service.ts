import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  DuffelConfig,
  DuffelOfferResponse,
  DuffelSearchResult,
  DuffelOrderResponse,
  DuffelWebhookEvent,
} from './duffel.types';

@Injectable()
export class DuffelService {
  private readonly logger = new Logger(DuffelService.name);
  private readonly client: AxiosInstance;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const accessToken = configService.get<string>('DUFFEL_ACCESS_TOKEN');
    const environment = configService.get<string>('DUFFEL_ENVIRONMENT');

    const baseURL =
      environment === 'live'
        ? 'https://api.duffel.com'
        : 'https://api.duffel.com';

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Duffel-Version': 'BETA',
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          this.logger.warn('Duffel API rate limit hit');
        }
        return Promise.reject(error);
      },
    );

    this.webhookSecret = configService.get<string>('DUFFEL_WEBHOOK_SECRET') ?? '';
  }

  async searchFlights(params: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    cabin_class?: string;
    passengers: { type: string; number_of_passengers?: number }[];
    max_connections?: number;
  }): Promise<DuffelSearchResult> {
    const config: AxiosRequestConfig = {
      params,
    };

    const response = await this.client.post('/air/offer_requests', {
      data: {
        cabin_class: params.cabin_class || 'economy',
        slices: {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departure_date,
          ...(params.return_date && { return_date: params.return_date }),
        },
        passengers: params.passengers,
        max_connections: params.max_connections || 0,
      },
      ...config,
    });

    return response.data;
  }

  async getOffer(offerId: string): Promise<DuffelOfferResponse> {
    const response = await this.client.get(`/air/offers/${offerId}`);
    return response.data;
  }

  async createOrder(offerId: string, passengers: any[]): Promise<DuffelOrderResponse> {
    const response = await this.client.post('/air/orders', {
      data: {
        offer_id: offerId,
        passengers,
        payments: [],
      },
    });
    return response.data;
  }

  async getOrder(orderId: string): Promise<DuffelOrderResponse> {
    const response = await this.client.get(`/air/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<DuffelOrderResponse> {
    const response = await this.client.post(`/air/orders/${orderId}/actions/cancel`);
    return response.data;
  }

  async getFlightInfo(flightId: string): Promise<DuffelOfferResponse> {
    const response = await this.client.get(`/air/flights/${flightId}`);
    return response.data;
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('DUFFEL_WEBHOOK_SECRET not configured');
      return false;
    }

    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      const providedSignature = signature.replace('Duffel-Signature ', '').trim();

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(providedSignature),
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      return false;
    }
  }

  parseWebhookEvent(payload: Buffer): DuffelWebhookEvent {
    try {
      return JSON.parse(payload.toString()) as DuffelWebhookEvent;
    } catch (error) {
      this.logger.error('Failed to parse webhook payload', error);
      throw error;
    }
  }
}
