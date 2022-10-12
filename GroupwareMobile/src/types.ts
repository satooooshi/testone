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
  CALL = 'call',
  STICKER = 'sticker',
  SYSTEM_TEXT = 'system_text',
  OTHER_FILE = 'other_file',
}

export enum EventType {
  ARTIST = 'artist',
  IDOL = 'idol',
  YOUTUBER = 'youtuber',
  TIKTOKER = 'tiktoker',
  INSTAGRAMER = 'instagramer',
  TALENT = 'talent',
  OTHER = 'other',
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
  //自己研鑽
  SELF_IMPROVEMENT = 'self_improvement',
  //個人告知
  PERSONAL_ANNOUNCEMENT = 'personal_announcement',
  //お祝い事
  CELEBRATION = 'celebration',
  //その他
  OTHER = 'other',
  //掲示板ではないもの
  NON_BOARD = '',
}

export type TextFormat = 'markdown' | 'html';
export type UserGoodForBoard = {
  id: number;
  user: User;
  wiki: Wiki;
};
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
  userGoodForBoard?: UserGoodForBoard[];
  eventCount?: number;
  questionCount?: number;
  answerCount?: number;
  knowledgeCount?: number;
  chatGroups?: ChatGroup[];
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
  userGoodForBoard?: UserGoodForBoard[];
  isGoodSender?: boolean;
  goodsCount?: number;
  answersCount?: number;
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
  fileName: string;
  type: ChatMessageType;
  chatGroup?: ChatGroup;
  sender?: User;
  reactions?: ChatMessageReaction[];
  createdAt: Date;
  updatedAt: Date;
  modifiedAt: Date;
  isSender?: boolean;
  thumbnail?: string;
  callTime?: string;
  replyParentMessage?: ChatMessage | null;
}

export interface SocketMessage {
  chatMessage: ChatMessage;
  type: 'send' | 'edit' | 'delete';
}

export enum RoomType {
  GROUP = 'group',
  TALK_ROOM = 'talk_room',
  PERSONAL = 'personal',
}

export interface ChatGroup {
  id: number;
  name: string;
  imageURL: string;
  roomType: RoomType;
  pinnedUsers?: User[];
  isPinned?: boolean;
  chatNotes?: ChatNote[];
  muteUsers?: User[];
  chatMessages?: ChatMessage[];
  isMute?: boolean;
  memberCount: number;
  members?: User[];
  lastReadChatTime?: LastReadChatTime[];
  hasBeenRead?: boolean;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveRoomsResult {
  room: ChatGroup;
  systemMessage: ChatMessage[];
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

export interface SaveNoteResult {
  note: ChatNote;
  systemMessage: ChatMessage;
}

export interface ChatNoteImage {
  id: number;
  fileName: string;
  imageURL: string;
  chatNote?: ChatNote;
  createdAt: Date;
  updatedAt: Date;
}

//this is for react-native-image-viewing
export type FIleSource = {
  uri: string;
  fileName: string;
  createdUrl?: string;
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

export interface SaveAlbumResult {
  album: ChatAlbum;
  systemMessage: ChatMessage;
}
export interface ChatAlbumImage {
  id: number;
  fileName: string;
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

export enum AttendanceCategory {
  // 通常
  COMMON = 'common',
  // 欠勤有給
  PAILD_ABSENCE = 'paid_absence',
  // 遅刻
  LATE = 'late',
  // 電車遅延
  TRAINDELAY = 'train_delay',
  // 早退
  EARLY_LEAVING = 'early_leaving',
  // 遅刻かつ早退
  LATE_AND_EARY_LEAVING = 'late_and_eary_leaving',
  // 有給などの休日
  HOLIDAY = 'holiday',
  // 休日出勤
  HOLIDAY_WORK = 'holiday_work',
  // 振替休日
  TRANSFER_HOLIDAY = 'transfer_holiday',
  // 外出(業務中に自己都合で外出)
  GOOUT = 'go_out',
  // シフト(顧客都合により出社時間を変更する場合)
  SHIFTWORK = 'shift_work',
  // 欠勤
  ABSENCE = 'absence',
  // 半休
  HALF_HOLIDAY = 'half_holiday',
}

export enum AttendanceReason {
  //私用
  PRIVATE = 'private',
  //体調不良
  SICK = 'sick',
  //家事都合
  HOUSEWORK = 'housework',
  //有給休暇
  HOLIDAY = 'holiday',
  //慶弔
  CONDOLENCE = 'condolence',
  //現場都合
  SITE = 'site',
  //災害
  DISASTER = 'disaster',
  //面談
  MEETING = 'meeting',
  //バースデー
  BIRTHDAY = 'birthday',
  //午前半休
  MORNING_OFF = 'morning_off',
  //午後半休
  AFTERNOON_OFF = 'afternoon_off',
  //遅刻半休
  LATE_OFF = 'late_off',
  //早退半休
  EARLY_LEAVING_OFF = 'early_leaving_off',
}

export interface Attendance {
  id: number;
  category: AttendanceCategory;
  //対象日
  targetDate: Date;
  //出勤時刻
  attendanceTime: Date;
  //退勤時刻
  absenceTime: Date;
  //備考
  detail: string;
  //休憩時間
  breakMinutes: string;
  //本社報告日
  reportDate: Date | null;
  // //交通費(円)
  travelCost: TravelCost[];
  //承認時刻
  verifiedAt: Date | null;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}
export interface AttendanceRepo {
  id: number;
  category: AttendanceCategory;
  reason: AttendanceReason;
  //対象日
  targetDate: Date;
  //詳細
  detail: string;
  //本社報告日
  reportDate: Date | null;
  //承認時刻
  verifiedAt: Date | null;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export enum TravelCostOneWayOrRound {
  ONE_WAY = 'one_way',
  ROUND = 'round',
}
export interface TravelCost {
  id: number;
  //交通費区分
  category: TravelCostCategory;
  //行き先
  destination: string;
  //目的
  purpose: string;
  //出発駅
  departureStation: string;
  //経由
  viaStation: string;
  //到着駅
  destinationStation: string;
  //交通費(円)
  travelCost: number;
  //片道か往復か
  oneWayOrRound: TravelCostOneWayOrRound;
  //承認時刻
  verifiedAt: Date | null;
  attendance?: Attendance;
  createdAt: Date;
  updatedAt: Date;
}
export enum OneWayOrRound {
  ONE_WAY = 'one_way',
  ROUND = 'round',
}

export enum TravelCostCategory {
  //お客様都合
  CLIENT = 'client',
  //自社都合
  INHOUSE = 'inhouse',
}

//入社前申請
export interface ApplicationBeforeJoining {
  id: number;
  //日付
  attendanceTime: Date;
  //行き先
  destination: string;
  //目的
  purpose: string;
  //出発駅
  departureStation: string;
  //経由
  viaStation: string;
  //到着駅
  destinationStation: string;
  //交通費(円)
  travelCost: number;
  //片道か往復か
  oneWayOrRound: OneWayOrRound;
  //承認時刻
  verifiedAt: Date | null;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefaultAttendance {
  id: number;
  //出勤時刻
  attendanceTime: string;
  //退勤時刻
  absenceTime: string;
  //休憩時間
  breakMinutes: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
