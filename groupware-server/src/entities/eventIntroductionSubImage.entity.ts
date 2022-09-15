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
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventIntroduction } from './eventIntroduction.entity';

@Entity({ name: 'event_introduction_sub_images' })
@Index(['displayOrder', 'eventIntroduction'], { unique: true })
export class EventIntroductionSubImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'image_url',
    length: 2083,
    nullable: true,
    default: '',
  })
  imageUrl: string;

  @Column({
    type: 'int',
    name: 'display_order',
    nullable: false,
  })
  displayOrder: number;

  @ManyToOne(
    () => EventIntroduction,
    (eventIntroduction) => eventIntroduction.subImages,
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

  @BeforeInsert()
  @BeforeUpdate()
  changeToStorageURL?() {
    this.imageUrl = genStorageURL(this.imageUrl);
  }

  @AfterInsert()
  @AfterLoad()
  @AfterUpdate()
  async changeToSignedURL?() {
    this.imageUrl = await genSignedURL(this.imageUrl);
  }
}
