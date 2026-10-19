import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Loads variables from .env into process.env and makes ConfigService available everywhere
    ConfigModule.forRoot({ isGlobal: true }),

    // forRootAsync waits for ConfigService, so the URI comes from config instead of being hardcoded
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

    // Rate limit config: max 10 requests per minute per IP (applied on auth routes)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),

    AuthModule,
  ],
})
export class AppModule {}
