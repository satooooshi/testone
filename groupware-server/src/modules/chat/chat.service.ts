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
import { ChatNote } from 'src/entities/chatNote.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { In, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { GetMessagesQuery, GetRoomsResult } from './chat.controller';

export interface GetChatNotesQuery {
  group: number;
  page?: string;
}

export interface GetChatNotesResult {
  notes: ChatNote[];
  pageCount: number;
}

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
    query: GetMessagesQuery,
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
      .leftJoinAndSelect('chat_groups.lastReadChatTime', 'lastReadChatTime')
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
      return {
        ...g,
        pinnedUsers: undefined,
        isPinned,
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
    const { page = '1' } = query;
    const limit = 20;
    const offset = (Number(page) - 1) * limit;
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
      .take(limit)
      .skip(offset)
      .orderBy('chat_messages.createdAt', 'DESC')
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
    const savedMessage = await this.chatMessageRepository.save(message);
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
    const existMemberIds = targetRoom.members.map((m) => m.id);
    const newMemberIds = targetRoom.members.map((m) => m.id);
    const newMembers = members.filter((m) => !existMemberIds.includes(m.id));
    const removedMembers = targetRoom.members.filter(
      (m) => !newMemberIds.includes(m.id),
    );
    if (removedMembers.length) {
      const removedMemberMsg = new ChatMessage();
      removedMemberMsg.content =
        removedMembers.map((m) => userNameFactory(m)).join(', ') +
        'が退出しました';
      removedMemberMsg.type = ChatMessageType.SYSTEM_TEXT;
      removedMemberMsg.chatGroup = targetRoom;

      await this.chatMessageRepository.save(removedMemberMsg);
    }
    if (newMembers.length) {
      const newMemberMsg = new ChatMessage();
      newMemberMsg.content =
        newMembers.map((m) => userNameFactory(m)).join(', ') + 'が参加しました';
      newMemberMsg.type = ChatMessageType.SYSTEM_TEXT;
      newMemberMsg.chatGroup = targetRoom;
      await this.chatMessageRepository.save(newMemberMsg);
    }

    return targetRoom;
  }

  public async saveChatGroup(
    chatGroup: Partial<ChatGroup>,
    userID: number,
  ): Promise<ChatGroup> {
    if (!chatGroup.members || !chatGroup.members.length) {
      throw new InternalServerErrorException('Something went wrong');
    }
    const userIds = chatGroup.members.map((u) => u.id);
    const users = await this.userRepository.findByIds(userIds);
    chatGroup.members = users;
    chatGroup.imageURL = this.storageService.parseSignedURLToStorageURL(
      chatGroup.imageURL || '',
    );

    const newGroup = await this.chatGroupRepository.save(chatGroup);
    if (typeof chatGroup.isPinned !== 'undefined') {
      if (chatGroup.isPinned) {
        await this.chatGroupRepository
          .createQueryBuilder('chat_groups')
          .relation('pinnedUsers')
          .of(newGroup.id)
          .remove(userID);
        await this.chatGroupRepository
          .createQueryBuilder('chat_groups')
          .relation('pinnedUsers')
          .of(newGroup.id)
          .add(userID);
      } else {
        await this.chatGroupRepository
          .createQueryBuilder('chat_groups')
          .relation('pinnedUsers')
          .of(newGroup.id)
          .remove(userID);
      }
    }
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
    const reactionWithUser = { ...reaction, user: existUser };
    const savedReaction = await this.chatMessageReactionRepository.save(
      reactionWithUser,
    );
    return { ...savedReaction, isSender: true };
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
    const target = await this.lastReadChatTimeRepository.findOne({
      where: {
        user: user,
        chatGroup: chatGroup,
      },
      relations: ['user', 'chatGroup'],
    });

    if (target) {
      target.readTime = new Date();
      const newLastReadChatTime = await this.lastReadChatTimeRepository.save(
        target,
      );
      return newLastReadChatTime;
    }

    const newLastReadChatTime = await this.lastReadChatTimeRepository.save({
      readTime: new Date(),
      user: user,
      chatGroup: chatGroup,
    });
    return newLastReadChatTime;
  }
}
