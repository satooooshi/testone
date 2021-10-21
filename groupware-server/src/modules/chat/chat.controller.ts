import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';

export interface GetMessagesQuery {
  group: number;
  page?: string;
}

@Controller('chat')
export class ChatController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly notifService: NotificationService,
    private readonly chatService: ChatService,
  ) {}

  @Get('group-list')
  @UseGuards(JwtAuthenticationGuard)
  async getChatGroup(@Req() req: RequestWithUser): Promise<ChatGroup[]> {
    return await this.chatService.getChatGroup(req.user.id);
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
    const mentionRegex = /@\[(.*?)\]\(([0-9]+)+\)/g;
    const matchedMentions = message.content.match(mentionRegex);
    if (matchedMentions) {
      const ids = matchedMentions.map((m) => {
        const idStr = m.replace(mentionRegex, '$2');
        return Number(idStr);
      });
      console.log(ids);
      const users = await this.userService.getByIdArr(ids);
      const title = `${message.sender.lastName} ${message.sender.firstName}さんからあなたにメンションされた新着メッセージが届きました`;
      const emails = users.map((u) => u.email);
      const mentionParsedMsg = message.content.replace(mentionRegex, '@$1');
      this.notifService.sendEmailNotification({
        to: emails,
        subject: title,
        title,
        content: mentionParsedMsg,
        buttonLink: `${this.configService.get('CLIENT_DOMAIN')}/chat/${
          message.chatGroup.id
        }`,
        buttonName: 'チャットを確認する',
      });
    }
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
}
