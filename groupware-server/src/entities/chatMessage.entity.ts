import { mentionTransform } from 'src/utils/mentionTransform';
import {
  CustomPushNotificationData,
  sendPushNotifToSpecificUsers,
} from 'src/utils/notification/sendPushNotification';
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
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
import { ChatMessageReaction } from './chatMessageReaction.entity';
import { User } from './user.entity';

export enum ChatMessageType {
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
  SYSTEM_TEXT = 'system_text',
  OTHER_FILE = 'other_file',
}

@Entity({ name: 'chat_messages' })
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', name: 'content' })
  content: string;

  @Column({
    type: 'enum',
    enum: ChatMessageType,
    default: ChatMessageType.TEXT,
  })
  type: ChatMessageType;

  @ManyToOne(() => ChatGroup, (chatGroup) => chatGroup.chatMessages, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup?: ChatGroup;

  @ManyToOne(() => User, (user) => user.chatMessages, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender?: User;

  @OneToMany(() => ChatMessageReaction, (reaction) => reaction.chatMessage)
  reactions?: ChatMessageReaction[];

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

  isSender?: boolean;

  @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.id)
  @JoinColumn({ name: 'reply_parent_id' })
  replyParentMessage?: ChatMessage;

  @BeforeInsert()
  @BeforeUpdate()
  async changeToStorageURL?() {
    if (
      this.type === ChatMessageType.IMAGE ||
      this.type === ChatMessageType.VIDEO ||
      this.type === ChatMessageType.OTHER_FILE
    ) {
      this.content = genStorageURL(this.content);
    }
  }

  @AfterInsert()
  @AfterLoad()
  @AfterUpdate()
  async changeToSignedURL?() {
    if (
      this.type === ChatMessageType.IMAGE ||
      this.type === ChatMessageType.VIDEO
    ) {
      this.content = await genSignedURL(this.content);
    }
    if (this.type === ChatMessageType.OTHER_FILE) {
      this.content = mentionTransform(this.content);
    }
  }

  @AfterInsert()
  async sendPushNotification() {
    if (this.chatGroup?.id && this.sender?.id) {
      const mentionRegex = /@\[.*?\]\(([0-9]+)\)/g;
      const mentionedIds: number[] = [];
      let mentionArr = [];
      while ((mentionArr = mentionRegex.exec(this.content)) !== null) {
        if (mentionArr[1] && typeof Number(mentionArr[1]) === 'number') {
          mentionedIds.push(Number(mentionArr[1]));
        }
      }
      // console.log(mentionedIds);
      const allUsersInRoom = await getRepository(User)
        .createQueryBuilder('user')
        .select('user.id')
        .leftJoin('user.chatGroups', 'chatGroups')
        .where('chatGroups.id = :chatGroupId', {
          chatGroupId: this.chatGroup.id,
        })
        .andWhere('user.id <> :senderId', { senderId: this.sender.id })
        .andWhere(
          mentionedIds?.length ? 'user.id NOT IN (:...mentionedIds)' : '1=1',
          { mentionedIds },
        )
        .getMany();
      const notificationDataWithNoMention: CustomPushNotificationData = {
        title: `新着メッセージが届きました`,
        body: `${this.content}`,
        custom: {
          screen: 'chat',
          id: this.chatGroup.id.toString(),
        },
      };
      await sendPushNotifToSpecificUsers(
        allUsersInRoom,
        notificationDataWithNoMention,
      );
      if (mentionedIds?.length) {
        const mentionedUsers = await getRepository(User)
          .createQueryBuilder('user')
          .select('user.id')
          .leftJoin('user.chatGroups', 'chatGroups')
          .where('chatGroups.id = :chatGroupId', {
            chatGroupId: this.chatGroup.id,
          })
          .andWhere('user.id <> :senderId', { senderId: this.sender.id })
          .andWhere('user.id IN (:...mentionedIds)', { mentionedIds })
          .getMany();
        const notificationDataWithMention: CustomPushNotificationData = {
          title: `あなたをメンションした新着メッセージが届きました`,
          body: `${mentionTransform(this.content)}`,
          custom: {
            screen: 'chat',
            id: this.chatGroup.id.toString(),
          },
        };
        await sendPushNotifToSpecificUsers(
          mentionedUsers,
          notificationDataWithMention,
        );
      }
    }
  }
}
