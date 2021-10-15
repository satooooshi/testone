import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parser } from 'json2csv';
import * as JSZip from 'jszip';
import { DateTime } from 'luxon';
import { EventSchedule, EventType } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { EventFile } from 'src/entities/eventFile.entity';
import { EventVideo } from 'src/entities/eventVideo.entity';
import { SubmissionFile } from 'src/entities/submissionFiles.entity';
import { User } from 'src/entities/user.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { In, Not, Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import {
  SearchQueryToGetEvents,
  SearchResultToGetEvents,
} from './event.controller';

@Injectable()
export class EventScheduleService {
  constructor(
    @InjectRepository(EventSchedule)
    private readonly eventRepository: Repository<EventSchedule>,
    @InjectRepository(UserJoiningEvent)
    private readonly userJoiningEventRepository: Repository<UserJoiningEvent>,
    @InjectRepository(EventFile)
    private readonly eventtFileRepository: Repository<EventFile>,
    @InjectRepository(EventVideo)
    private readonly eventVideoRepository: Repository<EventVideo>,
    @InjectRepository(EventComment)
    private readonly eventCommentRepository: Repository<EventComment>,
    @InjectRepository(SubmissionFile)
    private readonly submissionFileRepository: Repository<SubmissionFile>,
    private readonly storageService: StorageService,
  ) {}

  public eventTypeNameFactory(eventType: EventType): string {
    switch (eventType) {
      case EventType.IMPRESSIVE_UNIVERSITY:
        return '感動大学';
      case EventType.STUDY_MEETING:
        return '勉強会';
      case EventType.COACH:
        return 'コーチ制度';
      case EventType.BOLDAY:
        return 'BOLDay';
      case EventType.CLUB:
        return '部活動';
      case EventType.SUBMISSION_ETC:
        return '提出物等';
    }
  }

  public async getSubmissionZip(id: number) {
    const zip = new JSZip();
    const targetEvent = await this.eventRepository.findOne(id);
    const folder = zip.folder(targetEvent.title);
    const submissionFiles = await this.submissionFileRepository
      .createQueryBuilder('submissionFiles')
      .leftJoin('submissionFiles.eventSchedule', 'eventSchedule')
      .where('eventSchedule.id = :id', { id })
      .getMany();
    const fileURLs = submissionFiles.map((f) => f.url);
    const fileNames = submissionFiles.map(
      (f) => (f.url.match('.+/(.+?)([?#;].*)?$') || ['', f.url])[1],
    );

    const downloadedFiles = await this.storageService.downloadFile(fileURLs);
    for (let i = 0; i < downloadedFiles.length; i++) {
      folder?.file(fileNames[i], downloadedFiles[i].createReadStream(), {
        binary: true,
      });
    }
    const content = await zip.generateAsync({ type: 'base64' });
    return content;
  }

  public async getCsv(query: { from: string; to: string }) {
    const { from, to } = query;
    const fromDate = new Date(from);
    const toDate = from
      ? new Date(to)
      : new Date(`${new Date().getFullYear()}-12-31`);
    const csvFields = [
      { label: 'id', value: 'id' },
      { label: 'タイトル', value: 'title' },
      { label: '概要', value: 'description' },
      { label: '開始日時', value: 'startAt' },
      { label: '終了日時', value: 'endAt' },
      { label: 'タグ', value: 'tag' },
      { label: 'タイプ', value: 'type' },
      { label: '開催者', value: 'hostUsers' },
      { label: '参加者', value: 'users' },
      { label: '参加者の社員コード', value: 'employeeId' },
      { label: '参加人数', value: 'participantsCount' },
    ];
    const csvEvents: any[] = [];
    const events = await this.eventRepository
      .createQueryBuilder('events')
      .withDeleted()
      .leftJoinAndSelect('events.userJoiningEvent', 'userJoiningEvent')
      .leftJoinAndSelect('userJoiningEvent.user', 'user')
      .leftJoinAndSelect('events.hostUsers', 'hostUsers')
      .leftJoinAndSelect('events.tags', 'tags')
      .where('events.startAt > :fromDate', { fromDate })
      .andWhere('events.startAt < :toDate', { toDate })
      .andWhere('events.type <> :eventType', {
        eventType: EventType.SUBMISSION_ETC,
      })
      .getMany();

    for (const e of events) {
      const host = e.hostUsers.map((h) => h.lastName + ' ' + h.firstName);
      const tag = e.tags.map((t) => t.name);
      if (e.userJoiningEvent.length) {
        for (const userJoiningEvent of e.userJoiningEvent) {
          const participantName =
            userJoiningEvent.user.lastName +
            ' ' +
            userJoiningEvent.user.firstName;
          csvEvents.push({
            ...e,
            startAt: dateTimeFormatterFromJSDDate({ dateTime: e.startAt }),
            endAt: dateTimeFormatterFromJSDDate({ dateTime: e.endAt }),
            tag,
            type: this.eventTypeNameFactory(e.type),
            hostUsers: host,
            users: participantName,
            employeeId: userJoiningEvent.user.employeeId,
            participantsCount: e.userJoiningEvent.length,
          });
        }
        continue;
      }
      csvEvents.push({
        ...e,
        startAt: dateTimeFormatterFromJSDDate({ dateTime: e.startAt }),
        endAt: dateTimeFormatterFromJSDDate({ dateTime: e.endAt }),
        tag,
        type: this.eventTypeNameFactory(e.type),
        hostUsers: host,
        users: '',
        employeeId: '',
        participantsCount: e.userJoiningEvent.length,
      });
    }
    const csvParser = new Parser({ fields: csvFields });
    const csvData = csvParser.parse(csvEvents);
    return csvData;
  }

  public async getDetailCsv(id: number) {
    const csvFields = [
      { label: 'id', value: 'id' },
      { label: 'タイトル', value: 'title' },
      { label: '概要', value: 'description' },
      { label: '開始日時', value: 'startAt' },
      { label: '終了日時', value: 'endAt' },
      { label: 'タグ', value: 'tag' },
      { label: 'タイプ', value: 'type' },
      { label: '開催者', value: 'hostUsers' },
      { label: '参加者', value: 'users' },
      { label: '参加者の社員コード', value: 'employeeId' },
      { label: '参加人数', value: 'participantsCount' },
    ];
    const csvEvents: any[] = [];
    const events = await this.eventRepository.find({
      relations: [
        'userJoiningEvent',
        'userJoiningEvent.user',
        'hostUsers',
        'tags',
      ],
      where: { type: Not(EventType.SUBMISSION_ETC), id },
      withDeleted: true,
    });

    for (const e of events) {
      const host = e.hostUsers.map((h) => h.lastName + ' ' + h.firstName);
      const tag = e.tags.map((t) => t.name);
      if (e.userJoiningEvent.length) {
        for (const userJoiningEvent of e.userJoiningEvent) {
          const participantName =
            userJoiningEvent.user.lastName +
            ' ' +
            userJoiningEvent.user.firstName;
          csvEvents.push({
            ...e,
            startAt: dateTimeFormatterFromJSDDate({ dateTime: e.startAt }),
            endAt: dateTimeFormatterFromJSDDate({ dateTime: e.endAt }),
            tag,
            type: this.eventTypeNameFactory(e.type),
            hostUsers: host,
            users: participantName,
            employeeId: userJoiningEvent.user.employeeId,
            participantsCount: e.userJoiningEvent.length,
          });
        }
        continue;
      }
      csvEvents.push({
        ...e,
        startAt: dateTimeFormatterFromJSDDate({ dateTime: e.startAt }),
        endAt: dateTimeFormatterFromJSDDate({ dateTime: e.endAt }),
        tag,
        type: this.eventTypeNameFactory(e.type),
        hostUsers: host,
        users: '',
        employeeId: '',
        participantsCount: e.userJoiningEvent.length,
      });
    }
    const csvParser = new Parser({ fields: csvFields });
    const csvData = csvParser.parse(csvEvents);
    return csvData;
  }

  public async getEvents(
    query: SearchQueryToGetEvents,
  ): Promise<SearchResultToGetEvents> {
    const {
      page = 1,
      word = '',
      status = 'future',
      tag = '',
      type = EventType.STUDY_MEETING,
    } = query;
    let offset: number;
    const limit = 20;
    if (page) {
      offset = (Number(page) - 1) * limit;
    }
    const tagIDs = tag.split('+');
    const searchQuery = this.eventRepository
      .createQueryBuilder('events')
      .select()
      .leftJoinAndSelect('events.userJoiningEvent', 'userJoiningEvent')
      .leftJoinAndSelect('userJoiningEvent.user', 'user')
      .leftJoinAndSelect('events.tags', 'tag')
      .where(
        word && word.length !== 1
          ? 'MATCH(title, description) AGAINST (:word IN NATURAL LANGUAGE MODE)'
          : '1=1',
        { word },
      )
      .andWhere(type ? 'events.type = :type' : '1=1', {
        type,
      })
      .andWhere(
        word.length === 1
          ? 'CONCAT(title, description) LIKE :queryWord'
          : '1=1',
        { queryWord: `%${word}%` },
      )
      .andWhere(
        status === 'future'
          ? 'events.start_at > now()'
          : status === 'past'
          ? 'events.start_at < now() AND events.end_at < now()'
          : 'events.start_at < now() AND events.end_at > now()',
      )
      .andWhere(query.participant_id ? 'user = :userID' : '1=1', {
        userID: query.participant_id,
      })
      .andWhere(query.host_user_id ? 'host_user = :hostUserID' : '1=1', {
        hostUserID: query.host_user_id,
      })
      .andWhere(tag ? 'tag.id IN (:...tagIDs)' : '1=1', {
        tagIDs,
      });
    const events = await searchQuery.getMany();
    const ids = events.map((e) => e.id);
    const eventsWithRelation = await this.eventRepository.find({
      where: { id: In(ids) },
      relations: ['userJoiningEvent', 'userJoiningEvent.user', 'tags'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      withDeleted: true,
    });

    const count = await searchQuery.getCount();
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    return { pageCount, events: eventsWithRelation };
  }

  public async getEventAtSpecificTime(query: SearchQueryToGetEvents) {
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);
    const events = await this.eventRepository
      .createQueryBuilder('events')
      .select()
      .leftJoinAndSelect('events.userJoiningEvent', 'userJoiningEvent')
      .leftJoinAndSelect('userJoiningEvent.user', 'user')
      .leftJoinAndSelect('events.tags', 'tag')
      .leftJoin('events.hostUsers', 'host_user')
      .where(
        fromDate.toString() !== 'Invalid Date'
          ? 'events.start_at > :fromDate'
          : '1=1',
        {
          fromDate,
        },
      )
      .andWhere(
        toDate.toString() !== 'Invalid Date'
          ? 'events.start_at < :toDate'
          : '1=1',
        {
          toDate,
        },
      )
      .andWhere(query.type ? 'events.type = :type' : '1=1', {
        type: query.type,
      })
      .andWhere(query.participant_id ? 'user = :userID' : '1=1', {
        userID: query.participant_id,
      })
      .andWhere(query.host_user_id ? 'host_user = :hostUserID' : '1=1', {
        hostUserID: query.host_user_id,
      })
      .getMany();
    return { pageCount: 0, events };
  }

  public async getEventDetail(
    id: number,
    userID: number,
  ): Promise<EventSchedule> {
    const existEvent = await this.eventRepository
      .createQueryBuilder('events')
      .withDeleted()
      .leftJoinAndSelect('events.userJoiningEvent', 'userJoiningEvent')
      .leftJoinAndSelect('userJoiningEvent.user', 'user')
      .leftJoinAndSelect('userJoiningEvent.event', 'event')
      .leftJoinAndSelect('events.tags', 'tags')
      .leftJoinAndSelect('events.files', 'files')
      .leftJoinAndSelect('events.submissionFiles', 'submissionFiles')
      .leftJoinAndSelect('events.videos', 'videos')
      .leftJoinAndSelect('events.author', 'author')
      .leftJoinAndSelect('events.hostUsers', 'hostUsers')
      .leftJoinAndSelect('events.comments', 'comments')
      .leftJoinAndSelect('comments.writer', 'writer')
      .leftJoinAndSelect(
        'submissionFiles.userSubmitted',
        'userSubmitted',
        'userSubmitted.id = :userID',
        { userID },
      )
      .where('events.id = :id', { id })
      .getOne();
    return existEvent;
  }

  public async saveUserJoiningEvent(userJoiningEvent: UserJoiningEvent) {
    return await this.userJoiningEventRepository.save(userJoiningEvent);
  }

  public async saveSubmission(
    submissionFiles: Partial<SubmissionFile>[],
  ): Promise<SubmissionFile[]> {
    const submittedFiles = await this.submissionFileRepository.save(
      submissionFiles,
    );
    return submittedFiles;
  }

  public async getLatestEvent(
    query: Pick<SearchQueryToGetEvents, 'type'>,
  ): Promise<EventSchedule[]> {
    const { type } = query;
    const now = new Date();
    const oneWeekLater = new Date(now.setDate(now.getDate() + 7));
    const limit = 10;
    const latestEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.startAt > now()')
      .andWhere('event.startAt < :oneWeekLater', { oneWeekLater })
      .andWhere(type ? 'event.type = :type' : '1=1', {
        type,
      })
      .getMany();
    if (!latestEvents.length) {
      return [];
    }

    const ids = latestEvents.map((l) => l.id);
    const filteredLatestEvents = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('events.userJoiningEvent', 'userJoiningEvent')
      .leftJoinAndSelect('userJoiningEvent.user', 'user')
      .leftJoinAndSelect('event.tags', 'tags')
      .where('event.id IN (:ids)', { ids })
      .orderBy('RAND()')
      .limit(limit)
      .getMany();

    return filteredLatestEvents;
  }

  public async saveEvent(
    eventSchedule: Partial<EventSchedule>,
  ): Promise<EventSchedule> {
    if (eventSchedule.files && eventSchedule.files.length) {
      eventSchedule.files = await this.eventtFileRepository.save(
        eventSchedule.files,
      );
    }
    if (eventSchedule.videos && eventSchedule.videos.length) {
      eventSchedule.videos = await this.eventVideoRepository.save(
        eventSchedule.videos,
      );
    }
    const savedEvent = await this.eventRepository.save(eventSchedule);
    return savedEvent;
  }

  public async joinEvent(eventID: number, user: User): Promise<EventSchedule> {
    const joinedEvent = await this.eventRepository.findOne({
      where: { id: eventID },
      relations: ['chatGroup', 'userJoiningEvent', 'userJoiningEvent.user'],
      withDeleted: true,
    });
    const userJoiningEvent: UserJoiningEvent = {
      user: user,
      event: joinedEvent,
    };
    await this.userJoiningEventRepository.save(userJoiningEvent);
    return joinedEvent;
  }

  public async cancelEvent(
    eventID: number,
    user: User,
  ): Promise<UserJoiningEvent> {
    const canceledUserJoiningEvent =
      await this.userJoiningEventRepository.findOne({
        where: [{ event: eventID, user: user.id }],
        relations: ['user', 'event'],
      });
    if (!canceledUserJoiningEvent) {
      throw new NotAcceptableException('Something went wrong');
    }
    canceledUserJoiningEvent.canceledAt = new Date();
    await this.userJoiningEventRepository.save(canceledUserJoiningEvent);
    return canceledUserJoiningEvent;
  }

  async deleteEvent(eventScheduleId: number) {
    const event = await this.eventRepository.findOne({ id: eventScheduleId });
    if (!event) {
      throw new BadRequestException('The event has already been deleted.');
    }
    await this.eventRepository.delete(eventScheduleId);
  }

  public async createComment(
    comment: Partial<EventComment>,
  ): Promise<EventComment> {
    try {
      if (!comment.eventSchedule || !comment.eventSchedule.id) {
        throw new BadRequestException('You have not commented on the event.');
      }
      const existEvent = await this.eventRepository.findOne(
        comment.eventSchedule.id,
      );
      comment.eventSchedule = existEvent;
      const newComment = await this.eventCommentRepository.save(comment);
      return newComment;
    } catch (err) {
      throw new BadRequestException(
        'some parameter is missing or illegal request',
      );
    }
  }
}
