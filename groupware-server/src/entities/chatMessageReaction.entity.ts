import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ChatMessage } from './chatMessage.entity';
import { User } from './user.entity';

@Entity({ name: 'chat_message_reactions' })
@Unique(['emoji', 'user', 'chatMessage'])
export class ChatMessageReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  emoji: string;

  @ManyToOne(() => User, (user) => user.chatMessageReactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.reactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_message_id' })
  chatMessage?: ChatMessage;

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
