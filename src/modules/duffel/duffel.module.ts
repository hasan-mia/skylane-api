import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DuffelService } from './duffel.service';

@Module({
  imports: [ConfigModule],
  providers: [DuffelService],
  exports: [DuffelService],
})
export class DuffelModule {}