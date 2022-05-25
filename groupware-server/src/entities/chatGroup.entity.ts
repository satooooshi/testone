import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { genSignedURL } from 'src/utils/storage/genSignedURL';
import { genStorageURL } from 'src/utils/storage/genStorageURL';
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatAlbum } from './chatAlbum.entity';
import { ChatMessage, ChatMessageType } from './chatMessage.entity';
import { EventSchedule } from './event.entity';
import { LastReadChatTime } from './lastReadChatTime.entity';
import { User } from './user.entity';

export enum RoomType {
  GROUP = 'group',
  TALK_ROOM = 'talk_room',
  PERSONAL = 'personal',
}
@Entity({ name: 'chat_groups' })
export class ChatGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 50,
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'image_url',
    length: 2083,
    nullable: false,
    default: '',
  })
  imageURL: string;

  @Column({
    type: 'enum',
    name: 'room_type',
    enum: RoomType,
    default: RoomType.TALK_ROOM,
  })
  roomType: RoomType;

  @OneToOne(() => EventSchedule, (eventSchedule) => eventSchedule.chatGroup, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event?: EventSchedule;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatGroup)
  chatMessages?: ChatMessage[];

  @OneToMany(() => ChatAlbum, (chatAlbum) => chatAlbum.chatGroup)
  chatAlbums?: ChatAlbum[];

  @OneToMany(() => ChatAlbum, (chatNote) => chatNote.chatGroup)
  chatNotes?: ChatAlbum[];

  @OneToMany(() => LastReadChatTime, (t) => t.chatGroup)
  lastReadChatTime?: LastReadChatTime[];

  @ManyToMany(() => User, (user) => user.pinnedChatGroups, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'chat_user_pin',
    joinColumn: {
      name: 'chat_group_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
    },
  })
  pinnedUsers?: User[];

  @ManyToMany(() => User, (user) => user.chatGroups, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'user_chat_joining',
    joinColumn: {
      name: 'chat_group_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
    },
  })
  members?: User[];

  @ManyToMany(() => User, (user) => user.muteChatGroups, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'user_chat_mute',
    joinColumn: {
      name: 'chat_group_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
    },
  })
  muteUsers?: User[];

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

  isPinned?: boolean;
  hasBeenRead?: boolean;
  unreadCount?: number;

  @AfterInsert()
  async saveNewSystemMessage?() {
    if (this.id && this.members?.length) {
      if (this.members.length) {
        const newMemberMsg = new ChatMessage();
        newMemberMsg.content =
          this.members.map((m) => userNameFactory(m) + 'さん').join(', ') +
          'が参加しました';
        newMemberMsg.type = ChatMessageType.SYSTEM_TEXT;
        newMemberMsg.chatGroup = this;
        getRepository(ChatMessage).save(
          getRepository(ChatMessage).create(newMemberMsg),
        );
      }
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  changeToStorageURL?() {
    this.imageURL = genStorageURL(this.imageURL);
  }

  @AfterInsert()
  @AfterLoad()
  @AfterUpdate()
  async changeToSignedURL?() {
    this.imageURL = await genSignedURL(this.imageURL);
  }
}
