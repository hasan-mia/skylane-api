import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @RequirePermissions('bookings:create')
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Body('idempotencyKey') idempotencyKey: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.create(createBookingDto, user.id, idempotencyKey ?? undefined);
  }

  @Get()
  @RequirePermissions('bookings:read')
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async findAll(@CurrentUser() user: User) {
    return this.bookingsService.findAll(user.id);
  }

  @Get(':id')
  @RequirePermissions('bookings:read')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post(':id/cancel')
  @RequirePermissions('bookings:cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }

  @Post(':id/change')
  @RequirePermissions('bookings:change')
  @ApiOperation({ summary: 'Change a booking' })
  @ApiResponse({ status: 200, description: 'Booking changed' })
  async change(@Param('id') id: string, @Body() body: { newOfferId: string }) {
    return this.bookingsService.change(id, body.newOfferId);
  }
}