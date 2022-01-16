import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ApplicationCategory {
  //お客様都合
  CLIENT = 'client',
  //自社都合
  INHOUSE = 'inhouse',
}

export enum OneWayOrRound {
  ONE_WAY = 'one_way',
  ROUND = 'round',
}

//入社前申請
@Entity({ name: 'applications_before_joining' })
export class ApplicationBeforeJoining {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    name: 'category',
    enum: ApplicationCategory,
    default: ApplicationCategory.INHOUSE,
  })
  category: ApplicationCategory;

  //日付
  @Column({ type: 'datetime', name: 'attendance_time', default: () => 'now()' })
  attendanceTime: Date;

  //行き先
  @Column({ type: 'varchar', name: 'destination', length: 100, default: '' })
  destination: string;

  //目的
  @Column({ type: 'varchar', name: 'purpose', length: 100, default: '' })
  purpose: string;

  //出発駅
  @Column({
    type: 'varchar',
    name: 'departure_station',
    length: 100,
    default: '',
  })
  departureStation: string;

  //経由
  @Column({ type: 'varchar', name: 'via_station', length: 100, default: '' })
  viaStation: string;

  //到着駅
  @Column({
    type: 'varchar',
    name: 'destination_station',
    length: 100,
    default: '',
  })
  destinationStation: string;

  //交通費(円)
  @Column({
    type: 'int',
    name: 'break_minutes',
    nullable: false,
    default: 0,
  })
  travelCost: number;

  //片道か往復か
  @Column({
    type: 'enum',
    name: 'one_way_or_round',
    enum: OneWayOrRound,
    default: OneWayOrRound.ROUND,
  })
  oneWayOrRound: OneWayOrRound;

  //承認時刻
  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt: Date | null;

  @ManyToOne(() => User, (u) => u.applications, {
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
