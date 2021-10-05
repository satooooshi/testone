import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/entities/user.entity';
import RegisterDto from '../user/dto/registerDto';
import { AuthService } from './auth.service';
import JwtAuthenticationGuard from './jwtAuthentication.guard';
import { LocalAuthenticationGuard } from './localAuthenticationGuard';
import RequestWithUser from './requestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto): Promise<User> {
    return this.authService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  login(@Req() request: RequestWithUser): Partial<User> {
    const { user } = request;
    // const cookie = this.authService.getCookieWithJwtToken(user.id);
    const token = this.authService.createToken({ userId: user.id });
    // response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return { ...user, token };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('authenticate')
  authenticate(@Req() request: RequestWithUser): Partial<User> {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  async logout(@Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    response.clearCookie('Authentication');
    return response.sendStatus(200);
  }
}
