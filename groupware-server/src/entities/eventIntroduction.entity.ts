import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EventType } from './event.entity';
import { EventIntroductionSubImage } from './eventIntroductionSubImage.entity';

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

  @OneToMany(
    () => EventIntroductionSubImage,
    (eventIntroductionSubImage) => eventIntroductionSubImage.eventIntroduction,
  )
  eventIntroductionSubImages?: EventIntroductionSubImage[];

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
