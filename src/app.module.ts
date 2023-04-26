import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedModule } from './feed/feed.module';
import { AuthModule } from './auth/auth.module';

import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { FriendConnectionModule } from './connections/friend-connection/friend-connection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:
        process.env.ENVIRONMENT === 'prod'
          ? process.env.POSTGRES_HOST_PROD
          : process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username:
        process.env.ENVIRONMENT === 'prod'
          ? process.env.POSTGRES_USER_PROD
          : process.env.POSTGRES_USER,
      password:
        process.env.ENVIRONMENT === 'prod'
          ? process.env.POSTGRES_PASSWORD_PROD
          : process.env.POSTGRES_PASSWORD,
      database:
        process.env.ENVIRONMENT === 'prod'
          ? process.env.POSTGRES_DATABASE_PROD
          : process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.ENVIRONMENT === 'prod' ? true : false,
    }),
    FeedModule,
    AuthModule,
    UserModule,
    FriendConnectionModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
