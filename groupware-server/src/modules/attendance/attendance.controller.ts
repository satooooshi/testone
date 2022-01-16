import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Attendance } from 'src/entities/attendance.entity';
import { TravelCost } from 'src/entities/travelCost.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { AttendanceService } from './attendance.service';

export interface GetAttendanceQuery {
  fromDate: string;
  toDate: string;
}

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  isValidDate(date: string) {
    const maybeDate = new Date(date);
    if (maybeDate instanceof Date) {
      return true;
    }
    return false;
  }

  @Get('/')
  @UseGuards(JwtAuthenticationGuard)
  async getAttendanceSpecificUser(
    @Query() query: GetAttendanceQuery,
    @Req() req: RequestWithUser,
  ) {
    if (!this.isValidDate(query.fromDate) || !this.isValidDate(query.toDate)) {
      throw new BadRequestException();
    }
    const { user } = req;

    const attendance = await this.attendanceService.getAttendanceSpecificUser(
      user.id,
      query,
    );
    return attendance;
  }

  @Get('/all')
  @UseGuards(JwtAuthenticationGuard)
  async getAttendanceAllUser(@Query() query: GetAttendanceQuery) {
    if (!this.isValidDate(query.fromDate) || !this.isValidDate(query.toDate)) {
      throw new BadRequestException();
    }

    const attendance = await this.attendanceService.getAttendanceAllUser(query);
    return attendance;
  }

  @Post('/')
  @UseGuards(JwtAuthenticationGuard)
  async createAttendance(
    @Body() attendance: Attendance,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;

    const createdAttendance = await this.attendanceService.createAttendance({
      ...attendance,
      user,
    });
    return createdAttendance;
  }

  @Patch('/')
  @UseGuards(JwtAuthenticationGuard)
  async updateAttendance(
    @Body() attendance: Attendance,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;

    const createdAttendance = await this.attendanceService.updateAttendance({
      ...attendance,
      user,
    });
    return createdAttendance;
  }

  @Post('/cost')
  @UseGuards(JwtAuthenticationGuard)
  async createTravelCost(@Body() travelCost: TravelCost) {
    const createdTravelCost = await this.attendanceService.createTravelCost(
      travelCost,
    );
    return createdTravelCost;
  }

  @Patch('/cost')
  @UseGuards(JwtAuthenticationGuard)
  async updateTravelCost(@Body() travelCost: TravelCost) {
    const updatedTravelCost = await this.attendanceService.createTravelCost(
      travelCost,
    );
    return updatedTravelCost;
  }
}
