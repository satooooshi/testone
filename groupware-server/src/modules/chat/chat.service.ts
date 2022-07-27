import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { orderBy } from 'lodash';
import { DateTime } from 'luxon';
import PushNotifications from 'node-pushnotifications';
import { ChatGroup, RoomType } from 'src/entities/chatGroup.entity';
import { ChatMessage, ChatMessageType } from 'src/entities/chatMessage.entity';
import { ChatMessageReaction } from 'src/entities/chatMessageReaction.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import {
  CustomPushNotificationData,
  sendPushNotifToSpecificUsers,
} from 'src/utils/notification/sendPushNotification';
import { selectUserColumns } from 'src/utils/selectUserColumns';
import { getManager, In, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import {
  GetChaRoomsByPageQuery,
  GetMessagesQuery,
  GetRoomsResult,
  SearchMessageQuery,
  GetUnreadMessagesQuery,
  SaveRoomsResult,
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

  public async calleeForPhoneCall(calleeId: string) {
    const user = await this.userRepository.findOne(calleeId);
    return user;
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
    groupsAndUsers = orderBy(groupsAndUsers, [
      'isPinned',
      'updatedAt',
      ['desc', 'desc'],
    ]).reverse();
    return groupsAndUsers;
  }

  public async getRoomsId(userID: number): Promise<ChatGroup[]> {
    return await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .select(['chat_groups.id'])
      .leftJoin('chat_groups.members', 'member')
      .where('member.id = :memberId', { memberId: userID })
      .getMany();
  }

  public async getRoomsByPage(
    userID: number,
    query: GetChaRoomsByPageQuery,
  ): Promise<GetRoomsResult> {
    const { page, limit = '20', updatedAtLatestRoom } = query;

    let offset = 0;
    if (page) {
      offset = (Number(page) - 1) * Number(limit);
    }
    const limitNumber = Number(limit);

    const startTime = Date.now();

    const urlUnparsedRooms = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoin('chat_groups.members', 'member', 'member.id = :memberId', {
        memberId: userID,
      })
      .leftJoin('chat_groups.members', 'members')
      .addSelect(selectUserColumns('members'))
      // .leftJoinAndSelect(
      //   'chat_groups.chatMessages',
      //   'm',
      //   'm.id = ( SELECT id FROM chat_messages WHERE chat_group_id = chat_groups.id AND type <> "system_text" ORDER BY created_at DESC LIMIT 1 )',
      // )
      // .leftJoin('m.sender', 'sender')
      // .addSelect(['sender.id'])
      // .where('member.id = :memberId', { memberId: userID })
      .where(
        !!updatedAtLatestRoom
          ? `chat_groups.updatedAt > :updatedAtLatestRoom`
          : '1=1',
        {
          updatedAtLatestRoom: new Date(updatedAtLatestRoom),
        },
      )
      .skip(offset)
      .take(limitNumber >= 0 ? limitNumber : 20)
      .orderBy('chat_groups.updatedAt', 'DESC')
      .getMany();

    if (!urlUnparsedRooms.length) {
      return { rooms: urlUnparsedRooms, pageCount: 0 };
    }

    const roomIds = urlUnparsedRooms.map((r) => r.id);

    const manager = getManager();
    // const membersCountList = await manager.query(
    //   'select chat_group_id, COUNT(user_id) as cnt from user_chat_joining where chat_group_id IN (?) group by chat_group_id',
    //   [roomIds],
    // );

    const muteUserIds = await manager.query(
      'select chat_group_id, user_id  from user_chat_mute where chat_group_id IN (?) AND user_id = ?',
      [roomIds, userID],
    );

    const pinnedUserIds = await manager.query(
      'select chat_group_id, user_id  from chat_user_pin where chat_group_id IN (?) AND user_id = ?',
      [roomIds, userID],
    );

    const lastReadChatTimeList = await this.lastReadChatTimeRepository
      .createQueryBuilder('time')
      .select([
        'time.id as id',
        'time.read_time as readTime',
        'time.chat_group_id as chat_group_id',
      ])
      .where('time.chat_group_id IN (:...roomIds)', { roomIds })
      .andWhere('time.user_id = :userID', { userID })
      .getRawMany();

    // const latestMessages = await this.chatMessageRepository
    //   .createQueryBuilder('messages')
    //   .select([
    //     'messages.id as id',
    //     'messages.content as content',
    //     'messages.type as type',
    //     'messages.call_time as callTime',
    //     'messages.file_name as fileName',
    //     'messages.created_at as createdAt',
    //     'messages.updated_at as updatedAt',
    //     'messages.sender_id as sender_id',
    //     'messages.chat_group_id as chatGroupId',
    //   ])
    //   .where('messages.chat_group_id IN (:...roomIds)', {
    //     roomIds,
    //   })
    //   .andWhere(
    //     'messages.id =  ( SELECT id FROM chat_messages WHERE chat_group_id = messages.chat_group_id AND type <> "system_text" ORDER BY created_at DESC LIMIT 1 )',
    //   )
    //   .getRawMany();

    let rooms = await Promise.all(
      urlUnparsedRooms.map(async (g, index) => {
        // g.chatMessages = latestMessages
        //   .filter((m) => m.chatGroupId === g.id)
        //   .map((m) => ({ ...m, sender: { id: m.sender_id } }));

        const latestMessage = await this.chatMessageRepository
          .createQueryBuilder('messages')
          .select([
            'messages.id as id',
            'messages.content as content',
            'messages.type as type',
            'messages.call_time as callTime',
            'messages.file_name as fileName',
            'messages.created_at as createdAt',
            'messages.updated_at as updatedAt',
            'messages.sender_id as sender_id',
            'messages.chat_group_id as chat_group_id',
          ])
          .where('messages.chat_group_id  = :roomId', { roomId: g.id })
          .andWhere('type <> "system_text"')
          .orderBy('createdAt', 'DESC')
          .limit(1)
          .getRawMany();
        g.chatMessages = latestMessage.map((m) => ({
          ...m,
          sender: { id: m.sender_id },
        }));

        g.lastReadChatTime = lastReadChatTimeList.filter(
          (l) => l.chat_group_id === g.id,
        );
        const lastReadChatTimeDate = new Date(
          g?.lastReadChatTime?.[0]?.readTime,
        );
        let unreadCount = 0;
        const isPinned = pinnedUserIds.some((p) => p.chat_group_id === g.id);
        // const memberCount = Number(
        //   membersCountList.find((p) => p.chat_group_id === g.id).cnt || 0,
        // );
        const isMute = muteUserIds.some((p) => p.chat_group_id === g.id);
        const hasBeenRead = g?.lastReadChatTime?.[0]?.readTime
          ? lastReadChatTimeDate > g.updatedAt
          : false;
        if (!hasBeenRead) {
          const query = {
            group: g.id,
            lastReadTime:
              g.lastReadChatTime?.[0] && g.lastReadChatTime?.[0].readTime
                ? lastReadChatTimeDate
                : g.createdAt,
          };
          unreadCount = await this.getUnreadChatMessage(userID, query);
        }

        if (g.roomType === RoomType.PERSONAL && g.members.length === 2) {
          const chatPartner = g.members.filter((m) => m.id !== userID)[0];
          // const chatPartner = await this.userRepository.findOne(
          //   g.members.find((m) => m.id !== userID).id,
          // );
          // console.log('----', chatPartner, g.members.length, memberCount);

          g.imageURL = chatPartner.avatarUrl;
          g.name = `${chatPartner.lastName} ${chatPartner.firstName}`;
        }

        return {
          ...g,
          pinnedUsers: undefined,
          isPinned,
          isMute,
          // memberCount,
          hasBeenRead,
          unreadCount,
        };
      }),
    );

    rooms = orderBy(rooms, [
      'isPinned',
      'updatedAt',
      ['desc', 'desc'],
    ]).reverse();

    const endTime = Date.now();
    console.log(
      'get rooms by page ========================',
      endTime - startTime,
    );
    const pageCount = Number(page);
    return { rooms, pageCount };
  }

  public async getOneRoom(userID: number, roomId: number): Promise<ChatGroup> {
    const room = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoin('chat_groups.members', 'members')
      .addSelect(selectUserColumns('members'))
      .where('chat_groups.id = :roomId', { roomId: roomId })
      .getOne();

    const manager = getManager();
    // const membersCountList = await manager.query(
    //   'select chat_group_id, COUNT(user_id) as cnt from user_chat_joining where chat_group_id IN (?) group by chat_group_id',
    //   [roomIds],
    // );

    const muteUserId = await manager.query(
      'select chat_group_id, user_id  from user_chat_mute where chat_group_id  = ? AND user_id = ?',
      [roomId, userID],
    );

    const pinnedUserId = await manager.query(
      'select chat_group_id, user_id  from chat_user_pin where chat_group_id  = ? AND user_id = ?',
      [roomId, userID],
    );

    const lastReadChatTimeList = await this.lastReadChatTimeRepository
      .createQueryBuilder('time')
      .select([
        'time.id as id',
        'time.read_time as readTime',
        'time.chat_group_id as chat_group_id',
      ])
      .where('time.chat_group_id = :roomId', { roomId })
      .andWhere('time.user_id = :userID', { userID })
      .getRawMany();

    const latestMessage = await this.chatMessageRepository
      .createQueryBuilder('messages')
      .select([
        'messages.id as id',
        'messages.content as content',
        'messages.type as type',
        'messages.call_time as callTime',
        'messages.file_name as fileName',
        'messages.created_at as createdAt',
        'messages.updated_at as updatedAt',
        'messages.sender_id as sender_id',
        'messages.chat_group_id as chat_group_id',
      ])
      .where('messages.chat_group_id  = :roomId', { roomId })
      .andWhere('type <> "system_text"')
      .orderBy('createdAt', 'DESC')
      .limit(1)
      .getRawMany();
    console.log('------', pinnedUserId.length, muteUserId, latestMessage);

    room.chatMessages = latestMessage.map((m) => ({
      ...m,
      sender: { id: m.sender_id },
    }));
    room.lastReadChatTime = lastReadChatTimeList;
    room.isPinned = !!pinnedUserId.length;
    room.isMute = !!muteUserId.length;
    room.hasBeenRead = room?.lastReadChatTime?.[0]?.readTime
      ? room?.lastReadChatTime?.[0]?.readTime > room.updatedAt
      : false;
    if (!room.hasBeenRead) {
      const query = {
        group: room.id,
        lastReadTime:
          room?.lastReadChatTime?.[0] && room?.lastReadChatTime?.[0]?.readTime
            ? room.lastReadChatTime?.[0].readTime
            : room?.createdAt,
      };

      room.unreadCount = await this.getUnreadChatMessage(userID, query);
    }

    if (room.roomType === RoomType.PERSONAL && room.members.length === 2) {
      const chatPartner = room.members.filter((m) => m.id !== userID)[0];
      room.imageURL = chatPartner.avatarUrl;
      room.name = `${chatPartner.lastName} ${chatPartner.firstName}`;
    }

    return room;
  }

  public async getRoomsUnreadChatCount(userID: number): Promise<ChatGroup[]> {
    const [urlUnparsedRooms] = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .leftJoin('chat_groups.members', 'member')
      .leftJoinAndSelect(
        'chat_groups.lastReadChatTime',
        'lastReadChatTime',
        'lastReadChatTime.user_id = :userID',
        { userID },
      )
      .where('member.id = :memberId', { memberId: userID })
      .orderBy('chat_groups.updatedAt', 'DESC')
      .getManyAndCount();
    const rooms = await Promise.all(
      urlUnparsedRooms.map(async (g) => {
        let unreadCount = 0;
        const hasBeenRead = g?.lastReadChatTime?.[0]?.readTime
          ? g?.lastReadChatTime?.[0]?.readTime > g.updatedAt
          : false;
        if (!hasBeenRead && g?.lastReadChatTime?.[0]?.readTime) {
          const query = {
            group: g.id,
            lastReadTime: g.lastReadChatTime?.[0].readTime,
          };
          unreadCount = await this.getUnreadChatMessage(userID, query);
        }

        return {
          ...g,
          unreadCount,
        };
      }),
    );
    return rooms;
  }

  public async getChatMessage(
    userID: number,
    query: GetMessagesQuery,
  ): Promise<ChatMessage[]> {
    const {
      after,
      before,
      include = false,
      limit = '20',
      dateRefetchLatest,
    } = query;
    const limitNumber = Number(limit);

    const isUserJoining = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .innerJoin('chat_groups.members', 'm', 'm.id = :userId', {
        userId: userID,
      })
      .where('chat_groups.id = :chatGroupId', { chatGroupId: query.group })
      .getOne();
    if (!isUserJoining) {
      throw new BadRequestException('The user is not a member');
    }

    const startTime = Date.now();
    const existMessages = await this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .leftJoin('chat_messages.chatGroup', 'chat_group')
      .addSelect(['chat_group.id'])
      .leftJoin('chat_messages.sender', 'sender')
      .addSelect(selectUserColumns('sender'))
      .leftJoin('chat_messages.reactions', 'reactions')
      .leftJoin('reactions.user', 'user')
      .addSelect(['reactions.id', 'reactions.emoji'])
      .addSelect(selectUserColumns('user'))
      .leftJoinAndSelect(
        'chat_messages.replyParentMessage',
        'replyParentMessage',
      )
      .leftJoin('replyParentMessage.sender', 'reply_sender')
      .addSelect(selectUserColumns('reply_sender'))
      .where('chat_group.id = :chatGroupID', {
        chatGroupID: query.group,
      })
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
      .andWhere(
        dateRefetchLatest
          ? 'chat_messages.updatedAt > :dateRefetchLatest'
          : '1=1',
        {
          dateRefetchLatest: new Date(dateRefetchLatest),
        },
      )
      .take(limitNumber >= 0 ? limitNumber : 20)
      .orderBy('chat_messages.createdAt', after ? 'ASC' : 'DESC')
      .getMany();
    const endTime = Date.now();
    if (!dateRefetchLatest) {
      console.log('get messages speed check', endTime - startTime);
    }

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

  public async getExpiredUrlMessages(query: number): Promise<ChatMessage[]> {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    const justBeforeExpiredUrlMessages = await this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .leftJoinAndSelect('chat_messages.chatGroup', 'chat_group')
      .where('chat_group.id = :chatGroupID', { chatGroupID: query })
      .andWhere(
        'chat_messages.type <> :text AND chat_messages.type <> :system AND chat_messages.type <> :sticker AND chat_messages.type <> :call',
        {
          text: ChatMessageType.TEXT,
          system: ChatMessageType.SYSTEM_TEXT,
          sticker: ChatMessageType.STICKER,
          call: ChatMessageType.CALL,
        },
      )
      .andWhere('chat_messages.updatedAt < :fiveDaysAgo', {
        fiveDaysAgo: date,
      })
      .orderBy('chat_messages.createdAt', 'DESC')
      .getMany();
    for (const m of justBeforeExpiredUrlMessages) {
      await this.chatMessageRepository.save({ ...m, updatedAt: new Date() });
    }
    return justBeforeExpiredUrlMessages;
  }

  public async getUnreadChatMessage(
    userID: number,
    query: GetUnreadMessagesQuery,
  ): Promise<number> {
    const unreadCount = await this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .where('chat_messages.chatGroup.id = :chatGroupID', {
        chatGroupID: query.group,
      })
      .andWhere('chat_messages.sender.id != :userID', {
        userID,
      })
      .andWhere('chat_messages.createdAt > :lastReadTime', {
        lastReadTime: query.lastReadTime,
      })
      .getCount();
    return unreadCount;
  }

  public async searchMessage(
    query: SearchMessageQuery,
  ): Promise<Partial<ChatMessage[]>> {
    const replaceFullWidthSpace = query.word.replace('　', ' ');
    const words = replaceFullWidthSpace.split(' ');
    const sql = this.chatMessageRepository
      .createQueryBuilder('chat_messages')
      .leftJoin('chat_messages.chatGroup', 'g')
      .where('chat_messages.type <> :type', { type: 'system_text' })
      .select('chat_messages.id');

    words.map((w, index) => {
      if (index === 0) {
        sql.andWhere('chat_messages.content LIKE :word0', { word0: `%${w}%` });
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
    const chatGroup = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      // .withDeleted()
      .leftJoin('chat_groups.lastReadChatTime', 'lastReadChatTime')
      .addSelect(['lastReadChatTime.readTime'])
      .leftJoin('lastReadChatTime.user', 'user')
      .addSelect(selectUserColumns('user'))
      .where('chat_groups.id = :roomId', { roomId: chatGroupId })
      .getOne();
    // const chatGroup = await this.chatGroupRepository.findOne(chatGroupId, {
    //   relations: ['lastReadChatTime', 'lastReadChatTime.user'],
    //   select: ['id', 'lastReadChatTime'],
    //   withDeleted: true,
    // });
    if (!chatGroup) {
      return;
    }

    // const isMember = chatGroup.members.filter((m) => m.id === user.id).length;
    // if (!isMember) {
    //   throw new NotAcceptableException('Something went wrong');
    // }

    // return chatGroup.lastReadChatTime.filter((l) => l.user.id !== user.id);

    return chatGroup.lastReadChatTime.filter(
      (l) => l.user && l.user.id !== user.id,
    );
  }

  public async sendMessage(
    message: Partial<ChatMessage>,
  ): Promise<ChatMessage> {
    if (!message.chatGroup || !message.chatGroup.id) {
      throw new BadRequestException('No group is selected');
    }
    const existGroup = await this.chatGroupRepository
      .createQueryBuilder('chat_groups')
      .leftJoin('chat_groups.members', 'members')
      .addSelect(['members.id'])
      .leftJoin('chat_groups.muteUsers', 'muteUsers')
      .addSelect(['muteUsers.id'])
      .where('chat_groups.id = :roomId', { roomId: message.chatGroup.id })
      .getOne();

    // const existGroup = await this.chatGroupRepository.findOne({
    //   where: { id: message.chatGroup.id },
    //   relations: ['members', 'muteUsers'],
    // });
    if (!existGroup) {
      throw new BadRequestException('That group id is incorrect');
    } else if (
      !existGroup?.members.filter((m) => m?.id === message?.sender?.id).length
    ) {
      throw new BadRequestException('sender is not a member of this group');
    }
    const savedMessage = await this.chatMessageRepository.save(
      this.chatMessageRepository.create({ ...message, chatGroup: existGroup }),
    );

    existGroup.updatedAt = new Date();
    await this.chatGroupRepository.save({
      ...existGroup,
      updatedAt: new Date(),
    });

    savedMessage.isSender = true;
    return savedMessage;
  }

  public async updateMessage(
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

  public async deleteMessage(message: Partial<ChatMessage>) {
    if (!message.chatGroup || !message.chatGroup.id) {
      throw new BadRequestException('No group is selected');
    }
    const existGroup = await this.chatGroupRepository.findOne(
      message.chatGroup.id,
      { relations: ['members'] },
    );
    if (!existGroup) {
      throw new BadRequestException('That group id is incorrect');
    }
    await this.chatMessageRepository.delete(message.id);

    const silentNotification: CustomPushNotificationData = {
      title: '',
      body: '',
      custom: {
        silent: 'silent',
        type: 'deleteMessage',
        screen: 'chat',
        id: existGroup.id.toString(),
        messageId: message.id.toString(),
      },
    };
    await sendPushNotifToSpecificUsers(
      existGroup.members.map((m) => m.id),
      silentNotification,
    );

    // existGroup.updatedAt = new Date();
    // await this.chatGroupRepository.save({
    //   ...existGroup,
    //   updatedAt: new Date(),
    // });
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
    requestUser: User,
  ): Promise<SaveRoomsResult> {
    const newData: Partial<ChatGroup> = {
      ...chatGroup,
      chatMessages: undefined,
    };
    if (!newData.members || !newData.members.length) {
      throw new InternalServerErrorException('Something went wrong');
    }

    const existGroup = await this.chatGroupRepository.findOne(newData.id, {
      relations: ['members', 'lastReadChatTime', 'lastReadChatTime.user'],
    });
    let isMySelf = false;
    const otherExistMembers = existGroup.members.filter((u) => {
      if (u.id === requestUser.id) {
        isMySelf = true;
      } else {
        return true;
      }
    });

    if (!isMySelf) {
      throw new BadRequestException('The user is not a member');
    }
    const systemMessage: ChatMessage[] = [];
    const newGroup = await this.chatGroupRepository.save({
      ...existGroup,
      members: newData.members,
      name: newData.name,
      updatedAt: new Date(),
    });
    if (existGroup.name !== newGroup.name) {
      const sysMsgSaidsUpdated = new ChatMessage();
      sysMsgSaidsUpdated.type = ChatMessageType.SYSTEM_TEXT;
      sysMsgSaidsUpdated.content = `${userNameFactory(
        requestUser,
      )}さんがルーム名を${newGroup.name}に更新しました`;
      sysMsgSaidsUpdated.chatGroup = newGroup;
      const sysMsg = await this.chatMessageRepository.save(sysMsgSaidsUpdated);
      systemMessage.push(sysMsg);
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
      const sysMsg = await this.chatMessageRepository.save(newMembersSystemMsg);
      systemMessage.push(sysMsg);
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
      const sysMsg = await this.chatMessageRepository.save(
        removedMembersSystemMsg,
      );
      systemMessage.push(sysMsg);
    }
    const silentNotification: CustomPushNotificationData = {
      title: '',
      body: '',
      custom: {
        silent: 'silent',
        type: 'edit',
        screen: '',
        id: newGroup.id.toString(),
      },
    };
    const allMemberWithoutMyself = otherExistMembers.concat(newMembers);
    await sendPushNotifToSpecificUsers(
      allMemberWithoutMyself.map((u) => u.id),
      silentNotification,
    );
    return { room: newGroup, systemMessage };
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
    newData.name = newData.name ? newData.name : '';
    const maybeExistGroup = await this.chatGroupRepository
      .createQueryBuilder('g')
      .innerJoin('g.members', 'u', 'u.id IN (:...userIds)', { userIds })
      .leftJoinAndSelect('g.members', 'member')
      .where('g.name = :name', {
        name: newData.name,
      })
      .getMany();

    const existGroup = maybeExistGroup
      .filter((g) => g.members.length === userIds.length)
      .filter((g) => g.members.every((m) => userIds.includes(m.id)));

    if (existGroup.length) {
      return existGroup[0];
    }

    const newGroup = await this.chatGroupRepository.save(
      this.chatGroupRepository.create(newData),
    );

    return newGroup;
  }

  public async deleteReaction(reactionId: number): Promise<number> {
    const existReaction = await this.chatMessageReactionRepository.findOne(
      reactionId,
      {
        relations: ['chatMessage'],
      },
    );
    const existMessages = await this.chatMessageRepository.findOne(
      existReaction.chatMessage.id,
    );

    await this.chatMessageRepository.save({
      ...existMessages,
      updatedAt: new Date(),
    });
    await this.chatMessageReactionRepository.delete(reactionId);
    return reactionId;
  }

  public async postReaction(
    reaction: Partial<ChatMessageReaction>,
    userID: number,
  ): Promise<ChatMessageReaction> {
    const existUser = await this.userRepository.findOne(userID);
    const existMessages = await this.chatMessageRepository.findOne(
      reaction.chatMessage.id,
    );
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
    await this.chatMessageRepository.save({
      ...existMessages,
      updatedAt: new Date(),
    });
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
    console.log(user.lastName, 'call saveLastReadChatTime');

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
      .getOne();
    console.log(user.lastName, 'end saveLastReadChatTime');

    if (existTime) {
      return await this.lastReadChatTimeRepository.save({
        ...existTime,
        readTime: new Date(),
      });
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
