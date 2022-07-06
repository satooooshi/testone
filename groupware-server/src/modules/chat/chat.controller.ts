import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RtmTokenBuilder,
  RtmRole,
  RtcTokenBuilder,
  RtcRole,
} from 'agora-access-token';
import { Response } from 'express';
import { DateTime } from 'luxon';
import { ChatAlbum } from 'src/entities/chatAlbum.entity';
import { ChatGroup, RoomType } from 'src/entities/chatGroup.entity';
import { ChatMessage, ChatMessageType } from 'src/entities/chatMessage.entity';
import { ChatMessageReaction } from 'src/entities/chatMessageReaction.entity';
import { ChatNote } from 'src/entities/chatNote.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import {
  CustomPushNotificationData,
  sendPushNotifToSpecificUsers,
} from 'src/utils/notification/sendPushNotification';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { ChatService } from './chat.service';
import { ChatAlbumService, GetChatAlbumsResult } from './chatAlbum.service';
import { ChatNoteService, GetChatNotesResult } from './chatNote.service';

export interface GetMessagesQuery {
  group: number;
  limit?: string;
  after?: string;
  before?: string;
  include?: boolean;
  dateRefetchLatest?: string;
}

export interface GetChaRoomsByPageQuery {
  page?: string;
  limit?: string;
  updatedAtLatestRoom?: Date;
}
export interface GetUnreadMessagesQuery {
  group: number;
  lastReadTime: Date;
}

export interface SearchMessageQuery {
  group: number;
  word: string;
  limit?: string;
}

export interface SearchMessageQuery {
  group: number;
  word: string;
  limit?: string;
}

export interface GetRoomsQuery {
  page?: string;
}

export interface GetRoomsResult {
  rooms: ChatGroup[];
  pageCount: number;
}

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatAlbumService: ChatAlbumService,
    private readonly chatNoteService: ChatNoteService,
    private readonly configService: ConfigService,
  ) {}

  @Post('notif-call/:calleeId')
  @UseGuards(JwtAuthenticationGuard)
  async notifiCall(
    @Param('calleeId') calleeId: string,
    @Body() invitation: any,
  ) {
    const callee = await this.chatService.calleeForPhoneCall(calleeId);
    const notificationData: CustomPushNotificationData = {
      title: '',
      body: '',
      custom: { invitation: invitation, silent: 'silent', type: 'call' },
    };
    await sendPushNotifToSpecificUsers([callee.id], notificationData);
    return;
  }

  @Get('get-rtm-token')
  @UseGuards(JwtAuthenticationGuard)
  async getAgoraRtmToken(@Req() req: RequestWithUser) {
    const appID = this.configService.get('AGORA_APP_ID');
    const cert = this.configService.get('AGORA_CERT_ID');
    const uid = req.user?.id.toString();
    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // console.log(uid);
    const token = RtmTokenBuilder.buildToken(
      appID,
      cert,
      uid,
      RtmRole.Rtm_User,
      privilegeExpiredTs,
    );
    return token;
  }

  @Get('get-voice-token/:roomId')
  @UseGuards(JwtAuthenticationGuard)
  async getAgoraToken(
    @Req() req: RequestWithUser,
    @Param('roomId') roomId: string,
  ) {
    const appID = this.configService.get('AGORA_APP_ID');
    const cert = this.configService.get('AGORA_CERT_ID');
    const channelName = roomId;
    const uid = req.user?.id;
    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      cert,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
    );
    return token;
  }

  @Get('group-list')
  @UseGuards(JwtAuthenticationGuard)
  async getChatGroup(@Req() req: RequestWithUser): Promise<ChatGroup[]> {
    return await this.chatService.getChatGroup(req.user.id);
  }

  @Get('group-unread-chat-count')
  @UseGuards(JwtAuthenticationGuard)
  async getRoomsUnreadChatCount(
    @Req() req: RequestWithUser,
  ): Promise<ChatGroup[]> {
    return await this.chatService.getRoomsUnreadChatCount(req.user.id);
  }

  @Get('/v2/rooms')
  @UseGuards(JwtAuthenticationGuard)
  async getChatGroupByPage(
    @Req() req: RequestWithUser,
    @Query() query: GetMessagesQuery,
  ): Promise<GetRoomsResult> {
    return await this.chatService.getRoomsByPage(req.user.id, query);
  }

  @Get('get-room/:roomId')
  @UseGuards(JwtAuthenticationGuard)
  async getOneRoom(
    @Param('roomId') roomId: string,
    @Req() req: RequestWithUser,
  ): Promise<ChatGroup> {
    const { user } = req;

    const room = await this.chatService.getOneRoom(req.user.id, Number(roomId));
    // if (!room.members.filter((m) => m.id === user.id).length) {
    //   throw new BadRequestException('チャットルームを取得する権限がありません');
    // }
    return room;
  }

  @Get('get-messages')
  @UseGuards(JwtAuthenticationGuard)
  async getMessages(
    @Req() req: RequestWithUser,
    @Query() query: GetMessagesQuery,
  ): Promise<ChatMessage[]> {
    return await this.chatService.getChatMessage(req.user.id, query);
  }

  @Get('expired-url-messages/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getExpiredUrlMessages(
    @Param('id') roomId: number,
  ): Promise<ChatMessage[]> {
    return await this.chatService.getExpiredUrlMessages(roomId);
  }

  @Get('search-messages')
  @UseGuards(JwtAuthenticationGuard)
  async searchMessages(
    @Query() query: SearchMessageQuery,
  ): Promise<Partial<ChatMessage[]>> {
    return await this.chatService.searchMessage(query);
  }

  @Get('latest-mentioned')
  @UseGuards(JwtAuthenticationGuard)
  async getMentionedMessage(
    @Req() req: RequestWithUser,
  ): Promise<ChatMessage[]> {
    return await this.chatService.getMenthionedChatMessage(req.user);
  }

  @Post('send-message')
  @UseGuards(JwtAuthenticationGuard)
  async sendMessage(
    @Req() req: RequestWithUser,
    @Body() message: Partial<ChatMessage>,
  ): Promise<ChatMessage> {
    const user = req.user;
    message.sender = user;
    return await this.chatService.sendMessage(message);
  }

  @Patch('send-message')
  @UseGuards(JwtAuthenticationGuard)
  async updateMessage(
    @Req() req: RequestWithUser,
    @Body() message: Partial<ChatMessage>,
  ): Promise<ChatMessage> {
    const user = req.user;
    message.sender = user;
    return await this.chatService.updateMessage(message);
  }

  @Post('delete-message')
  @UseGuards(JwtAuthenticationGuard)
  async deleteMessage(@Body() message: Partial<ChatMessage>) {
    await this.chatService.deleteMessage(message);
    return message;
  }

  @Post('save-chat-group')
  @UseGuards(JwtAuthenticationGuard)
  async createChatGroup(
    @Req() req: RequestWithUser,
    @Body() chatGroup: Partial<ChatGroup>,
  ): Promise<ChatGroup> {
    const user = req.user;
    chatGroup.members = [
      ...(chatGroup?.members?.filter((u) => u.id !== user.id) || []),
      user,
    ];
    return await this.chatService.saveChatGroup(chatGroup);
  }

  @Post('v2/room/pin')
  @UseGuards(JwtAuthenticationGuard)
  async savePin(
    @Req() req: RequestWithUser,
    @Body() chatGroup: Partial<ChatGroup>,
  ) {
    const { user } = req;
    return await this.chatService.savePin(chatGroup, user.id);
  }

  @Patch('/v2/room')
  @UseGuards(JwtAuthenticationGuard)
  async v2UpdateChatGroup(
    @Req() req: RequestWithUser,
    @Body() chatGroup: Partial<ChatGroup>,
  ): Promise<ChatGroup> {
    const user = req.user;
    const savedGroup = await this.chatService.v2UpdateChatGroup(
      chatGroup,
      user,
    );
    if (
      savedGroup.roomType === RoomType.PERSONAL &&
      savedGroup.members.length === 2
    ) {
      const chatPartner = savedGroup.members.filter((m) => m.id !== user.id)[0];
      savedGroup.imageURL = chatPartner.avatarUrl;
      savedGroup.name = `${chatPartner.lastName} ${chatPartner.firstName}`;
    }

    return savedGroup;
  }

  @Post('/v2/room')
  @UseGuards(JwtAuthenticationGuard)
  async v2SaveChatGroup(
    @Req() req: RequestWithUser,
    @Body() chatGroup: Partial<ChatGroup>,
  ): Promise<ChatGroup> {
    const user = req.user;
    const otherMembersId = chatGroup.members.map((u) => u.id);
    if (chatGroup.name) {
      chatGroup.roomType = RoomType.GROUP;
    } else {
      chatGroup.roomType =
        chatGroup.members.length === 1 ? RoomType.PERSONAL : RoomType.TALK_ROOM;
    }
    chatGroup.members = [
      ...(chatGroup?.members?.filter((u) => u.id !== user.id) || []),
      user,
    ];
    const savedGroup = await this.chatService.v2SaveChatGroup(chatGroup);
    const silentNotification: CustomPushNotificationData = {
      title: '',
      body: '',
      custom: {
        silent: 'silent',
        type: 'create',
        screen: '',
        id: savedGroup.id.toString(),
      },
    };
    await sendPushNotifToSpecificUsers(otherMembersId, silentNotification);

    if (
      savedGroup.roomType === RoomType.PERSONAL &&
      savedGroup.members.length === 2
    ) {
      const chatPartner = savedGroup.members.filter((m) => m.id !== user.id)[0];
      savedGroup.imageURL = chatPartner.avatarUrl;
      savedGroup.name = `${chatPartner.lastName} ${chatPartner.firstName}`;
    }
    return savedGroup;
  }

  @Patch('/v2/room/:roomId/members')
  @UseGuards(JwtAuthenticationGuard)
  async editRoomMembers(
    @Param('roomId') roomId: number,
    @Body() members: User[],
  ): Promise<ChatGroup> {
    const newGroupInfo = await this.chatService.editChatMembers(
      roomId,
      members,
    );
    return newGroupInfo;
  }

  @Get('get-last-read-chat-time/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getLastReadChatTime(
    @Req() req: RequestWithUser,
    @Param('id') chatGroupId: string,
  ): Promise<LastReadChatTime[]> {
    return await this.chatService.getLastReadChatTime(req.user, chatGroupId);
  }

  @Patch('save-last-read-chat-time/:id')
  @UseGuards(JwtAuthenticationGuard)
  async saveLastReadChatTime(
    @Req() req: RequestWithUser,
    @Param('id') chatGroupId: number,
  ): Promise<LastReadChatTime> {
    return await this.chatService.saveLastReadChatTime(req.user, chatGroupId);
  }

  @Post('leave-room')
  @UseGuards(JwtAuthenticationGuard)
  async leaveGroup(
    @Req() req: RequestWithUser,
    @Body() chatGroup: Partial<ChatGroup>,
  ) {
    const { id } = req.user;
    const { id: chatGroupId } = chatGroup;
    await this.chatService.leaveChatRoom(id, chatGroupId);
    const silentNotification: CustomPushNotificationData = {
      title: '',
      body: '',
      custom: {
        silent: 'silent',
        type: 'leave',
        screen: '',
        id: chatGroupId.toString(),
      },
    };
    await sendPushNotifToSpecificUsers(
      chatGroup?.members.map((u) => u.id),
      silentNotification,
    );
  }

  @Delete('/v2/reaction/:reactionId')
  @UseGuards(JwtAuthenticationGuard)
  async deleteReaction(
    @Param('reactionId') reactionId: number,
  ): Promise<number> {
    const deletedReaction = await this.chatService.deleteReaction(reactionId);
    return deletedReaction;
  }

  @Post('/v2/reaction')
  @UseGuards(JwtAuthenticationGuard)
  async postReaction(
    @Req() req: RequestWithUser,
    @Body() postedReaction: Partial<ChatMessageReaction>,
  ): Promise<ChatMessageReaction> {
    const { user } = req;
    const reaction = await this.chatService.postReaction(
      postedReaction,
      user.id,
    );
    return reaction;
  }

  @Get('/v2/room/:roomId')
  @UseGuards(JwtAuthenticationGuard)
  async getRoomDetail(
    @Param('roomId') roomId: string,
    @Req() req: RequestWithUser,
  ): Promise<ChatGroup> {
    const { user } = req;
    const roomDetail = await this.chatService.getRoomDetail(Number(roomId));
    // if (!roomDetail.members.filter((m) => m.id === user.id).length) {
    //   throw new BadRequestException('チャットルームを取得する権限がありません');
    // }
    return roomDetail;
  }

  @Get('/v2/room/:roomId/note')
  @UseGuards(JwtAuthenticationGuard)
  async getChatNotes(
    @Param('roomId') roomId: string,
    @Query('page') page: string,
    @Req() req: RequestWithUser,
  ): Promise<GetChatNotesResult> {
    const { user } = req;
    const notes = await this.chatNoteService.getChatNotes(
      { group: Number(roomId), page },
      user.id,
    );
    return notes;
  }

  @Post('/v2/room/:roomId/note')
  @UseGuards(JwtAuthenticationGuard)
  async createChatNotes(
    @Body() body: Partial<ChatNote>,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    body.editors = [user];
    const notes = await this.chatNoteService.saveChatNotes(body);
    await this.chatService.sendMessage({
      content: `${userNameFactory(user)}さんが新しいノートを作成しました`,
      type: ChatMessageType.SYSTEM_TEXT,
      chatGroup: body.chatGroup,
      sender: user,
    });
    return notes;
  }

  @Patch('/v2/room/:roomId/note/:noteId')
  @UseGuards(JwtAuthenticationGuard)
  async updateChatNotes(@Body() body: ChatNote, @Req() req: RequestWithUser) {
    const { user } = req;
    body.editors = body?.editors?.length
      ? [...body.editors.filter((e) => e.id !== user.id), user]
      : [user];
    const notes = await this.chatNoteService.saveChatNotes(body);
    return notes;
  }

  @Delete('/v2/room/:roomId/note/:noteId')
  @UseGuards(JwtAuthenticationGuard)
  async deleteChatNotes(@Param('noteId') noteId: number, @Res() res: Response) {
    await this.chatNoteService.deleteChatNotes(noteId);
    res.send(200);
  }

  @Get('/v2/room/:roomId/note/:noteId')
  @UseGuards(JwtAuthenticationGuard)
  async getChatNoteDetail(
    @Param('noteId') noteId: string,
    @Req() req: RequestWithUser,
  ) {
    const { id: userID } = req.user;
    const notes = await this.chatNoteService.getChatNoteDetail(
      Number(noteId),
      userID,
    );
    return notes;
  }

  @Get('/v2/room/:roomId/album')
  @UseGuards(JwtAuthenticationGuard)
  async getChatAlbums(
    @Param('roomId') roomId: string,
    @Query('page') page: string,
    @Req() req: RequestWithUser,
  ): Promise<GetChatAlbumsResult> {
    const { user } = req;
    const albums = await this.chatAlbumService.getChatAlbums(
      { group: Number(roomId), page },
      user.id,
    );
    return albums;
  }

  @Post('/v2/room/:roomId/album')
  @UseGuards(JwtAuthenticationGuard)
  async createChatAlbums(
    @Body() body: Partial<ChatAlbum>,
    @Req() req: RequestWithUser,
  ) {
    const { user } = req;
    body.editors = [user];
    const albums = await this.chatAlbumService.saveChatAlbums(body);
    await this.chatService.sendMessage({
      content: `${userNameFactory(user)}さんが新しいアルバム: ${
        albums.title
      }を作成しました`,
      type: ChatMessageType.SYSTEM_TEXT,
      chatGroup: body.chatGroup,
      sender: user,
    });
    return albums;
  }

  @Patch('/v2/room/:roomId/album/:albumId')
  @UseGuards(JwtAuthenticationGuard)
  async updateChatAlbums(@Body() body: ChatAlbum, @Req() req: RequestWithUser) {
    const { user } = req;
    body.editors = body?.editors?.length
      ? [...body.editors.filter((e) => e.id !== user.id), user]
      : [user];
    const albums = await this.chatAlbumService.saveChatAlbums(body);
    return albums;
  }

  @Delete('/v2/room/:roomId/album/:albumId')
  @UseGuards(JwtAuthenticationGuard)
  async deleteChatAlbums(
    @Param('albumId') albumId: number,
    @Res() res: Response,
  ) {
    await this.chatAlbumService.deleteChatAlbums(albumId);
    res.send(200);
  }

  @Get('/v2/room/:roomId/album/:albumId')
  @UseGuards(JwtAuthenticationGuard)
  async getChatAlbumDetail(
    @Param('albumId') albumId: string,
    // @Query('page') page: string,
  ) {
    const albums = await this.chatAlbumService.getChatAlbumImages(
      Number(albumId),
    );
    return albums;
  }
}
