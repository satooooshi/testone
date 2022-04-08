import { EventSchedule } from 'src/entities/event.entity';

export type GetEventDetailResopnse = EventSchedule & {
  isJoining: boolean;
  isCanceled: boolean;
};
