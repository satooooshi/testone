import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
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
import { LastReadChatTime } from './lastReadChatTime.entity';
import { QAAnswer } from './qaAnswer.entity';
import { QAAnswerReply } from './qaAnswerReply.entity';
import { Wiki } from './wiki.entity';
import { SubmissionFile } from './submissionFiles.entity';
import { UserTag } from './userTag.entity';
import { UserJoiningEvent } from './userJoiningEvent.entity';
import { ChatMessageReaction } from './chatMessageReaction.entity';
import { NotificationDevice } from './device.entity';
import { genSignedURL } from 'src/utils/storage/genSignedURL';
import { genStorageURL } from 'src/utils/storage/genStorageURL';
import { UserGoodForBoard } from './userGoodForBord.entity';
import { Cart } from './cart.entity';
import { ShippingAddress } from './shippingAddress.entity';

export enum UserRole {
  ADMIN = 'admin',
  EXTERNAL_INSTRUCTOR = 'external_instructor',
  INTERNAL_INSTRUCTOR = 'internal_instructor',
  COACH = 'coach',
  COMMON = 'common',
}

export enum BranchType {
  TOKYO = 'tokyo',
  OSAKA = 'osaka',
  NON_SET = 'non_set',
}

@Entity({ name: 'users' })
@Index(['lastName', 'firstName'], { fulltext: true })
@Unique(['email', 'existence'])
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
    type: 'boolean',
    name: 'isEmailPublic',
    nullable: false,
    default: false,
  })
  isEmailPublic: boolean;

  @Column({
    type: 'varchar',
    name: 'phone',
    length: 100,
    nullable: false,
    default: '',
  })
  phone: string;

  @Column({
    type: 'boolean',
    name: 'isPhonePublic',
    nullable: false,
    default: false,
  })
  isPhonePublic: boolean;

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
    name: 'last_name_kana',
    length: 50,
    nullable: false,
    default: '',
  })
  lastNameKana: string;

  @Column({
    type: 'varchar',
    name: 'first_name_kana',
    length: 50,
    nullable: false,
    default: '',
  })
  firstNameKana: string;

  @Column({
    type: 'enum',
    enum: BranchType,
    default: BranchType.NON_SET,
  })
  branch: BranchType;

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'introduce_tech',
    default: '',
    nullable: false,
  })
  introduceTech: string;

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'introduce_qualification',
    default: '',
    nullable: false,
  })
  introduceQualification: string;

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'introduce_hobby',
    default: '',
    nullable: false,
  })
  introduceHobby: string;

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'introduce_club',
    default: '',
    nullable: false,
  })
  introduceClub: string;

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'introduce_other',
    default: '',
    nullable: false,
  })
  introduceOther: string;

  @Column({
    type: 'varchar',
    name: 'password',
    length: 200,
    nullable: false,
    default: '',
    select: false,
  })
  password?: string;

  @Column({
    type: 'varchar',
    name: 'refreshed_password',
    length: 200,
    nullable: false,
    default: '',
    select: false,
  })
  refreshedPassword?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMMON })
  role: UserRole;

  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt: Date | null;

  @Column({
    type: 'varchar',
    name: 'avatar_url',
    length: 2083,
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

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date;

  @Column({
    type: 'boolean',
    name: 'existence',
    nullable: true,
    default: true,
  })
  existence: boolean | null;

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

  @OneToMany(
    () => NotificationDevice,
    (notificationDevices) => notificationDevices.user,
  )
  notificationDevices?: NotificationDevice[];

  @OneToMany(
    () => UserJoiningEvent,
    (userJoiningEvent) => userJoiningEvent.user,
  )
  userJoiningEvent?: UserJoiningEvent[];

  @OneToMany(() => EventSchedule, (eventSchedule) => eventSchedule.author)
  eventsCreated?: EventSchedule[];

  @ManyToMany(() => ChatGroup, (chatGroup) => chatGroup.pinnedUsers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  pinnedChatGroups?: ChatGroup[];

  @ManyToMany(() => ChatGroup, (chatGroup) => chatGroup.members, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  chatGroups?: ChatGroup[];

  @ManyToMany(() => ChatGroup, (chatGroup) => chatGroup.muteUsers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  muteChatGroups?: ChatGroup[];

  @OneToMany(
    () => UserGoodForBoard,
    (userGoodForBoard) => userGoodForBoard.user,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  userGoodForBoard?: UserGoodForBoard[];

  @OneToMany(() => Cart, (cart) => cart.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  cart?: Cart[];

  @OneToMany(() => Wiki, (wiki) => wiki.writer)
  wiki?: Wiki[];

  @OneToMany(() => QAAnswer, (qaAnswer) => qaAnswer.writer)
  qaAnswers?: QAAnswer[];

  @OneToMany(() => QAAnswerReply, (qaAnswerReply) => qaAnswerReply.writer)
  qaAnswerReplies?: QAAnswerReply[];

  @OneToMany(() => ChatMessageReaction, (reaction) => reaction.user)
  chatMessageReactions?: ChatMessageReaction[];

  @OneToMany(() => ShippingAddress, (shippingAddress) => shippingAddress.user)
  shippingAddress: ShippingAddress[];

  //this is jwt token send when login or authenticate
  token?: string;

  eventCount?: number;
  questionCount?: number;
  answerCount?: number;
  knowledgeCount?: number;

  @BeforeInsert()
  @BeforeUpdate()
  changeToStorageURL?() {
    this.avatarUrl = genStorageURL(this.avatarUrl);
  }

  // @AfterInsert()
  // @AfterLoad()
  // @AfterUpdate()
  // async changeToSignedURL?() {
  //   this.avatarUrl = await genSignedURL(this.avatarUrl);
  // }
}
