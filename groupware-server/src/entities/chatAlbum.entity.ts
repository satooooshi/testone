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
import { ChatAlbumImage } from './chatAlbumImage.entity';
import { ChatGroup } from './chatGroup.entity';
import { User } from './user.entity';

@Entity({ name: 'chat_albums' })
export class ChatAlbum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'title' })
  title: string;

  @ManyToOne(() => ChatGroup, (chatGroup) => chatGroup.chatAlbums, {
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
    name: 'album_user_editted',
    joinColumn: {
      name: 'chat_album_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
    },
  })
  editors?: User[];

  @OneToMany(() => ChatAlbumImage, (chatAlbumImage) => chatAlbumImage.chatAlbum)
  images?: ChatAlbumImage[];

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
