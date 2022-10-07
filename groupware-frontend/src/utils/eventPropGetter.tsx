import { EventType } from 'src/types';

export const eventPropGetter = (event: any): any => {
  const type = event.type;
  switch (type) {
    case EventType.IMPRESSIVE_UNIVERSITY:
      return { style: { backgroundColor: '#3182ce' } };
    case EventType.STUDY_MEETING:
      return { style: { backgroundColor: '#38a169' } };
    case EventType.BOLDAY:
      return { style: { backgroundColor: '#f6ad55' } };
    case EventType.COACH:
      return { style: { backgroundColor: '#90cdf4', color: '#65657d' } };
    case EventType.CLUB:
      return { style: { backgroundColor: '#f56565' } };
    case EventType.SUBMISSION_ETC:
      return { style: { backgroundColor: '#086f83' } };
    case EventType.OTHER:
      return { style: { backgroundColor: '#a9a9a9' } };
  }
};
