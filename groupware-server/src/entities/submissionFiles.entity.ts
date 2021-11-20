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

@Entity({ name: 'submission_files' })
export class SubmissionFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'url',
    type: 'varchar',
    length: 2083,
    default: '',
    nullable: false,
  })
  url: string;

  @ManyToOne(
    () => EventSchedule,
    (eventSchedule) => eventSchedule.submissionFiles,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'event_id' })
  eventSchedule: EventSchedule;

  @ManyToOne(() => User, (user) => user.submissionFiles, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userSubmitted: User;

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
