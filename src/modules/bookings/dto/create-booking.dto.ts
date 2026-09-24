import { IsString, IsArray, ValidateNested, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class PassengerBookingDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsDateString()
  @IsOptional()
  dob?: string;
}

export class CreateBookingDto {
  @ApiProperty({ example: 'ofc_abc123' })
  @IsString()
  offerId: string;

  @ApiProperty({ example: 'LHR' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'JFK' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2024-12-25T10:00:00Z' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ example: '2024-12-25T14:00:00Z' })
  @IsDateString()
  arrivalDate: string;

  @ApiProperty({ example: 80000, description: 'Price in minor units' })
  @IsString()
  price: string;

  @ApiProperty({ example: 'GBP' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'British Airways' })
  @IsString()
  carrier: string;

  @ApiProperty({
    type: [PassengerBookingDto],
    description: 'Passenger details',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerBookingDto)
  passengers: PassengerBookingDto[];

  @ApiProperty({
    example: 'idempotency-key-123',
    required: false,
    description: 'Idempotency key for duplicate prevention',
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
