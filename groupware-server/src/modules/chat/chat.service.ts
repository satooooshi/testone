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
import { ChatNote } from 'src/entities/chatNote.entity';
import { ChatNoteImage } from 'src/entities/chatNoteImage.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { In, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { UserService } from '../user/user.service';
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
    @InjectRepository(ChatNote)
    private readonly noteRepository: Repository<ChatNote>,
    @InjectRepository(ChatNoteImage)
    private readonly noteImageRepository: Repository<ChatNoteImage>,
    private readonly storageService: StorageService,
    private readonly userService: UserService,
  ) {}

  public async generateSignedStorageURLsFromChatGroupObj(
    chatGroup: ChatGroup,
  ): Promise<ChatGroup> {
    if (chatGroup?.imageURL) {
      chatGroup.imageURL = await this.storageService.parseStorageURLToSignedURL(
        chatGroup.imageURL,
      );
    }
    if (chatGroup?.members && chatGroup?.members.length) {
      chatGroup.members =
        await this.userService.generateSignedStorageURLsFromUserArr(
          chatGroup.members,
        );
    }
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
  public async generateSignedStorageURLsFromChatNoteObj(
    chatNote: ChatNote,
  ): Promise<ChatNote> {
    const images: ChatNoteImage[] = [];
    const editors: User[] = [];
    for (const i of chatNote.images) {
      const parsedImageUrl =
        await this.storageService.parseStorageURLToSignedURL(i.imageURL);
      const parsedImageObj = { ...i, imageURL: parsedImageUrl };
      images.push(parsedImageObj);
    }
    for (const e of chatNote.editors) {
      const parsedAvatarUrl =
        await this.storageService.parseStorageURLToSignedURL(e.avatarUrl);
      const parsedAvatarObj = { ...e, avatarUrl: parsedAvatarUrl };
      editors.push(parsedAvatarObj);
    }
    chatNote.images = images;
    chatNote.editors = editors;

    return chatNote;
  }

  public async generateSignedStorageURLsFromChatNoteArr(
    chatNotes: ChatNote[],
  ): Promise<ChatNote[]> {
    const parsedNotes = [];
    for (const n of chatNotes) {
      const parsed = await this.generateSignedStorageURLsFromChatNoteObj(n);
      parsedNotes.push(parsed);
    }
    return parsedNotes;
  }

  public async generateSignedStorageURLsFromChatMessageObj(
    chatMessage: ChatMessage,
  ): Promise<ChatMessage> {
    chatMessage.content = await this.storageService.parseStorageURLToSignedURL(
      chatMessage.content,
    );
    const avatarUrl = await this.storageService.parseStorageURLToSignedURL(
      chatMessage.sender?.avatarUrl,
    );
    chatMessage.sender = { ...chatMessage.sender, avatarUrl };
    if (chatMessage.replyParentMessage) {
      chatMessage.replyParentMessage =
        await this.generateSignedStorageURLsFromChatMessageObj(
          chatMessage.replyParentMessage,
        );
    }
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
    const urlParsedGroups =
      await this.generateSignedStorageURLsFromChatGroupArr(groupsAndUsers);
    return urlParsedGroups;
  }

  public async getRoomsByPage(
    userID: number,
    page: number,
  ): Promise<GetRoomsResult> {
    const limit = 20;
    const offset = limit * (page - 1);
    const [urlUnparsedRooms, count] = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .leftJoinAndSelect('chat_groups.members', 'member')
      .leftJoinAndSelect(
        'chat_groups.pinnedUsers',
        'pinnedUsers',
        'pinnedUsers.id = :pinnedUserID',
        { pinnedUserID: userID },
      )
      .leftJoinAndSelect('chat_groups.lastReadChatTime', 'lastReadChatTime')
      .leftJoinAndSelect('lastReadChatTime.user', 'lastReadChatTime.user')
      .where('member.id = :memberId', { memberId: userID })
      .skip(offset)
      .take(limit)
      .orderBy('chat_groups.updatedAt', 'DESC')
      .getManyAndCount();
    let rooms = await this.generateSignedStorageURLsFromChatGroupArr(
      urlUnparsedRooms,
    );
    rooms = rooms.map((g) => {
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
    const pageCount = Math.floor(count / limit) + 1;
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
      .leftJoinAndSelect(
        'chat_messages.replyParentMessage',
        'replyParentMessage',
      )
      .leftJoinAndSelect('replyParentMessage.sender', 'reply_sender')
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

  public async saveChatNotes(dto: Partial<ChatNote>): Promise<ChatNote> {
    const savedNote = await this.noteRepository.save(dto);
    if (dto.images?.length) {
      const sentImages = dto.images.map((i) => ({
        ...i,
        imageURL: this.storageService.parseSignedURLToStorageURL(i.imageURL),
        chatNote: savedNote,
      }));

      await this.noteImageRepository.save(sentImages);
    }
    return savedNote;
  }

  public async deleteChatNotes(noteId: number) {
    await this.noteRepository.delete(noteId);
  }

  public async getChatNoteDetail(
    noteID: number,
    userID: number,
  ): Promise<ChatNote> {
    let noteDetail = await this.noteRepository.findOne(noteID, {
      relations: ['chatGroup', 'editors', 'images'],
      withDeleted: true,
    });
    noteDetail = await this.generateSignedStorageURLsFromChatNoteObj(
      noteDetail,
    );
    noteDetail.isEditor = !!noteDetail.editors.filter((e) => e.id === userID)
      .length;
    return noteDetail;
  }

  public async getChatNotes(
    query: GetChatNotesQuery,
    userID: number,
  ): Promise<GetChatNotesResult> {
    const { page, group } = query;
    const limit = 20;
    const offset = limit * (Number(page) - 1);
    const [existNotes, count] = await this.noteRepository
      .createQueryBuilder('chat_notes')
      .leftJoinAndSelect('chat_notes.chatGroup', 'chat_groups')
      .leftJoinAndSelect('chat_notes.editors', 'editors')
      .leftJoinAndSelect('chat_notes.images', 'images')
      .where('chat_groups.id = :chatGroupId', { chatGroupId: group })
      .withDeleted()
      .skip(offset)
      .take(limit)
      .orderBy('chat_notes.createdAt', 'DESC')
      .getManyAndCount();

    let notes = await this.generateSignedStorageURLsFromChatNoteArr(existNotes);
    notes = existNotes.map((n) => ({
      ...n,
      isEditor: !!n.editors?.filter((e) => e.id === userID).length,
    }));
    const pageCount = Math.floor(count / limit) + 1;
    return { notes, pageCount };
  }
}
