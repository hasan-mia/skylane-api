export type DuffelEnvironment = 'test' | 'live';

export interface DuffelOfferPassenger {
  type: 'adult' | 'child' | 'infant';
  family_name: string;
  given_name: string;
  born_on: string;
  id?: string;
  email?: string;
  phone_number?: string;
}

export interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  base_amount: string;
  base_currency: string;
  tax_amount: string;
  tax_currency: string;
  created_at: string;
  expires_at: string;
}

export interface DuffelSlice {
  origin: string;
  destination: string;
  departure_date: string;
  arrival_date: string;
  duration: number;
  segments: DuffelSegment[];
}

export interface DuffelSegment {
  id: string;
  departure: {
    airport: string;
    at: string;
  };
  arrival: {
    airport: string;
    at: string;
  };
  carrier: string;
  flight_number: string;
  duration: number;
  distance: string;
  origin: string;
  destination: string;
  status: string;
}

export interface DuffelOrder {
  id: string;
  booking_reference: string;
  status: string;
  total_amount: string;
  total_currency: string;
  created_at: string;
  passengers: DuffelOfferPassenger[];
  offers: DuffelOffer[];
  documents: any[];
}

export interface DuffelPayment {
  id: string;
  type: string;
  amount: string;
  currency: string;
  created_at: string;
}

export interface DuffelDocument {
  id: string;
  name: string;
  type: string;
  released_at: string;
}

export interface DuffelOrderResponse {
  data: DuffelOrder;
}

export interface DuffelOfferResponse {
  data: DuffelOffer;
}

export interface DuffelSearchResult {
  data: {
    offers: DuffelOffer[];
    currencies: Record<string, { symbol: string }>;
  };
}

export interface DuffelWebhookEvent {
  data: any;
  event: {
    id: string;
    type: string;
    received_at: string;
    live: boolean;
  };
}

export interface DuffelConfig {
  accessToken: string;
  environment: DuffelEnvironment;
  baseUrl?: string;
  webhookSecret?: string;
}