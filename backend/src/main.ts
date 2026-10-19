import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { AUTH_COOKIE_NAME } from './auth/auth.constants';
import { requestLogger } from './common/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(requestLogger);
  configureApp(app);

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
