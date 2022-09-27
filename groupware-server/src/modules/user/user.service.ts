import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/requestWithUser.interface';
import { compare, hash } from 'bcrypt';
import updatePasswordDto from './dto/updatePasswordDto';
import { UserTag } from 'src/entities/userTag.entity';
import { BoardCategory, Wiki, WikiType } from 'src/entities/wiki.entity';
import { Parser } from 'json2csv';
import { SearchQueryToGetUsers } from './user.controller';
import { Tag, TagType } from 'src/entities/tag.entity';
import { StorageService } from '../storage/storage.service';
import { DateTime } from 'luxon';
import { UserGoodForBoard } from 'src/entities/userGoodForBord.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import { QAAnswer } from 'src/entities/qaAnswer.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserGoodForBoard)
    private readonly userGoodForBoardRepository: Repository<UserGoodForBoard>,
    @InjectRepository(UserJoiningEvent)
    private readonly userJoiningEventRepository: Repository<UserJoiningEvent>,
    @InjectRepository(QAAnswer)
    private readonly qaAnswerRepository: Repository<QAAnswer>,
    @InjectRepository(Wiki)
    private readonly wikiRepository: Repository<Wiki>,
    private storageService: StorageService,
  ) {}

  public userRoleNameFactory(userRole: UserRole): string {
    switch (userRole) {
      case UserRole.ADMIN:
        return '管理者';
      case UserRole.COMMON:
        return '一般社員';
      case UserRole.EXTERNAL_INSTRUCTOR:
        return '講師(外部)';
      case UserRole.INTERNAL_INSTRUCTOR:
        return '講師(社員)';
      case UserRole.COACH:
        return '本社勤務';
    }
  }

  public async getCsv(query: { fromDate: Date; toDate: Date }) {
    const { fromDate, toDate } = query;
    const csvFields = [
      { label: 'id', value: 'id' },
      { label: 'メールアドレス', value: 'email' },
      { label: '電話番号', value: 'phone' },
      { label: '姓', value: 'lastName' },
      { label: '名', value: 'firstName' },
      { label: '自己紹介', value: 'introduce' },
      { label: '役職', value: 'role' },
      { label: '社員コード', value: 'employeeId' },
      { label: '技術', value: 'technologyTag' },
      { label: '部活動', value: 'clubTag' },
      { label: '資格', value: 'qualificationTag' },
      { label: '趣味', value: 'hobbyTag' },
      { label: 'その他のタグ', value: 'otherTag' },
      { label: 'イベント参加数', value: 'eventCount' },
      { label: '質問数', value: 'questionCount' },
      { label: '回答数', value: 'answerCount' },
      { label: 'ナレッジ投稿数', value: 'knowledgeCount' },
    ];
    const csvParser = new Parser({ fields: csvFields });
    const searchQuery = this.userRepository
      .createQueryBuilder('user')
      .select()
      .leftJoinAndSelect('user.tags', 'tag');
    const users: any[] = await searchQuery
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT event.id )', 'eventCount')
          .from(User, 'u')
          .leftJoin('u.userJoiningEvent', 'userJoiningEvent')
          .leftJoin('userJoiningEvent.event', 'event')
          .where(fromDate ? 'event.endAt > :fromDate' : '1=1', { fromDate })
          .andWhere(toDate ? 'event.endAt < :toDate' : '1=1', { toDate })
          .andWhere('u.id = user.id');
      }, 'eventCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT wiki.id )', 'questionCount')
          .from(User, 'u')
          .leftJoin('u.wiki', 'wiki')
          .where(fromDate ? 'wiki.createdAt > :fromDate' : '1=1', {
            fromDate,
          })
          .andWhere('wiki.type = :wikiTypeOfQa', {
            wikiTypeOfQa: WikiType.BOARD,
          })
          .andWhere('wiki.board_category = :boardCategory', {
            boardCategory: BoardCategory.QA,
          })
          .andWhere(fromDate ? 'wiki.createdAt < :toDate' : '1=1', {
            toDate,
          })
          .andWhere('u.id = user.id');
      }, 'questionCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT answer.id )', 'answerCount')
          .from(User, 'u')
          .leftJoin('u.qaAnswers', 'answer')
          .where(fromDate ? 'answer.createdAt > :fromDate' : '1=1', {
            fromDate,
          })
          .andWhere(fromDate ? 'answer.createdAt < :toDate' : '1=1', {
            toDate,
          })
          .andWhere('u.id = user.id');
      }, 'answerCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT wiki.id )', 'answerCount')
          .from(User, 'u')
          .leftJoin('u.wiki', 'wiki')
          .where(fromDate ? 'wiki.createdAt < :fromDate' : '1=1', {
            fromDate,
          })
          .andWhere('wiki.type = :board', {
            board: WikiType.BOARD,
          })
          .andWhere('wiki.board_category = :boarrdCategory', {
            boarrdCategory: BoardCategory.KNOWLEDGE,
          })
          .andWhere('u.id = user.id');
      }, 'knowledgeCount')
      .groupBy('user.id')
      .addGroupBy('tag.id')
      .getRawMany();
    let entityUsers: any[] = [];
    for (const u of users) {
      const tag: UserTag = {
        id: u.tag_id,
        name: u.tag_name,
        type: u.tag_type,
        createdAt: u.tag_created_at,
        updatedAt: u.tag_updated_at,
      };
      let tags: UserTag[] = [];
      const repeatedUsers = entityUsers.filter(
        (existUesrInArr) => existUesrInArr.id === u.user_id,
      );
      if (repeatedUsers.length) {
        const existTags = repeatedUsers[0].tags || [];
        tags = [...existTags, tag];

        //remove repeated user
        entityUsers = entityUsers.filter(
          (existUesrInArr) => existUesrInArr.id !== u.user_id,
        );
      }
      entityUsers = entityUsers.filter((e) => e.id !== u.user_id);
      entityUsers.push({
        id: u.user_id,
        email: u.user_email,
        phone: u.user_phone,
        lastName: u.user_last_name,
        firstName: u.user_first_name,
        introduce: u.user_introduce,
        role: this.userRoleNameFactory(u.user_role),
        technologyTag: tags.filter((t) => t.type === TagType.TECH),
        qualificationTag: tags.filter((t) => t.type === TagType.QUALIFICATION),
        clubTag: tags.filter((t) => t.type === TagType.CLUB),
        hobbyTag: tags.filter((t) => t.type === TagType.HOBBY),
        otherTag: tags.filter((t) => t.type === TagType.OTHER),
        verifiedAt: u.user_verified_at,
        avatarUrl: u.user_avatar_url,
        employeeId: u.user_employee_id,
        createdAt: u.user_created_at,
        updatedAt: u.user_updated_at,
        eventCount: u.eventCount,
        questionCount: u.questionCount,
        answerCount: u.answerCount,
        knowledgeCount: u.knowledgeCount,
      });
    }

    const tagModified = entityUsers.map((u) => {
      u.technologyTag = u.technologyTag.map((t: Tag) => t.name);
      u.qualificationTag = u.qualificationTag.map((t: Tag) => t.name);
      u.clubTag = u.clubTag.map((t: Tag) => t.name);
      u.hobbyTag = u.hobbyTag.map((t: Tag) => t.name);
      u.otherTag = u.otherTag.map((t: Tag) => t.name);
      return u;
    });

    const csvData = csvParser.parse(tagModified);
    return csvData;
  }

  async search(query: SearchQueryToGetUsers) {
    const {
      page = 1,
      word = '',
      tag = '',
      sort,
      role,
      verified,
      duration,
    } = query;
    const sortKey =
      sort === 'event'
        ? 'eventCount'
        : sort === 'question'
        ? 'questionCount'
        : sort === 'answer'
        ? 'answerCount'
        : sort === 'knowledge'
        ? 'knowledgeCount'
        : 'user.lastNameKana';
    let offset: number;
    let fromDate: Date;
    if (duration === 'month') {
      fromDate = new Date();
      fromDate.setDate(1);
      fromDate = DateTime.fromJSDate(fromDate)
        .set({ hour: 0, minute: 0, second: 0 })
        .toJSDate();
    }
    if (duration === 'week') {
      fromDate = new Date();
      fromDate = DateTime.fromJSDate(fromDate)
        .minus({ days: 7 })
        .set({ hour: 0, minute: 0, second: 0 })
        .toJSDate();
    }
    const toDate = new Date();
    const limit = 20;
    if (page) {
      offset = (Number(page) - 1) * limit;
    }
    const tagIDs = tag.split(' ');
    // const startTime = Date.now();
    let users, count;
    const q = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.tags', 'tag')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT event.id )', 'eventCount')
          .from(User, 'u')
          .leftJoin('u.userJoiningEvent', 'userJoiningEvent')
          .leftJoin('userJoiningEvent.event', 'event')
          .where('u.id = user.id')
          .andWhere('userJoiningEvent.canceledAt IS NULL')
          .andWhere(
            fromDate && toDate
              ? 'event.endAt > :fromDate AND event.endAt < :toDate'
              : '1=1',
            { fromDate, toDate },
          );
      }, 'eventCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT wiki.id )', 'questionCount')
          .from(User, 'u')
          .leftJoin('u.wiki', 'wiki')
          .where(fromDate ? 'wiki.createdAt > :fromDate' : '1=1', {
            fromDate,
          })
          .andWhere('wiki.type = :wikiTypeOfQa', {
            wikiTypeOfQa: WikiType.BOARD,
          })
          .andWhere('wiki.board_category = :boardCategory', {
            boardCategory: BoardCategory.QA,
          })
          .andWhere(fromDate ? 'wiki.createdAt < :toDate' : '1=1', {
            toDate,
          })
          .andWhere('u.id = user.id');
      }, 'questionCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT answer.id )', 'answerCount')
          .from(User, 'u')
          .leftJoin('u.qaAnswers', 'answer')
          .where(fromDate ? 'answer.createdAt > :fromDate' : '1=1', {
            fromDate,
          })
          .andWhere(fromDate ? 'answer.createdAt < :toDate' : '1=1', {
            toDate,
          })
          .andWhere('u.id = user.id');
      }, 'answerCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT( DISTINCT wiki.id )', 'answerCount')
          .from(User, 'u')
          .leftJoin('u.wiki', 'wiki')
          .where(fromDate ? 'wiki.createdAt < :fromDate' : '1=1', {
            fromDate,
          })
          .andWhere('wiki.type = :board', {
            board: WikiType.BOARD,
          })
          .andWhere('wiki.board_category = :boarrdCategory', {
            boarrdCategory: BoardCategory.KNOWLEDGE,
          })
          .andWhere('u.id = user.id');
      }, 'knowledgeCount')
      .where(
        word && word.length > 2
          ? 'MATCH(user.firstName, user.lastName) AGAINST (:word IN NATURAL LANGUAGE MODE)'
          : '1=1',
        {
          word,
        },
      )
      .andWhere(role ? 'user.role = :role' : '1=1', { role })
      .andWhere(verified ? 'user.verifiedAt is not null' : '1=1')
      .andWhere(
        word.length <= 2
          ? 'CONCAT(user.firstName, user.lastName) LIKE :queryWord'
          : '1=1',
        { queryWord: `%${word}%` },
      )
      .andWhere(tag ? 'tag.id IN (:...tagIDs)' : '1=1', {
        tagIDs,
      })
      .skip(offset)
      .take(limit);
    if (sortKey === 'user.lastNameKana') {
      [users, count] = await q.orderBy(sortKey, 'ASC').getManyAndCount();
    } else {
      [users, count] = await q
        .orderBy(sortKey, 'DESC')
        .addOrderBy('user.lastNameKana', 'ASC')
        .getManyAndCount();
    }
    //.orderBy(sortKey, sortKey === 'user.lastNameKana' ? 'ASC' : 'DESC')

    // const endTime = Date.now();
    const userIDs = users.map((u) => u.id);
    const userArrWithTags = await this.userRepository.findByIds(userIDs, {
      relations: ['tags'],
    });
    const joiningEventCountList = await this.userJoiningEventRepository
      .createQueryBuilder('userJoiningEvent')
      .select(['userJoiningEvent.user_id', 'COUNT(*) AS cnt'])
      .leftJoin('userJoiningEvent.event', 'event')
      .where(
        userIDs.length ? 'userJoiningEvent.user_id IN (:...userIDs)' : '1=1',
        { userIDs },
      )
      .andWhere('userJoiningEvent.canceledAt IS NULL')
      .andWhere(
        fromDate && toDate
          ? 'event.endAt > :fromDate AND event.endAt < :toDate'
          : '1=1',
        { fromDate, toDate },
      )
      .groupBy('userJoiningEvent.user_id')
      .getRawMany();

    const questionCountList = await this.wikiRepository
      .createQueryBuilder('wiki')
      .select(['wiki.user_id', 'COUNT(*) AS cnt'])
      .where(userIDs.length ? 'wiki.user_id IN (:...userIDs)' : '1=1', {
        userIDs,
      })
      .andWhere(
        fromDate
          ? 'wiki.createdAt > :fromDate AND wiki.createdAt < :toDate AND wiki.type = :board AND wiki.boardCategory = :boardCategory'
          : 'wiki.type = :board AND wiki.boardCategory = :boardCategory',
        {
          fromDate,
          toDate,
          board: WikiType.BOARD,
          boardCategory: BoardCategory.QA,
        },
      )
      .groupBy('wiki.user_id')
      .getRawMany();

    const knowledgeCountList = await this.wikiRepository
      .createQueryBuilder('wiki')
      .select(['wiki.user_id', 'COUNT(*) AS cnt'])
      .where(userIDs.length ? 'wiki.user_id IN (:...userIDs)' : '1=1', {
        userIDs,
      })
      .andWhere(
        fromDate
          ? 'wiki.createdAt > :fromDate AND wiki.createdAt < :toDate AND wiki.type = :board AND wiki.boardCategory = :boardCategory'
          : 'wiki.type = :board AND wiki.boardCategory = :boardCategory',
        {
          fromDate,
          toDate,
          board: WikiType.BOARD,
          boardCategory: BoardCategory.KNOWLEDGE,
        },
      )
      .groupBy('wiki.user_id')
      .getRawMany();

    const answerCountList = await this.qaAnswerRepository
      .createQueryBuilder('qa')
      .select(['qa.user_id', 'COUNT(*) AS cnt'])
      .where(userIDs.length ? 'qa.user_id IN (:...userIDs)' : '1=1', {
        userIDs,
      })
      .andWhere(
        fromDate && toDate
          ? 'qa.createdAt > :fromDate AND qa.createdAt < :toDate'
          : '1=1',
        { fromDate, toDate },
      )
      .groupBy('qa.user_id')
      .getRawMany();

    const usersArrWithEachCount = users.map((u) => {
      const tags = userArrWithTags.filter((user) => user.id === u.id)[0]?.tags;
      const eventCount = joiningEventCountList.find(
        (e) => e['user_id'] == u.id,
      )?.['cnt'];
      const questionCount = questionCountList.find(
        (e) => e['user_id'] == u.id,
      )?.['cnt'];
      const knowledgeCount = knowledgeCountList.find(
        (e) => e['user_id'] == u.id,
      )?.['cnt'];
      const answerCount = answerCountList.find((e) => e['user_id'] == u.id)?.[
        'cnt'
      ];
      return {
        ...u,
        tags,
        questionCount,
        eventCount,
        knowledgeCount,
        answerCount,
      };
    });
    // const endTime2 = Date.now();
    // console.log(
    //   'get user list speed check',
    //   endTime - startTime,
    //   'end ',
    //   endTime2 - startTime,
    // );

    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    return { users: usersArrWithEachCount, pageCount };
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      relations: ['tags'],
      where: { id },
    });
    return user;
  }

  async getUsers(): Promise<User[]> {
    const startTime = Date.now();
    const users = await this.userRepository.find({
      select: ['id', 'avatarUrl', 'lastName', 'firstName', 'existence', 'role'],
      order: { lastNameKana: 'ASC' },
    });
    const endTime = Date.now();
    console.log('spped check get users ==', endTime - startTime);
    return users;
  }

  async getById(id: number) {
    const user = await this.userRepository.findOne({ id });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('You are not alloed');
    }
    if (!user.verifiedAt) {
      throw new BadRequestException('The user is not verified');
    }
    return user;
  }

  async getByIdArr(ids: number[]): Promise<User[]> {
    const user = await this.userRepository.findByIds(ids);
    return user;
  }

  async getAllInfoById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!user) {
      throw new NotFoundException('User with this id does not exist');
    }
    if (!user?.verifiedAt) {
      throw new BadRequestException('The user is not verified');
    }
    const userGoodForBoards = await this.userGoodForBoardRepository.find({
      where: { user },
      relations: ['wiki', 'wiki.tags', 'wiki.writer'],
      take: 20,
      order: {
        id: 'DESC',
      },
    });

    if (!userGoodForBoards.length) {
      return user;
    }

    const wikisSentGoods = userGoodForBoards.map((u) => u.wiki);
    const wikiIDs = wikisSentGoods.map((w) => w.id);

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
      .select('user_good_for_board.wiki_id')
      .where('user_id = :userID', { userID: id })
      .getRawMany();

    const userGoodForBoardsAndRelationCount = userGoodForBoards.map((u) => {
      for (const goodCount of goodsCount) {
        if (goodCount['wiki_id'] === u.wiki.id) {
          u.wiki.goodsCount = Number(goodCount['cnt']);
        }
      }
      for (const answerCount of answersCount) {
        if (answerCount['wiki_id'] === u.wiki.id) {
          u.wiki.answersCount = Number(answerCount['cnt']);
        }
      }
      if (wikisSentGoodReqUser.some((g) => g['wiki_id'] === u.wiki.id)) {
        u.wiki.isGoodSender = true;
      }
      return u;
    });

    return { ...user, userGoodForBoard: userGoodForBoardsAndRelationCount };
  }

  async getByEmail(email: string, passwordSelect?: boolean) {
    let user: User;

    if (passwordSelect) {
      user = await this.userRepository.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'lastName',
          'firstName',
          'introduceTech',
          'introduceQualification',
          'introduceClub',
          'introduceHobby',
          'introduceOther',
          'password',
          'refreshedPassword',
          'role',
          'avatarUrl',
          'verifiedAt',
          'createdAt',
          'updatedAt',
        ],
      });
    } else {
      user = await this.userRepository.findOne({
        where: { email },
      });
    }
    if (user) {
      return user;
    }
    throw new NotFoundException('User with this email does not exist');
  }

  async create(userData: User) {
    if (userData?.avatarUrl) {
      userData.avatarUrl = this.storageService.parseSignedURLToStorageURL(
        userData.avatarUrl,
      );
    }
    userData.verifiedAt = new Date();
    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async registerUsers(userData: User[]) {
    const usersArr: User[] = [];
    for (const u of userData) {
      const existUser = await this.userRepository.findOne({
        email: u.email,
      });
      if (!u.email && !u.password && !existUser) {
        throw new BadRequestException('メールアドレスとパスワードは必須です');
      }
      if (existUser) {
        usersArr.push({
          ...existUser,
          ...u,
          verifiedAt: new Date(),
        });
      } else {
        const hashedPassword = await hash(u.password, 10);
        usersArr.push({
          ...u,
          password: hashedPassword,
          verifiedAt: new Date(),
        });
      }
    }
    const newUsers = await this.userRepository.save(usersArr);
    return newUsers;
  }

  async saveUser(newUserProfile: Partial<User>): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: { id: newUserProfile.id },
    });
    if (!existUser) {
      throw new InternalServerErrorException('Something went wrong');
    }
    const newUserObj = await this.userRepository.save(
      this.userRepository.create({
        ...existUser,
        ...newUserProfile,
      }),
    );
    return newUserObj;
  }

  async updatePassword(
    request: RequestWithUser,
    content: updatePasswordDto,
  ): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: { id: request.user.id },
      select: ['id', 'password'],
    });
    const hashedNewPassword = await hash(content.newPassword, 10);
    const isPasswordMatching = await compare(
      content.currentPassword,
      existUser.password,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('現在のパスワードが正しくありません');
    }
    existUser.password = hashedNewPassword;
    const user = await this.userRepository.save(existUser);
    return user;
  }

  async deleteUser(user: User) {
    try {
      const existUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      await this.userRepository.save({ ...existUser, existence: null });
      await this.userRepository.softDelete(user.id);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong. Deleting user was not successful',
      );
    }
  }
}
