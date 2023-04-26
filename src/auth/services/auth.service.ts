import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TokenEntity } from '../models/tokens/token.entity';
import { Tokens } from '../models/tokens/token.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    public jwtService: JwtService,
  ) {}
  hashPassword(passwd: string): Promise<string> {
    return bcrypt.hash(passwd, 10);
  }

  comparePasswords(passwd: string, hashedPassword: string) {
    return bcrypt.compare(passwd, hashedPassword);
  }

  async registerAccount(user: User): Promise<User | null> {
    const { firstName, lastName, email, password } = user;

    const isUserExists = await this.findUserByEmail(email);

    if (isUserExists) {
      return null;
    }

    const hashedPassword = await this.hashPassword(password);

    return await this.userRepo.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
  }

  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(user, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(user, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async isValidToken(token: string): Promise<User | null> {
    try {
      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      return user;
    } catch {
      return null;
    }
  }

  async saveTokens(user: User): Promise<Tokens> {
    const { accessToken, refreshToken } = this.generateTokens(user);

    await this.tokenRepo.save({ accessToken, refreshToken, user });

    return { accessToken, refreshToken };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOneBy({ email });
  }
}
