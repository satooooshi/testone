import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EventType } from './event.entity';

@Entity({ name: 'event_introductions' })
@Unique(['type'])
export class EventIntroduction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: EventType,
    default: EventType.STUDY_MEETING,
    nullable: false,
  })
  type: EventType;

  @Column({
    type: 'varchar',
    name: 'title',
    length: 100,
    default: '',
    nullable: false,
  })
  title: string;

  @Column({ type: 'longtext', name: 'description' })
  description: string;

  @Column({
    type: 'varchar',
    name: 'image_url',
    length: 500,
    nullable: false,
    default: '',
  })
  imageUrl: string;

  @Column({
    type: 'varchar',
    name: 'image_url_sub_1',
    length: 500,
    nullable: true,
    default: '',
  })
  imageUrlSub1: string;

  @Column({
    type: 'varchar',
    name: 'image_url_sub_2',
    length: 500,
    nullable: true,
    default: '',
  })
  imageUrlSub2: string;

  @Column({
    type: 'varchar',
    name: 'image_url_sub_3',
    length: 500,
    nullable: true,
    default: '',
  })
  imageUrlSub3: string;

  @Column({
    type: 'varchar',
    name: 'image_url_sub_4',
    length: 500,
    nullable: true,
    default: '',
  })
  imageUrlSub4: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}
