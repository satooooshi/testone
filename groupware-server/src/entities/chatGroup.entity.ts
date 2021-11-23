import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatMessage } from './chatMessage.entity';
import { EventSchedule } from './event.entity';
import { LastReadChatTime } from './lastReadChatTime.entity';
import { User } from './user.entity';

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

  @OneToOne(() => EventSchedule, (eventSchedule) => eventSchedule.chatGroup, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event?: EventSchedule;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatGroup)
  chatMessages?: ChatMessage[];

  @OneToMany(() => LastReadChatTime, (t) => t.chatGroup)
  lastReadChatTime?: LastReadChatTime[];

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
}
