import {EventType} from '../../types';

const eventTypeNameFactory = (type: EventType): any => {
  switch (type) {
    case EventType.STUDY_MEETING:
      return '技術勉強会';
    case EventType.COACH:
      return 'コーチ制度';
    case EventType.CLUB:
      return '部活動';
    case EventType.SUBMISSION_ETC:
      return '提出物等';
  }
};

export default eventTypeNameFactory;
