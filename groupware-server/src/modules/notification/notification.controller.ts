import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationDevice } from 'src/entities/device.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Post('/devices')
  @UseGuards(JwtAuthenticationGuard)
  async registerDevice(
    @Body() device: NotificationDevice,
  ): Promise<NotificationDevice> {
    return await this.notifService.registerDevice(device);
  }
}
