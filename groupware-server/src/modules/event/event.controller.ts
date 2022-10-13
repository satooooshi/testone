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
import { Response } from 'express';
import { EventSchedule, EventType } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { EventIntroduction } from 'src/entities/eventIntroduction.entity';
import { SubmissionFile } from 'src/entities/submissionFiles.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { ChatService } from '../chat/chat.service';
import SaveEventIntroductionDto from './dto/saveEventIntroductionDto';
import CreateCommentDto from './dto/createCommentDto';
import SaveEventDto from './dto/saveEventDto';
import { EventScheduleService } from './event.service';
import { GetEventDetailResopnse } from './eventDetail.type';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import {
  CustomPushNotificationData,
  sendPushNotifToSpecificUsers,
} from 'src/utils/notification/sendPushNotification';

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
  personal?: string;
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
    case EventType.OTHER:
      return 'その他';
  }
};

@Controller('event')
export class EventScheduleController {
  constructor(
    private readonly eventService: EventScheduleService,
    private readonly chatService: ChatService,
    private readonly notifService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  //@TODO this endpoint is for inputting data
  // @Post('create-from-array')
  // async registerUsers(@Body() events: EventSchedule[]) {
  //   return await this.eventService.createFromArr(events);
  // }

  @Get('submission-zip')
  @UseGuards(JwtAuthenticationGuard)
  async getSubmissionZip(@Query() query: QueryToGetZipSubmission) {
    const { id } = query;

    return await this.eventService.getSubmissionZip(Number(id));
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
    @Req() req: RequestWithUser,
    @Query() query: SearchQueryToGetEvents,
  ): Promise<SearchResultToGetEvents> {
    const { from, to } = query;
    if (from || to) {
      return await this.eventService.getEventAtSpecificTime(query, req.user.id);
    }
    return await this.eventService.getEvents(query);
  }

  @Get('introduction/:type')
  @UseGuards(JwtAuthenticationGuard)
  async getEventIntroduction(
    @Param() params: { type: EventType },
  ): Promise<EventIntroduction> {
    return await this.eventService.getEventIntroduction(params.type);
  }

  @Patch('save-introduction')
  @UseGuards(JwtAuthenticationGuard)
  async saveEventIntroduction(
    @Body() eventIntroduction: SaveEventIntroductionDto,
  ): Promise<EventIntroduction> {
    return await this.eventService.saveEventIntroduction(eventIntroduction);
  }

  @Post('save-submission')
  @UseGuards(JwtAuthenticationGuard)
  async saveSubmission(
    @Body() submissionFiles: Partial<SubmissionFile>[],
  ): Promise<SubmissionFile[]> {
    return await this.eventService.saveSubmission(submissionFiles);
  }

  @Post('delete-submission')
  @UseGuards(JwtAuthenticationGuard)
  async deleteSubmission(@Body() body: { submissionId: number }) {
    await this.eventService.deleteSubmission(body.submissionId);
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
    const isJoining =
      eventSchedule?.userJoiningEvent?.filter(
        (userJoiningEvent) => user?.id === userJoiningEvent.user?.id,
      ).length || false;
    const isCanceled =
      eventSchedule?.userJoiningEvent?.filter(
        (userJoiningEvent) =>
          user.id === userJoiningEvent.user?.id && userJoiningEvent?.canceledAt,
      ).length || false;

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
    @Body() eventSchedule: SaveEventDto,
  ): Promise<EventSchedule> {
    if (!eventSchedule.tags || !eventSchedule.tags.length) {
      throw new BadRequestException('Event must links one or more tags');
    }
    eventSchedule.author = req.user;

    const savedEvent = await this.eventService.saveEvent(eventSchedule);
    return savedEvent;
  }

  @Post('update-event')
  @UseGuards(JwtAuthenticationGuard)
  async updateEvent(
    @Body() eventSchedule: SaveEventDto,
  ): Promise<EventSchedule> {
    if (!eventSchedule.tags || !eventSchedule.tags.length) {
      throw new BadRequestException('Event must links one or more tags');
    }
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
      await this.chatService.joinChatGroup(req.user, joinedEvent.chatGroup.id);
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
    @Body() comment: CreateCommentDto,
  ): Promise<EventComment> {
    comment.writer = request.user;
    return await this.eventService.createComment(comment);
  }

  @Get('send-notif-events-starts-in-hour')
  async sendNotifEventsStartsInHour() {
    const eventsStartAtAnHourLater =
      await this.eventService.getEventsStartAtAnHourLater();
    for (const e of eventsStartAtAnHourLater) {
      const notificationData: CustomPushNotificationData = {
        title: 'イベントの開始の1時間前になりました。',
        body: e.title,
        custom: {
          screen: 'event',
          id: e.id.toString(),
        },
      };
      await sendPushNotifToSpecificUsers(
        [
          e.author.id,
          ...e.hostUsers.map((u) => u.id),
          ...e.userJoiningEvent.map((e) => e.user.id),
        ],
        notificationData,
      );
    }
  }
}
