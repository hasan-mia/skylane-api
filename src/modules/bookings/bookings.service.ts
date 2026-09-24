import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { RedisCacheService } from '../../common/cache/redis-cache.service';
import { PrismaService } from '../../database/prisma.service';
import { DuffelService } from '../duffel/duffel.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly duffelService: DuffelService,
    private readonly cacheManager: RedisCacheService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
    idempotencyKey?: string,
  ) {
    const key = idempotencyKey ?? uuidv4();

    const existingBooking = await this.prisma.booking.findUnique({
      where: { idempotencyKey: key },
    });

    if (existingBooking) {
      return {
        message: 'Booking already exists',
        booking: existingBooking,
        idempotent: true,
      };
    }

    let duffelOrderId: string | undefined;
    try {
      const paymentIntent = await this.duffelService.createOrder(
        createBookingDto.offerId,
        createBookingDto.passengers,
      );
      duffelOrderId = paymentIntent?.data?.id;
    } catch (error) {
      this.logger?.warn?.(
        `Duffel order creation failed: ${(error as Error).message}`,
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        duffelOrderId,
        user: { connect: { id: userId } },
        flight: {
          create: {
            duffelOfferId: createBookingDto.offerId,
            origin: createBookingDto.origin,
            destination: createBookingDto.destination,
            departureAt: new Date(createBookingDto.departureDate),
            arrivalAt: new Date(createBookingDto.arrivalDate),
            price: parseInt(createBookingDto.price, 10),
            currency: createBookingDto.currency,
            carrier: createBookingDto.carrier,
          },
        },
        idempotencyKey: key,
        passengers: {
          create: createBookingDto.passengers.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            phone: p.phone,
            dob: p.dob ? new Date(p.dob) : undefined,
          })),
        },
        status: 'CONFIRMED' as const,
      },
      include: {
        flight: true,
        passengers: true,
      },
    });

    return {
      message: 'Booking created successfully',
      booking,
      idempotent: false,
    };
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};

    return this.prisma.booking.findMany({
      where,
      include: {
        flight: true,
        passengers: true,
        payments: true,
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        flight: true,
        passengers: true,
        payments: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancel(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking already cancelled');
    }

    if (booking.duffelOrderId) {
      await this.duffelService.cancelOrder(booking.duffelOrderId);
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        flight: true,
        passengers: true,
      },
    });

    return {
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    };
  }

  async change(id: string, newOfferId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed bookings can be changed');
    }

    const changeResult = await this.duffelService.createOrder(newOfferId, []);

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        duffelOrderId: changeResult?.data?.id,
        status: 'CONFIRMED',
      },
      include: {
        flight: true,
        passengers: true,
      },
    });

    return {
      message: 'Booking changed successfully',
      booking: updatedBooking,
    };
  }
}
