import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as MarkdownIt from 'markdown-it';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { QAAnswerReply } from 'src/entities/qaAnswerReply.entity';
import { Wiki, WikiType } from 'src/entities/qaQuestion.entity';
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
    private readonly qaQuestionRepository: Repository<Wiki>,

    @InjectRepository(QAAnswer)
    private readonly qaAnswerRepository: Repository<QAAnswer>,

    @InjectRepository(QAAnswerReply)
    private readonly qaAnswerReplyRepository: Repository<QAAnswerReply>,
  ) {}

  public async getWikiList(
    query: SearchQueryToGetWiki,
  ): Promise<SearchResultToGetWiki> {
    const { page = 1, word = '', status = 'new', tag = '', type } = query;
    let offset: number;
    const limit = 20;
    if (page) {
      offset = (Number(page) - 1) * limit;
    }
    const tagIDs = tag.split('+');
    const searchQuery = this.qaQuestionRepository
      .createQueryBuilder('qa_questions')
      .select()
      .leftJoinAndSelect('qa_questions.tags', 'tag')
      .leftJoin('qa_questions.writer', 'writer')
      .leftJoin('qa_questions.answers', 'answer')
      .leftJoin('answer.writer', 'answer_writer')
      .where(
        word && word.length !== 1
          ? 'MATCH(title, qa_questions.body) AGAINST (:word IN NATURAL LANGUAGE MODE)'
          : '1=1',
        {
          word,
        },
      )
      .andWhere(type ? 'qa_questions.type = :type' : '1=1', { type })
      .andWhere(
        word.length === 1
          ? 'CONCAT(title, qa_questions.body) LIKE :queryWord'
          : '1=1',
        { queryWord: `%${word}%` },
      )
      .andWhere(
        status === 'new'
          ? 'qa_questions.resolved_at is null'
          : status === 'resolved'
          ? 'qa_questions.resolved_at is not null'
          : '1=1',
      )
      .andWhere(query.writer ? 'writer = :writer' : '1=1', {
        writer: query.writer,
      })
      .andWhere(query.answer_writer ? 'answer_writer = :answerWriter' : '1=1', {
        answerWriter: query.answer_writer,
      })
      .andWhere(tag ? 'tag.id IN (:...tagIDs)' : '1=1', {
        tagIDs,
      });
    const qaQuestions = await searchQuery.getMany();
    const ids = qaQuestions.map((q) => q.id);
    const questionsWithRelation = await this.qaQuestionRepository.find({
      where: { id: In(ids) },
      relations: ['writer', 'answers', 'tags'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const count = await searchQuery.getCount();
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    return { pageCount, qaQuestions: questionsWithRelation };
  }

  public async saveWiki(question: Partial<Wiki>): Promise<Wiki> {
    try {
      const newQuestion = await this.qaQuestionRepository.save(question);
      if (newQuestion.type !== WikiType.RULES) {
        const allUsers = await this.userRepository.find();
        const emails = allUsers.map((u) => u.email);
        const postedWikiType =
          newQuestion.type === WikiType.QA ? 'Q&A' : 'ナレッジ';
        const md = MarkdownIt({
          breaks: true,
        });
        this.notifService.sendEmailNotification({
          to: emails,
          subject: `新規${postedWikiType}が投稿されました`,
          title: `${newQuestion.title}`,
          content: `${md.render(newQuestion.body)}`,
          buttonLink: `${this.configService.get('CLIENT_DOMAIN')}/wiki/${
            newQuestion.id
          }`,
          buttonName: `${postedWikiType}を見る`,
        });
      }
      return newQuestion;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }

  public async createAnswer(answer: Partial<QAAnswer>): Promise<QAAnswer> {
    try {
      if (!answer.question || !answer.question.id) {
        throw Error;
      }
      const existQuestion = await this.qaQuestionRepository.findOne(
        answer.question.id,
      );
      answer.question = existQuestion;
      const newAnswer = await this.qaAnswerRepository.save(answer);
      return newAnswer;
    } catch (err) {
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }

  public async getLatestQuestion(): Promise<Wiki[]> {
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const limit = 10;
    const latest = await this.qaQuestionRepository
      .createQueryBuilder('question')
      .where('question.created_at < now()')
      .andWhere('question.created_at > :oneWeekAgo', { oneWeekAgo })
      .getMany();
    const ids = latest.map((q) => q.id);
    const filteredQuestions = await this.qaQuestionRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['answers', 'writer', 'tags'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return filteredQuestions;
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
    const existQuestion = await this.qaQuestionRepository
      .createQueryBuilder('question')
      .innerJoinAndSelect('question.writer', 'writer')
      .leftJoinAndSelect('question.bestAnswer', 'bestAnswer')
      .leftJoinAndSelect('question.answers', 'answer')
      .leftJoinAndSelect('answer.writer', 'answer_writer')
      .leftJoinAndSelect('answer.replies', 'reply')
      .leftJoinAndSelect('reply.writer', 'reply_writer')
      .leftJoinAndSelect('question.tags', 'tags')
      .where('question.id = :id', { id })
      .orderBy({ 'answer.created_at': 'ASC', 'reply.created_at': 'ASC' })
      .getOne();
    return existQuestion;
  }
}
