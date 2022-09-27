import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('default_attendance')
export class DefaultAttendance {
  @PrimaryGeneratedColumn()
  id: number;

  //出勤時刻
  @Column({ type: 'time', name: 'attendance_time', default: '00:00:00' })
  attendanceTime: string;

  //退勤時刻
  @Column({ type: 'time', name: 'absence_time', default: '00:00:00' })
  absenceTime: string;

  //休憩時間
  @Column({
    type: 'int',
    name: 'break_minutes',
    nullable: false,
    default: '00:00:00',
  })
  breakMinutes: number;

  @OneToOne(() => User, (user) => user.defaultAttendance)
  @JoinColumn({ name: 'user_id' })
  user: User;

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
