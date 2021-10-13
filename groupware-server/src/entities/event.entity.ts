import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
import { EventComment } from './eventComment.entity';
import { EventFile } from './eventFile.entity';
import { EventVideo } from './eventVideo.entity';
import { SubmissionFile } from './submissionFiles.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';
import { UserJoiningEvent } from './userJoiningEvent.entity';

export enum EventType {
  IMPRESSIVE_UNIVERSITY = 'impressive_university',
  STUDY_MEETING = 'study_meeting',
  BOLDAY = 'bolday',
  COACH = 'coach',
  CLUB = 'club',
  SUBMISSION_ETC = 'submission_etc',
}

@Entity({ name: 'events' })
@Index(['title', 'description'], { fulltext: true })
export class EventSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'title',
    length: 100,
    default: '',
    nullable: false,
  })
  title: string;

  @Column({ type: 'longtext', name: 'description' })
  description: string | null;

  @Column({
    type: 'datetime',
    name: 'start_at',
    default: () => 'now()',
    nullable: false,
  })
  startAt: Date;

  @Column({
    type: 'datetime',
    name: 'end_at',
    default: () => 'now()',
    nullable: false,
  })
  endAt: Date;

  @Column({
    name: 'type',
    type: 'enum',
    enum: EventType,
    default: EventType.STUDY_MEETING,
  })
  type: EventType;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 200,
    nullable: false,
    default: '',
  })
  imageURL: string;

  @Column({
    name: 'chat_needed',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  chatNeeded: boolean;

  @OneToOne(() => ChatGroup, (chatGroup) => chatGroup.event, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  chatGroup?: ChatGroup;

  @ManyToMany(() => User, (user) => user.hostingEvents, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'event_hosting',
    joinColumn: {
      name: 'event_id',
    },
    inverseJoinColumn: {
      name: 'host_user_id',
    },
  })
  hostUsers?: User[];

  @OneToMany(
    () => UserJoiningEvent,
    (userJoiningEvent) => userJoiningEvent.event,
  )
  userJoiningEvent: UserJoiningEvent[];

  @ManyToMany(() => Tag, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'event_linked_tags',
    joinColumn: {
      name: 'event_id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
    },
  })
  tags?: Tag[];

  @OneToMany(() => EventComment, (file) => file.eventSchedule)
  comments: EventComment[];

  @OneToMany(
    () => SubmissionFile,
    (submissionFile) => submissionFile.eventSchedule,
  )
  submissionFiles?: SubmissionFile[];

  @OneToMany(() => EventFile, (file) => file.eventSchedule)
  files: EventFile[];

  @OneToMany(() => EventVideo, (video) => video.eventSchedule)
  videos: EventVideo[];

  @ManyToOne(() => User, (user) => user.eventsCreated)
  @JoinColumn({ name: 'author_id' })
  author?: User;

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
