export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  HEAD_OFFICE = 'head_office',
  COMMON = 'common',
}

export enum ChatMessageType {
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
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
  KNOWLEDGE = 'knowledge',
  QA = 'qa',
}

export interface User {
  id: number;
  email: string;
  lastName: string;
  firstName: string;
  introduce: string;
  password?: string;
  role: UserRole;
  avatarUrl: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
  hostingEvents?: EventSchedule[];
  events?: EventSchedule[];
  eventComments?: EventComment[];
  eventsCreated?: EventSchedule[];
  qaQuestions?: QAQuestion[];
  qaAnswers?: QAAnswer[];
  qaAnswerReplies?: QAAnswerReply[];
  //this params is sent when login
  token?: string;

  eventCount?: number;
  questionCount?: number;
  answerCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  type: TagType;
  createdAt: Date;
  updatedAt: Date;
  events?: EventSchedule[];
  qaQuestions?: QAQuestion[];
}

export interface UserTag {
  id: number;
  name: string;
  type: TagType;
  createdAt: Date;
  updatedAt: Date;
  users?: User[];
}

export interface QAQuestion {
  id: number;
  title: string;
  body: string;
  type: WikiType;
  resolvedAt: Date;
  writer?: User;
  answers?: QAAnswer[];
  tags?: Tag[];
  bestAnswer?: QAAnswer;
  createdAt: Date;
  updatedAt: Date;
}

export interface QAAnswerReply {
  id: number;
  body: string;
  writer?: User;
  answer?: QAAnswer;
  createdAt: Date;
  updatedAt: Date;
}

export interface QAAnswer {
  id: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  question?: QAQuestion;
  writer?: User;
  replies?: QAAnswerReply[];
}

export interface QABestAnswer {
  question?: QAQuestion;
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
  hostUsers?: User[];
  tags?: Tag[];
  files?: EventFile[];
  videos?: EventVideo[];
  author?: User;
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

export interface EventFile {
  id: number;
  url: string;
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
  createdAt: Date;
  updatedAt: Date;
  isSender?: boolean;
}

export interface ChatGroup {
  id: number;
  name: string;
  imageURL: string;
  chatMessages?: ChatMessage[];
  members?: User[];
  lastReadChatTime?: LastReadChatTime[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LastReadChatTime {
  id: number;
  readTime: Date;
  chatGroup: ChatGroup;
  user: User;
}
