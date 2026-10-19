import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
