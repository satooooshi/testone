import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QAAnswerReply } from './qaAnswerReply.entity';
import { Wiki } from './qaQuestion.entity';
import { User } from './user.entity';

export enum EditorLanguage {
  MARKDOWN = 'markdown',
  MARKUP = 'markup',
}

@Entity({ name: 'qa_answers' })
export class QAAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'body', type: 'longtext' })
  body: string;

  @Column({
    name: 'editor_language',
    type: 'enum',
    enum: EditorLanguage,
    default: EditorLanguage.MARKDOWN,
  })
  editorLanguage: EditorLanguage;

  @ManyToOne(() => Wiki, (qaQuestion) => qaQuestion.answers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question?: Wiki;

  @ManyToOne(() => User, (user) => user.qaAnswers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  writer?: User;

  @OneToMany(() => QAAnswerReply, (qaAnswerReply) => qaAnswerReply.answer)
  replies?: QAAnswerReply[];

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
