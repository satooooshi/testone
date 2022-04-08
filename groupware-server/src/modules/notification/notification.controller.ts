import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
    @Body() device: Partial<NotificationDevice>,
    @Req() req: RequestWithUser,
  ): Promise<NotificationDevice> {
    const { user } = req;
    return await this.notifService.registerDevice({ ...device, user });
  }

  @Delete('/devices/:deviceToken')
  @UseGuards(JwtAuthenticationGuard)
  async deleteDevice(
    @Param('deviceToken') token: string,
    @Res() res: Response,
  ) {
    await this.notifService.deleteDevice(token);
    res.send(200);
  }
}
