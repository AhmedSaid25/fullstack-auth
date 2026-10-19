import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

// Shared by main.ts and the e2e tests, so tests run against the same configuration
export function configureApp(app: INestApplication) {
  // Sets secure HTTP headers (X-Content-Type-Options, Strict-Transport-Security, ...)
  app.use(helmet());

  // Only the frontend may call the API from a browser; credentials: true allows the cookie
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Parses the Cookie header into req.cookies (used by JwtAuthGuard)
  app.use(cookieParser());

  // Validates every request body against its DTO class
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that are not in the DTO
      forbidNonWhitelisted: true, // ...and reject the request if any were sent
      transform: true, // turn plain JSON into DTO instances (runs @Transform)
    }),
  );

  // One consistent error shape for every endpoint
  app.useGlobalFilters(new AllExceptionsFilter());
}
