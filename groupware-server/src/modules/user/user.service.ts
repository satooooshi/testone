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
import { WikiType } from 'src/entities/wiki.entity';
import { Parser } from 'json2csv';
import { SearchQueryToGetUsers } from './user.controller';
import { Tag, TagType } from 'src/entities/tag.entity';
import { StorageService } from '../storage/storage.service';
import { DateTime } from 'luxon';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
          .andWhere('wiki.type = :qa', {
            qa: WikiType.QA,
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
          .andWhere('wiki.type = :knowledge', {
            knowledge: WikiType.KNOWLEDGE,
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

  public async generateSignedStorageURLsFromUserObj(user: User): Promise<User> {
    if (user.avatarUrl) {
      user.avatarUrl = await this.storageService.parseStorageURLToSignedURL(
        user.avatarUrl,
      );
    }
    return user;
  }

  public async generateSignedStorageURLsFromUserArr(
    users: User[],
  ): Promise<User[]> {
    const parsedUsers: User[] = [];
    for (const u of users) {
      const parsed = await this.generateSignedStorageURLsFromUserObj(u);
      parsedUsers.push(parsed);
    }
    return parsedUsers;
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
        : 'user.createdAt';
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
    const [users, count] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.tags', 'tag')
      .where(
        word && word.length !== 1
          ? 'MATCH(user.firstName, user.lastName, user.email) AGAINST (:word IN NATURAL LANGUAGE MODE)'
          : '1=1',
        {
          word,
        },
      )
      .andWhere(role ? 'user.role = :role' : '1=1', { role })
      .andWhere(verified ? 'user.verifiedAt is not null' : '1=1')
      .andWhere(
        word.length === 1
          ? 'CONCAT(user.firstName, user.lastName, user.email) LIKE :queryWord'
          : '1=1',
        { queryWord: `%${word}%` },
      )
      .andWhere(tag ? 'tag.id IN (:...tagIDs)' : '1=1', {
        tagIDs,
      })
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
          .andWhere('wiki.type = :qa', {
            qa: WikiType.QA,
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
          .andWhere('wiki.type = :knowledge', {
            knowledge: WikiType.KNOWLEDGE,
          })
          .andWhere('u.id = user.id');
      }, 'knowledgeCount')
      .skip(offset)
      .take(limit)
      .orderBy(sortKey, 'DESC')
      .getManyAndCount();
    const userIDs = users.map((u) => u.id);
    const userObjWithEvent = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userJoiningEvent', 'userJoiningEvent')
      .leftJoin('userJoiningEvent.event', 'event')
      .where(userIDs.length ? 'user.id IN (:...userIDs)' : '1=1', { userIDs })
      .andWhere('userJoiningEvent.canceledAt IS NULL')
      .andWhere(
        fromDate && toDate
          ? 'event.endAt > :fromDate AND event.endAt < :toDate'
          : '1=1',
        { fromDate, toDate },
      )
      .getMany();

    const userObjWithQuestion = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.wiki',
        'wiki',
        fromDate
          ? 'wiki.createdAt > :fromDate AND wiki.createdAt < :toDate AND wiki.type = :qa'
          : 'wiki.type = :qa',
        { fromDate, toDate, qa: WikiType.QA },
      )
      .where(userIDs.length ? 'user.id IN (:...userIDs)' : '1=1', { userIDs })
      .getMany();
    const userObjWithKnowledge = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.wiki',
        'wiki',
        fromDate
          ? 'wiki.createdAt > :fromDate AND wiki.createdAt < :toDate AND wiki.type = :knowledge'
          : 'wiki.type = :knowledge',
        { fromDate, toDate, knowledge: WikiType.KNOWLEDGE },
      )
      .where(userIDs.length ? 'user.id IN (:...userIDs)' : '1=1', { userIDs })
      .getMany();
    const userObjWithAnswer = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.qaAnswers',
        'answer',
        fromDate
          ? 'answer.createdAt > :fromDate AND answer.createdAt < :toDate'
          : '1=1',
        { fromDate, toDate },
      )
      .where(userIDs.length ? 'user.id IN (:...userIDs)' : '1=1', { userIDs })
      .getMany();
    const usersArrWithEachCount = users.map((u) => {
      const eventCount =
        userObjWithEvent.filter((user) => user.id === u.id)[0]?.userJoiningEvent
          .length || 0;
      const questionCount =
        userObjWithQuestion.filter((user) => user.id === u.id)[0].wiki.length ||
        0;
      const knowledgeCount =
        userObjWithKnowledge.filter((user) => user.id === u.id)[0].wiki
          .length || 0;
      const answerCount =
        userObjWithAnswer.filter((user) => user.id === u.id)[0].qaAnswers
          .length || 0;
      return {
        ...u,
        questionCount,
        eventCount,
        knowledgeCount,
        answerCount,
      };
    });
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    const urlParsedUsers = await this.generateSignedStorageURLsFromUserArr(
      usersArrWithEachCount,
    );
    return { users: urlParsedUsers, pageCount };
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      relations: ['tags'],
      where: { id },
    });
    const urlParsedUser = await this.generateSignedStorageURLsFromUserObj(user);
    return urlParsedUser;
  }

  async getUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    const urlParsedUsers = this.generateSignedStorageURLsFromUserArr(users);
    return urlParsedUsers;
  }

  async getById(id: number) {
    const user = await this.userRepository.findOne({ id });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('You are not alloed');
    }
    if (!user.verifiedAt) {
      throw new BadRequestException('The user is not verified');
    }
    const urlParsedUser = await this.generateSignedStorageURLsFromUserObj(user);
    return urlParsedUser;
  }

  async getByIdArr(ids: number[]): Promise<User[]> {
    const user = await this.userRepository.findByIds(ids);
    const urlParsedUser = await this.generateSignedStorageURLsFromUserArr(user);
    return urlParsedUser;
  }

  async getAllInfoById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!user?.verifiedAt) {
      throw new BadRequestException('The user is not verified');
    }
    if (user) {
      const urlParsedUser = await this.generateSignedStorageURLsFromUserObj(
        user,
      );
      return urlParsedUser;
    }
    throw new NotFoundException('User with this id does not exist');
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
    user = await this.generateSignedStorageURLsFromUserObj(user);
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
    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    const urlParsedUser = await this.generateSignedStorageURLsFromUserObj(
      newUser,
    );
    return urlParsedUser;
  }

  async registerUsers(userData: User[]) {
    const usersArr: User[] = [];
    for (const u of userData) {
      const hashedPassword = await hash(u.password, 10);
      usersArr.push({ ...u, password: hashedPassword, verifiedAt: new Date() });
    }
    const newUsers = await this.userRepository.save(usersArr);
    const urlParsedUser = await this.generateSignedStorageURLsFromUserArr(
      newUsers,
    );
    return urlParsedUser;
  }

  async saveUser(newUserProfile: Partial<User>): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: { id: newUserProfile.id },
    });
    if (!existUser) {
      throw new InternalServerErrorException('Something went wrong');
    }
    const parsedAvatarURL = this.storageService.parseSignedURLToStorageURL(
      newUserProfile.avatarUrl || existUser.avatarUrl,
    );
    const newUserObj: User = {
      ...existUser,
      ...newUserProfile,
      avatarUrl: parsedAvatarURL,
    };
    const updatedUser = await this.userRepository.save(newUserObj);
    const urlParsedUser = await this.generateSignedStorageURLsFromUserObj(
      updatedUser,
    );
    return urlParsedUser;
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
      throw new BadRequestException('unmatch password');
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
