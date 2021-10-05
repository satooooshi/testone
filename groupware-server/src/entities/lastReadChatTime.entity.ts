import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
import { User } from './user.entity';

@Entity({ name: 'last_read_chat_time' })
export class LastReadChatTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'read_time', type: 'datetime', default: () => 'now()' })
  readTime: Date;

  @ManyToOne(() => User, (u) => u.lastReadChatTime, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatGroup, (g) => g.lastReadChatTime, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup: ChatGroup;
}
