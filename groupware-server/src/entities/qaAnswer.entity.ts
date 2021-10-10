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
import { TextFormat, Wiki } from './wiki.entity';
import { User } from './user.entity';

@Entity({ name: 'qa_answers' })
export class QAAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'body', type: 'longtext' })
  body: string;

  @Column('simple-enum', {
    name: 'text_format',
    enum: ['markdown', 'html'],
    default: 'markdown',
  })
  textFormat: TextFormat;

  @ManyToOne(() => Wiki, (wiki) => wiki.answers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  wiki?: Wiki;

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
