import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage, ChatMessageType } from 'src/entities/chatMessage.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { In, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { GetMessagesQuery } from './chat.controller';

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
    private readonly storageService: StorageService,
  ) {}

  public async generateSignedStorageURLsFromChatGroupObj(
    chatGroup: ChatGroup,
  ): Promise<ChatGroup> {
    chatGroup.imageURL = await this.storageService.parseStorageURLToSignedURL(
      chatGroup.imageURL,
    );
    return chatGroup;
  }

  public async generateSignedStorageURLsFromChatGroupArr(
    chatGroups: ChatGroup[],
  ): Promise<ChatGroup[]> {
    const parsedGroups = [];
    for (const c of chatGroups) {
      const parsed = await this.generateSignedStorageURLsFromChatGroupObj(c);
      parsedGroups.push(parsed);
    }
    return parsedGroups;
  }

  public async generateSignedStorageURLsFromChatMessageObj(
    chatMessage: ChatMessage,
  ): Promise<ChatMessage> {
    chatMessage.content = await this.storageService.parseStorageURLToSignedURL(
      chatMessage.content,
    );
    return chatMessage;
  }

  public async generateSignedStorageURLsFromChatMessageArr(
    chatMessages: ChatMessage[],
  ): Promise<ChatMessage[]> {
    const parsedMessages = [];
    for (const m of chatMessages) {
      const parsed = await this.generateSignedStorageURLsFromChatMessageObj(m);
      parsedMessages.push(parsed);
    }
    return parsedMessages;
  }

  public async getChatGroup(userID: number): Promise<ChatGroup[]> {
    const groups = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoinAndSelect('chat_groups.members', 'member')
      .where('member.id = :memberId', { memberId: userID })
      .getMany();
    const groupIDs = groups.map((g) => g.id);
    const groupsAndUsers = await this.chatGroupRepository.find({
      where: { id: In(groupIDs) },
      relations: ['members', 'lastReadChatTime', 'lastReadChatTime.user'],
      order: { updatedAt: 'DESC' },
    });
    const urlParsedGroups =
      await this.generateSignedStorageURLsFromChatGroupArr(groupsAndUsers);
    return urlParsedGroups;
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
      .where('chat_group.id = :chatGroupID', { chatGroupID: query.group })
      .orderBy('chat_messages.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
    const messages = existMessages.map((m) => {
      if (m.sender && m.sender.id === userID) {
        m.isSender = true;
        return m;
      }
      m.isSender = false;
      return m;
    });
    const parsedMessages =
      await this.generateSignedStorageURLsFromChatMessageArr(messages);
    return parsedMessages;
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
    const parsedMessages =
      await this.generateSignedStorageURLsFromChatMessageArr(mentioned);
    return parsedMessages;
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
    message.content = this.storageService.parseSignedURLToStorageURL(
      message.content,
    );
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
      throw new BadRequestException('The user is already participant');
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

  public async saveChatGroup(
    chatGroup: Partial<ChatGroup>,
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
    return newGroup;
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
