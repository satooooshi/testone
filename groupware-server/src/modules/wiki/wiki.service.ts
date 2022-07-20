import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { QAAnswerReply } from 'src/entities/qaAnswerReply.entity';
import { BoardCategory, Wiki, WikiType } from 'src/entities/wiki.entity';
import { In, Repository } from 'typeorm';
import { SearchQueryToGetWiki, SearchResultToGetWiki } from './wiki.controller';
import { StorageService } from '../storage/storage.service';
import { selectUserColumns } from 'src/utils/selectUserColumns';
import { UserGoodForBoard } from 'src/entities/userGoodForBord.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(Wiki)
    private readonly wikiRepository: Repository<Wiki>,

    @InjectRepository(QAAnswer)
    private readonly qaAnswerRepository: Repository<QAAnswer>,

    @InjectRepository(QAAnswerReply)
    private readonly qaAnswerReplyRepository: Repository<QAAnswerReply>,

    @InjectRepository(UserGoodForBoard)
    private readonly userGoodForBoardRepository: Repository<UserGoodForBoard>,

    private readonly storageService: StorageService,
  ) {}

  public async saveWiki(wiki: Partial<Wiki>): Promise<Wiki> {
    try {
      wiki.body = this.storageService.parseSignedURLToStorageURL(wiki.body);
      const newWiki = await this.wikiRepository.save(wiki);
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
      const newAnswer = await this.qaAnswerRepository.save(
        this.qaAnswerRepository.create(answer),
      );
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
      reply.body = this.storageService.parseSignedURLToStorageURL(reply.body);
      const newAnswer = await this.qaAnswerReplyRepository.save(
        this.qaAnswerReplyRepository.create(reply),
      );
      return newAnswer;
    } catch (err) {
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }

  public async getWikiDetail(userID: number, id: number): Promise<Wiki> {
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

    // const userGoodForBoard = await this.userGoodForBoardRepository.find({
    //   where: { wiki: existWiki },
    //   relations: ['user'],
    // });
    // const goodSenders = userGoodForBoard.map((g) => g.user);
    // const isGoodSender = goodSenders.some((u) => u.id === userID);

    return existWiki;
  }

  public async getAnswerDetail(id: number): Promise<QAAnswer> {
    const existAnswer = await this.qaAnswerRepository
      .createQueryBuilder('answer')
      .withDeleted()
      .innerJoinAndSelect('answer.writer', 'writer')
      .leftJoinAndSelect('answer.wiki', 'wiki')
      .leftJoinAndSelect('wiki.writer', 'wiki_writer')
      .leftJoinAndSelect('wiki.bestAnswer', 'bestAnswer')
      .leftJoinAndSelect('wiki.tags', 'tags')
      .leftJoinAndSelect('answer.replies', 'reply')
      .leftJoinAndSelect('reply.writer', 'reply_writer')
      .where('answer.id = :id', { id })
      .orderBy({ 'reply.created_at': 'ASC' })
      .getOne();
    return existAnswer;
  }

  public async getWikiList(
    userID: number,
    query: SearchQueryToGetWiki,
  ): Promise<SearchResultToGetWiki> {
    const {
      page = 1,
      word = '',
      status = 'new',
      tag = '',
      type,
      rule_category,
      board_category,
      writer,
    } = query;
    let offset: number;
    const limit = 20;
    if (page) {
      offset = (Number(page) - 1) * limit;
    }
    const tagIDs = tag.split(' ');
    const startTime = Date.now();

    const [wikis, count] = await this.wikiRepository
      .createQueryBuilder('wiki')
      .select()
      .leftJoinAndSelect('wiki.tags', 'tag')
      // .leftJoinAndSelect('wiki.userGoodForBoard', 'userGoodForBoard')
      // .leftJoinAndSelect('wiki.answers', 'answer')
      // .leftJoinAndSelect('answer.writer', 'answer_writer')
      .leftJoin('wiki.writer', 'writer')
      .addSelect(selectUserColumns('writer'))
      .andWhere(type ? 'wiki.type = :type' : '1=1', { type })
      .andWhere(word ? 'CONCAT(title, wiki.body) LIKE :queryWord' : '1=1', {
        queryWord: `%${word}%`,
      })
      .andWhere(
        status === 'new' &&
          !writer &&
          type === WikiType.BOARD &&
          board_category === BoardCategory.QA
          ? 'wiki.resolved_at is null'
          : status === 'resolved' &&
            !writer &&
            type === WikiType.BOARD &&
            board_category === BoardCategory.QA
          ? 'wiki.resolved_at is not null'
          : '1=1',
      )
      .andWhere(writer ? 'writer.id = :writer' : '1=1', {
        writer: writer,
      })
      .andWhere(
        rule_category && type === WikiType.RULES
          ? 'wiki.ruleCategory = :ruleCategory'
          : '1=1',
        {
          ruleCategory: rule_category,
        },
      )
      .andWhere(
        board_category && type === WikiType.BOARD
          ? 'wiki.boardCategory = :boardCategory'
          : '1=1',
        {
          boardCategory: board_category,
        },
      )
      .andWhere(tag ? 'tag.id IN wikiIDs  (:...tagIDs)' : '1=1', {
        tagIDs,
      })
      .skip(offset)
      .take(limit)
      .orderBy('wiki.id', 'DESC')
      .getManyAndCount();
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;

    if (!wikis.length) {
      return { pageCount, wiki: wikis };
    }
    const wikiIDs = wikis.map((w) => w.id);
    const goodsCount = await this.userGoodForBoardRepository
      .createQueryBuilder('user_good_for_board')
      .select(['user_good_for_board.wiki_id', 'COUNT(*) AS cnt'])
      .where('user_good_for_board.wiki_id IN (:...wikiIDs)', { wikiIDs })
      .groupBy('user_good_for_board.wiki_id')
      .getRawMany();

    const answersCount = await this.qaAnswerRepository
      .createQueryBuilder('qa')
      .select(['qa.wiki_id', 'COUNT(*) AS cnt'])
      .where('qa.wiki_id IN (:...wikiIDs)', { wikiIDs })
      .groupBy('qa.wiki_id')
      .getRawMany();

    const wikisSentGoodReqUser = await this.userGoodForBoardRepository
      .createQueryBuilder('user_good_for_board')
      .select(['user_good_for_board.wiki_id'])
      .where('user_id = :userID', { userID })
      .getRawMany();

    const wikisAndRelationCount = wikis.map((w) => {
      for (const goodCount of goodsCount) {
        if (goodCount['wiki_id'] === w.id) {
          w.goodsCount = Number(goodCount['cnt']);
        }
      }
      for (const answerCount of answersCount) {
        if (answerCount['wiki_id'] === w.id) {
          w.answersCount = Number(answerCount['cnt']);
        }
      }
      if (wikisSentGoodReqUser.some((g) => g['wiki_id'] === w.id)) {
        w.isGoodSender = true;
      }
      return w;
    });

    const endTime = Date.now();
    console.log('get wiki speed check2', endTime - startTime);
    return { pageCount, wiki: wikisAndRelationCount };
  }

  public async getHearts(wikiID: number): Promise<UserGoodForBoard[]> {
    const existWiki = await this.wikiRepository.findOne(wikiID);
    const existGoodReaction = await this.userGoodForBoardRepository.find({
      where: {
        wiki: existWiki,
      },
      relations: ['user'],
    });
    return existGoodReaction;
  }

  public async toggleGoodForBoard(
    user: User,
    wikiID: number,
  ): Promise<Partial<Wiki>> {
    const existWiki = await this.wikiRepository.findOne(wikiID);

    const existGoodReaction = await this.userGoodForBoardRepository.findOne({
      wiki: existWiki,
      user: user,
    });
    if (existGoodReaction) {
      return await this.userGoodForBoardRepository.remove(existGoodReaction);
    }
    return await this.userGoodForBoardRepository.save({
      user: user,
      wiki: existWiki,
    });
  }
}
