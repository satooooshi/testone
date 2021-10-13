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
  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  readonly updatedAt?: Date;

  @Column({
    type: 'timestamp',
    name: 'canceled_at',
    nullable: true,
    default: null,
  })
  canceledAt?: Date;

  @Column({
    type: 'int',
    name: 'late_minutes',
    nullable: false,
    default: 0,
  })
  lateMinutes?: number;

  @ManyToOne(() => User, (user) => user.userJoiningEvent, { primary: true })
  user: User;

  @ManyToOne(() => EventSchedule, (event) => event.userJoiningEvent, {
    primary: true,
  })
  event: EventSchedule;
}
