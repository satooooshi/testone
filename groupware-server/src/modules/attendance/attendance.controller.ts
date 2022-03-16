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
import { ApplicationBeforeJoining } from 'src/entities/applicationBeforeJoining.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { AttendanceReport } from 'src/entities/attendanceReport.entity';
import { DefaultAttendance } from 'src/entities/defaultAttendance.entity';
import { TravelCost } from 'src/entities/travelCost.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { AttendanceService } from './attendance.service';

export interface GetAttendanceQuery {
  from_date: string;
  to_date: string;
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
    if (
      !this.isValidDate(query.from_date) ||
      !this.isValidDate(query.to_date)
    ) {
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
    if (
      !this.isValidDate(query.from_date) ||
      !this.isValidDate(query.to_date)
    ) {
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

  @Get('/default')
  @UseGuards(JwtAuthenticationGuard)
  async getDefaultAttendance(@Req() req: RequestWithUser) {
    const { user } = req;

    const attendance = await this.attendanceService.getDefaultAttendance(user);
    return attendance;
  }

  @Post('/default')
  @UseGuards(JwtAuthenticationGuard)
  async createDefaultAttendance(
    @Body() defaultAttendance: DefaultAttendance,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    const attendance = await this.attendanceService.createDefaultAttendance({
      ...defaultAttendance,
      user,
    });
    return attendance;
  }

  @Patch('/default')
  @UseGuards(JwtAuthenticationGuard)
  async updateDefaultAttendance(
    @Body() defaultAttendance: DefaultAttendance,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    const attendance = await this.attendanceService.updateDefaultAttendance({
      ...defaultAttendance,
      user,
    });
    return attendance;
  }

  @Get('application')
  @UseGuards(JwtAuthenticationGuard)
  async getApplications(@Req() req: RequestWithUser) {
    const { user } = req;
    const applications =
      await this.attendanceService.getApplicationBySpecificUser(user);
    return applications;
  }

  @Post('application')
  @UseGuards(JwtAuthenticationGuard)
  async createApplication(
    @Req() req: RequestWithUser,
    @Body() application: ApplicationBeforeJoining,
  ) {
    const { user } = req;
    console.log('called');
    const created = await this.attendanceService.createApplication({
      ...application,
      user,
    });
    return created;
  }

  @Post('delete-application')
  @UseGuards(JwtAuthenticationGuard)
  async deleteApplication(@Body() body: { applicationId: number }) {
    return await this.attendanceService.deleteApplication(body.applicationId);
  }

  @Patch('application')
  @UseGuards(JwtAuthenticationGuard)
  async updateApplication(
    @Req() req: RequestWithUser,
    @Body() application: ApplicationBeforeJoining,
  ) {
    const { user } = req;
    const updated = await this.attendanceService.createApplication({
      ...application,
      user,
    });
    return updated;
  }

  @Get('/report')
  @UseGuards(JwtAuthenticationGuard)
  async getAttendanceReport(
    @Query() query: GetAttendanceQuery,
    @Req() req: RequestWithUser,
  ) {
    if (
      !this.isValidDate(query.from_date) ||
      !this.isValidDate(query.to_date)
    ) {
      throw new BadRequestException();
    }

    const { user } = req;
    const attendanceReports = await this.attendanceService.getAttendanceReports(
      user.id,
      query,
    );
    return attendanceReports;
  }
  @Get('/report/all-unverified')
  @UseGuards(JwtAuthenticationGuard)
  async getUnverifiedAttendanceReportAllUser(
    @Query() query: GetAttendanceQuery,
  ) {
    if (
      !this.isValidDate(query.from_date) ||
      !this.isValidDate(query.to_date)
    ) {
      throw new BadRequestException();
    }

    const attendanceReports =
      await this.attendanceService.getUnverifiedAttendanceReportAllUser(query);
    return attendanceReports;
  }

  @Post('/report')
  @UseGuards(JwtAuthenticationGuard)
  async createAttendanceReport(
    @Body() attendanceReport: AttendanceReport,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    const attendanceRepo = await this.attendanceService.createAttendanceReport({
      ...attendanceReport,
      user,
    });
    const attendance =
      await this.attendanceService.getAttendanceSpecificUserByDate(
        user.id,
        attendanceReport.targetDate,
      );
    if (!attendance) {
      await this.attendanceService.createAttendanceBYReport(attendanceRepo);
    }
    return attendanceRepo;
  }

  @Patch('/report')
  @UseGuards(JwtAuthenticationGuard)
  async updateAttendanceReport(
    @Body() attendanceReport: AttendanceReport,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    const attendanceReports =
      await this.attendanceService.updateAttendanceReport({
        ...attendanceReport,
        user,
      });
    return attendanceReports;
  }

  @Patch('/verify')
  @UseGuards(JwtAuthenticationGuard)
  async verifyAttendanceReport(
    @Body() attendanceReport: AttendanceReport,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    const attendanceRepo = await this.attendanceService.verifyAttendanceReport({
      ...attendanceReport,
      user,
    });
    const attendance =
      await this.attendanceService.getAttendanceSpecificUserByDate(
        user.id,
        attendanceRepo.targetDate,
      );
    if (attendance)
      await this.attendanceService.verityAttendance(
        attendance,
        attendanceRepo.verifiedAt,
      );
    return attendanceRepo;
  }
}
