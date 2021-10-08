import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QAAnswer } from './qaAnswer.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';

export enum WikiType {
  RULES = 'rule',
  KNOWLEDGE = 'knowledge',
  QA = 'qa',
}

export enum EditorLanguage {
  MARKDOWN = 'markdown',
  MARKUP = 'markup',
}

@Entity({ name: 'wiki' })
@Index(['title', 'body'], { fulltext: true })
export class Wiki {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 100, default: '' })
  title: string;

  @Column({ name: 'body', type: 'longtext' })
  body: string;

  @Column({ name: 'type', type: 'enum', enum: WikiType, default: WikiType.QA })
  type: WikiType;

  @Column({
    name: 'editorLanguage',
    type: 'enum',
    enum: EditorLanguage,
    default: EditorLanguage.MARKDOWN,
  })
  editorLanguage: EditorLanguage;

  @Column({
    type: 'datetime',
    name: 'resolved_at',
    default: null,
    nullable: true,
  })
  resolvedAt: Date;

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

  @ManyToOne(() => User, (user) => user.qaQuestions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  writer?: User;

  @OneToMany(() => QAAnswer, (qaAnswer) => qaAnswer.question)
  answers?: QAAnswer[];

  @OneToOne(() => QAAnswer, (qaAnswer) => qaAnswer.id)
  @JoinColumn({ name: 'best_answer_id' })
  bestAnswer?: QAAnswer;

  @ManyToMany(() => Tag, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'qa_linked_tags',
    joinColumn: {
      name: 'question_id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
    },
  })
  tags?: Tag[];
}
