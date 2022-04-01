interface _DeepPartialArray<T> extends Array<DeepPartial<T>> {}
/** @private */
type _DeepPartialObject<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? _DeepPartialArray<U>
  : T extends object
  ? _DeepPartialObject<T>
  : T | undefined;

export enum UserRole {
  ADMIN = 'admin',
  EXTERNAL_INSTRUCTOR = 'external_instructor',
  INTERNAL_INSTRUCTOR = 'internal_instructor',
  COACH = 'coach',
  COMMON = 'common',
}

export enum BranchType {
  TOKYO = 'tokyo',
  OSAKA = 'osaka',
  NON_SET = 'non_set',
}

export enum ChatMessageType {
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
  SYSTEM_TEXT = 'system_text',
  OTHER_FILE = 'other_file',
}

export enum EventType {
  IMPRESSIVE_UNIVERSITY = 'impressive_university',
  STUDY_MEETING = 'study_meeting',
  BOLDAY = 'bolday',
  COACH = 'coach',
  CLUB = 'club',
  SUBMISSION_ETC = 'submission_etc',
}

export enum TagType {
  TECH = 'technology',
  CLUB = 'club',
  QUALIFICATION = 'qualification',
  HOBBY = 'hobby',
  OTHER = 'other',
}

export enum WikiType {
  RULES = 'rule',
  ALL_POSTAL = 'all-postal',
  //掲示板
  BOARD = 'board',
}

export enum RuleCategory {
  //会社理念
  PHILOSOPHY = 'philosophy',
  //社内規則
  RULES = 'rules',
  //ABC制度
  ABC = 'abc',
  //福利厚生等
  BENEFITS = 'benefits',
  //各種申請書
  DOCUMENT = 'document',
  //社内規則以外
  NON_RULE = '',
}

export enum BoardCategory {
  //ナレッジ
  KNOWLEDGE = 'knowledge',
  //Q&A
  QA = 'question',
  //本社からのお知らせ
  NEWS = 'news',
  //感動大学
  IMPRESSIVE_UNIVERSITY = 'impressive_university',
  //部活動・サークル
  CLUB = 'club',
  //勉強会
  STUDY_MEETING = 'study_meeting',
  //お祝い事
  CELEBRATION = 'celebration',
  //その他
  OTHER = 'other',
  //掲示板ではないもの
  NON_BOARD = '',
}

export type TextFormat = 'markdown' | 'html';

export interface User {
  id: number;
  email: string;
  isEmailPublic: boolean;
  phone: string;
  isPhonePublic: boolean;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  branch: BranchType;
  introduceTech: string;
  introduceQualification: string;
  introduceHobby: string;
  introduceClub: string;
  introduceOther: string;
  password?: string;
  role: UserRole;
  avatarUrl: string;
  verifiedAt: Date | null;
  employeeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  existence: boolean | null;
  chatMessageReactions?: ChatMessageReaction[];
  tags?: Tag[];
  submissionFiles?: SubmissionFile[];
  hostingEvents?: EventSchedule[];
  events?: EventSchedule[];
  eventComments?: EventComment[];
  eventsCreated?: EventSchedule[];
  wiki?: Wiki[];
  qaAnswers?: QAAnswer[];
  qaAnswerReplies?: QAAnswerReply[];
  //this params is sent when login
  token?: string;
  userGoodForBoard?: Wiki[];
  eventCount?: number;
  questionCount?: number;
  answerCount?: number;
  knowledgeCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  type: TagType;
  createdAt: Date;
  updatedAt: Date;
  events?: EventSchedule[];
  wiki?: Wiki[];
}

export interface UserTag {
  id: number;
  name: string;
  type: TagType;
  createdAt: Date;
  updatedAt: Date;
  users?: User[];
}

export type AllTag = Tag | UserTag;

export type TagTypeInApp = 'All' | TagType;
export type UserRoleInApp = 'All' | UserRole;

export interface Wiki {
  id: number;
  title: string;
  body: string;
  type: WikiType;
  ruleCategory: RuleCategory;
  boardCategory: BoardCategory;
  textFormat: TextFormat;
  resolvedAt: Date;
  writer?: User;
  answers?: QAAnswer[];
  tags?: Tag[];
  bestAnswer?: QAAnswer;
  createdAt: Date;
  updatedAt: Date;
  userGoodForBoard?: User[];
  isGoodSender?: boolean;
}

export interface QAAnswerReply {
  id: number;
  body: string;
  textFormat: TextFormat;
  writer?: User;
  answer?: QAAnswer;
  createdAt: Date;
  updatedAt: Date;
}

export interface QAAnswer {
  id: number;
  body: string;
  textFormat: TextFormat;
  createdAt: Date;
  updatedAt: Date;
  wiki?: Wiki;
  writer?: User;
  replies?: QAAnswerReply[];
}

export interface QABestAnswer {
  wiki?: Wiki;
  answer?: QAAnswer;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSchedule {
  id: number;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  type: EventType;
  imageURL: string;
  chatNeeded: boolean;
  chatGroup?: ChatGroup;
  comments?: EventComment[];
  users?: User[];
  userJoiningEvent?: UserJoiningEvent[];
  hostUsers?: User[];
  tags?: Tag[];
  files?: Partial<EventFile>[];
  submissionFiles?: Partial<SubmissionFile>[];
  videos?: Partial<EventVideo>[];
  author?: Partial<User>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserJoiningEvent {
  id?: number;
  lateMinutes: number;
  canceledAt: Date | null;
  user: User;
  event: EventSchedule;
  createdAt: Date;
  updatedAt: Date;
}
export interface EventComment {
  id: number;
  body: string;
  eventSchedule?: EventSchedule;
  writer?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventVideo {
  id: number;
  url: string;
  eventSchedule?: EventSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionFile {
  id: number;
  url: string;
  name: string;
  eventSchedule?: Partial<EventSchedule>;
  userSubmitted?: Partial<User>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFile {
  id: number;
  url: string;
  name: string;
  eventSchedule?: EventSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: number;
  content: string;
  type: ChatMessageType;
  chatGroup?: ChatGroup;
  sender?: User;
  reactions?: ChatMessageReaction[];
  createdAt: Date;
  updatedAt: Date;
  isSender?: boolean;
  thumbnail?: string;
  replyParentMessage?: ChatMessage | null;
}

export interface ChatGroup {
  id: number;
  name: string;
  imageURL: string;
  pinnedUsers?: User[];
  isPinned?: boolean;
  chatNotes?: ChatNote[];
  chatMessages?: ChatMessage[];
  members?: User[];
  lastReadChatTime?: LastReadChatTime[];
  hasBeenRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LastReadChatTime {
  id: number;
  readTime: Date;
  chatGroup: ChatGroup;
  user: User;
}

export interface ChatNote {
  id: number;
  content: string;
  chatGroup?: ChatGroup;
  editors?: User[];
  images?: Partial<ChatNoteImage>[];
  createdAt: Date;
  updatedAt: Date;
  isEditor?: boolean;
}

export interface ChatNoteImage {
  id: number;
  imageURL: string;
  chatNote?: ChatNote;
  createdAt: Date;
  updatedAt: Date;
}

//this is for react-native-image-viewing
export type ImageSource = {
  uri: string;
};

export interface ChatAlbum {
  id: number;
  title: string;
  chatGroup?: ChatGroup;
  editors?: User[];
  images?: Partial<ChatAlbumImage>[];
  createdAt: Date;
  updatedAt: Date;
  isEditor?: boolean;
}

export interface ChatAlbumImage {
  id: number;
  imageURL: string;
  chatAlbum?: ChatAlbum;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageReaction {
  id: number;
  emoji: string;
  user?: User;
  chatMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
  isSender?: boolean;
}

export type NotificationRouting = 'chat' | 'event' | 'wiki' | 'users';

export type NotificationNavigator = {
  id?: string;
  screen: NotificationRouting;
};

export interface TopNews {
  id: number;
  title: string;
  urlPath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDevice {
  id: number;
  token: string;
  user?: Partial<User>;
  createdAt: Date;
  updatedAt: Date;
}
export interface EventIntroduction {
  type: EventType;
  title: string;
  description: string;
  imageUrl: string;
  subImages: EventIntroductionSubImage[];
  createdAt: Date;
  updatedAt: Date;
}
export interface EventIntroductionSubImage {
  eventIntruduction: EventIntroduction;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
