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
import { Response } from 'express';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { ChatNote } from 'src/entities/chatNote.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { ChatService, GetChatNotesResult } from './chat.service';

export interface GetMessagesQuery {
  group: number;
  page?: string;
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
  constructor(private readonly chatService: ChatService) {}

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
    const page = Number(query?.page) || 1;
    return await this.chatService.getRoomsByPage(req.user.id, page);
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
    if (!chatGroup.members || !chatGroup.members.length) {
      throw new BadRequestException(
        'Group member is necessary at least 1 person',
      );
    }
    if (!chatGroup.members.filter((u) => u.id === user.id).length) {
      chatGroup.members.push(user);
    }
    return await this.chatService.saveChatGroup(chatGroup);
  }

  @Get('get-last-read-chat-time/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getLastReadChatTime(
    @Req() req: RequestWithUser,
    @Param() chatGroupId: string,
  ): Promise<LastReadChatTime[]> {
    return await this.chatService.getLastReadChatTime(req.user, chatGroupId);
  }

  @Patch('save-last-read-chat-time/:id')
  @UseGuards(JwtAuthenticationGuard)
  async saveLastReadChatTime(
    @Req() req: RequestWithUser,
    @Param() chatGroupId: number,
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

  @Get('/v2/room/:roomId/note')
  @UseGuards(JwtAuthenticationGuard)
  async getChatNotes(
    @Param('roomId') roomId: string,
    @Query('page') page: string,
    @Req() req: RequestWithUser,
  ): Promise<GetChatNotesResult> {
    const { user } = req;
    const notes = await this.chatService.getChatNotes(
      { group: Number(roomId), page },
      user.id,
    );
    return notes;
  }

  @Post('/v2/room/:roomId/note')
  @UseGuards(JwtAuthenticationGuard)
  async createChatNotes(@Body() body: Partial<ChatNote>) {
    const notes = await this.chatService.saveChatNotes(body);
    return notes;
  }

  @Patch('/v2/room/:roomId/note/:noteId')
  @UseGuards(JwtAuthenticationGuard)
  async updateChatNotes(@Body() body: ChatNote) {
    const notes = await this.chatService.saveChatNotes(body);
    return notes;
  }

  @Delete('/v2/room/:roomId/note/:noteId')
  @UseGuards(JwtAuthenticationGuard)
  async deleteChatNotes(@Param('noteId') noteId: number, @Res() res: Response) {
    await this.chatService.deleteChatNotes(noteId);
    res.send(200);
  }

  @Get('/v2/room/:roomId/note/:noteId')
  @UseGuards(JwtAuthenticationGuard)
  async getChatNoteDetail(
    @Param('noteId') noteId: string,
    @Req() req: RequestWithUser,
  ) {
    const { id: userID } = req.user;
    const notes = await this.chatService.getChatNoteDetail(
      Number(noteId),
      userID,
    );
    return notes;
  }
}
