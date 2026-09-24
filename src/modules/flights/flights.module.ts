import { Module } from '@nestjs/common';
import { DuffelModule } from '../duffel/duffel.module';
import { PrismaModule } from '../../database/prisma.module';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [DuffelModule, PrismaModule],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService],
})
export class FlightsModule {}