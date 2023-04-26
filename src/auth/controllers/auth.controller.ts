import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User, UserLoginPayload } from '../models/user/user.interface';
import { Tokens } from '../models/tokens/token.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async registerUser(@Body() user: User): Promise<Tokens> {
    const createdUser = await this.authService.registerAccount(user);

    if (!createdUser) {
      throw new NotFoundException('User already exists');
    }

    const tokens = await this.authService.saveTokens(createdUser);

    return tokens;
  }

  @Post('login')
  async loginUser(@Body() user: UserLoginPayload) {
    const dbUserResult = await this.authService.findUserByEmail(user.email);
    if (!dbUserResult) {
      throw new NotFoundException('User not found');
    }

    const isValidPasswd = await this.authService.comparePasswords(
      user.password,
      dbUserResult.password,
    );

    if (!isValidPasswd) {
      throw new NotFoundException('Bad credentials');
    }

    const tokens = await this.authService.saveTokens({ ...dbUserResult });

    return tokens;
  }

  @Post('refreshToken')
  async refreshToken(@Body() tokens: Tokens) {
    const tokenPayload = await this.authService.isValidToken(
      tokens.refreshToken,
    );

    if (!tokenPayload) {
      throw new UnauthorizedException('Unauthorized');
    }

    const dbUserResult = await this.authService.findUserByEmail(
      tokenPayload.email,
    );

    const generatedTokens = await this.authService.saveTokens({
      ...dbUserResult,
    });

    return generatedTokens;
  }
}
