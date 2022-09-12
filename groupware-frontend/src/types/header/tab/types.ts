export enum EventTab {
  ALL = 'All',
  STUDY_MEETING = '技術勉強会',
  COACH = 'コーチ制度',
  CLUB = '部活動',
  SUBMISSION_ETC = '提出物等',
}

export type Tab = {
  type?: 'backButton' | 'create' | 'edit' | 'delete';
  name: string;
  onClick?: () => void;
  href?: string;
  color?: string;
  isActive?: boolean;
};
// | {
//     type?: ;
//     name: string;
//     color?: string;
//   };

export enum TabName {
  EDIT = 'edit',
  PREVIEW = 'preview',
  DETAIL = 'detail',
  EVENT = 'event',
  QUESTION = 'question',
  KNOWLEDGE = 'knowledge',
  GOOD = 'good',
  ANSWER = 'answer', // FIXME: 使用されている箇所がないかもしれないです...
}
