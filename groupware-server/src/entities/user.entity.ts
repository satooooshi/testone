import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
import { ChatMessage } from './chatMessage.entity';
import { EventSchedule } from './event.entity';
import { EventComment } from './eventComment.entity';
import { EventFile } from './eventFile.entity';
import { LastReadChatTime } from './lastReadChatTime.entity';
import { QAAnswer } from './qaAnswer.entity';
import { QAAnswerReply } from './qaAnswerReply.entity';
import { Wiki } from './qaQuestion.entity';
import { SubmissionFile } from './submissionFiles.entity';
import { UserTag } from './userTag.entity';

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  HEAD_OFFICE = 'head_office',
  COMMON = 'common',
}

@Entity({ name: 'users' })
@Unique(['email', 'employeeId'])
@Index(['lastName', 'firstName', 'email'], { fulltext: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'email',
    length: 100,
    nullable: false,
    default: '',
  })
  email: string;

  @Column({
    type: 'varchar',
    name: 'last_name',
    length: 50,
    nullable: false,
    default: '',
  })
  lastName: string;

  @Column({
    type: 'varchar',
    name: 'first_name',
    length: 50,
    nullable: false,
    default: '',
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'introduce',
    default: '',
    nullable: false,
  })
  introduce: string;

  @Column({
    type: 'varchar',
    name: 'password',
    length: 200,
    nullable: false,
    default: '',
    select: false,
  })
  password?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMMON })
  role: UserRole;

  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt: Date | null;

  @Column({
    type: 'varchar',
    name: 'avatar_url',
    length: 200,
    nullable: false,
    default: '',
  })
  avatarUrl: string;

  @Column({
    type: 'varchar',
    name: 'employee_id',
    length: 200,
    nullable: true,
  })
  employeeId: string | null;

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

  @OneToMany(() => EventComment, (e) => e.writer)
  eventComments?: EventComment[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.sender)
  chatMessages?: ChatMessage[];

  @OneToMany(
    () => SubmissionFile,
    (submissionFile) => submissionFile.userSubmitted,
  )
  submissionFiles?: SubmissionFile[];

  @OneToMany(
    () => LastReadChatTime,
    (lastReadChatTime) => lastReadChatTime.user,
  )
  lastReadChatTime?: LastReadChatTime[];

  @ManyToMany(() => UserTag, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'user_tag_linking',
    joinColumn: {
      name: 'user_id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
    },
  })
  tags?: UserTag[];

  @ManyToMany(() => EventSchedule, (event) => event.hostUsers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  hostingEvents?: EventSchedule[];

  @ManyToMany(() => EventSchedule, (events) => events.users, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  events?: EventSchedule[];

  @OneToMany(() => EventSchedule, (eventSchedule) => eventSchedule.author)
  eventsCreated?: EventSchedule[];

  @ManyToMany(() => ChatMessage, (chatMessage) => chatMessage.sender, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  chatGroups?: ChatGroup[];

  @OneToMany(() => Wiki, (qaQuestion) => qaQuestion.writer)
  qaQuestions?: Wiki[];

  @OneToMany(() => QAAnswer, (qaAnswer) => qaAnswer.writer)
  qaAnswers?: QAAnswer[];

  @OneToMany(() => QAAnswerReply, (qaAnswerReply) => qaAnswerReply.writer)
  qaAnswerReplies?: QAAnswerReply[];

  //this is jwt token send when login or authenticate
  token?: string;

  eventCount?: number;
  questionCount?: number;
  answerCount?: number;
}
