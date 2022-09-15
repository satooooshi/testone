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

  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 2083,
    default: '',
    nullable: false,
  })
  fileName: string;

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

  @BeforeInsert()
  @BeforeUpdate()
  changeToStorageURL?() {
    this.imageURL = genStorageURL(this.imageURL);
  }

  // @AfterInsert()
  // @AfterLoad()
  // @AfterUpdate()
  // async changeToSignedURL?() {
  //   this.imageURL = await genSignedURL(this.imageURL);
  // }
}
