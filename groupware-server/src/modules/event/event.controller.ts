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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { EventSchedule, EventType } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { SubmissionFile } from 'src/entities/submissionFiles.entity';
import { UserRole } from 'src/entities/user.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { ChatService } from '../chat/chat.service';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { EventScheduleService } from './event.service';
import { GetEventDetailResopnse } from './eventDetail.type';

export interface QueryToGetZipSubmission {
  id: string;
}

export interface SearchQueryToGetEvents {
  page?: string;
  word?: string;
  tag?: string;
  status?: 'future' | 'past' | 'current';
  type?: EventType;
  from?: string;
  to?: string;
  participant_id?: string;
  host_user_id?: string;
}

export interface QueryToGetEventCsv {
  id?: string;
  from?: string;
  to?: string;
}

export interface SearchResultToGetEvents {
  // this key is the total page count
  pageCount: number;
  events: EventSchedule[];
}

const eventTypeName = (eventType: EventType) => {
  switch (eventType) {
    case EventType.IMPRESSIVE_UNIVERSITY:
      return '感動大学';
    case EventType.BOLDAY:
      return 'BOLDay';
    case EventType.CLUB:
      return '部活動';
    case EventType.STUDY_MEETING:
      return '勉強会';
    case EventType.COACH:
      return 'コーチ制度';
    case EventType.SUBMISSION_ETC:
      return '提出物等';
  }
};

@Controller('event')
export class EventScheduleController {
  constructor(
    private readonly eventService: EventScheduleService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly notifService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  @Get('submission-zip')
  @UseGuards(JwtAuthenticationGuard)
  async getSubmissionZip(
    @Query() query: QueryToGetZipSubmission,
    @Res() res: Response,
  ) {
    const { id } = query;

    const zip = await this.eventService.getSubmissionZip(Number(id));
    res.setHeader('Content-Type', 'application/zip');
    res.send(zip);
  }

  @Get('csv')
  @UseGuards(JwtAuthenticationGuard)
  async getCsv(@Query() query: QueryToGetEventCsv, @Res() res: Response) {
    const { id, from, to } = query;
    if (!id && !from && !to) {
      throw new BadRequestException();
    }

    if (id) {
      const csv = await this.eventService.getDetailCsv(Number(id));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=event.csv');

      res.status(200).end(csv);
      return;
    }
    const csv = await this.eventService.getCsv({ from, to });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=event.csv');

    res.status(200).end(csv);
  }

  @Get('list')
  @UseGuards(JwtAuthenticationGuard)
  async getEvents(
    @Query() query: SearchQueryToGetEvents,
  ): Promise<SearchResultToGetEvents> {
    const { from, to } = query;
    if (from || to) {
      return await this.eventService.getEventAtSpecificTime(query);
    }
    return await this.eventService.getEvents(query);
  }

  @Post('save-submission')
  @UseGuards(JwtAuthenticationGuard)
  async saveSubmission(
    @Body() submissionFiles: Partial<SubmissionFile>[],
  ): Promise<SubmissionFile[]> {
    return await this.eventService.saveSubmission(submissionFiles);
  }

  //get 10 latest event randomly
  @Get('latest')
  @UseGuards(JwtAuthenticationGuard)
  async getLatest(
    @Query() query: Pick<SearchQueryToGetEvents, 'type'>,
  ): Promise<EventSchedule[]> {
    return await this.eventService.getLatestEvent(query);
  }

  @Get('detail/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getEventDetail(
    @Param() params: { id: number },
    @Req() req: RequestWithUser,
  ): Promise<GetEventDetailResopnse> {
    const { id } = params;
    const { user } = req;
    const eventSchedule = await this.eventService.getEventDetail(id, user.id);
    const isJoining = eventSchedule.userJoiningEvent?.filter(
      (userJoiningEvent) => user.id === userJoiningEvent.user.id,
    ).length;
    const isCanceled = eventSchedule.userJoiningEvent?.filter(
      (userJoiningEvent) =>
        user.id === userJoiningEvent.user.id && userJoiningEvent.canceledAt,
    ).length;

    const returnData: GetEventDetailResopnse = {
      ...eventSchedule,
      isJoining: false,
      isCanceled: false,
    };
    if (isJoining) {
      returnData.isJoining = true;
    }
    if (isCanceled) {
      returnData.isCanceled = true;
    }
    return returnData;
  }

  @Post('create-event')
  @UseGuards(JwtAuthenticationGuard)
  async createEvent(
    @Req() req: RequestWithUser,
    @Body() eventSchedule: Partial<EventSchedule>,
  ): Promise<EventSchedule> {
    if (!eventSchedule.tags || !eventSchedule.tags.length) {
      throw new BadRequestException('Event must links one or more tags');
    }
    const { title, description } = eventSchedule;
    eventSchedule.author = req.user;

    const savedEvent = await this.eventService.saveEvent(eventSchedule);
    if (savedEvent.type !== EventType.SUBMISSION_ETC) {
      const users = await this.userService.getUsers();
      const emailArr = users.map((u) => u.email);
      const startAtStr = dateTimeFormatterFromJSDDate({
        dateTime: savedEvent.startAt,
      });
      const endAtStr = dateTimeFormatterFromJSDDate({
        dateTime: savedEvent.endAt,
      });
      const emailContent = `${title} 開始日時: ${startAtStr} 終了日時: ${endAtStr} \n ${description}`;
      const subject = `新規イベント: ${eventTypeName(
        savedEvent.type,
      )}が登録されました`;
      const buttonName = `作成された${eventTypeName(savedEvent.type)}を見る`;
      this.notifService.sendEmailNotification({
        to: emailArr,
        subject,
        title: subject,
        content: emailContent,
        buttonLink: `${this.configService.get('CLIENT_DOMAIN')}/event/${
          savedEvent.id
        }`,
        buttonName,
      });
    }
    if (savedEvent.chatNeeded) {
      const eventChatGroup = new ChatGroup();
      eventChatGroup.name = savedEvent.title;
      eventChatGroup.imageURL = savedEvent.imageURL || '';
      if (savedEvent.hostUsers && savedEvent.hostUsers.length) {
        eventChatGroup.members = [...savedEvent.hostUsers, savedEvent.author];
      } else {
        eventChatGroup.members = [savedEvent.author];
      }
      const eventGroup = await this.chatService.saveChatGroup(eventChatGroup);
      const groupSavedEvent = await this.eventService.saveEvent({
        ...savedEvent,
        chatGroup: eventGroup,
      });
      return groupSavedEvent;
    }
    return savedEvent;
  }

  @Post('update-event')
  @UseGuards(JwtAuthenticationGuard)
  async updateEvent(
    @Body() eventSchedule: Partial<EventSchedule>,
    @Req() req: RequestWithUser,
  ): Promise<EventSchedule> {
    if (!eventSchedule.tags || !eventSchedule.tags.length) {
      throw new BadRequestException('Event must links one or more tags');
    }
    const existEvent = await this.eventService.getEventDetail(
      eventSchedule.id,
      req.user.id,
    );
    if (
      existEvent.author &&
      existEvent.author.id !== req.user.id &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new BadRequestException(
        'Events are able to be editted by only the user created',
      );
    }
    console.log(eventSchedule);
    return await this.eventService.saveEvent(eventSchedule);
  }

  @Post('save-user-joining-event')
  @UseGuards(JwtAuthenticationGuard)
  async saveUserJoiningEvent(@Body() userJoiningEvent: UserJoiningEvent) {
    const savedResponse = await this.eventService.saveUserJoiningEvent(
      userJoiningEvent,
    );
    return savedResponse;
  }

  @Post('join-event')
  @UseGuards(JwtAuthenticationGuard)
  async joinEvent(
    @Req() req: RequestWithUser,
    @Body() body: { eventID: number },
  ) {
    const joinedEvent = await this.eventService.joinEvent(
      body.eventID,
      req.user,
    );
    if (joinedEvent.chatNeeded && joinedEvent.chatGroup) {
      await this.chatService.joinChatGroup(
        req.user.id,
        joinedEvent.chatGroup.id,
      );
    }
    return joinedEvent;
  }

  @Patch('cancel-event/:id')
  @UseGuards(JwtAuthenticationGuard)
  async cancelEvent(@Req() req: RequestWithUser, @Param() eventId: number) {
    const userJoiningEvent = await this.eventService.cancelEvent(
      eventId,
      req.user,
    );
    // if (userJoiningEvent.event.chatNeeded && userJoiningEvent.event.chatGroup) {
    //   await this.chatService.joinChatGroup(
    //     req.user.id,
    //     userJoiningEvent.event.chatGroup.id,
    //   );
    // }
    return userJoiningEvent.event;
  }

  @Post('delete-event')
  @UseGuards(JwtAuthenticationGuard)
  async deleteEvent(@Body() body: { eventId: number }) {
    return await this.eventService.deleteEvent(body.eventId);
  }

  @Post('create-comment')
  @UseGuards(JwtAuthenticationGuard)
  async createAnswer(
    @Req() request: RequestWithUser,
    @Body() comment: EventComment,
  ): Promise<EventComment> {
    comment.writer = request.user;
    return await this.eventService.createComment(comment);
  }
}
