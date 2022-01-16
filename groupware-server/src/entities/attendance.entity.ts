import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TravelCost } from './travelCost.entity';
import { User } from './user.entity';

export enum AttendanceCategory {
  // 通常
  COMMON = 'common',
  // 欠勤有給
  PAILD_ABSENCE = 'paid_absence',
  // 遅刻
  LATE = 'late',
  // 電車遅延
  TRAINDELAY = 'train_delay',
  // 早退
  EARLY_LEAVING = 'early_leaving',
  // 遅刻かつ早退
  LATE_AND_EARY_LEAVING = 'late_and_eary_leaving',
  // 有給などの休日
  HOLIDAY = 'holiday',
  // 休日出勤
  HOLIDAY_WORK = 'holiday_work',
  // 振替休日
  TRANSFER_HOLIDAY = 'transfer_holiday',
  // 外出(業務中に自己都合で外出)
  GOOUT = 'go_out',
  // シフト(顧客都合により出社時間を変更する場合)
  SHIFTWORK = 'shift_work',
  // 欠勤
  ABSENCE = 'absence',
  // 半休
  HALF_HOLIDAY = 'half_holiday',
}

export enum AttendanceReason {
  //通常
  COMMON = 'common',
  //私用
  PRIVATE = 'private',
  //体調不良
  SICK = 'sick',
  //家事都合
  HOUSEWORK = 'housework',
  //有給休暇
  HOLIDAY = 'holiday',
  //慶弔
  CONDOLENCE = 'condolence',
  //現場都合
  SITE = 'site',
  //災害
  DISASTER = 'disaster',
  //面談
  MEETING = 'meeting',
  //バースデー
  BIRTHDAY = 'birthday',
  //午前半休
  MORNING_OFF = 'morning_off',
  //午後半休
  AFTERNOON_OFF = 'afternoon_off',
  //遅刻半休
  LATE_OFF = 'late_off',
  //早退半休
  EARLY_LEAVING_OFF = 'early_leaving_off',
}

@Entity({ name: 'attendance' })
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    name: 'category',
    enum: AttendanceCategory,
    default: AttendanceCategory.COMMON,
  })
  category: AttendanceCategory;

  @Column({
    type: 'enum',
    name: 'reason',
    enum: AttendanceReason,
    default: AttendanceReason.COMMON,
  })
  reason: AttendanceReason;

  //対象日
  @Column({ type: 'datetime', name: 'target_date', default: () => 'now()' })
  targetDate: Date;

  //出勤時刻
  @Column({ type: 'datetime', name: 'attendance_time', default: () => 'now()' })
  attendanceTime: Date;

  //退勤時刻
  @Column({ type: 'datetime', name: 'absence_time', default: () => 'now()' })
  absenceTime: Date;

  //退勤時刻
  @Column({ type: 'varchar', name: 'detail', length: 500, default: '' })
  detail: string;

  //休憩時間
  @Column({
    type: 'int',
    name: 'break_minutes',
    nullable: false,
    default: 0,
  })
  breakMinutes: number;

  //本社報告日
  @Column({
    type: 'datetime',
    name: 'report_date',
    nullable: true,
  })
  reportDate: Date | null;
  //
  // //交通費(円)
  // @Column({
  //   type: 'int',
  //   name: 'break_minutes',
  //   nullable: false,
  //   default: 0,
  // })
  @OneToMany(() => TravelCost, (travelCost) => travelCost.attendance)
  travelCost: TravelCost[];

  //承認時刻
  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt: Date | null;

  @ManyToOne(() => User, (u) => u.attendance, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}
