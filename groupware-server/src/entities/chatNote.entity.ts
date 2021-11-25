import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatGroup } from './chatGroup.entity';
import { ChatNoteImage } from './chatNoteImage.entity';
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
  editors?: User[];

  @OneToMany(() => ChatNoteImage, (chatNoteImage) => chatNoteImage.chatNote)
  images?: ChatNoteImage[];

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
