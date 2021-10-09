import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QAAnswer } from './qaAnswer.entity';
import { User } from './user.entity';

export enum EditorLanguage {
  MARKDOWN = 'markdown',
  MARKUP = 'markup',
}

@Entity({ name: 'qa_answer_replies' })
export class QAAnswerReply {
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

  @ManyToOne(() => User, (user) => user.qaAnswerReplies, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  writer?: User;

  @ManyToOne(() => QAAnswer, (qaAnswer) => qaAnswer.replies, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'answer_id' })
  answer?: QAAnswer;

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
