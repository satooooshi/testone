import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
import { User } from './user.entity';

@Entity({ name: 'chat_notes' })
export class ChatNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'longtext', name: 'content' })
  content: string;

  @ManyToOne(() => ChatGroup, (chatGroup) => chatGroup.chatMessages, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_group_id' })
  chatGroup?: ChatGroup;

  @ManyToMany(() => User, (user) => user.chatMessages, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'chat_user_editted',
    joinColumn: {
      name: 'chat_group_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
    },
  })
  editor?: User[];

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

  isEditor?: boolean;
}
