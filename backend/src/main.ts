import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AUTH_COOKIE_NAME } from './auth/auth.constants';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { requestLogger } from './common/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(requestLogger);

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

  // API docs at /docs, generated from controllers + DTOs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fullstack Auth API')
    .setDescription('Sign up, sign in and a protected profile endpoint')
    .setVersion('1.0')
    .addCookieAuth(AUTH_COOKIE_NAME)
    .build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
void bootstrap();
