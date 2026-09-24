import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../common/cache/redis-cache.service';
import { DuffelService } from '../duffel/duffel.service';
import { PrismaService } from '../../database/prisma.service';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { DuffelSearchResult } from '../duffel/duffel.types';

@Injectable()
export class FlightsService {
  constructor(
    private readonly duffelService: DuffelService,
    private readonly prisma: PrismaService,
    private readonly cacheManager: RedisCacheService,
  ) {}

  async searchFlights(searchDto: SearchFlightsDto): Promise<any> {
    const cacheKey = `flights:search:${this.generateCacheKey(searchDto)}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return {
        cached: true,
        data: cachedResult,
      };
    }

    const result: DuffelSearchResult = await this.duffelService.searchFlights({
      origin: searchDto.origin,
      destination: searchDto.destination,
      departure_date: searchDto.departureDate,
      return_date: searchDto.returnDate,
      cabin_class: searchDto.cabinClass,
      passengers: searchDto.passengers,
      max_connections: searchDto.maxConnections,
    });

    await this.cacheManager.set(cacheKey, result, 900);

    return {
      cached: false,
      data: result,
    };
  }

  async getOffer(offerId: string): Promise<any> {
    const cacheKey = `flights:offer:${offerId}`;
    const cachedOffer = await this.cacheManager.get(cacheKey);

    if (cachedOffer) {
      return {
        cached: true,
        data: cachedOffer,
      };
    }

    const offer = await this.duffelService.getOffer(offerId);

    await this.cacheManager.set(cacheKey, offer, 3600);

    return {
      cached: false,
      data: offer,
    };
  }

  private generateCacheKey(dto: SearchFlightsDto): string {
    return `${dto.origin}-${dto.destination}-${dto.departureDate}-${dto.returnDate ?? 'oneway'}-${dto.cabinClass ?? 'economy'}`;
  }
}
