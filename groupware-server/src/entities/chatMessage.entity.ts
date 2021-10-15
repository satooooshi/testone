import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
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
}
