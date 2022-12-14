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
import { EventSchedule } from './event.entity';

@Entity({ name: 'event_videos' })
export class EventVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'url',
    type: 'varchar',
    length: 2083,
    default: '',
    nullable: false,
  })
  url: string;

  @ManyToOne(() => EventSchedule, (eventSchedule) => eventSchedule.videos, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  eventSchedule: EventSchedule;

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
    this.url = genStorageURL(this.url);
  }

  @AfterInsert()
  @AfterLoad()
  @AfterUpdate()
  async changeToSignedURL?() {
    // this.url = await genSignedURL(this.url);
    this.url = genStorageURL(this.url);
  }
}
