export enum EventTab {
  ALL = 'All',
  IMPRESSIVE_UNIVERSITY = '感動大学',
  STUDY_MEETING = '技術勉強会',
  BOLDAY = 'BOLDay',
  COACH = 'コーチ制度',
  CLUB = '部活動',
  SUBMISSION_ETC = '提出物等',
}

export type Tab =
  | {
      type?: 'action';
      name: string;
      onClick: () => void;
      color?: string;
    }
  | {
      type: 'link';
      name: string;
      href: string;
      color?: string;
    };

export enum TabName {
  EDIT = 'edit',
  PREVIEW = 'preview',
  DETAIL = 'detail',
  EVENT = 'event',
  QUESTION = 'question',
  ANSWER = 'answer', // FIXME: 使用されている箇所がないかもしれないです...
}
