import {
  BoardCategory,
  ChatAlbum,
  ChatGroup,
  ChatNote,
  EventType,
  RuleCategory,
  WikiType,
} from '../../types';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Main: undefined;
  EventList: {
    type?: EventType;
    tag?: string;
    personal?: boolean;
  };
  EventDetail: {
    id: number;
  };
  Wiki: undefined;
  WikiList: {
    type?: WikiType;
    tag?: string;
    word?: string;
  };
  WikiDetail: {
    id: number;
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
  TagAdmin: undefined;
  UserTagAdmin: undefined;
  Chat: {
    room: ChatGroup;
  };
  RoomList: undefined;
  NewRoom: undefined;
  EditRoom: {room: ChatGroup};
  ChatMenu: {
    room: ChatGroup;
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
};
