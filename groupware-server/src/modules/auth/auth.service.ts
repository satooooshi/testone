import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import TokenPayload from './tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notifService: NotificationService,
  ) {}

  public async sendEmailToRefreshPass(email: string) {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        'this email has been deleted or not registered',
      );
    }
    const refreshedPassword = Math.random().toString(36).slice(-8);
    const hashed = await hash(refreshedPassword, 10);
    const updatedUser = await this.userService.create({
      ...user,
      refreshedPassword: hashed,
    });
    const subject = 'パスワード再発行メール';
    const title = 'パスワードの再発行が完了しました。';
    const content = `新しいパスワードは下記です。旧パスワードか新パスワードでログインできます。ログイン時に使用されなかったパスワードは無効になります。\n
    再発行パスワード: ${refreshedPassword}
    `;
    this.notifService.sendEmailNotification({
      to: updatedUser.email,
      subject,
      title,
      content,
      buttonLink: `${this.configService.get('CLIENT_DOMAIN')}`,
      buttonName: `ログインする`,
    });
  }

  public async register(registrationData: User) {
    const hashedPassword = await hash(registrationData.password, 10);
    try {
      const createdUser = await this.userService.create({
        ...registrationData,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      //@TODO add error handling for non unique email
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.getByEmail(email, true);
      if (!user.verifiedAt) {
        throw new BadRequestException('The user is not verified');
      }
      await this.verifyPassword(plainTextPassword, user);
      user.password = undefined;
      return user;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Wrong credentials provided');
    }
  }
  private async verifyPassword(plainTextPassword: string, existUser: User) {
    const isPasswordMatching = await compare(
      plainTextPassword,
      existUser.password,
    );
    const isRefreshedPasswordMatching = await compare(
      plainTextPassword,
      existUser.refreshedPassword,
    );
    if (!isPasswordMatching && isRefreshedPasswordMatching) {
      await this.userService.saveUser({ ...existUser, refreshedPassword: '' });
    } else if (!isPasswordMatching && isRefreshedPasswordMatching) {
      await this.userService.saveUser({
        ...existUser,
        password: existUser.refreshedPassword,
        refreshedPassword: '',
      });
    }
    if (!isPasswordMatching && !isRefreshedPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  public createToken(payload: any) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0`;
  }
}
