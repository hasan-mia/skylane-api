import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('flights')
@ApiBearerAuth()
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post('search')
  @RequirePermissions('flights:search')
  @ApiOperation({ summary: 'Search for available flights' })
  @ApiResponse({ status: 200, description: 'Flight search results' })
  async searchFlights(@Body() searchDto: SearchFlightsDto) {
    return this.flightsService.searchFlights(searchDto);
  }

  @Get('offers/:id')
  @RequirePermissions('flights:read')
  @ApiOperation({ summary: 'Get a specific flight offer' })
  @ApiResponse({ status: 200, description: 'Flight offer details' })
  async getOffer(@Param('id') id: string) {
    return this.flightsService.getOffer(id);
  }
}
