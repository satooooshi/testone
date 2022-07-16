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
import { UserGoodForBoard } from './userGoodForBord.entity';

export enum WikiType {
  RULES = 'rule',
  ALL_POSTAL = 'all-postal',
  //掲示板
  BOARD = 'board',
}

export enum RuleCategory {
  //会社理念
  PHILOSOPHY = 'philosophy',
  //社内規則
  RULES = 'rules',
  //ABC制度
  ABC = 'abc',
  //福利厚生等
  BENEFITS = 'benefits',
  //各種申請書
  DOCUMENT = 'document',
  //社内規則ではないもの
  NON_RULE = '',
}

export enum BoardCategory {
  //ナレッジ
  KNOWLEDGE = 'knowledge',
  //Q&A
  QA = 'question',
  //本社からのお知らせ
  NEWS = 'news',
  //感動大学
  IMPRESSIVE_UNIVERSITY = 'impressive_university',
  //部活動・サークル
  CLUB = 'club',
  //勉強会
  STUDY_MEETING = 'study_meeting',
  //自己研鑽
  SELF_IMPROVEMENT = 'self_improvement',
  //個人告知
  PERSONAL_ANNOUNCEMENT = 'personal_announcement',
  //お祝い事
  CELEBRATION = 'celebration',
  //その他
  OTHER = 'other',
  //掲示板ではないもの
  NON_BOARD = '',
}

export type TextFormat = 'markdown' | 'html';

@Entity({ name: 'wiki' })
@Index(['title', 'body'], { fulltext: true })
export class Wiki {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 100, default: '' })
  title: string;

  @Column({ name: 'body', type: 'longtext' })
  body: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: WikiType,
    default: WikiType.BOARD,
  })
  type: WikiType;

  @Column({
    name: 'rule_category',
    type: 'enum',
    enum: RuleCategory,
    default: RuleCategory.NON_RULE,
    comment:
      'insert empty string to this column in the case of the type is not rule',
  })
  ruleCategory: RuleCategory;

  @Column({
    name: 'board_category',
    type: 'enum',
    enum: BoardCategory,
    default: BoardCategory.NON_BOARD,
    comment:
      'insert empty string to this column in the case of the type is not board',
  })
  boardCategory: BoardCategory;

  @Column('simple-enum', {
    name: 'text_format',
    enum: ['markdown', 'html'],
    default: 'markdown',
  })
  textFormat: TextFormat;

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

  @ManyToOne(() => User, (user) => user.wiki, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  writer?: User;

  @OneToMany(() => QAAnswer, (qaAnswer) => qaAnswer.wiki)
  answers?: QAAnswer[];

  @OneToOne(() => QAAnswer, (qaAnswer) => qaAnswer.id, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'best_answer_id' })
  bestAnswer?: QAAnswer;

  @ManyToMany(() => Tag, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'wiki_linked_tags',
    joinColumn: {
      name: 'wiki_id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
    },
  })
  tags?: Tag[];

  @ManyToMany(
    () => UserGoodForBoard,
    (userGoodForBoard) => userGoodForBoard.wiki,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  userGoodForBoard?: User[];

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

  isGoodSender?: boolean;
}
