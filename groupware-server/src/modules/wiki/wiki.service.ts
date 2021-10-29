import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { QAAnswerReply } from 'src/entities/qaAnswerReply.entity';
import { Wiki, WikiType } from 'src/entities/wiki.entity';
import { In, Repository } from 'typeorm';
import { SearchQueryToGetWiki, SearchResultToGetWiki } from './wiki.controller';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(Wiki)
    private readonly wikiRepository: Repository<Wiki>,

    @InjectRepository(QAAnswer)
    private readonly qaAnswerRepository: Repository<QAAnswer>,

    @InjectRepository(QAAnswerReply)
    private readonly qaAnswerReplyRepository: Repository<QAAnswerReply>,

    private readonly storageService: StorageService,
  ) {}

  public async generateSignedStorageURLsFromWikiObj(wiki: Wiki): Promise<Wiki> {
    if (wiki?.body) {
      wiki.body = await this.storageService.parseStorageURLToSignedURL(
        wiki.body,
      );
    }
    if (wiki?.writer) {
      wiki.writer.avatarUrl =
        await this.storageService.parseStorageURLToSignedURL(
          wiki.writer.avatarUrl,
        );
    }
    if (wiki?.answers) {
      const parsedAnswers: QAAnswer[] = [];
      for (const a of wiki.answers) {
        const parsedAvatar =
          await this.storageService.parseStorageURLToSignedURL(
            a.writer?.avatarUrl || '',
          );
        const parsedReplies: QAAnswerReply[] = [];
        if (a?.replies && a.replies.length) {
          for (const r of a.replies) {
            const parsedReplyAvatar =
              await this.storageService.parseStorageURLToSignedURL(
                a.writer?.avatarUrl || '',
              );
            const replyObj: QAAnswerReply = {
              ...r,
              writer: { ...r.writer, avatarUrl: parsedReplyAvatar },
            };
            parsedReplies.push(replyObj);
          }
        }
        parsedAnswers.push({
          ...a,
          writer: { ...a.writer, avatarUrl: parsedAvatar },
          replies: parsedReplies,
        });
      }
      wiki.answers = parsedAnswers;
    }
    return wiki;
  }

  public async generateSignedStorageURLsFromWikiArr(
    wiki: Wiki[],
  ): Promise<Wiki[]> {
    const parsedWiki = [];
    for (const w of wiki) {
      const parsed = await this.generateSignedStorageURLsFromWikiObj(w);
      parsedWiki.push(parsed);
    }

    return parsedWiki;
  }

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
      writer,
    } = query;
    let offset: number;
    const limit = 20;
    if (page) {
      offset = (Number(page) - 1) * limit;
    }
    const tagIDs = tag.split(' ');
    const [wikiWithRelation, count] = await this.wikiRepository
      .createQueryBuilder('wiki')
      .select()
      .leftJoinAndSelect('wiki.tags', 'tag')
      .leftJoinAndSelect('wiki.writer', 'writer')
      .leftJoinAndSelect('wiki.answers', 'answer')
      .leftJoinAndSelect('answer.writer', 'answer_writer')
      .andWhere(type ? 'wiki.type = :type' : '1=1', { type })
      .andWhere(word ? 'CONCAT(title, wiki.body) LIKE :queryWord' : '1=1', {
        queryWord: `%${word}%`,
      })
      .andWhere(
        status === 'new' && !writer && type === WikiType.QA
          ? 'wiki.resolved_at is null'
          : status === 'resolved' && !writer && type === WikiType.QA
          ? 'wiki.resolved_at is not null'
          : '1=1',
      )
      .andWhere(writer ? 'writer.id = :writer' : '1=1', {
        writer: writer,
      })
      .andWhere(
        query.answer_writer ? 'answer_writer.id = :answerWriter' : '1=1',
        {
          answerWriter: query.answer_writer,
        },
      )
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
      })
      .skip(offset)
      .take(limit)
      .orderBy('wiki.createdAt', 'DESC')
      .getManyAndCount();
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    const urlParsedWiki = await this.generateSignedStorageURLsFromWikiArr(
      wikiWithRelation,
    );
    return { pageCount, wiki: urlParsedWiki };
  }

  public async saveWiki(wiki: Partial<Wiki>): Promise<Wiki> {
    try {
      wiki.body = this.storageService.parseSignedURLToStorageURL(wiki.body);
      let newWiki = await this.wikiRepository.save(wiki);
      newWiki = await this.generateSignedStorageURLsFromWikiObj(newWiki);
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
      answer.body = this.storageService.parseSignedURLToStorageURL(answer.body);
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
      withDeleted: true,
      order: { createdAt: 'DESC' },
      take: limit,
    });
    const parsedWiki = this.generateSignedStorageURLsFromWikiArr(filteredWikis);
    return parsedWiki;
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
      reply.body = this.storageService.parseSignedURLToStorageURL(reply.body);
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
      .withDeleted()
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
    const parsedWiki = await this.generateSignedStorageURLsFromWikiObj(
      existWiki,
    );
    return parsedWiki;
  }
}
