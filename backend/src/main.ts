import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { requestLogger } from './common/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(requestLogger);

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
void bootstrap();
