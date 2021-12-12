import {
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
import { Response } from 'express';
import { ChatAlbum } from 'src/entities/chatAlbum.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { ChatMessageReaction } from 'src/entities/chatMessageReaction.entity';
import { ChatNote } from 'src/entities/chatNote.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { ChatService, GetChatNotesResult } from './chat.service';
import { ChatAlbumService, GetChatAlbumsResult } from './chatAlbum.service';
import { ChatNoteService } from './chatNote.service';

export interface GetMessagesQuery {
  group: number;
  page?: string;
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
  ) {}

  @Get('group-list')
  @UseGuards(JwtAuthenticationGuard)
  async getChatGroup(@Req() req: RequestWithUser): Promise<ChatGroup[]> {
    return await this.chatService.getChatGroup(req.user.id);
  }

  @Get('/v2/rooms')
  @UseGuards(JwtAuthenticationGuard)
  async getChatGroupByPage(
    @Req() req: RequestWithUser,
    @Query() query: GetMessagesQuery,
  ): Promise<GetRoomsResult> {
    return await this.chatService.getRoomsByPage(req.user.id, query);
  }

  @Get('get-messages')
  @UseGuards(JwtAuthenticationGuard)
  async getMessages(
    @Req() req: RequestWithUser,
    @Query() query: GetMessagesQuery,
  ): Promise<ChatMessage[]> {
    return await this.chatService.getChatMessage(req.user.id, query);
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
    return await this.chatService.saveChatGroup(chatGroup, user.id);
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
    @Query('page') page: string,
  ) {
    const albums = await this.chatAlbumService.getChatAlbumImages(
      Number(albumId),
      page,
    );
    return albums;
  }
}
