import { EventType } from 'src/types';

export const eventTypeColorFactory = (type: EventType): string => {
  switch (type) {
    case EventType.STUDY_MEETING:
      return '#38a169';
    case EventType.COACH:
      return '#90cdf4';
    case EventType.CLUB:
      return '#f56565';
    case EventType.SUBMISSION_ETC:
      return '#086f83';
  }
};
