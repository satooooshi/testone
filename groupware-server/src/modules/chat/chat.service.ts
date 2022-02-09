import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { orderBy } from 'lodash';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage, ChatMessageType } from 'src/entities/chatMessage.entity';
import { ChatMessageReaction } from 'src/entities/chatMessageReaction.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { In, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import {
  GetChaRoomsByPageQuery,
  GetMessagesQuery,
  GetRoomsResult,
  SearchMessageQuery,
} from './chat.controller';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(LastReadChatTime)
    private readonly lastReadChatTimeRepository: Repository<LastReadChatTime>,
    @InjectRepository(ChatGroup)
    private readonly chatGroupRepository: Repository<ChatGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatMessageReaction)
    private readonly chatMessageReactionRepository: Repository<ChatMessageReaction>,
    private readonly storageService: StorageService,
  ) {}

  public async getChatGroup(userID: number): Promise<ChatGroup[]> {
    const groups = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoinAndSelect('chat_groups.members', 'member')
      .where('member.id = :memberId', { memberId: userID })
      .getMany();
    const groupIDs = groups.map((g) => g.id);
    let groupsAndUsers = await this.chatGroupRepository.find({
      where: { id: In(groupIDs) },
      relations: [
        'members',
        'lastReadChatTime',
        'lastReadChatTime.user',
        'pinnedUsers',
      ],
      order: { updatedAt: 'DESC' },
    });
    groupsAndUsers = groupsAndUsers.map((g) => {
      const isPinned = !!g.pinnedUsers.filter((u) => u.id === userID).length;
      return {
        ...g,
        pinnedUsers: undefined,
        isPinned,
      };
    });
    groupsAndUsers = orderBy(groupsAndUsers, [
      'isPinned',
      'updatedAt',
      ['desc', 'desc'],
    ]).reverse();
    return groupsAndUsers;
  }

  public async getRoomsByPage(
    userID: number,
    query: GetChaRoomsByPageQuery,
  ): Promise<GetRoomsResult> {
    const { page, limit = '20' } = query;
    const offset = Number(limit) * (Number(page) - 1);
    const [urlUnparsedRooms, count] = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .leftJoinAndSelect('chat_groups.members', 'members')
      .leftJoin('chat_groups.members', 'member')
      .leftJoinAndSelect(
        'chat_groups.pinnedUsers',
        'pinnedUsers',
        'pinnedUsers.id = :pinnedUserID',
        { pinnedUserID: userID },
      )
      .leftJoinAndSelect(
        'chat_groups.lastReadChatTime',
        'lastReadChatTime',
        'lastReadChatTime.user_id = :userID',
        { userID },
      )
      .leftJoinAndSelect(
        'chat_groups.chatMessages',
        'm',
        'm.id = ( SELECT id FROM chat_messages WHERE chat_group_id = chat_groups.id AND type <> "system_text" ORDER BY updated_at DESC LIMIT 1 )',
      )
      .leftJoinAndSelect('lastReadChatTime.user', 'lastReadChatTime.user')
      .where('member.id = :memberId', { memberId: userID })
      .skip(offset)
      .take(Number(limit))
      .orderBy('chat_groups.updatedAt', 'DESC')
      .getManyAndCount();
    let rooms = urlUnparsedRooms.map((g) => {
      const isPinned = !!g.pinnedUsers.length;
      const hasBeenRead = g?.lastReadChatTime?.[0]?.readTime
        ? g?.lastReadChatTime?.[0]?.readTime > g.updatedAt
        : false;
      return {
        ...g,
        pinnedUsers: undefined,
        isPinned,
        hasBeenRead,
      };
    });
    rooms = orderBy(rooms, [
      'isPinned',
      'updatedAt',
      ['desc', 'desc'],
    ]).reverse();
    const pageCount = Math.floor(count / Number(limit)) + 1;
    return { rooms, pageCount };
  }

  public async getChatMessage(
    userID: number,
    query: GetMessagesQuery,
  ): Promise<ChatMessage[]> {
    const { after, before, include = false } = query;
    const limit = 20;
    const existMessages = await this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .withDeleted()
      .leftJoin('chat_messages.chatGroup', 'chat_group')
      .leftJoinAndSelect('chat_messages.sender', 'sender')
      .leftJoinAndSelect('chat_messages.reactions', 'reactions')
      .leftJoinAndSelect('reactions.user', 'user')
      .leftJoinAndSelect(
        'chat_messages.replyParentMessage',
        'replyParentMessage',
      )
      .leftJoinAndSelect('replyParentMessage.sender', 'reply_sender')
      .where('chat_group.id = :chatGroupID', { chatGroupID: query.group })
      .andWhere(
        after && include
          ? 'chat_messages.id >= :after'
          : after && !include
          ? 'chat_messages.id > :after'
          : '1=1',
        { after },
      )
      .andWhere(
        before && include
          ? 'chat_messages.id <= :before'
          : before && !include
          ? 'chat_messages.id < :before'
          : '1=1',
        { before },
      )
      .take(limit)
      .orderBy('chat_messages.createdAt', after ? 'ASC' : 'DESC')
      .withDeleted()
      .getMany();
    const messages = existMessages.map((m) => {
      m.reactions = m.reactions.map((r) => {
        if (r.user?.id === userID) {
          return { ...r, isSender: true };
        }
        return r;
      });
      if (m.sender && m.sender.id === userID) {
        m.isSender = true;
        return m;
      }
      m.isSender = false;
      return m;
    });
    return messages;
  }

  public async searchMessage(
    query: SearchMessageQuery,
  ): Promise<Partial<ChatMessage[]>> {
    const words = query.word.split(' ');

    const sql = this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .leftJoin('chat_messages.chatGroup', 'g')
      .select('chat_messages.id');

    words.map((w, index) => {
      if (index === 0) {
        sql.where('chat_messages.content LIKE :word0', { word0: `%${w}%` });
      } else {
        sql.andWhere(`chat_messages.content LIKE :word${index}`, {
          [`word${index}`]: `%${w}%`,
        });
      }
    });
    const message = await sql
      .andWhere('g.id = :group', { group: query.group })
      .orderBy('chat_messages.createdAt', 'DESC')
      .getMany();
    return message;
  }

  public async getMenthionedChatMessage(user: User): Promise<ChatMessage[]> {
    const now = new Date();
    // const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const limit = 10;
    const mentioned = await this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .select()
      .innerJoinAndSelect('chat_messages.sender', 'sender')
      .innerJoinAndSelect('chat_messages.chatGroup', 'chat_group')
      .where('chat_messages.created_at < now()')
      .andWhere(`chat_messages.created_at > :oneWeekAgo`, {
        oneWeekAgo: oneWeekAgo,
      })
      .andWhere(`chat_messages.content LIKE :mentionWord`, {
        mentionWord: `%\\@\\[${user.lastName} ${user.firstName}\\]\\(${user.id}\\)%`,
      })
      .limit(limit)
      .getMany();
    return mentioned;
  }

  public async getLastReadChatTime(
    user: User,
    chatGroupId: string,
  ): Promise<LastReadChatTime[]> {
    const chatGroup = await this.chatGroupRepository.findOne(chatGroupId, {
      relations: ['members', 'lastReadChatTime', 'lastReadChatTime.user'],
      withDeleted: true,
    });
    if (!chatGroup) {
      return;
    }
    const isMember = chatGroup.members.filter((m) => m.id === user.id).length;
    if (!isMember) {
      throw new NotAcceptableException('Something went wrong');
    }
    return chatGroup.lastReadChatTime.filter((l) => l.user.id !== user.id);
  }

  public async sendMessage(
    message: Partial<ChatMessage>,
  ): Promise<ChatMessage> {
    if (!message.chatGroup || !message.chatGroup.id) {
      throw new BadRequestException('No group is selected');
    }
    const existGroup = await this.chatGroupRepository.findOne(
      message.chatGroup.id,
    );
    if (!existGroup) {
      throw new BadRequestException('That group id is incorrect');
    }
    const savedMessage = await this.chatMessageRepository.save(
      this.chatMessageRepository.create(message),
    );
    existGroup.updatedAt = new Date();
    await this.chatGroupRepository.save({
      ...existGroup,
      updatedAt: new Date(),
    });

    savedMessage.isSender = true;
    return savedMessage;
  }

  public async joinChatGroup(userID: number, chatGroupID: number) {
    const containMembers: ChatGroup = await this.chatGroupRepository.findOne({
      where: { id: chatGroupID },
      relations: ['members'],
    });

    const isUserJoining = containMembers.members.filter(
      (m) => m.id === userID,
    ).length;
    if (isUserJoining) {
      console.log('The user is already participant');
      return;
    }
    await this.chatGroupRepository
      .createQueryBuilder()
      .relation(ChatGroup, 'members')
      .of(chatGroupID)
      .add(userID);
  }

  public async leaveChatRoom(userID: number, chatGroupID: number) {
    const containMembers: ChatGroup = await this.chatGroupRepository.findOne({
      where: { id: chatGroupID },
      relations: ['members'],
    });
    const targetGroup = await this.chatGroupRepository.findOne(chatGroupID);
    const user = await this.userRepository.findOne(userID);

    const isUserJoining = containMembers.members.filter(
      (m) => m.id === userID,
    ).length;
    if (!isUserJoining) {
      throw new BadRequestException('The user is not participant');
    }
    await this.chatGroupRepository
      .createQueryBuilder()
      .relation(ChatGroup, 'members')
      .of(chatGroupID)
      .remove(userID);
    const systemMessage = new ChatMessage();
    const userName = userNameFactory(user);
    systemMessage.content = `${userName}さんが退出しました`;
    systemMessage.type = ChatMessageType.SYSTEM_TEXT;
    systemMessage.createdAt = new Date();
    systemMessage.chatGroup = targetGroup;
    await this.chatMessageRepository.save(systemMessage);
  }

  public async editChatMembers(roomId: number, members: User[]) {
    const targetRoom = await this.chatGroupRepository.findOne(roomId, {
      relations: ['members'],
    });
    await this.chatGroupRepository.save({ ...targetRoom, members });
    return targetRoom;
  }

  public async savePin(chatGroup: Partial<ChatGroup>, userID: number) {
    if (typeof chatGroup.isPinned !== 'undefined') {
      if (chatGroup.isPinned) {
        await this.chatGroupRepository
          .createQueryBuilder('chat_groups')
          .relation('pinnedUsers')
          .of(chatGroup.id)
          .remove(userID);
        await this.chatGroupRepository
          .createQueryBuilder('chat_groups')
          .relation('pinnedUsers')
          .of(chatGroup.id)
          .add(userID);
      } else {
        await this.chatGroupRepository
          .createQueryBuilder('chat_groups')
          .relation('pinnedUsers')
          .of(chatGroup.id)
          .remove(userID);
      }
    }
    return chatGroup;
  }

  public async saveChatGroup(
    chatGroup: Partial<ChatGroup>,
  ): Promise<ChatGroup> {
    if (!chatGroup.members || !chatGroup.members.length) {
      throw new InternalServerErrorException('Something went wrong');
    }
    const userIds = chatGroup.members.map((u) => u.id);
    const users = await this.userRepository.findByIds(userIds);
    chatGroup.members = users;

    const newGroup = await this.chatGroupRepository.save(
      this.chatGroupRepository.create(chatGroup),
    );
    return newGroup;
  }

  public async v2UpdateChatGroup(
    chatGroup: Partial<ChatGroup>,
    userID: number,
  ): Promise<ChatGroup> {
    const newData: Partial<ChatGroup> = {
      ...chatGroup,
      chatMessages: undefined,
    };
    if (!newData.members || !newData.members.length) {
      throw new InternalServerErrorException('Something went wrong');
    }
    const userIds = newData.members.map((u) => u.id);
    const users = await this.userRepository.findByIds(userIds);
    const requestUser = await this.userRepository.findOne(userID);

    const existGroup = await this.chatGroupRepository.findOne(newData.id, {
      relations: ['members'],
    });
    newData.members = users;

    const newGroup = await this.chatGroupRepository.save(
      this.chatGroupRepository.create({
        ...existGroup,
        ...newData,
      }),
    );
    if (existGroup.name !== newGroup.name) {
      const sysMsgSaidsUpdated = new ChatMessage();
      sysMsgSaidsUpdated.type = ChatMessageType.SYSTEM_TEXT;
      sysMsgSaidsUpdated.content = `${userNameFactory(
        requestUser,
      )}さんがルーム名を${existGroup.name}に更新しました`;
      sysMsgSaidsUpdated.chatGroup = newGroup;
      await this.chatMessageRepository.save(sysMsgSaidsUpdated);
    }
    const newMembers = newGroup.members.filter(
      (newM) => !existGroup.members.map((m) => m.id).includes(newM.id),
    );
    const removedMembers = existGroup.members.filter(
      (existM) => !newGroup.members.map((m) => m.id).includes(existM.id),
    );
    if (newMembers.length) {
      const newMembersSystemMsg = new ChatMessage();
      newMembersSystemMsg.type = ChatMessageType.SYSTEM_TEXT;
      newMembersSystemMsg.content = `${userNameFactory(
        requestUser,
      )}さんが${newMembers
        .map((m) => userNameFactory(m) + 'さん')
        .join(', ')}を追加しました`;
      newMembersSystemMsg.chatGroup = { ...newGroup, members: undefined };
      await this.chatMessageRepository.save(newMembersSystemMsg);
    }
    if (removedMembers.length) {
      const removedMembersSystemMsg = new ChatMessage();
      removedMembersSystemMsg.type = ChatMessageType.SYSTEM_TEXT;
      removedMembersSystemMsg.content = `${userNameFactory(
        requestUser,
      )}さんが${removedMembers
        .map((m) => userNameFactory(m) + 'さん')
        .join(', ')}を退出させました`;
      removedMembersSystemMsg.chatGroup = { ...newGroup, members: undefined };
      await this.chatMessageRepository.save(removedMembersSystemMsg);
    }

    return newGroup;
  }

  public async v2SaveChatGroup(
    chatGroup: Partial<ChatGroup>,
  ): Promise<ChatGroup> {
    const newData: Partial<ChatGroup> = {
      ...chatGroup,
      chatMessages: undefined,
    };
    if (!newData.members || !newData.members.length) {
      throw new InternalServerErrorException('Something went wrong');
    }
    const userIds = newData.members.map((u) => u.id);
    const users = await this.userRepository.findByIds(userIds);
    const maybeExistGroup = await this.chatGroupRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.members', 'u')
      .andWhere(newData.name ? 'g.name = :name' : 'g.name = ""', {
        name: newData.name,
      })
      .getMany();

    const existGroup = maybeExistGroup
      .filter((g) => g.members.length === userIds.length)
      .map((g) => {
        g.members = g.members.filter((m) => userIds.includes(m.id));
        return g;
      })
      .filter((g) => g.members?.length === 2);

    if (existGroup.length) {
      return existGroup[0];
    }
    newData.members = users;

    const newGroup = await this.chatGroupRepository.save(
      this.chatGroupRepository.create(newData),
    );
    return newGroup;
  }

  public async deleteReaction(reactionId: number): Promise<number> {
    await this.chatMessageReactionRepository.delete(reactionId);
    return reactionId;
  }

  public async postReaction(
    reaction: Partial<ChatMessageReaction>,
    userID: number,
  ): Promise<ChatMessageReaction> {
    const existUser = await this.userRepository.findOne(userID);
    const existReaction = await this.chatMessageReactionRepository.findOne({
      where: {
        emoji: reaction.emoji,
        user: existUser,
        chatMessage: reaction.chatMessage,
      },
    });
    if (existReaction) {
      return {
        ...existReaction,
        isSender: true,
      };
    }
    const reactionWithUser = { ...reaction, user: existUser };
    const savedReaction = await this.chatMessageReactionRepository.save(
      reactionWithUser,
    );
    return { ...savedReaction, isSender: true };
  }

  public async getRoomDetail(roomId: number) {
    const existRoom = await this.chatGroupRepository.findOne(roomId, {
      relations: ['members'],
    });
    return existRoom;
  }

  public async saveLastReadChatTime(
    user: User,
    chatGroupId: number,
  ): Promise<LastReadChatTime> {
    const chatGroup = await this.chatGroupRepository.findOne(chatGroupId, {
      relations: ['members'],
    });
    const isMember = chatGroup.members.filter((m) => m.id === user.id).length;
    if (!isMember) {
      throw new NotAcceptableException('Something went wrong');
    }
    const existTime = await this.lastReadChatTimeRepository
      .createQueryBuilder('time')
      .leftJoin('time.chatGroup', 'g')
      .leftJoin('time.user', 'u')
      .where('g.id = :chatGroupId', { chatGroupId })
      .andWhere('u.id = :userId', { userId: user.id })
      .getMany();

    if (existTime.length) {
      await this.lastReadChatTimeRepository.remove(existTime);
    }

    const newTarget = this.lastReadChatTimeRepository.create({
      readTime: new Date(),
      user,
      chatGroup: { id: chatGroupId },
    });
    const newLastReadChatTime = await this.lastReadChatTimeRepository.save(
      newTarget,
    );
    return newLastReadChatTime;
  }
}
