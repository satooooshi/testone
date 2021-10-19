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
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from 'src/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import RegisterDto from '../user/dto/registerDto';
import { AuthService } from './auth.service';
import JwtAuthenticationGuard from './jwtAuthentication.guard';
import { LocalAuthenticationGuard } from './localAuthenticationGuard';
import RequestWithUser from './requestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notifService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registrationData: User): Promise<User> {
    const registeredUser = await this.authService.register(registrationData);

    const notifTitle = 'ボールドのポータルに登録されました';
    const notifContent = `
下記情報で登録されました。\n
姓: ${registrationData.lastName}\n
名: ${registrationData.firstName}\n
メールアドレス: ${registrationData.email}\n
以下のパスワードでログインしてください。\n
${registrationData.password}
    `;
    const buttonLink = `${this.configService.get('CLIENT_DOMAIN')}`;
    const buttonName = 'ログインする';
    this.notifService.sendEmailNotification({
      to: registeredUser.email,
      subject: notifTitle,
      title: notifTitle,
      content: notifContent,
      buttonLink,
      buttonName,
    });

    return registeredUser;
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
