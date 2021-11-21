import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventIntroduction } from './eventIntroduction.entity';

@Entity({ name: 'event_introduction_sub_images' })
export class EventIntroductionSubImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'image_url',
    length: 500,
    nullable: true,
    default: '',
  })
  imageUrl: string;

  @ManyToOne(
    () => EventIntroduction,
    (eventIntroduction) => eventIntroduction.eventIntroductionSubImages,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'event_introduction_id' })
  eventIntroduction: EventIntroduction;

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
