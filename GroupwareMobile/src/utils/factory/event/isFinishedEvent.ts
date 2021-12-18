import {EventSchedule} from '../../../types';

export const isFinishedEvent = (event?: EventSchedule): boolean => {
  if (event?.endAt) {
    return new Date(event.endAt) <= new Date();
  }
  return false;
};
