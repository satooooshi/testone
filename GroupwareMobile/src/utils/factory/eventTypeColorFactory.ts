import {EventType} from '../../types';

export const eventTypeColorFactory = (type: EventType): string => {
  switch (type) {
    case EventType.IMPRESSIVE_UNIVERSITY:
      return '#3182ce';
    case EventType.STUDY_MEETING:
      return '#38a169';
    case EventType.BOLDAY:
      return '#f6ad55';
    case EventType.COACH:
      return '#90cdf4';
    case EventType.CLUB:
      return '#f56565';
    case EventType.SUBMISSION_ETC:
      return '#086f83';
    case EventType.OTHER:
      return '#A9A9A9';
  }
};
