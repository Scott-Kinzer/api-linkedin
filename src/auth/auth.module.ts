import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { TokenEntity } from './models/tokens/token.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [AuthService, JwtGuard, JwtStrategy, JwtService],
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.SECRET_JWT,
        signOptions: {
          expiresIn: '3600s',
        },
      }),
    }),

    TypeOrmModule.forFeature([UserEntity, TokenEntity]),
  ],
})
export class AuthModule {}
