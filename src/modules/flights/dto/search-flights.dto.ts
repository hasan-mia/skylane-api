import { IsString, IsDateString, IsArray, ValidateNested, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class PassengerDto {
  @ApiProperty({ example: 'adult', enum: ['adult', 'child', 'infant'] })
  @IsString()
  type: 'adult' | 'child' | 'infant';

  @ApiProperty({ example: 1, description: 'Number of passengers of this type' })
  @IsInt()
  @Min(1)
  number_of_passengers: number;
}

export class SearchFlightsDto {
  @ApiProperty({ example: 'LHR', description: 'Origin airport IATA code' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'JFK', description: 'Destination airport IATA code' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2024-12-25', description: 'Departure date (YYYY-MM-DD)' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ example: '2024-12-30', required: false, description: 'Return date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiProperty({ example: 'economy', required: false, enum: ['economy', 'premium_economy', 'business', 'first'] })
  @IsOptional()
  @IsString()
  cabinClass?: string;

  @ApiProperty({ example: 0, required: false, description: 'Maximum number of connections' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxConnections?: number;

  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}
