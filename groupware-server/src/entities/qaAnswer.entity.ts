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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QAAnswerReply } from './qaAnswerReply.entity';
import { TextFormat, Wiki } from './wiki.entity';
import { User } from './user.entity';
import { genSignedURL } from 'src/utils/storage/genSignedURL';
import { genStorageURL } from 'src/utils/storage/genStorageURL';
import {
  CustomPushNotificationData,
  sendPushNotifToSpecificUsers,
} from 'src/utils/notification/sendPushNotification';

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
  @JoinColumn({ name: 'wiki_id' })
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

  @AfterInsert()
  async sendPushNotification?() {
    const notificationData: CustomPushNotificationData = {
      title: `あなたの質問に新しい回答が投稿されました`,
      body: '',
      custom: {
        screen: 'wiki',
        id: this.wiki.id.toString(),
      },
    };
    const targetUser = await getRepository(User)
      .createQueryBuilder('user')
      .select('user.id')
      .leftJoin('user.wiki', 'w')
      .where('w.id = :wikiId', {
        wikiId: this.wiki.id,
      })
      .getOne();
    await sendPushNotifToSpecificUsers([targetUser], notificationData);
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
    this.body = await genSignedURL(this.body);
  }
}
