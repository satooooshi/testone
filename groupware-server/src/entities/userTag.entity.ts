import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TagType } from './tag.entity';
import { User } from './user.entity';

@Entity({ name: 'user_tags' })
@Unique(['name'])
export class UserTag {
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

  @ManyToMany(() => User, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  users?: User[];
}
