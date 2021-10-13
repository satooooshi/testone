import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventSchedule } from './event.entity';
import { User } from './user.entity';

@Entity('user_joining_event')
export class UserJoiningEvent {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'timestamp',
    name: 'canceled_at',
    nullable: true,
    default: null,
  })
  canceledAt?: Date | null;

  @Column({
    type: 'int',
    name: 'late_minutes',
    nullable: false,
    default: 0,
  })
  lateMinutes?: number;

  @ManyToOne(() => User, (user) => user.userJoiningEvent, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => EventSchedule, (event) => event.userJoiningEvent, {
    primary: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: EventSchedule;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  readonly createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  readonly updatedAt?: Date;
}
