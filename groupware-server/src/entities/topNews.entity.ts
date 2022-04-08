import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'top_news' })
export class TopNews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'title',
    length: 100,
    nullable: false,
    default: '',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'url_path',
    nullable: false,
    default: '',
  })
  urlPath: string;

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
