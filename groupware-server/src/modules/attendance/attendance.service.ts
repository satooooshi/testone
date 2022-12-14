import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationBeforeJoining } from 'src/entities/applicationBeforeJoining.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { AttendanceReport } from 'src/entities/attendanceReport.entity';
import { DefaultAttendance } from 'src/entities/defaultAttendance.entity';
import { TravelCost } from 'src/entities/travelCost.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { GetAttendanceQuery } from './attendance.controller';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(ApplicationBeforeJoining)
    private readonly applicationRepo: Repository<ApplicationBeforeJoining>,
    @InjectRepository(TravelCost)
    private readonly travelCostRepo: Repository<TravelCost>,
    @InjectRepository(DefaultAttendance)
    private readonly defaultAttendanceRepo: Repository<DefaultAttendance>,
    @InjectRepository(AttendanceReport)
    private readonly attendanceReport: Repository<AttendanceReport>,
  ) {}

  public async getDefaultAttendance(user: User) {
    const defaultAttendance = await this.defaultAttendanceRepo.findOne(
      {
        user,
      },
      { relations: ['user'] },
    );
    return defaultAttendance;
  }

  public async createDefaultAttendance(defaultAttendance: DefaultAttendance) {
    const created = await this.defaultAttendanceRepo.save(defaultAttendance);
    return created;
  }

  public async updateDefaultAttendance(defaultAttendance: DefaultAttendance) {
    const updated = await this.defaultAttendanceRepo.save(defaultAttendance);
    return updated;
  }

  public async getAttendanceAllUser(query: GetAttendanceQuery) {
    const { from_date: fromDate, to_date: toDate } = query;
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.travelCost', 'travelCost')
      .leftJoinAndSelect('attendance.user', 'user')
      .andWhere('attendance.targetDate between :fromDate and :toDate', {
        fromDate,
        toDate,
      })
      .getMany();
    return attendance;
  }

  public async getAttendanceSpecificUser(
    userId: number,
    query: GetAttendanceQuery,
  ) {
    const { from_date: fromDate, to_date: toDate, id } = query;
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.travelCost', 'travelCost')
      .leftJoinAndSelect('attendance.user', 'user')
      .andWhere('user.id = :userId', { userId: id > 0 ? id : userId })
      .andWhere('attendance.targetDate between :fromDate and :toDate', {
        fromDate,
        toDate,
      })
      .getMany();
    return attendance;
  }

  public async getAttendanceSpecificUserByDate(
    userId: number,
    targetDate: Date,
  ) {
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .andWhere(
        `DATE_FORMAT(attendance.targetDate, '%Y-%m-%d') = DATE_FORMAT(:targetDate, '%Y-%m-%d')`,
        {
          targetDate,
        },
      )
      .getOne();
    return attendance;
  }

  public async createAttendance(attendance: Attendance) {
    const createdAttendance = await this.attendanceRepo.save({
      ...attendance,
      verifiedAt: null,
    });
    if (attendance?.travelCost?.length) {
      const costArr = attendance.travelCost.map((cost) => ({
        ...cost,
        createdAttendance,
      }));
      const travelCost = await this.travelCostRepo.save(costArr);
      return { ...createdAttendance, travelCost };
    }
    return createdAttendance;
  }

  public async createAttendanceBYReport(attendanceRepo: AttendanceReport) {
    await this.attendanceRepo.save({
      category: attendanceRepo.category,
      reason: attendanceRepo.reason,
      user: attendanceRepo.user,
      targetDate: attendanceRepo.targetDate,
      detail: '',
      verifiedAt: null,
    });
  }

  public async updateAttendance(attendance: Attendance) {
    const updatedAttendance = await this.attendanceRepo.save({
      ...attendance,
      verifiedAt: null,
    });
    if (attendance?.travelCost.length) {
      const costArr = attendance.travelCost.map((cost) => ({
        ...cost,
        updatedAttendance,
      }));

      const travelCost = await this.travelCostRepo.save(costArr);
      return { ...updatedAttendance, travelCost };
    }
    return updatedAttendance;
  }

  public async verityAttendance(attendance: Attendance, date: Date) {
    await this.attendanceRepo.save({
      ...attendance,
      verifiedAt: date,
    });
  }

  public async createTravelCost(travelCost: TravelCost) {
    const createdAttendance = await this.travelCostRepo.save(travelCost);
    return createdAttendance;
  }

  public async updateTravelCost(travelCost: TravelCost) {
    const updatedAttendance = await this.travelCostRepo.save(travelCost);
    return updatedAttendance;
  }

  public async getApplicationBySpecificUser(user: User) {
    const applications = await this.applicationRepo.find({ where: { user } });
    return applications;
  }

  public async createApplication(application: ApplicationBeforeJoining) {
    const created = await this.applicationRepo.save(application);
    return created;
  }

  public async updateApplication(application: ApplicationBeforeJoining) {
    const updated = await this.applicationRepo.save(application);
    return updated;
  }

  public async deleteApplication(applicationId: number) {
    const Application = await this.applicationRepo.findOne({
      id: applicationId,
    });
    if (!Application) {
      throw new BadRequestException(
        'The application has already been deleted.',
      );
    }
    await this.applicationRepo.delete(applicationId);
  }

  public async getAttendanceReports(userId: number, query: GetAttendanceQuery) {
    const { from_date: fromDate, to_date: toDate, id } = query;
    userId - id ? id : userId;

    const attendanceReports = await this.attendanceReport
      .createQueryBuilder('attendance_report')
      .leftJoinAndSelect('attendance_report.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .andWhere('attendance_report.targetDate between :fromDate and :toDate', {
        fromDate,
        toDate,
      })
      .getMany();

    return attendanceReports;
  }

  public async getUnverifiedAttendanceReportAllUser(query: GetAttendanceQuery) {
    const { from_date: fromDate, to_date: toDate } = query;
    const attendanceReports = await this.attendanceReport
      .createQueryBuilder('attendance_report')
      .leftJoinAndSelect('attendance_report.user', 'user')
      .andWhere('attendance_report.targetDate between :fromDate and :toDate', {
        fromDate,
        toDate,
      })
      .andWhere('attendance_report.verifiedAt is null')
      .getMany();
    return attendanceReports;
  }
  public async getAttendanceRepoSpecificUserByDate(
    userId: number,
    targetDate: Date,
  ) {
    const attendanceRepo = await this.attendanceRepo
      .createQueryBuilder('attendance_report')
      .leftJoinAndSelect('attendance_report.user', 'user')
      .andWhere('user.id = :userId', { userId })
      .andWhere(
        `DATE_FORMAT(attendance_report.targetDate, '%Y-%m-%d') = DATE_FORMAT(:targetDate, '%Y-%m-%d')`,
        {
          targetDate,
        },
      )
      .getOne();
    return attendanceRepo;
  }

  public async createAttendanceReport(attendanceReport: AttendanceReport) {
    const createdAttendanceReport = await this.attendanceReport.save({
      ...attendanceReport,
      verifiedAt: null,
    });
    return createdAttendanceReport;
  }

  public async updateAttendanceReport(attendanceReport: AttendanceReport) {
    const updatedAttendanceReport = await this.attendanceReport.save(
      attendanceReport,
    );
    return updatedAttendanceReport;
  }

  public async deleteAttendanceReport(reportId: number) {
    const report = await this.attendanceReport.findOne({
      id: reportId,
    });
    if (!report) {
      throw new BadRequestException(
        'The attendance report has already been deleted.',
      );
    }
    await this.attendanceReport.delete(reportId);
  }

  public async verifyAttendanceReport(attendanceReport: AttendanceReport) {
    const verifyAttendanceReport = await this.attendanceReport.save({
      ...attendanceReport,
      verifiedAt: new Date(),
    });
    return verifyAttendanceReport;
  }
}
