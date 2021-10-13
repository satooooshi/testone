import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as MarkdownIt from 'markdown-it';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { QAAnswerReply } from 'src/entities/qaAnswerReply.entity';
import { Wiki, WikiType } from 'src/entities/wiki.entity';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { SearchQueryToGetWiki, SearchResultToGetWiki } from './wiki.controller';

@Injectable()
export class WikiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notifService: NotificationService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Wiki)
    private readonly wikiRepository: Repository<Wiki>,

    @InjectRepository(QAAnswer)
    private readonly qaAnswerRepository: Repository<QAAnswer>,

    @InjectRepository(QAAnswerReply)
    private readonly qaAnswerReplyRepository: Repository<QAAnswerReply>,
  ) {}

  public async getWikiList(
    query: SearchQueryToGetWiki,
  ): Promise<SearchResultToGetWiki> {
    const {
      page = 1,
      word = '',
      status = 'new',
      tag = '',
      type,
      rule_category,
    } = query;
    let offset: number;
    const limit = 20;
    if (page) {
      offset = (Number(page) - 1) * limit;
    }
    const tagIDs = tag.split('+');
    const searchQuery = this.wikiRepository
      .createQueryBuilder('wiki')
      .select()
      .leftJoinAndSelect('wiki.tags', 'tag')
      .leftJoin('wiki.writer', 'writer')
      .leftJoin('wiki.answers', 'answer')
      .leftJoin('answer.writer', 'answer_writer')
      .where(
        word && word.length !== 1
          ? 'MATCH(title, wiki.body) AGAINST (:word IN NATURAL LANGUAGE MODE)'
          : '1=1',
        {
          word,
        },
      )
      .andWhere(type ? 'wiki.type = :type' : '1=1', { type })
      .andWhere(
        word.length === 1 ? 'CONCAT(title, wiki.body) LIKE :queryWord' : '1=1',
        { queryWord: `%${word}%` },
      )
      .andWhere(
        status === 'new'
          ? 'wiki.resolved_at is null'
          : status === 'resolved'
          ? 'wiki.resolved_at is not null'
          : '1=1',
      )
      .andWhere(query.writer ? 'writer = :writer' : '1=1', {
        writer: query.writer,
      })
      .andWhere(query.answer_writer ? 'answer_writer = :answerWriter' : '1=1', {
        answerWriter: query.answer_writer,
      })
      .andWhere(
        rule_category && type === WikiType.RULES
          ? 'wiki.ruleCategory = :ruleCategory'
          : '1=1',
        {
          ruleCategory: rule_category,
        },
      )
      .andWhere(tag ? 'tag.id IN (:...tagIDs)' : '1=1', {
        tagIDs,
      });
    const wikis = await searchQuery.getMany();
    const ids = wikis.map((q) => q.id);
    const wikiWithRelation = await this.wikiRepository.find({
      where: { id: In(ids) },
      relations: ['writer', 'answers', 'tags'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const count = await searchQuery.getCount();
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    return { pageCount, wiki: wikiWithRelation };
  }

  public async saveWiki(wiki: Partial<Wiki>): Promise<Wiki> {
    try {
      const newWiki = await this.wikiRepository.save(wiki);
      if (newWiki.type !== WikiType.RULES) {
        let mailContent = '';
        const allUsers = await this.userRepository.find();
        const emails = allUsers.map((u) => u.email);
        const postedWikiType =
          newWiki.type === WikiType.QA ? 'Q&A' : 'ナレッジ';
        if (newWiki.textFormat === 'markdown') {
          const md = MarkdownIt({
            breaks: true,
          });
          mailContent = md.render(newWiki.body);
        }
        if (newWiki.textFormat === 'html') {
          mailContent = newWiki.body;
        }
        this.notifService.sendEmailNotification({
          to: emails,
          subject: `新規${postedWikiType}が投稿されました`,
          title: `${newWiki.title}`,
          content: mailContent,
          buttonLink: `${this.configService.get('CLIENT_DOMAIN')}/wiki/${
            newWiki.id
          }`,
          buttonName: `${postedWikiType}を見る`,
        });
      }
      return newWiki;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }

  public async createAnswer(answer: Partial<QAAnswer>): Promise<QAAnswer> {
    try {
      if (!answer.wiki || !answer.wiki.id) {
        throw Error;
      }
      const existWiki = await this.wikiRepository.findOne(answer.wiki.id);
      answer.wiki = existWiki;
      const newAnswer = await this.qaAnswerRepository.save(answer);
      return newAnswer;
    } catch (err) {
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }

  public async getLatestWiki(): Promise<Wiki[]> {
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const limit = 10;
    const latest = await this.wikiRepository
      .createQueryBuilder('wiki')
      .where('wiki.created_at < now()')
      .andWhere('wiki.created_at > :oneWeekAgo', { oneWeekAgo })
      .getMany();
    const ids = latest.map((q) => q.id);
    const filteredWikis = await this.wikiRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['answers', 'writer', 'tags'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return filteredWikis;
  }

  public async createAnswerReply(
    reply: Partial<QAAnswerReply>,
  ): Promise<QAAnswerReply> {
    try {
      if (!reply.answer || !reply.answer.id) {
        throw Error;
      }
      const existAnswer = await this.qaAnswerRepository.findOne(
        reply.answer.id,
      );
      reply.answer = existAnswer;
      const newAnswer = await this.qaAnswerReplyRepository.save(reply);
      return newAnswer;
    } catch (err) {
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }

  public async getWikiDetail(id: number): Promise<Wiki> {
    const existWiki = await this.wikiRepository
      .createQueryBuilder('wiki')
      .innerJoinAndSelect('wiki.writer', 'writer')
      .leftJoinAndSelect('wiki.bestAnswer', 'bestAnswer')
      .leftJoinAndSelect('wiki.answers', 'answer')
      .leftJoinAndSelect('answer.writer', 'answer_writer')
      .leftJoinAndSelect('answer.replies', 'reply')
      .leftJoinAndSelect('reply.writer', 'reply_writer')
      .leftJoinAndSelect('wiki.tags', 'tags')
      .where('wiki.id = :id', { id })
      .orderBy({ 'answer.created_at': 'ASC', 'reply.created_at': 'ASC' })
      .getOne();
    return existWiki;
  }
}
