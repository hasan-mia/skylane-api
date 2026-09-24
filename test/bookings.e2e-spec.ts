import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'booking-test@example.com',
      password: 'TestPass123!',
      name: 'Booking Test',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'booking-test@example.com',
        password: 'TestPass123!',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await prismaService.payment.deleteMany({});
    await prismaService.passenger.deleteMany({});
    await prismaService.booking.deleteMany({});
    await prismaService.flight.deleteMany({});
    await app.close();
  });

  describe('Bookings', () => {
    it('should require authentication to create booking', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({
          offerId: 'test-offer',
          passengers: [],
        });

      expect(response.status).toBe(401);
    });

    it('should create a booking with auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          offerId: 'test-offer-123',
          origin: 'LHR',
          destination: 'JFK',
          departureDate: '2024-12-25',
          arrivalDate: '2024-12-25T14:00:00Z',
          price: '80000',
          currency: 'GBP',
          carrier: 'British Airways',
          passengers: [
            {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('booking');
    });
  });
});