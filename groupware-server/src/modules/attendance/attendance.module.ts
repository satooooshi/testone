import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationBeforeJoining } from 'src/entities/applicationBeforeJoining.entity';
import { Attendance } from 'src/entities/attendance.entity';
import { TravelCost } from 'src/entities/travelCost.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      ApplicationBeforeJoining,
      TravelCost,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
