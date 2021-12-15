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
import { User } from './user.entity';

@Entity({ name: 'submission_files' })
export class SubmissionFile {
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

  @ManyToOne(
    () => EventSchedule,
    (eventSchedule) => eventSchedule.submissionFiles,
    {
      nullable: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'event_id' })
  eventSchedule: EventSchedule;

  @ManyToOne(() => User, (user) => user.submissionFiles, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userSubmitted: User;

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
    this.url = await genSignedURL(this.url);
  }
}
