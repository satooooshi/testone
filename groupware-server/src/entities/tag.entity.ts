import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EventSchedule } from './event.entity';
import { Wiki } from './wiki.entity';

export enum TagType {
  TECH = 'technology',
  CLUB = 'club',
  QUALIFICATION = 'qualification',
  HOBBY = 'hobby',
  OTHER = 'other',
}

@Entity({ name: 'tags' })
@Unique(['name'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 30,
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TagType,
    default: TagType.TECH,
  })
  type: TagType;

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

  @ManyToMany(() => EventSchedule, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  events?: EventSchedule[];

  @ManyToMany(() => Wiki, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  wiki?: Wiki[];
}
