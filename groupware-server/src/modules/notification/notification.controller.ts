import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationDevice } from 'src/entities/device.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Post('/devices')
  @UseGuards(JwtAuthenticationGuard)
  async registerDevice(
    @Body() device: NotificationDevice,
    @Req() req: RequestWithUser,
  ): Promise<NotificationDevice> {
    const { user } = req;
    return await this.notifService.registerDevice({ ...device, user });
  }
}
