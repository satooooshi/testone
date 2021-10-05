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

@Entity({ name: 'event_videos' })
export class EventVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'url',
    type: 'varchar',
    length: 255,
    default: '',
    nullable: false,
  })
  url: string;

  @ManyToOne(() => EventSchedule, (eventSchedule) => eventSchedule.videos, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  eventSchedule: EventSchedule;

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
