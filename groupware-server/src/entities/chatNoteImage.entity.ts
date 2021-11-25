import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatNote } from './chatNote.entity';

@Entity({ name: 'chat_note_images' })
export class ChatNoteImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'image_url', length: 2083 })
  imageURL: string;

  @ManyToOne(() => ChatNote, (chatNote) => chatNote.images, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_note_id' })
  chatNote?: ChatNote;

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
