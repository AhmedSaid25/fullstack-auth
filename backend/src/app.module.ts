import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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

    AuthModule,
  ],
})
export class AppModule {}
