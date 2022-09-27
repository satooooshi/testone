import { userNameFactory } from 'src/utils/factory/userNameFactory';
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
  CALL = 'call',
  STICKER = 'sticker',
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

  @Column({ type: 'varchar', name: 'call_time', default: '' })
  callTime?: string;
  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 2083,
    default: '',
    nullable: false,
  })
  fileName: string;

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

  @Column({ type: 'datetime', name: 'modified_at', nullable: true })
  modifiedAt: Date | null;

  isSender?: boolean;

  @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.id)
  @JoinColumn({ name: 'reply_parent_id' })
  replyParentMessage?: ChatMessage;

  @BeforeInsert()
  async changeToStorageURL?() {
    if (
      this.type === ChatMessageType.IMAGE ||
      this.type === ChatMessageType.VIDEO ||
      this.type === ChatMessageType.OTHER_FILE
    ) {
      this.content = genStorageURL(this.content);
    }
  }

  // @AfterLoad()
  // @AfterInsert()
  // async changeToSignedURL?() {
  //   if (
  //     this.type === ChatMessageType.IMAGE ||
  //     this.type === ChatMessageType.VIDEO ||
  //     this.type === ChatMessageType.OTHER_FILE
  //   ) {
  //     this.content = await genSignedURL(this.content);
  //   }
  //   // if (this.type === ChatMessageType.OTHER_FILE) {
  //   //   this.content = mentionTransform(this.content);
  //   // }
  // }

  @AfterInsert()
  async sendPushNotification() {
    if (this.chatGroup?.id && this.sender?.id) {
      if (this.content === '音声通話') return;
      let content = this.content;
      if (this.type === ChatMessageType.IMAGE) {
        content = '画像を送信しました。';
      } else if (this.type === ChatMessageType.VIDEO) {
        content = '動画を送信しました。';
      } else if (this.type === ChatMessageType.OTHER_FILE) {
        content = 'ファイルを送信しました。';
      } else if (this.type === ChatMessageType.STICKER) {
        content = 'スタンプを送信しました。';
      }
      const mentionRegex = /@\[.*?\]\(([0-9]+)\)/g;
      const mentionedIds: number[] = [];
      let mentionArr = [];
      while ((mentionArr = mentionRegex.exec(content)) !== null) {
        if (mentionArr[1] && typeof Number(mentionArr[1]) === 'number') {
          mentionedIds.push(Number(mentionArr[1]));
        }
      }
      // console.log(mentionedIds);
      // const allUsers = await getRepository(User)
      //   .createQueryBuilder('user')
      //   .select('user.id')
      //   .leftJoin('user.chatGroups', 'chatGroups')
      //   .leftJoinAndSelect('user.muteChatGroups', 'muteChatGroups')
      //   .where('chatGroups.id = :chatGroupId', {
      //     chatGroupId: this.chatGroup.id,
      //   })
      //   .andWhere('user.id <> :senderId', { senderId: this.sender.id })
      //   .getMany();
      // const notifiedUsers = await getRepository(User)
      //   .createQueryBuilder('user')
      //   .select('user.id')
      //   .leftJoin('user.chatGroups', 'chatGroups')
      //   .leftJoin('user.muteChatGroups', 'muteChatGroups')
      //   .where(
      //     'muteChatGroups.id <> :chatGroupId OR muteChatGroups.id is null',
      //     {
      //       chatGroupId: this.chatGroup.id,
      //     },
      //   )
      //   // .orWhere('muteChatGroups.id is null')
      //   .andWhere('chatGroups.id = :chatGroupId', {
      //     chatGroupId: this.chatGroup.id,
      //   })
      //   .andWhere('user.id <> :senderId', { senderId: this.sender.id })
      //   .andWhere(
      //     mentionedIds?.length ? 'user.id NOT IN (:...mentionedIds)' : '1=1',
      //     { mentionedIds },
      //   )
      //   .getMany();
      const notifiedUsers = this.chatGroup.members.filter(
        (u) =>
          u.id !== this.sender.id &&
          !this.chatGroup.muteUsers.filter((m) => m.id === u.id).length &&
          !mentionedIds.filter((m) => m === u.id).length,
      );
      const groupName = this.chatGroup.name ? `(#${this.chatGroup.name})` : '';
      const title = `${userNameFactory(this.sender)} ${groupName}`;
      const notificationDataWithNoMention: CustomPushNotificationData = {
        title: title,
        body: `${mentionTransform(content)}`,
        custom: {
          type: 'badge',
          screen: 'chat',
          id: this.chatGroup.id.toString(),
        },
      };
      const silentNotification: CustomPushNotificationData = {
        title: '',
        body: '',
        custom: {
          type: 'badge',
          silent: 'silent',
          id: this.chatGroup.id.toString(),
        },
      };
      // console.log(
      //   '---====',
      //   notifiedUsers.map((u) => u.id),
      //   this.chatGroup.members.map((u) => u.id),
      //   this.sender.id,
      //   title,
      // );

      await sendPushNotifToSpecificUsers(
        notifiedUsers.map((u) => u.id),
        notificationDataWithNoMention,
      );
      if (this.chatGroup.muteUsers.length)
        await sendPushNotifToSpecificUsers(
          this.chatGroup.muteUsers.map((u) => u.id),
          silentNotification,
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
          title: `あなたをメンションした新着メッセージが届きました - ${userNameFactory(
            this.sender,
          )} ${groupName}`,
          body: `${mentionTransform(content)}`,
          custom: {
            type: 'badge',
            screen: 'chat',
            id: this.chatGroup.id.toString(),
          },
        };
        await sendPushNotifToSpecificUsers(
          mentionedUsers.map((u) => u.id),
          notificationDataWithMention,
        );
      }
    }
  }
}
