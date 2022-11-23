import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QAAnswer } from './qaAnswer.entity';
import { TextFormat, Wiki } from './wiki.entity';
import { User } from './user.entity';
import { genSignedURL } from 'src/utils/storage/genSignedURL';
import { genStorageURL } from 'src/utils/storage/genStorageURL';
import {
  CustomPushNotificationData,
  sendPushNotifToSpecificUsers,
} from 'src/utils/notification/sendPushNotification';

@Entity({ name: 'qa_answer_replies' })
export class QAAnswerReply {
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

  @AfterInsert()
  async sendPushNotification?() {
    const targetWiki = await getRepository(Wiki)
      .createQueryBuilder('wiki')
      .leftJoinAndSelect('wiki.answers', 'a')
      .leftJoinAndSelect('wiki.writer', 'writer')
      .where('a.id = :answerId', {
        answerId: this.answer.id,
      })
      .getOne();
    const notificationData: CustomPushNotificationData = {
      title: `あなたの質問の回答に返信が送られました`,
      body: '',
      custom: {
        screen: 'wiki',
        id: targetWiki.id.toString(),
      },
    };
    await sendPushNotifToSpecificUsers(
      [targetWiki.writer.id],
      notificationData,
    );
  }

  @BeforeInsert()
  @BeforeUpdate()
  changeToStorageURL?() {
    this.body = genStorageURL(this.body);
  }

  @AfterInsert()
  @AfterLoad()
  @AfterUpdate()
  async changeToSignedURL?() {
    // this.body = await genSignedURL(this.body);
    this.body = genStorageURL(this.body);
  }
}
