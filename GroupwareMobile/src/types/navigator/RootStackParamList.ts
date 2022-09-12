import {
  AttendanceRepo,
  BoardCategory,
  ChatAlbum,
  ChatGroup,
  ChatNote,
  EventType,
  RuleCategory,
  User,
  WikiType,
} from '../../types';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Main: undefined;
  Call: undefined;
  TabBar: undefined;
  EventList: {
    type?: EventType;
    tag?: string;
    personal?: boolean;
  };
  EventDetail: {
    id: number;
    previousScreenName?: keyof RootStackParamList;
  };
  Wiki: undefined;
  WikiList: {
    type?: WikiType;
    tag?: string;
    word?: string;
  };
  WikiDetail: {
    id: number;
    previousScreenName?: keyof RootStackParamList;
  };
  PostWiki: {
    type?: WikiType;
    ruleCategory?: RuleCategory;
    boardCategory?: BoardCategory;
  };
  EditWiki: {
    id: number;
  };
  PostAnswer: {
    id: number;
  };
  PostReply: {
    id: number;
  };
  AccountDetail:
    | {
        id?: number;
        previousScreenName?: keyof RootStackParamList;
      }
    | undefined;
  Profile: undefined;
  UpdatePassword: undefined;
  UserList: {
    tag?: string;
  };
  UserAdmin: undefined;
  UserRegisteringAdmin: undefined;
  EditedProfile: {id?: number};
  TagAdmin: undefined;
  UserTagAdmin: undefined;
  Chat: {
    room: ChatGroup;
  };
  RoomList: undefined;
  NewRoom: undefined | {selectedMembers: User[]};
  EditRoom: {room: ChatGroup};
  ChatMenu: {
    room: ChatGroup;
    removeCache?: () => void;
  };
  ChatNotes: {
    room: ChatGroup;
  };
  PostChatNote: {
    room: ChatGroup;
  };
  EditChatNote: {
    room: ChatGroup;
    note: ChatNote;
  };
  ChatAlbums: {
    room: ChatGroup;
  };
  PostChatAlbum: {
    room: ChatGroup;
  };
  ChatAlbumDetail: {
    room: ChatGroup;
    album: ChatAlbum;
  };
  EditChatAlbum: {
    album: ChatAlbum;
    room: ChatGroup;
  };
  ForgotPassword: undefined;
  Share: {
    urlPath: string;
    text: string;
  };
  EventIntroduction: {
    type: EventType;
  };
  WikiLinks: undefined;
  MyProfile: undefined;
  AttendanceHome: undefined;
  Attendance: undefined;
  AttendanceReport: undefined;
  AttendanceReportDetail: {
    report: AttendanceRepo;
    previousScreenName?: keyof RootStackParamList;
  };
  DefaultAttendance: undefined;
  ApplicationBeforeJoining: undefined;
};
