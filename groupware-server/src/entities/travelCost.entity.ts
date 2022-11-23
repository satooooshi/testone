import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';

export enum TravelCostOneWayOrRound {
  ONE_WAY = 'one_way',
  ROUND = 'round',
}

export enum TravelCostCategory {
  //お客様都合
  CLIENT = 'client',
  //自社都合
  INHOUSE = 'inhouse',
}

@Entity('travel_cost')
export class TravelCost {
  @PrimaryGeneratedColumn()
  id: number;

  //交通費区分
  @Column({
    type: 'enum',
    name: 'category',
    enum: TravelCostCategory,
    default: TravelCostCategory.INHOUSE,
  })
  category: TravelCostCategory;

  //行き先
  @Column({ type: 'varchar', name: 'destination', length: 500, default: '' })
  destination: string;

  //目的
  @Column({ type: 'varchar', name: 'purpose', length: 500, default: '' })
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
    enum: TravelCostOneWayOrRound,
    default: TravelCostOneWayOrRound.ROUND,
  })
  oneWayOrRound: TravelCostOneWayOrRound;

  //承認時刻
  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt: Date | null;

  @ManyToOne(() => Attendance, (a) => a.travelCost, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attendance_id' })
  attendance?: Attendance;

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
