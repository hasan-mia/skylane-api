import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DuffelModule } from '../duffel/duffel.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [DuffelModule, PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}