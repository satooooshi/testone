import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationBeforeJoining } from 'src/entities/applicationBeforeJoining.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { TravelCost } from 'src/entities/travelCost.entity';
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
  ) {}

  public async getAttendanceAllUser(query: GetAttendanceQuery) {
    const { from_date: fromDate, to_date: toDate } = query;
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.travelCost', 'travelCost')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('attendance.targetDate >= :fromDate', { fromDate })
      .where('attendance.targetDate <= :toDate', { toDate })
      .getMany();
    return attendance;
  }

  public async getAttendanceSpecificUser(
    userId: number,
    query: GetAttendanceQuery,
  ) {
    const { from_date: fromDate, to_date: toDate } = query;
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.travelCost', 'travelCost')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('user.id = :userId', { userId })
      .where('attendance.targetDate >= :fromDate', { fromDate })
      .where('attendance.targetDate <= :toDate', { toDate })
      .getMany();
    return attendance;
  }

  public async createAttendance(attendance: Attendance) {
    const createdAttendance = await this.attendanceRepo.save(attendance);
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

  public async updateAttendance(attendance: Attendance) {
    const updatedAttendance = await this.attendanceRepo.save(attendance);
    if (attendance?.travelCost?.length) {
      const costArr = attendance.travelCost.map((cost) => ({
        ...cost,
        updatedAttendance,
      }));
      const travelCost = await this.travelCostRepo.save(costArr);
      return { ...updatedAttendance, travelCost };
    }
    return updatedAttendance;
  }

  public async createTravelCost(travelCost: TravelCost) {
    const createdAttendance = await this.travelCostRepo.save(travelCost);
    return createdAttendance;
  }

  public async updateTravelCost(travelCost: TravelCost) {
    const updatedAttendance = await this.travelCostRepo.save(travelCost);
    return updatedAttendance;
  }
}
