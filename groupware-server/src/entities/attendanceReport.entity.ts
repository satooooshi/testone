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
import { AttendanceCategory, AttendanceReason } from './attendance.entity';
import { User } from './user.entity';

@Entity({ name: 'attendance_report' })
export class AttendanceReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    name: 'category',
    enum: AttendanceCategory,
    default: AttendanceCategory.PAILD_ABSENCE,
  })
  category: AttendanceCategory;

  @Column({
    type: 'enum',
    name: 'reason',
    enum: AttendanceReason,
    default: AttendanceReason.PRIVATE,
  })
  reason: AttendanceReason;

  //対象日
  @Column({ type: 'datetime', name: 'target_date', default: () => 'now()' })
  targetDate: Date;

  //詳細
  @Column({ type: 'longtext', name: 'detail' })
  detail: string;

  //本社報告日
  @Column({
    type: 'datetime',
    name: 'report_date',
    nullable: true,
  })
  reportDate: Date | null;

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
